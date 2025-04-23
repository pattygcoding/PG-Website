import json
import time
import threading
from deep_translator import GoogleTranslator

source_language = "en"

# Leave the s out of language to prevent running by accident
target_language = [
    "am_et",
    "ar_sa",
    "az_az",
    "be_by",
    "bg_bg",
    "bn_bd",
    "bs_ba",
    "ca_ad",
    "cn_cn",
    "cr_ca",
    "cs_cz",
    "cy_gb",
    "da_dk",
    "de_de",
    "dv_mv",
    "el_gr",
    "en_us",
    "es_mx",
    "et_ee",
    "fa_ir",
    "fi_fi",
    "fj_fj",
    "fo_fo",
    "fr_ca",
    "fr_fr",
    "ga_ie",
    "he_il",
    "hi_in",
    "hr_hr",
    "ht_ht",
    "hu_hu",
    "hy_am",
    "id_id",
    "is_is",
    "it_it",
    "jp_jp",
    "ka_ge",
    "kk_kz",
    "kl_gl",
    "km_kh",
    "kn_in",
    "ko_kr",
    "ky_kg",
    "lb_lu",
    "lo_la",
    "lt_lt",
    "lv_lv",
    "mg_mg",
    "mh_mh",
    "mn_mn",
    "mr_in",
    "ms_my",
    "mt_mt",
    "my_mm",
    "na_nr",
    "ne_np",
    "nl_nl",
    "no_no",
    "pl_pl",
    "ps_af",
    "pt_br",
    "ro_md",
    "ro_ro",
    "ru_ru",
    "sg_cf",
    "si_lk",
    "sk_sk",
    "sl_si",
    "sm_ws",
    "so_so",
    "sq_al",
    "sr_rs",
    "st_ls",
    "sv_se",
    "sw_tz",
    "ta_in",
    "te_in",
    "th_th",
    "tg_tj",
    "tk_tm",
    "to_to",
    "tr_tr",
    "uk_ua",
    "ur_pk",
    "uz_uz",
    "vi_vn"
]


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

def translate_one_by_one(json_data, target_language):
    string_paths = collect_string_paths(json_data)
    total = len(string_paths)
    progress = [0]
    stop_flag = [False]

    print(f"\nTranslating to '{target_language}'...")
    print(f"Total strings to translate: {total}\n")

    base_lang = target_language.split("_")[0]

    # Start progress thread
    thread = threading.Thread(target=periodic_progress, args=(total, progress, stop_flag))
    thread.start()

    for path in string_paths:
        original = get_nested_value(json_data, path)

        # Skip if the string looks like a URL
        if original.strip().lower().startswith("http"):
            progress[0] += 1
            continue

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
            # Make a deep copy so each language starts from the original
            from copy import deepcopy
            data_copy = deepcopy(base_json)
            translated_json = translate_one_by_one(data_copy, lang_code)
            write_pretty_json(translated_json, lang_code)
