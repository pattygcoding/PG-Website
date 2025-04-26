import json
import time
import threading
import sys
from deep_translator import GoogleTranslator
from copy import deepcopy

source_language = "en"

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
    "en_us",
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

skip_existing = "-skip" in sys.argv

def lint_json_file(source="src/assets/lang/en_us.json"):
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
    output_file = f"src/assets/lang/{target_language}.json"
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

def periodic_progress(total, progress_ref, stop_flag):
    while not stop_flag[0]:
        print(f"✔️ {progress_ref[0]}/{total} lines translated")
        time.sleep(3)

def translate_one_by_one(json_data, target_language, existing_translations=None):
    string_paths = collect_string_paths(json_data)
    total = len(string_paths)
    progress = [0]
    stop_flag = [False]

    print(f"\nTranslating to '{target_language}'...")
    print(f"Total strings to translate: {total}\n")

    if target_language.count("_") >= 2:
        base_lang = "_".join(target_language.split("_")[:-1])
    else:
        base_lang = target_language.split("_")[0]

    thread = threading.Thread(target=periodic_progress, args=(total, progress, stop_flag))
    thread.start()

    for path in string_paths:
        original = get_nested_value(json_data, path)

        if original.strip().lower().startswith("http"):
            progress[0] += 1
            continue

        if skip_existing and existing_translations:
            try:
                existing_value = get_nested_value(existing_translations, path)
                if existing_value and existing_value.strip() != "":
                    set_nested_value(json_data, path, existing_value)
                    progress[0] += 1
                    continue
            except (KeyError, IndexError, TypeError):
                pass

        try:
            translated = GoogleTranslator(source=source_language, target=base_lang).translate(original)
            set_nested_value(json_data, path, translated)
        except Exception as e:
            print(f"Failed to translate: {original} — {e}")
        progress[0] += 1

    stop_flag[0] = True
    thread.join()
    print(f"✔️ {progress[0]}/{total} lines translated (done!)")

    return json_data

def write_pretty_json(data, target_language):
    output_file = f"src/assets/lang/{target_language}.json"
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"\nSaved translated JSON to '{output_file}'")
    except Exception as e:
        print(f"Failed to write output file: {e}")

if __name__ == "__main__":
    base_json = lint_json_file()
    if base_json is not None:
        for lang_code in target_languages:
            data_copy = deepcopy(base_json)
            existing_translations = load_existing_translations(lang_code) if skip_existing else None
            translated_json = translate_one_by_one(data_copy, lang_code, existing_translations)
            write_pretty_json(translated_json, lang_code)
