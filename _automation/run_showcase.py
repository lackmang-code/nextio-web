# -*- coding: utf-8 -*-
"""
쇼케이스 3종(성대 첨디공·Next I/O 반도체·에이프로머티리얼즈) 무인 발행 오케스트레이터.

run_daily.py(디스플레이 데일리 실발행)와 **완전히 분리된** 별도 경로다.
- 실발행 파이프라인(display-daily/)은 이 스크립트가 절대 건드리지 않는다.
- 여기서 실패해도 디스플레이 데일리 발행에는 영향이 없다(워크플로에서 별도 스텝).

동작(브랜드별로 독립 수행):
 1) Gmail에서 해당 브랜드의 다이제스트 최신 메일을 찾는다.
 2) 그 날짜 카드가 이미 있으면 스킵한다(멱등).
 3) 본문을 파싱해 items.json 생성 — 다이제스트 발행일보다 오래된 기사는 걸러낸다.
 4) make_promo.py / make_index.py 를 --brand 로 실행해 카드·아카이브를 만든다.
 5) latest.html 을 그날 카드로 갱신한다(홈페이지 목업이 이 파일을 본다).

사용법: python _automation/run_showcase.py [--only <brand-key>]
"""
import os
import re
import ssl
import sys
import json
import shutil
import imaplib
import email
import subprocess
from datetime import datetime, timedelta, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from run_daily import decode_mime, get_plain_text  # IMAP 헬퍼만 재사용(실발행 로직은 건드리지 않음)
from mail_html_to_md import get_html_text

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTO_DIR = os.path.join(REPO_ROOT, "_automation")
SHOWCASE_DIR = os.path.join(REPO_ROOT, "showcase")
PY = sys.executable

SEARCH_WINDOW_DAYS = 5
MAX_AGE_DAYS = 3  # 다이제스트 발행일보다 이만큼 넘게 지난 기사는 카드에 싣지 않는다

# 반도체·배터리 제목은 "…2026년 8월 23일 일일 …" 형태라 디스플레이의 "…8월 23일자"와 다르다.
# '일' 뒤의 '자'를 선택적으로 둬서 세 형식을 모두 잡는다.
DATE_RE = re.compile(r"(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일")

BRANDS = [
    {
        "key": "skku-display",
        "subject": "일간 디스플레이 탐사 보도 다이제스트",
        "legacy": True,   # 구 형식 파서(- 내용:/- 분석:/- 출처:)
        "logo": "assets/brand_skku.svg",
    },
    {
        "key": "semiconductor",
        "subject": "반도체 탐사 보도 다이제스트",
        "legacy": False,  # 마크다운 형식 파서
        "logo": "assets/nextio_logo.svg",
    },
    {
        "key": "battery",
        "subject": "배터리 탐사 보도 다이제스트",
        "legacy": False,
        "logo": "assets/brand_battery.svg",
    },
]


def find_digest(imap, subject_keyword):
    """제목에 keyword가 든 메일 중 제목 날짜가 가장 최신인 것을 고른다."""
    since = (datetime.now(timezone.utc) - timedelta(days=SEARCH_WINDOW_DAYS)).strftime("%d-%b-%Y")
    typ, data = imap.search(None, '(SINCE "%s")' % since)
    if typ != "OK" or not data or not data[0]:
        return None

    candidates = []
    for msg_id in data[0].split():
        typ, hdata = imap.fetch(msg_id, "(BODY.PEEK[HEADER.FIELDS (SUBJECT DATE)])")
        if typ != "OK" or not hdata or not hdata[0]:
            continue
        subject = decode_mime(email.message_from_bytes(hdata[0][1]).get("Subject"))
        if subject_keyword not in subject:
            continue
        m = DATE_RE.search(subject)
        if not m:
            continue
        y, mo, d = m.groups()
        candidates.append(("%s-%02d-%02d" % (y, int(mo), int(d)), msg_id, subject))

    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0]


def run(cmd):
    res = subprocess.run(cmd, cwd=AUTO_DIR)
    if res.returncode != 0:
        raise RuntimeError("명령 실패: %s" % " ".join(str(c) for c in cmd))


def publish_brand(imap, brand):
    """한 브랜드를 발행한다. 발행하면 True, 스킵이면 False, 실패하면 예외."""
    key = brand["key"]
    pub_dir = os.path.join(SHOWCASE_DIR, key)
    os.makedirs(pub_dir, exist_ok=True)

    found = find_digest(imap, brand["subject"])
    if not found:
        raise RuntimeError("최근 %d일 내 '%s' 메일을 찾지 못했습니다." % (SEARCH_WINDOW_DAYS, brand["subject"]))

    date_str, msg_id, subject = found
    print("  선택한 메일: %s" % subject)

    card_path = os.path.join(pub_dir, "card_%s.html" % date_str)
    if os.path.exists(card_path):
        print("  %s 카드 이미 존재 → 스킵" % date_str)
        return False

    typ, data = imap.fetch(msg_id, "(RFC822)")
    if typ != "OK" or not data or not data[0]:
        raise RuntimeError("메일 본문 가져오기 실패")

    msg = email.message_from_bytes(data[0][1])
    body_text = ""
    if not brand["legacy"]:
        # 마크다운형(반도체·배터리)은 HTML 파트를 우선 쓴다.
        # 2026-08-24부터 text/plain 파트에서 기사 링크가 통째로 빠져 나와 파싱이 0건이 됐다.
        # HTML에는 <a href>가 살아있으므로 그쪽을 마크다운으로 변환해 쓴다.
        md = get_html_text(msg)
        if "](http" in md:
            body_text = md
        elif md:
            print("  주의: HTML 파트에서 링크를 찾지 못해 text/plain으로 폴백합니다.")
    if not body_text:
        body_text = get_plain_text(msg)
    if not body_text.strip():
        raise RuntimeError("다이제스트 본문이 비어있음")

    raw_path = os.path.join(AUTO_DIR, "_raw_%s_%s.txt" % (key, date_str))
    items_path = os.path.join(AUTO_DIR, "_items_%s_%s.json" % (key, date_str))
    with open(raw_path, "w", encoding="utf-8") as f:
        f.write(body_text)

    try:
        cmd = [PY, "digest_md_to_items.py", raw_path, items_path, date_str,
               "--max-age", str(MAX_AGE_DAYS)]
        if brand["legacy"]:
            cmd.append("--legacy")
        run(cmd)

        run([PY, "make_promo.py", items_path, card_path, date_str, brand["logo"], "--brand", key])
        run([PY, "make_index.py", pub_dir, brand["logo"], "--brand", key])
        shutil.copyfile(card_path, os.path.join(pub_dir, "latest.html"))
        print("  발행 완료: %s" % card_path)
        return True
    finally:
        for p in (raw_path, items_path):
            if os.path.exists(p):
                os.remove(p)


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]

    gmail_user = os.environ.get("GMAIL_ADDRESS")
    gmail_pass = os.environ.get("GMAIL_APP_PASSWORD")
    if not gmail_user or not gmail_pass:
        print("ERROR: GMAIL_ADDRESS / GMAIL_APP_PASSWORD 환경변수가 없습니다.")
        sys.exit(1)

    imap = imaplib.IMAP4_SSL("imap.gmail.com", 993, ssl_context=ssl.create_default_context())
    imap.login(gmail_user, gmail_pass)
    imap.select("INBOX")

    published, skipped, failed = [], [], []
    try:
        for brand in BRANDS:
            if only and brand["key"] != only:
                continue
            print("[%s]" % brand["key"])
            try:
                if publish_brand(imap, brand):
                    published.append(brand["key"])
                else:
                    skipped.append(brand["key"])
            except Exception as e:
                # 한 브랜드가 실패해도 나머지는 계속 발행한다.
                print("  ERROR: %s" % e)
                failed.append(brand["key"])
    finally:
        try:
            imap.logout()
        except Exception:
            pass

    print("\n요약 — 발행 %d건%s / 스킵 %d건%s / 실패 %d건%s" % (
        len(published), (" " + ",".join(published)) if published else "",
        len(skipped), (" " + ",".join(skipped)) if skipped else "",
        len(failed), (" " + ",".join(failed)) if failed else ""))

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
