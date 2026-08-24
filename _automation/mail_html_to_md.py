# -*- coding: utf-8 -*-
"""
쇼케이스 전용 — 다이제스트 메일의 HTML 파트를 digest_md_to_items.py가 읽는
마크다운 형태로 변환한다.

**왜 필요한가 (2026-08-24)**
반도체 다이제스트 메일의 text/plain 파트가 이날부터 마크다운이 아니라
"링크가 통째로 빠진 평문"으로 바뀌어, 파싱이 0건이 됐다. HTML 파트에는
링크가 그대로 살아있으므로 그쪽을 쓴다.

메일 HTML 구조(발신: Gemini Spark ... Digest):
    <div>
      <span>카테고리</span>
      <h2> N. <a href="URL">제목</a> </h2>
      <p> 요약 </p>
      <div><strong>🔍 심층 분석 및 산업 영향:</strong> 분석</div>
    </div>
변환 결과:
    카테고리 ## N. [제목](URL)
    요약
    🔍 심층 분석 및 산업 영향: 분석

디스플레이 실발행(run_daily.py)과 legacy 파서 경로는 이 파일을 쓰지 않는다.
"""
import re
import html as html_mod

NL = "\x00NL\x00"  # 블록 경계 표시용 임시 마커(원문 개행과 구분하려고 씀)

TAG_A = re.compile(r'<a\b[^>]*?href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.S | re.I)
TAG_SCRIPT = re.compile(r'<(script|style)\b.*?</\1>', re.S | re.I)
TAG_BLOCK_END = re.compile(r'</(p|div|h[1-6]|li|tr|td|section|article)\s*>', re.I)
TAG_BR = re.compile(r'<br\s*/?>', re.I)
TAG_HEADING = re.compile(r'<h[1-6][^>]*>', re.I)
TAG_ANY = re.compile(r'<[^>]+>')
WS = re.compile(r'[ \t]+')


def html_to_md(html):
    """메일 HTML을 마크다운 유사 텍스트로 변환한다."""
    s = TAG_SCRIPT.sub(" ", html)
    # 링크를 먼저 [텍스트](URL)로 바꾼다 — 이후 태그를 싹 지워도 URL이 남도록.
    s = TAG_A.sub(lambda m: "[%s](%s)" % (TAG_ANY.sub("", m.group(2)).strip(), m.group(1)), s)
    s = TAG_BR.sub(NL, s)
    # 제목 태그는 줄을 새로 열지 않는다 — 바로 앞 <span>카테고리</span>와 한 줄로 붙어야
    # ITEM_RE("카테고리 ## 1. [제목](URL)")에 맞는다.
    s = TAG_HEADING.sub(" ## ", s)
    s = TAG_BLOCK_END.sub(NL, s)
    s = TAG_ANY.sub("", s)
    # 원문 개행은 블록 경계가 아니다(한 항목이 여러 줄에 걸쳐 있음) → 공백으로 접는다.
    s = s.replace("\r", " ").replace("\n", " ")
    s = s.replace(NL, "\n")
    s = html_mod.unescape(s)
    lines = [WS.sub(" ", ln).strip() for ln in s.split("\n")]
    return "\n".join(ln for ln in lines if ln)


def get_html_text(msg):
    """메일에서 text/html 파트를 찾아 마크다운으로 변환해 돌려준다. 없으면 ''."""
    parts = msg.walk() if msg.is_multipart() else [msg]
    for part in parts:
        if part.get_content_type() != "text/html":
            continue
        if "attachment" in str(part.get("Content-Disposition") or ""):
            continue
        payload = part.get_payload(decode=True)
        if payload:
            charset = part.get_content_charset() or "utf-8"
            return html_to_md(payload.decode(charset, errors="replace"))
    return ""
