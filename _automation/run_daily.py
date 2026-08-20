# -*- coding: utf-8 -*-
"""
디스플레이 데일리 무인 실행 오케스트레이터 (GitHub Actions 전용).

1) Gmail(IMAP, 앱 비밀번호)에서 최근 며칠 내 "일간 디스플레이 탐사 보도 다이제스트" 메일 중 가장 최신 것을 찾는다.
2) 그 날짜의 카드가 이미 있으면 아무것도 하지 않고 종료한다(멱등성 — 중복 실행 방지).
3) digest_to_items.py 로직으로 파싱해 items.json을 만든다.
4) make_promo.py + make_index.py를 서브프로세스로 실행해 카드/아카이브 인덱스/사이트맵을 생성한다.
5) latest.html을 갱신한다.

출력은 전부 이 저장소 안(display-daily/)에 직접 쓴다 — 별도 복사 단계가 필요 없다.
성공/스킵/실패 여부는 종료 코드와 표준출력 메시지로 판단한다(GitHub Actions 로그에서 확인).
"""
import os
import re
import sys
import ssl
import json
import shutil
import imaplib

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
import email
import subprocess
from datetime import datetime, timedelta, timezone
from email.header import decode_header

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTO_DIR = os.path.join(REPO_ROOT, "_automation")
PUB_DIR = os.path.join(REPO_ROOT, "display-daily")
LOGO = os.path.join(AUTO_DIR, "assets", "nextio_logo.svg")
PY = sys.executable

SUBJECT_KEYWORD = "일간 디스플레이 탐사 보도 다이제스트"
DATE_RE = re.compile(r"(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일자")
SEARCH_WINDOW_DAYS = 5  # 최근 며칠 안에서만 다이제스트를 찾는다(주말/연휴 대비 여유)


def decode_mime(s):
    if not s:
        return ""
    out = ""
    for text, enc in decode_header(s):
        if isinstance(text, bytes):
            out += text.decode(enc or "utf-8", errors="replace")
        else:
            out += text
    return out


def get_plain_text(msg):
    if msg.is_multipart():
        for part in msg.walk():
            disp = str(part.get("Content-Disposition") or "")
            if part.get_content_type() == "text/plain" and "attachment" not in disp:
                charset = part.get_content_charset() or "utf-8"
                payload = part.get_payload(decode=True)
                if payload:
                    return payload.decode(charset, errors="replace")
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                charset = part.get_content_charset() or "utf-8"
                payload = part.get_payload(decode=True)
                if payload:
                    html = payload.decode(charset, errors="replace")
                    return re.sub("<[^>]+>", "", html)
        return ""
    charset = msg.get_content_charset() or "utf-8"
    payload = msg.get_payload(decode=True)
    return payload.decode(charset, errors="replace") if payload else ""


def find_latest_digest(imap):
    since = (datetime.now(timezone.utc) - timedelta(days=SEARCH_WINDOW_DAYS)).strftime("%d-%b-%Y")
    typ, data = imap.search(None, f'(SINCE "{since}")')
    if typ != "OK" or not data or not data[0]:
        return None
    ids = data[0].split()

    candidates = []  # (received_date, msg_id, subject_date_str)
    for msg_id in ids:
        typ, hdata = imap.fetch(msg_id, "(BODY.PEEK[HEADER.FIELDS (SUBJECT DATE)])")
        if typ != "OK" or not hdata or not hdata[0]:
            continue
        raw_header = hdata[0][1]
        msg = email.message_from_bytes(raw_header)
        subject = decode_mime(msg.get("Subject"))
        if SUBJECT_KEYWORD not in subject:
            continue
        m = DATE_RE.search(subject)
        if not m:
            continue
        y, mo, d = m.groups()
        date_str = f"{y}-{int(mo):02d}-{int(d):02d}"
        candidates.append((date_str, msg_id, subject))

    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0]  # (date_str, msg_id, subject)


def main():
    gmail_user = os.environ.get("GMAIL_ADDRESS")
    gmail_pass = os.environ.get("GMAIL_APP_PASSWORD")
    if not gmail_user or not gmail_pass:
        print("ERROR: GMAIL_ADDRESS / GMAIL_APP_PASSWORD 환경변수가 없습니다.")
        sys.exit(1)

    imap = imaplib.IMAP4_SSL("imap.gmail.com", 993, ssl_context=ssl.create_default_context())
    imap.login(gmail_user, gmail_pass)
    imap.select("INBOX")

    found = find_latest_digest(imap)
    if not found:
        # 조용히 성공으로 끝내지 않는다 — 실패로 종료해야 GitHub이 알림 메일을 보낸다.
        # (메일함에는 반도체/배터리 등 다른 다이제스트도 오므로, 못 찾았다는 건 진짜 이상 신호다.)
        print(f"ERROR: 최근 {SEARCH_WINDOW_DAYS}일 내 '{SUBJECT_KEYWORD}' 메일을 찾지 못했습니다.")
        print("       메일이 아직 도착하지 않았거나, 제목 형식이 바뀌었을 수 있습니다.")
        imap.logout()
        sys.exit(1)

    date_str, msg_id, subject = found
    # 어떤 메일을 골랐는지 반드시 남긴다 — 엉뚱한 다이제스트를 집었는지 로그로 확인할 수 있어야 한다.
    print(f"선택한 메일: {subject}")
    card_path = os.path.join(PUB_DIR, f"card_{date_str}.html")
    if os.path.exists(card_path):
        print(f"오늘({date_str}) 카드 이미 존재 → 작업 없이 종료: {card_path}")
        imap.logout()
        return

    typ, data = imap.fetch(msg_id, "(RFC822)")
    imap.logout()
    if typ != "OK" or not data or not data[0]:
        print("ERROR: 메일 본문 가져오기 실패")
        sys.exit(1)

    msg = email.message_from_bytes(data[0][1])
    body_text = get_plain_text(msg)
    if not body_text.strip():
        print("ERROR: 다이제스트 본문이 비어있음")
        sys.exit(1)

    tmp_txt = os.path.join(AUTO_DIR, f"_digest_{date_str}.txt")
    with open(tmp_txt, "w", encoding="utf-8") as f:
        f.write(body_text)

    sys.path.insert(0, AUTO_DIR)
    import digest_to_items  # noqa: E402

    items = digest_to_items.parse_digest(body_text)
    for it in items:
        it["date"] = date_str
        it["tag"] = ""

    if not items:
        print(f"ERROR: {date_str} 다이제스트에서 파싱된 기사가 0건 — 형식이 예상과 다를 수 있음")
        sys.exit(1)

    empty_urls = [it["title"] for it in items if not it.get("url")]
    if empty_urls:
        print(f"경고: 원문 링크 파싱 실패 항목 {len(empty_urls)}건: {empty_urls}")

    items_json = os.path.join(AUTO_DIR, f"_items_{date_str}.json")
    with open(items_json, "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=2)

    os.makedirs(PUB_DIR, exist_ok=True)

    r1 = subprocess.run(
        [PY, os.path.join(AUTO_DIR, "make_promo.py"), items_json, card_path, date_str, LOGO],
        capture_output=True, text=True,
    )
    print(r1.stdout)
    if r1.returncode != 0:
        print(r1.stderr)
        sys.exit(1)

    r2 = subprocess.run(
        [PY, os.path.join(AUTO_DIR, "make_index.py"), PUB_DIR, LOGO],
        capture_output=True, text=True,
    )
    print(r2.stdout)
    if r2.returncode != 0:
        print(r2.stderr)
        sys.exit(1)

    shutil.copyfile(card_path, os.path.join(PUB_DIR, "latest.html"))

    os.remove(tmp_txt)
    os.remove(items_json)

    print(f"✔ {date_str} 데일리카드 {len(items)}건 생성 완료: {card_path}")


if __name__ == "__main__":
    main()
