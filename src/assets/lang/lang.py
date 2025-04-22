import json
import time
import threading
from deep_translator import GoogleTranslator

source_language = "en"
target_languages = [
    "lv_lv",    # Latvian
    "lt_lt",    # Lithuanian
    "am_et",    # Amharic (Ethiopia)
    "lb_lu",    # Luxembourgish
    "ca_ad",    # Catalan (Andorra)
    "na_nr",    # Nauruan
    "to_to",    # Tongan
    "he_il",    # Hebrew
    "sm_ws",    # Samoan
    "sg_cf",    # Sango
    "kl_gl",    # Greenlandic
    "cr_ca",    # Cree (Canada)
    "te_in",    # Telugu
    "mr_in",    # Marathi
    "ta_in",    # Tamil
    "et_ee",    # Estonian
    "kn_in",    # Kannada
    "si_lk",    # Sinhala (Sri Lanka)
    "so_so",    # Somali
    "fo_fo",    # Faroese
    "fj_fj",    # Fijian
    "ht_ht",    # Haitian Creole
    "sw_tz",    # Swahili (Tanzania)
    "mg_mg",    # Malagasy (Madagascar)
    "ps_af",    # Pashto (Afghanistan)
    "mh_mh",    # Marshallese
    "ro_md",    # Moldovan (Romanian in Moldova)
    "cy_gb",    # Welsh
    "ga_ie",    # Irish (Gaelic)
    "mt_mt",    # Maltese
    "tg_tj"     # Tajik
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
