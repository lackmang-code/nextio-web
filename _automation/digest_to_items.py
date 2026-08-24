# -*- coding: utf-8 -*-
"""
이메일 다이제스트([일간 디스플레이 탐사 보도 다이제스트]) 원문을
make_promo.py가 쓰는 items.json 스키마로 변환.
사용법: python digest_to_items.py <raw_digest.txt> <items.json> <YYYY-MM-DD>
"""
import sys, re, json
from datetime import date, timedelta
from urllib.parse import urlparse, parse_qs, unquote

# 콘솔 인코딩 방어: 기사 제목에 cp949로 못 쓰는 문자(— 등)가 있으면
# print 하나 때문에 발행 전체가 죽는다. GitHub Actions(UTF-8)에서는 무해하고
# Windows 로컬 수동 실행에서만 의미가 있다.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

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

# ── 기사 보도일 판정 / 묵은 기사 걸러내기 ────────────────────────────
# 2026-08-24 실발행 경로에 도입(대표 지시). 그 전까지는 쇼케이스에만 있었다.
#
# URL "경로"에 박힌 8자리 날짜만 보도일로 인정한다.
# 쿼리스트링(?idxno=2023092168625 등)은 기사 일련번호인 경우가 많아
# 날짜로 오독하면 당일 기사가 잘못 걸러진다.
PATH_DATE_RE = re.compile(r'(20\d{2})(\d{2})(\d{2})')

# 다이제스트 발행일보다 이만큼 넘게 지난 기사는 싣지 않는다.
# 실측(2026-08-24, 과거 카드 44장 400건): 3일 기준 21건(5.2%) 제외,
# 카드 1장당 최대 2건이라 10건짜리 카드가 8건으로 줄어드는 정도.
DEFAULT_MAX_AGE_DAYS = 3


def article_date(url):
    """URL 경로에서 보도일을 추정한다. 알 수 없으면 None."""
    path = urlparse(url).path
    for y, m, d in PATH_DATE_RE.findall(path):
        try:
            return date(int(y), int(m), int(d))
        except ValueError:
            continue
    return None


def filter_by_age(items, date_str, max_age_days):
    """다이제스트 발행일 기준으로 오래된 기사를 걷어낸다.
    보도일을 알 수 없는 기사는 남긴다 — URL에 날짜가 없는 매체가 많아
    (실측 87%) 엄격하게 굴면 카드가 텅 빈다. 이 필터는 확실한 것만
    걸러내는 보조 장치이지 완전한 보증이 아니다."""
    y, m, d = (int(x) for x in date_str.split("-"))
    pub = date(y, m, d)
    cutoff = pub - timedelta(days=max_age_days)
    kept, dropped = [], []
    for it in items:
        ad = article_date(it.get("url") or "")
        if ad is not None and ad < cutoff:
            it["_dropped_date"] = ad.isoformat()
            dropped.append(it)
        else:
            kept.append(it)
    return kept, dropped


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
    argv = sys.argv[1:]
    max_age = DEFAULT_MAX_AGE_DAYS
    if "--max-age" in argv:
        i = argv.index("--max-age")
        max_age = int(argv[i + 1])
        del argv[i:i + 2]
    if len(argv) < 3:
        print("usage: digest_to_items.py <raw_digest.txt> <items.json> <YYYY-MM-DD> [--max-age N]")
        sys.exit(1)
    raw_path, out_path, date_str = argv[:3]
    with open(raw_path, encoding="utf-8") as f:
        text = f.read()
    items = parse_digest(text)
    for it in items:
        it["date"] = date_str
        it["tag"] = ""
    items, dropped = filter_by_age(items, date_str, max_age)
    for it in dropped:
        print(f"  [제외] {it['_dropped_date']} ({max_age}일 초과) {it['title'][:40]}")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=2)
    print(f"OK digest_to_items: {len(items)}건 -> {out_path}")

if __name__ == "__main__":
    main()
