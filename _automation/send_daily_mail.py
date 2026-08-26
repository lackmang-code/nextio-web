# -*- coding: utf-8 -*-
"""
데일리카드 발행 알림 메일.

당일 카드 HTML을 헤드리스 크롬으로 캡처해 썸네일을 만들고,
"오늘 카드가 나왔습니다 + 썸네일(링크) + 카드 링크" 한 통을 보낸다.

설계 의도
  · 메일에 카드 내용을 옮겨 담지 않는다. 카드는 홈페이지에 이미 있고,
    메일이 할 일은 알림과 유입뿐이다.
  · 썸네일은 저장소에 커밋하지 않고 메일에 인라인 첨부한다.
    매일 커밋하면 저장소가 영구히 부푼다(2026-08-24 히스토리 재작성 사례).
  · 썸네일 생성에 실패해도 메일은 텍스트+링크로 나간다. 발송이 우선이다.

사용법
  python _automation/send_daily_mail.py --brand battery [--date YYYY-MM-DD] [--dry-run]

수신자
  환경변수 MAIL_TO_<브랜드키>  (쉼표 구분, 대시는 밑줄로: skku-display -> MAIL_TO_SKKU_DISPLAY)
  비어 있으면 그 브랜드는 조용히 건너뛴다. → 브랜드별로 켜고 끄는 스위치 역할.
"""
import os, sys, json, argparse, subprocess, tempfile, smtplib, shutil
from datetime import datetime, timezone, timedelta
from email.message import EmailMessage
from email.utils import make_msgid
from urllib.parse import urlparse

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTO_DIR = os.path.join(REPO_ROOT, "_automation")
BRANDS_PATH = os.path.join(AUTO_DIR, "brands.json")
KST = timezone(timedelta(hours=9))

# 썸네일: 카드 상단(헤더+TOP PICK)만 담기는 크기. 카드 본문은 이 아래부터 시작한다.
SHOT_W, SHOT_H = 700, 470
THUMB_W = 480          # 이메일에 표시되는 CSS 폭(px) — HTML width/max-width는 이 값을 쓴다
THUMB_PX_W = THUMB_W * 2  # 실제 저장 픽셀 폭 — 고밀도(레티나) 화면에서 흐려 보이지 않게 2배로 저장


def load_brand(key):
    with open(BRANDS_PATH, encoding="utf-8") as f:
        brands = json.load(f)
    if key not in brands:
        raise SystemExit("알 수 없는 브랜드: %s (가능: %s)" % (key, ", ".join(brands)))
    return brands[key]


def pub_dir_of(brand):
    """base_url 의 경로 부분을 저장소 안 폴더로 되돌린다."""
    path = urlparse(brand["base_url"]).path.strip("/")
    return os.path.join(REPO_ROOT, *path.split("/"))


def find_chrome():
    # CI(우분투)에는 google-chrome 이 기본 설치돼 있다. 윈도우 로컬 테스트용 경로도 함께 본다.
    env = os.environ.get("CHROME_BIN")
    if env and os.path.exists(env):
        return env
    for name in ("google-chrome", "google-chrome-stable", "chromium",
                 "chromium-browser", "chrome"):
        p = shutil.which(name)
        if p:
            return p
    for p in (r"C:\Program Files\Google\Chrome\Application\chrome.exe",
              r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"):
        if os.path.exists(p):
            return p
    return None


def make_thumb(card_path, out_path):
    """카드 상단을 캡처해 축소 저장. 실패하면 None 을 돌려주고 메일은 그대로 진행한다."""
    chrome = find_chrome()
    if not chrome:
        print("  썸네일 건너뜀: 크롬을 찾지 못했습니다")
        return None
    raw = out_path + ".raw.png"
    # 2배 스케일로 캡처한 뒤 THUMB_W로 축소 — 이메일 화면(고밀도 디스플레이 포함)에서
    # 더 또렷하게 보인다. 캡처 자체를 THUMB_W 그대로 하면 확대 시 흐려진다.
    scale = 2
    cmd = [chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
           "--hide-scrollbars", "--force-device-scale-factor=%d" % scale,
           "--window-size=%d,%d" % (SHOT_W, SHOT_H),
           "--screenshot=" + raw, "file://" + card_path.replace("\\", "/")]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    if r.returncode != 0 or not os.path.exists(raw):
        print("  썸네일 건너뜀: 캡처 실패 (%s)" % (r.stderr or "").strip()[:160])
        return None
    try:
        from PIL import Image
    except ImportError:
        print("  썸네일 건너뜀: Pillow 미설치")
        return None
    im = Image.open(raw).convert("RGB")
    im = im.crop((0, 0, im.width, min(SHOT_H * scale, im.height)))
    h = round(im.height * THUMB_PX_W / im.width)
    im.resize((THUMB_PX_W, h), Image.LANCZOS).save(
        out_path, "JPEG", quality=90, optimize=True, progressive=True)
    os.remove(raw)
    print("  썸네일 생성: %.1f KB" % (os.path.getsize(out_path) / 1024))
    return out_path


def build_html(brand, date_str, card_url, cid):
    pub = brand["publisher"]
    kicker = brand["kicker"]
    topic = brand["topic"]
    accent, accent2 = brand["accent"], brand["accent2"]
    img_block = ""
    if cid:
        img_block = (
            '<div style="padding:18px 20px 0;">'
            '<a href="%s" style="text-decoration:none;">'
            '<img src="cid:%s" width="%d" alt="%s %s 카드" '
            'style="display:block;width:100%%;max-width:%dpx;height:auto;margin:0 auto;'
            'border:1px solid #e0dbd0;border-radius:8px;" /></a></div>'
            % (card_url, cid, THUMB_W, pub, date_str, THUMB_W))
    return """<div style="margin:0;padding:0;background:#f4f1ea;">
<div style="max-width:520px;margin:0 auto;background:#ffffff;font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;">
<div style="background:#1a1a1a;padding:15px 20px;">
<table width="100%%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="color:#ffffff;font-size:14px;font-weight:800;">{pub}</td>
<td align="right" style="color:{accent};font-size:11px;font-weight:800;letter-spacing:0.14em;">{kicker}</td>
</tr></table>
</div>
<div style="padding:24px 20px 0;text-align:center;">
<div style="font-size:17px;font-weight:800;color:#1a1a1a;">{date} {topic} 핫 이슈입니다.</div>
</div>
{img}
<div style="padding:16px 20px 6px;">
<table width="100%%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="{accent2}" style="border-radius:8px;">
<a href="{card}" style="display:block;padding:15px 20px;color:#ffffff;font-size:15.5px;font-weight:800;text-decoration:none;">카드 보기 &#9654;</a>
</td></tr></table>
</div>
<div style="padding:14px 20px 26px;text-align:center;">
<div style="font-size:10.5px;color:#aaaaaa;line-height:1.7;margin-top:4px;border-top:1px solid #eeeeee;padding-top:14px;">
이 메일은 <b style="color:#888888;">Next I/O 홍보팀</b>이 매일 아침 자동 발송합니다<br>
수신을 원치 않으시면 이 메일에 회신해 주십시오. 바로 중단하겠습니다.<br>
<a href="https://www.nextio.ai.kr" style="color:#aaaaaa;text-decoration:none;">www.nextio.ai.kr</a>
</div>
</div>
</div></div>""".format(pub=pub, kicker=kicker, topic=topic, accent=accent, accent2=accent2,
                       date=date_str, img=img_block, card=card_url)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--brand", required=True)
    ap.add_argument("--date")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    brand = load_brand(a.brand)
    date_str = a.date or datetime.now(KST).strftime("%Y-%m-%d")

    env_key = "MAIL_TO_" + a.brand.upper().replace("-", "_")
    raw_to = (os.environ.get(env_key) or "").strip()
    to = [x.strip() for x in raw_to.replace(";", ",").split(",") if x.strip()]
    if not to:
        print("[%s] 수신자 미설정(%s) — 건너뜁니다" % (a.brand, env_key))
        return

    pub_dir = pub_dir_of(brand)
    card_path = os.path.join(pub_dir, "card_%s.html" % date_str)
    if not os.path.exists(card_path):
        print("[%s] %s 카드가 없습니다 — 건너뜁니다" % (a.brand, date_str))
        return

    base = brand["base_url"].rstrip("/")
    # 확장자 없는 주소가 리다이렉트 0회로 바로 열린다(2026-08-25 실측).
    card_url = "%s/card_%s?utm_source=email&utm_medium=daily" % (base, date_str)

    print("[%s] %s → %d명" % (a.brand, date_str, len(to)))

    tmpdir = tempfile.mkdtemp(prefix="dailymail_")
    try:
        thumb = make_thumb(card_path, os.path.join(tmpdir, "thumb.jpg"))

        msg = EmailMessage()
        msg["Subject"] = "%s — %s | %s" % (brand["masthead"], date_str, brand["publisher"])
        msg["From"] = "Next I/O 홍보팀 <%s>" % os.environ["GMAIL_ADDRESS"]
        msg["To"] = ", ".join(to)
        msg.set_content(
            "%s %s 핫 이슈입니다.\n\n카드 보기: %s\n\n"
            "이 메일은 Next I/O 홍보팀이 매일 아침 자동 발송합니다.\n"
            "수신을 원치 않으시면 이 메일에 회신해 주십시오. 바로 중단하겠습니다."
            % (date_str, brand["topic"], card_url))

        cid_val = None
        if thumb:
            cid_val = make_msgid(domain="nextio.ai.kr")[1:-1]  # <> 제거
        msg.add_alternative(
            build_html(brand, date_str, card_url, cid_val), subtype="html")
        if thumb:
            with open(thumb, "rb") as f:
                msg.get_payload()[1].add_related(
                    f.read(), "image", "jpeg", cid="<%s>" % cid_val, filename="card.jpg")

        if a.dry_run:
            print("  [드라이런] 발송하지 않음. 제목: %s" % msg["Subject"])
            return

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=60) as s:
            s.login(os.environ["GMAIL_ADDRESS"], os.environ["GMAIL_APP_PASSWORD"])
            s.send_message(msg)
        print("  발송 완료")
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


if __name__ == "__main__":
    main()
