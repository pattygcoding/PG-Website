import json
import time
import threading
import sys
import os
import re
import requests
from bs4 import BeautifulSoup
from deep_translator import MyMemoryTranslator
from deep_translator.exceptions import TooManyRequests, TranslationNotFound
from copy import deepcopy

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
source_language = "en"
source_locale = "en_us"

target_languages = [
    "af_za",
    "am_et",
    "ar_sa",
    "az_az",
    "ay_bo",
    "be_by",
    "bg_bg",
    "bn_bd",
    "bs_ba",
    "ca_ad",
    "ceb_ph",
    "cs_cz",
    "cy_gb",
    "da_dk",
    "de_de",
    "dv_mv",
    "ee_gh",
    "el_gr",
    "es_mx",
    "et_ee",
    "fa_ir",
    "fi_fi",
    "fr_fr",
    "ga_ie",
    "gd_gb",
    "gn_py",
    "ha_ng",
    "haw_us",
    "hi_in",
    "hr_hr",
    "ht_ht",
    "hu_hu",
    "hy_am",
    "id_id",
    "ig_ng",
    "is_is",
    "it_it",
    "iw_il",
    "ja_jp",
    "jw_id",
    "ka_ge",
    "kk_kz",
    "km_kh",
    "kn_in",
    "ko_kr",
    "kri_sl",
    "ky_kg",
    "la_va",
    "lb_lu",
    "ln_cd",
    "lo_la",
    "lt_lt",
    "lv_lv",
    "mg_mg",
    "mi_nz",
    "mk_mk",
    "mn_mn",
    "mr_in",
    "ms_my",
    "mt_mt",
    "my_mm",
    "ne_np",
    "nl_nl",
    "no_no",
    "ny_mw",
    "pl_pl",
    "ps_af",
    "pt_br",
    "qu_pe",
    "ro_md",
    "ro_ro",
    "ru_ru",
    "si_lk",
    "sk_sk",
    "sl_si",
    "sn_zw",
    "so_so",
    "sq_al",
    "sr_rs",
    "st_ls",
    "su_id",
    "sv_se",
    "sw_tz",
    "ta_in",
    "te_in",
    "tg_tj",
    "th_th",
    "ti_er",
    "tl_ph",
    "tk_tm",
    "tr_tr",
    "uk_ua",
    "ur_pk",
    "uz_uz",
    "vi_vn",
    "yo_ng",
    "zh-CN_cn",
    "zh-TW_tw",
    "zu_za"
]

def extract_keys_from_args(key_args):
    if not key_args:
        return []
    filtered_args = [a for a in key_args if a not in ("-k", "--keys", "-key", "--key")]
    raw_text = " ".join(filtered_args).strip()
    if not raw_text:
        return []
    tokens = re.findall(r"[a-zA-Z0-9_\-.]+", raw_text)
    keys = []
    for t in tokens:
        t_clean = t.strip(".")
        if t_clean and t_clean not in keys:
            keys.append(t_clean)
    return keys

def parse_cli_args(argv):
    skip_existing = False
    retry_failed = False
    requested_langs = []
    key_args = []

    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg in ("-skip", "--skip"):
            skip_existing = True
            i += 1
        elif arg in ("-retry", "--retry"):
            retry_failed = True
            i += 1
        elif arg in ("-k", "--keys", "-key", "--key"):
            i += 1
            while i < len(argv):
                next_arg = argv[i]
                if next_arg in ("-skip", "--skip", "-retry", "--retry"):
                    break
                if next_arg in target_languages:
                    requested_langs.append(next_arg)
                else:
                    key_args.append(next_arg)
                i += 1
        elif arg in target_languages:
            requested_langs.append(arg)
            i += 1
        else:
            key_args.append(arg)
            i += 1

    target_keys = extract_keys_from_args(key_args)
    return skip_existing, retry_failed, requested_langs, target_keys

skip_existing, retry_failed, requested_langs, target_keys = parse_cli_args(sys.argv[1:])

REQUEST_INTERVAL = 0.3
PROVIDER_COOLDOWN = 60
TRANSIENT_COOLDOWN = 5
PROVIDER_RETRY_CYCLES = 3
MAX_TRANSLATION_LENGTH = 180
GOOGLE_TRANSLATE_URL = "https://translate.google.com/m"

def get_locale_path(lang_code):
    return os.path.join(SCRIPT_DIR, f"{lang_code}.json")

def get_translation_language(lang_code):
    if lang_code.count("_") >= 2:
        return "_".join(lang_code.split("_")[:-1])
    if "_" in lang_code:
        return lang_code.split("_")[0]
    return lang_code

def get_translation_locale(lang_code):
    language_parts = lang_code.split("_")
    if len(language_parts) >= 3:
        return "-".join(language_parts[:-1])
    if len(language_parts) == 2:
        return f"{language_parts[0].lower()}-{language_parts[1].upper()}"
    return lang_code.lower()

class GoogleMobileTranslator:
    def __init__(self, source, target):
        self.source = source
        self.target = target
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 Chrome/128.0 Safari/537.36"
            )
        })

    def translate(self, text):
        response = self.session.get(
            GOOGLE_TRANSLATE_URL,
            params={"sl": self.source, "tl": self.target, "q": text},
            timeout=15,
        )
        if response.status_code == 429:
            raise TooManyRequests()
        response.raise_for_status()

        result = BeautifulSoup(response.text, "html.parser").select_one(
            ".result-container"
        )
        if result is None or not result.get_text(strip=True):
            raise TranslationNotFound(text)
        return result.get_text(strip=True)

class TranslationProvider:
    def __init__(self, providers):
        self.providers = providers
        self.active_index = 0
        self.last_request_at = 0
        self.cooldowns = {}

    def _wait_for_request_slot(self):
        wait_time = REQUEST_INTERVAL - (time.monotonic() - self.last_request_at)
        if wait_time > 0:
            time.sleep(wait_time)

    def translate(self, text, retry_cycles=PROVIDER_RETRY_CYCLES):
        errors = []
        retryable_failure = False
        provider_count = len(self.providers)

        for offset in range(provider_count):
            provider_index = (self.active_index + offset) % provider_count
            provider_name, translator = self.providers[provider_index]
            cooldown_until = self.cooldowns.get(provider_name, 0)
            if cooldown_until > time.monotonic():
                continue

            self._wait_for_request_slot()
            try:
                translated = translator.translate(text)
                self.last_request_at = time.monotonic()
                self.active_index = provider_index
                return translated
            except TooManyRequests as error:
                self.last_request_at = time.monotonic()
                self.cooldowns[provider_name] = time.monotonic() + PROVIDER_COOLDOWN
                retryable_failure = True
                errors.append(f"{provider_name}: {error}")
                print(f"{provider_name} rate limit reached; trying another provider.")
            except TranslationNotFound as error:
                self.last_request_at = time.monotonic()
                self.cooldowns[provider_name] = time.monotonic() + TRANSIENT_COOLDOWN
                retryable_failure = True
                errors.append(f"{provider_name}: {error}")
                print(f"{provider_name} returned no result; retrying after a short pause.")
            except Exception as error:
                self.last_request_at = time.monotonic()
                errors.append(f"{provider_name}: {type(error).__name__}: {error}")

        if retryable_failure and retry_cycles > 0:
            current_time = time.monotonic()
            provider_available = any(
                self.cooldowns.get(provider_name, 0) <= current_time
                for provider_name, _ in self.providers
            )
            active_cooldowns = [
                cooldown_until - current_time
                for cooldown_until in self.cooldowns.values()
                if cooldown_until > current_time
            ]
            if not provider_available and active_cooldowns:
                wait_time = min(active_cooldowns)
                print(f"All translation providers are cooling down; waiting {wait_time:.0f}s.")
                time.sleep(wait_time)
            return self.translate(text, retry_cycles - 1)

        raise RuntimeError("; ".join(errors))

def create_translator(target_language):
    providers = (
        (
            "Google",
            lambda: GoogleMobileTranslator(
                source=source_language,
                target=get_translation_language(target_language),
            ),
        ),
        (
            "MyMemory",
            lambda: MyMemoryTranslator(
                source="en-US",
                target=get_translation_locale(target_language),
            ),
        ),
    )
    available_providers = []
    errors = []

    for provider_name, translator_factory in providers:
        try:
            translator = translator_factory()
            available_providers.append((provider_name, translator))
        except Exception as error:
            errors.append(f"{provider_name}: {type(error).__name__}: {error}")

    if not available_providers:
        raise RuntimeError(
            f"No translation provider is available for '{target_language}'.\n"
            + "\n".join(f"  {error}" for error in errors)
        )

    provider_names = ", ".join(name for name, _ in available_providers)
    print(f"Available translators: {provider_names} (max 4 requests/second).")
    return TranslationProvider(available_providers)

def lint_json_file(source=None):
    if source is None:
        source = get_locale_path(source_locale)
    try:
        with open(source, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"{source} is valid JSON.\n")
        return data
    except json.JSONDecodeError as e:
        print(f"JSON syntax error: Line {e.lineno}, Column {e.colno}: {e.msg}")
    except FileNotFoundError:
        print(f"File not found: {source}")
    return None

def load_existing_translations(target_language):
    output_file = get_locale_path(target_language)
    try:
        with open(output_file, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
        print(f"Found existing translations for '{target_language}', will reuse them.")
        return existing_data
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def collect_string_paths(obj, path=()):
    paths = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            paths.extend(collect_string_paths(v, path + (k,)))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            paths.extend(collect_string_paths(v, path + (i,)))
    elif isinstance(obj, str):
        paths.append(path)
    return paths

def set_nested_value(obj, path, value):
    for key in path[:-1]:
        obj = obj[key]
    obj[path[-1]] = value

def get_nested_value(obj, path):
    for key in path:
        obj = obj[key]
    return obj

def merge_json_structures(base_data, existing_data):
    merged = deepcopy(base_data)
    if not isinstance(existing_data, dict):
        return merged
    all_paths = collect_string_paths(base_data)
    for path in all_paths:
        try:
            val = get_nested_value(existing_data, path)
            if val is not None and isinstance(val, str) and val.strip() != "":
                set_nested_value(merged, path, val)
        except (KeyError, IndexError, TypeError):
            pass
    return merged

def periodic_progress(total, progress_ref, stop_flag):
    while not stop_flag[0]:
        print(f"✔️ {progress_ref[0]}/{total} lines translated")
        time.sleep(3)

def split_translation_text(text, max_length=MAX_TRANSLATION_LENGTH):
    if len(text) <= max_length:
        return [text]

    chunks = []
    current_chunk = ""
    sentences = re.split(r"(?<=[.!?])\s+", text)

    for sentence in sentences:
        candidate = f"{current_chunk} {sentence}".strip()
        if len(candidate) <= max_length:
            current_chunk = candidate
            continue

        if current_chunk:
            chunks.append(current_chunk)

        remaining = sentence.strip()
        while len(remaining) > max_length:
            split_at = remaining.rfind(" ", 0, max_length + 1)
            if split_at <= 0:
                split_at = max_length
            chunks.append(remaining[:split_at].strip())
            remaining = remaining[split_at:].strip()
        current_chunk = remaining

    if current_chunk:
        chunks.append(current_chunk)

    return chunks

def translate_text(translator, original):
    placeholders = re.findall(r"\{\{[^{}]+\}\}|\{[^{}]+\}", original)
    masked_text = original
    for i, placeholder in enumerate(placeholders):
        masked_text = masked_text.replace(placeholder, f"__VAR_{i}__", 1)

    translated_chunks = [
        translator.translate(chunk) for chunk in split_translation_text(masked_text)
    ]
    translated = " ".join(chunk for chunk in translated_chunks if chunk)
    if translated:
        for i, placeholder in enumerate(placeholders):
            pattern = re.compile(rf"__\s*VAR\s*_\s*{i}\s*__", re.IGNORECASE)
            if pattern.search(translated):
                translated = pattern.sub(placeholder, translated)
            else:
                translated = translated.replace(f"__VAR_{i}__", placeholder)
    return translated

def translate_one_by_one(json_data, target_language, existing_translations=None, target_keys=None, base_json=None):
    if base_json is None:
        base_json = json_data

    string_paths = collect_string_paths(base_json)

    if target_keys:
        filtered_paths = []
        for path in string_paths:
            path_str = ".".join(str(p) for p in path)
            if any(path_str == tk or path_str.startswith(tk + ".") for tk in target_keys):
                filtered_paths.append(path)
        string_paths = filtered_paths

    total = len(string_paths)
    if total == 0:
        print(f"\nNo matching target keys to translate for '{target_language}'.")
        return json_data

    progress = [0]
    stop_flag = [False]

    print(f"\nTranslating to '{target_language}'...")
    print(f"Total strings to translate: {total}\n")

    try:
        translator = create_translator(target_language)
    except RuntimeError as error:
        print(error)
        return None

    thread = threading.Thread(target=periodic_progress, args=(total, progress, stop_flag))
    thread.start()

    for path in string_paths:
        original = get_nested_value(base_json, path)

        if not original or not original.strip() or original.strip().lower().startswith("http"):
            progress[0] += 1
            continue

        if not target_keys and skip_existing and existing_translations:
            try:
                existing_value = get_nested_value(existing_translations, path)
                if existing_value and existing_value.strip() != "":
                    set_nested_value(json_data, path, existing_value)
                    progress[0] += 1
                    continue
            except (KeyError, IndexError, TypeError):
                pass

        success = False
        for attempt in range(3):
            try:
                translated = translate_text(translator, original)
                if translated:
                    set_nested_value(json_data, path, translated)
                    success = True
                    break
            except Exception as error:
                if attempt == 2:
                    print(f"  {type(error).__name__}: {error}")
                time.sleep(0.5 * (attempt + 1))

        if not success:
            print(f"Failed to translate after retries: {original}")

        progress[0] += 1
        time.sleep(0.05)

    stop_flag[0] = True
    thread.join()
    print(f"✔️ {progress[0]}/{total} lines translated (done!)")

    return json_data

def write_pretty_json(data, target_language):
    output_file = get_locale_path(target_language)
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"\nSaved translated JSON to '{output_file}'")
    except Exception as e:
        print(f"Failed to write output file: {e}")

def retry_failed_translations(base_json, existing_json, target_language, target_keys=None):
    string_paths = collect_string_paths(base_json)
    if target_keys:
        filtered_paths = []
        for path in string_paths:
            path_str = ".".join(str(p) for p in path)
            if any(path_str == tk or path_str.startswith(tk + ".") for tk in target_keys):
                filtered_paths.append(path)
        string_paths = filtered_paths

    failed_paths = []
    for path in string_paths:
        original = get_nested_value(base_json, path)
        try:
            existing_value = get_nested_value(existing_json, path)
        except (KeyError, IndexError, TypeError):
            failed_paths.append(path)
            continue
        if not original or not original.strip() or original.strip().lower().startswith("http"):
            continue
        if existing_value == original:
            failed_paths.append(path)

    total = len(failed_paths)
    print(f"\nRetrying {total} previously failed translations for '{target_language}'...")

    try:
        translator = create_translator(target_language)
    except RuntimeError as error:
        print(error)
        return None
    result = deepcopy(existing_json)
    still_failed = []

    for i, path in enumerate(failed_paths, 1):
        original = get_nested_value(base_json, path)
        success = False
        for attempt in range(5):
            try:
                translated = translate_text(translator, original)
                if translated:
                    set_nested_value(result, path, translated)
                    success = True
                    break
            except Exception as error:
                if attempt == 4:
                    print(f"  {type(error).__name__}: {error}")
                time.sleep(0.75 * (attempt + 1))

        if not success:
            still_failed.append(original)
        print(f"✔️ {i}/{total} retried")
        time.sleep(0.1)

    if still_failed:
        print(f"\nStill failed after retry ({len(still_failed)}):")
        for text in still_failed:
            print(f"  - {text}")
    else:
        print("\nAll previously failed translations recovered.")

    return result

if __name__ == "__main__":
    base_json = lint_json_file()
    if base_json is not None:
        skip_existing, retry_failed, requested_langs, target_keys = parse_cli_args(sys.argv[1:])
        langs_to_process = requested_langs if requested_langs else target_languages

        if target_keys:
            all_paths = collect_string_paths(base_json)
            all_key_strs = [".".join(str(p) for p in path) for path in all_paths]
            matched_keys = []
            for tk in target_keys:
                if any(k == tk or k.startswith(tk + ".") for k in all_key_strs):
                    matched_keys.append(tk)
                else:
                    print(f"Warning: Target key '{tk}' was not found in {source_locale}.json.")
            if matched_keys:
                print(f"Targeting key(s): {matched_keys}")
            else:
                print("No matching target keys found in base JSON file.")

        if retry_failed:
            for lang_code in langs_to_process:
                existing_translations = load_existing_translations(lang_code)
                if existing_translations is None:
                    print(f"No existing translation file for '{lang_code}', skipping retry.")
                    continue
                fixed_json = retry_failed_translations(
                    base_json, existing_translations, lang_code, target_keys=target_keys
                )
                if fixed_json is not None:
                    write_pretty_json(fixed_json, lang_code)
        else:
            for lang_code in langs_to_process:
                existing_translations = load_existing_translations(lang_code)
                if target_keys:
                    if existing_translations:
                        data_copy = merge_json_structures(base_json, existing_translations)
                    else:
                        data_copy = deepcopy(base_json)
                    translated_json = translate_one_by_one(
                        data_copy,
                        lang_code,
                        existing_translations,
                        target_keys=target_keys,
                        base_json=base_json,
                    )
                else:
                    data_copy = deepcopy(base_json)
                    existing_translations = existing_translations if skip_existing else None
                    translated_json = translate_one_by_one(data_copy, lang_code, existing_translations)

                if translated_json is not None:
                    write_pretty_json(translated_json, lang_code)
                if translated_json is not None:
                    write_pretty_json(translated_json, lang_code)
