# -*- coding: utf-8 -*-
"""
이메일 다이제스트([일간 디스플레이 탐사 보도 다이제스트]) 원문을
make_promo.py가 쓰는 items.json 스키마로 변환.
사용법: python digest_to_items.py <raw_digest.txt> <items.json> <YYYY-MM-DD>
"""
import sys, re, json
from urllib.parse import urlparse, parse_qs, unquote

ITEM_RE = re.compile(r'^\d+\.\s+(.*\S)\s*$')
CONTENT_RE = re.compile(r'^-\s*N?내용:\s*(.*\S)\s*$')
ANALYSIS_RE = re.compile(r'^-\s*N?분석:\s*(.*\S)\s*$')
SOURCE_RE = re.compile(r'^-\s*출처:\s*(.+?)\s*\((https?://\S+?)\)')

def unwrap_url(u):
    if "google.com/url" in u:
        q = parse_qs(urlparse(u).query).get("q")
        if q:
            return unquote(q[0])
    return u

def parse_digest(text):
    lines = [l.rstrip() for l in text.splitlines()]
    items = []
    cur = None
    for line in lines:
        m = ITEM_RE.match(line)
        if m:
            if cur:
                items.append(cur)
            cur = {"title": m.group(1), "summary": "", "body": "", "source": "", "url": ""}
            continue
        if cur is None:
            continue
        m = CONTENT_RE.match(line)
        if m:
            cur["summary"] = m.group(1)
            continue
        m = ANALYSIS_RE.match(line)
        if m:
            cur["body"] = f"<p>{m.group(1)}</p>"
            continue
        m = SOURCE_RE.match(line)
        if m:
            cur["source"] = m.group(1)
            cur["url"] = unwrap_url(m.group(2))
            continue
    if cur:
        items.append(cur)
    return items

def main():
    if len(sys.argv) < 4:
        print("usage: digest_to_items.py <raw_digest.txt> <items.json> <YYYY-MM-DD>")
        sys.exit(1)
    raw_path, out_path, date_str = sys.argv[1:4]
    with open(raw_path, encoding="utf-8") as f:
        text = f.read()
    items = parse_digest(text)
    for it in items:
        it["date"] = date_str
        it["tag"] = ""
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=2)
    print(f"OK digest_to_items: {len(items)}건 -> {out_path}")

if __name__ == "__main__":
    main()
