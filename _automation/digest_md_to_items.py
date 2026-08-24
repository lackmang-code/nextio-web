# -*- coding: utf-8 -*-
"""
마크다운형 다이제스트(반도체·배터리)를 make_promo.py용 items.json으로 변환.

디스플레이 다이제스트와 형식이 다르다:
  디스플레이 : "1. 제목" / "- 내용:" / "- 분석:" / "- 출처: 매체 (URL)"
  이 파서 대상: "카테고리 ## 1. [제목](URL)" / 요약문단 / "*🔍 심층 분석...:* 분석"
                → 출처 매체명이 없어 URL 도메인에서 역추정한다.

기존 digest_to_items.py(디스플레이 발행 파이프라인 전용)는 건드리지 않는다.
사용법: python digest_md_to_items.py <raw.txt> <items.json> <YYYY-MM-DD>
"""
import sys, re, json
from datetime import date, timedelta
from urllib.parse import urlparse

from digest_to_items import unwrap_url, article_date, filter_by_age

ITEM_RE = re.compile(r'^(.*?)\s*##\s*(\d+)\.\s*\[(.+?)\]\((https?://[^)\s]+)\)\s*$')
ANALYSIS_RE = re.compile(r'^\s*\*?\s*🔍.*?:\s*\*?\s*(.*\S)\s*$')
SKIP_RE = re.compile(r'^\s*(#|©|본 다이제스트는|\*?\s*📌)')

MEDIA = {
    "it.chosun.com": "IT조선", "biz.chosun.com": "조선비즈", "chosun.com": "조선일보",
    "econovill.com": "이코노믹리뷰", "yna.co.kr": "연합뉴스", "mk.co.kr": "매일경제",
    "donga.com": "동아일보", "g-enews.com": "글로벌이코노믹", "newspim.com": "뉴스핌",
    "v.daum.net": "다음뉴스", "n.news.naver.com": "네이버뉴스",
    "semiconductor.samsung.com": "삼성전자 뉴스룸", "news.samsung.com": "삼성전자 뉴스룸",
    "etnews.com": "전자신문", "hankyung.com": "한국경제", "sedaily.com": "서울경제",
    "thelec.kr": "디일렉", "zdnet.co.kr": "ZDNet Korea", "mt.co.kr": "머니투데이",
    "edaily.co.kr": "이데일리", "fnnews.com": "파이낸셜뉴스", "asiae.co.kr": "아시아경제",
    "dt.co.kr": "디지털타임스", "inews24.com": "아이뉴스24", "ddaily.co.kr": "디지털데일리",
    "theelec.kr": "디일렉", "energy-news.co.kr": "에너지신문", "hellot.net": "헬로티",
    "reuters.com": "Reuters", "bloomberg.com": "Bloomberg", "digitimes.com": "DigiTimes",
    "nikkei.com": "Nikkei", "scmp.com": "SCMP",
    "einfomax.co.kr": "연합인포맥스", "investing.com": "인베스팅닷컴",
    "investchosun.com": "인베스트조선", "thedailyeconomy.kr": "데일리이코노미",
}


def guess_source(url):
    host = (urlparse(url).hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    if host in MEDIA:
        return MEDIA[host]
    parts = host.split(".")
    for i in range(len(parts) - 1):
        cand = ".".join(parts[i:])
        if cand in MEDIA:
            return MEDIA[cand]
    return host


def parse_digest(text):
    items, cur = [], None
    for raw in text.splitlines():
        line = raw.rstrip()
        m = ITEM_RE.match(line)
        if m:
            if cur:
                items.append(cur)
            cat, _, title, url = m.groups()
            url = unwrap_url(url)
            cur = {"title": title.strip(), "summary": "", "body": "",
                   "source": guess_source(url), "url": url,
                   "tag": ("#" + cat.strip().replace(" ", "")) if cat.strip() else ""}
            continue
        if cur is None or not line.strip():
            continue
        m = ANALYSIS_RE.match(line)
        if m:
            cur["body"] = "<p>%s</p>" % m.group(1)
            continue
        if SKIP_RE.match(line):
            continue
        if not cur["summary"]:
            cur["summary"] = line.strip()
    if cur:
        items.append(cur)
    return items


def dump_diagnostics(text):
    """파싱이 0건일 때 원인 판별용 진단 출력.
    메일에서 뽑아낸 텍스트가 마크다운인지(정상) 태그만 걷어낸 HTML인지(비정상) 여기서 갈린다.
    저장소가 public이라 Actions 로그도 공개되므로 앞부분만 짧게 찍는다."""
    lines = [l for l in text.splitlines() if l.strip()]
    print("  [진단] 총 %d자 / 비어있지 않은 줄 %d개" % (len(text), len(lines)))
    print("  [진단] 마커 개수 — '## ':%d  '](http':%d  '🔍':%d  '<':%d"
          % (text.count("## "), text.count("](http"), text.count("🔍"), text.count("<")))
    print("  [진단] 앞 20줄:")
    for l in lines[:20]:
        print("    | %s" % l[:120])


def main():
    if len(sys.argv) < 4:
        print("usage: digest_md_to_items.py <raw.txt> <items.json> <YYYY-MM-DD> [--max-age N] [--legacy]")
        sys.exit(1)
    argv = sys.argv[1:]
    max_age = 3
    if "--max-age" in argv:
        i = argv.index("--max-age")
        max_age = int(argv[i + 1])
        del argv[i:i + 2]
    legacy = "--legacy" in argv
    if legacy:
        argv.remove("--legacy")
    raw_path, out_path, date_str = argv[:3]
    with open(raw_path, encoding="utf-8") as f:
        text = f.read()
    if legacy:
        # 디스플레이 다이제스트(구 형식)는 기존 파서로 읽고, 날짜 필터만 동일하게 적용한다.
        from digest_to_items import parse_digest as parse_legacy
        items = parse_legacy(text)
        for it in items:
            it.setdefault("tag", "")
    else:
        items = parse_digest(text)
    if not items:
        print("파싱된 항목이 0건 — 다이제스트 형식을 확인할 것")
        dump_diagnostics(text)
        sys.exit(1)
    items, dropped = filter_by_age(items, date_str, max_age)
    for it in dropped:
        print("  [제외] %s자 기사: %s" % (it["_dropped_date"], it["title"][:40]))
    if not items:
        print("날짜 필터 후 남은 항목이 0건"); sys.exit(1)
    for it in items:
        it["date"] = date_str
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=2)
    print("OK digest_md_to_items: %d건 채택 / %d건 제외(%d일 초과) -> %s"
          % (len(items), len(dropped), max_age, out_path))


if __name__ == "__main__":
    main()
