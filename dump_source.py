import json

diff = json.load(open("comp/en_us_diff_paths.json", encoding="utf-8"))
en = json.load(open("src/assets/lang/en_us.json", encoding="utf-8"))


def get_value(data, path):
    cur = data
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


for i, p in enumerate(diff, 1):
    v = get_value(en, p)
    print(f"{i:3}. {p} :: {v}")
