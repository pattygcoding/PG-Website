import json
import os

LANG = "src/assets/lang"
diff = json.load(open("comp/en_us_diff_paths.json", encoding="utf-8"))
en = json.load(open(os.path.join(LANG, "en_us.json"), encoding="utf-8"))


def get_value(data, path):
    cur = data
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def count_placeholders(s):
    import re
    return sorted(set(re.findall(r"\{[^}]*\}", s)))


langs = sorted(
    f[:-5]
    for f in os.listdir(LANG)
    if f.endswith(".json") and f not in ("en_us.json",)
)

problems = []
for code in langs:
    path = os.path.join(LANG, code + ".json")
    try:
        data = json.load(open(path, encoding="utf-8"))
    except Exception as e:
        problems.append(f"{code}: INVALID JSON: {e}")
        continue
    missing = [p for p in diff if get_value(data, p) is None]
    if missing:
        problems.append(f"{code}: missing {len(missing)} diff paths")
    # placeholder consistency vs English
    for p in diff:
        v = get_value(data, p)
        e = get_value(en, p)
        if isinstance(v, str) and isinstance(e, str) and (
            count_placeholders(v) != count_placeholders(e)
        ):
            problems.append(f"{code}: placeholder mismatch {p}: {v!r} vs {e!r}")

if problems:
    print("PROBLEMS:")
    for p in problems:
        print(" ", p)
else:
    print(f"OK: all {len(langs)} language files valid; all {len(diff)} diff paths present; placeholders intact.")
