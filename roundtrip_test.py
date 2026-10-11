import json
import os
import re

LANG = "src/assets/lang"


def detect_indent(raw):
    m = re.search(r'\n( +)"', raw)
    return len(m.group(1)) if m else 2


files = ["fr_fr", "af_za", "zh-CN_cn", "de_de", "ja_jp", "hi_in", "en_us"]
for f in files:
    raw = open(os.path.join(LANG, f + ".json"), encoding="utf-8").read()
    data = json.loads(raw)
    ind = detect_indent(raw)
    out = json.dumps(data, ensure_ascii=False, indent=ind) + "\n"
    print(
        f"{f}: indent={ind} identical={raw == out} orig_len={len(raw)} out_len={len(out)}"
    )
