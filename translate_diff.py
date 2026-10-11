#!/usr/bin/env python3
"""Apply diff-path translations to language files.

The master source is src/assets/lang/en_us.json. For each target language file,
every path listed in comp/en_us_diff_paths.json is set to its authored translation
(from a per-language JSON file under translations_build/) if present, otherwise to
the English source value (correct for URLs, technology names, and brand names that
remain identical across languages). All non-diff paths are left untouched. Files are
re-serialized with their detected indent (the language files use 2 spaces) as UTF-8
with ensure_ascii=False.
"""
import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
LANG_DIR = os.path.join(BASE, "src", "assets", "lang")
BUILD_DIR = os.path.join(BASE, "translations_build")
DIFF_FILE = os.path.join(BASE, "comp", "en_us_diff_paths.json")
EN_FILE = os.path.join(LANG_DIR, "en_us.json")


def get_value(data, path):
    cur = data
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def set_value(data, path, value):
    cur = data
    parts = path.split(".")
    for part in parts[:-1]:
        cur = cur.setdefault(part, {})
    cur[parts[-1]] = value


def detect_indent(raw):
    m = re.search(r'\n( +)"', raw)
    return len(m.group(1)) if m else 2


def load_translations():
    trans = {}
    for fn in sorted(os.listdir(BUILD_DIR)):
        if fn.endswith(".json"):
            code = fn[:-5]
            trans[code] = json.load(open(os.path.join(BUILD_DIR, fn), encoding="utf-8"))
    return trans


def main():
    diff_paths = json.load(open(DIFF_FILE, encoding="utf-8"))
    en = json.load(open(EN_FILE, encoding="utf-8"))
    trans = load_translations()

    results = []
    for code, authored in trans.items():
        path = os.path.join(LANG_DIR, code + ".json")
        if not os.path.exists(path):
            results.append(f"{code}: FILE NOT FOUND")
            continue
        raw = open(path, encoding="utf-8").read()
        indent = detect_indent(raw)
        data = json.loads(raw)

        filled_from_en = 0
        filled_authored = 0
        for p in diff_paths:
            value = authored.get(p)
            if value is None:
                value = get_value(en, p)
                filled_from_en += 1
            else:
                filled_authored += 1
            set_value(data, p, value)

        out = json.dumps(data, ensure_ascii=False, indent=indent)
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        results.append(f"{code}: authored={filled_authored} from_en={filled_from_en}")

    print("\n".join(results))


if __name__ == "__main__":
    main()
