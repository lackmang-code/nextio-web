# -*- coding: utf-8 -*-
"""
디스플레이 데일리 — 공개 홍보용 카드 생성기
내부 수집용과 달리: ① 기사 본문 임베드 안 함(저작권 안전) ② 공식 로고 삽입
③ 헤드라인 + 'AI의 시선'(우리 코멘트) + 원문 링크 형태.
사용법: python make_promo.py <items.json> <output.html> <YYYY-MM-DD> <logo.svg>
"""
import sys, json, html

# 카톡·링크드인 링크 미리보기용 썸네일(1200x630). display-daily/에 함께 배포됨.
OG_IMAGE = "https://www.nextio.ai.kr/display-daily/og-display-daily.png"

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{font-family:'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;background:#c8bfb0;padding:22px 12px;line-height:1.6}
.sheet{max-width:800px;margin:0 auto;background:#fdf9f3;border-radius:8px;box-shadow:0 14px 44px rgba(0,0,0,.4),0 4px 12px rgba(0,0,0,.25);overflow:hidden}
/* 다크 로고 헤더 */
.hd{background:#0a0a0a;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.hd .logo{height:46px;display:flex;align-items:center}
.hd .logo svg{height:46px;width:auto;border-radius:4px}
.hd .kick{text-align:right}
.hd .kick .k1{font-size:12px;font-weight:700;color:#fbbf24;letter-spacing:2px}
.hd .kick .k2{font-size:11px;color:#bbb;margin-top:2px}
.inner{padding:26px 30px 22px}
.title{font-size:1.4rem;line-height:1.3;letter-spacing:-.5px;color:#000;font-weight:700;margin-bottom:4px}
.date{font-size:.85rem;color:#777;font-weight:600;margin-bottom:16px}
.date b{color:#b45309}
.dt{height:1px;background:#e0e0e0;margin:14px 0}

.top{background:#1a1a1a;color:#f0eadf;border-radius:10px;padding:16px 18px;margin-bottom:14px}
.top .tk{font-size:10px;letter-spacing:1.5px;color:#ffd700;font-weight:700;text-transform:uppercase;margin-bottom:6px}
.top .tt{font-size:1.08rem;line-height:1.4;color:#fff;font-weight:700;word-break:keep-all;margin-bottom:7px}
.top .eye{font-size:.84rem;line-height:1.7;color:#e8e2d6;word-break:keep-all}
.top .eye b{color:#ffd700;font-weight:700}
.top .meta{font-size:11px;color:#bbb;margin-top:9px}
.top .meta a{color:#d9c98a;text-decoration:none}

.item{display:flex;gap:13px;padding:13px 0;border-bottom:1px solid #ece7dd}
.item:last-of-type{border-bottom:none}
.num{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#efe9df;border:1px solid #e0d8c9;color:#3a3228;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
.ib{flex:1;min-width:0}
.it{font-size:1rem;line-height:1.4;color:#111;font-weight:700;word-break:keep-all;margin-bottom:4px}
.eye{font-size:.84rem;line-height:1.65;color:#444;word-break:keep-all}
.eye .lab{color:#b45309;font-weight:700}
.meta{font-size:11px;color:#999;margin-top:5px;word-break:break-all}
.meta a{color:#8a6d3b;text-decoration:none;font-weight:600}
.dbadge{display:inline-block;font-size:10px;font-weight:700;color:#fff;background:#3a3228;border-radius:4px;padding:1px 6px;margin-right:7px}
.top .dbadge{background:#fbbf24;color:#1a1a1a}
/* 기사 본문 아코디언(한글 번역·편집본) */
.art{margin-top:10px;border:1px solid #e3ddd2;border-radius:8px;background:#faf7f1;overflow:hidden}
.art>summary{cursor:pointer;list-style:none;padding:8px 12px;font-size:.8rem;font-weight:700;color:#3a3228;background:#f1ece2;user-select:none}
.art>summary::-webkit-details-marker{display:none}
.art>summary::before{content:"▸ ";color:#b45309}
.art[open]>summary::before{content:"▾ "}
.art[open]>summary{border-bottom:1px solid #e3ddd2}
.bodytext{padding:12px 14px}
.bodytext p{font-size:.85rem;line-height:1.8;color:#333;word-break:keep-all;text-align:justify;margin-bottom:9px}
.bodytext p:last-child{margin-bottom:0}
.top .art{background:#262626;border-color:#3a3a3a;margin-top:11px}
.top .art>summary{background:#333;color:#e8e2d6}
.top .art>summary::before{color:#fbbf24}
.top .bodytext p{color:#ddd6c8}

/* 홍보 푸터 (CTA) */
.cta{margin-top:20px;background:#fbf6ee;border:1px solid #ecdfca;border-radius:10px;padding:16px 18px;text-align:center}
.cta .c1{font-size:.92rem;color:#1a1a1a;font-weight:700;word-break:keep-all}
.cta .c1 b{color:#b45309}
.cta .c2{font-size:.8rem;color:#666;margin-top:6px;line-height:1.6;word-break:keep-all}
.cta .c3{font-size:.75rem;color:#999;margin-top:8px;padding-top:8px;border-top:1px solid #ecdfca;word-break:keep-all}
.foot{margin-top:14px;padding-top:12px;border-top:1px solid #e0e0e0;font-size:10.5px;color:#aaa;line-height:1.6;text-align:center;word-break:keep-all}

@media (max-width: 600px) {
  body { padding: 0 !important; }
  .sheet { border-radius: 0 !important; box-shadow: none !important; }
  .hd { padding: 14px 16px !important; flex-direction: column; align-items: flex-start; gap: 10px; }
  .inner { padding: 20px 16px !important; }
  .title { font-size: 1.25rem !important; }
  .row { padding: 10px 12px !important; }
  .row .d { font-size: 0.95rem !important; }
  .item { flex-direction: column; gap: 8px; }
  .num { width: 24px; height: 24px; font-size: 11px; }
  .it { font-size: 1rem !important; }
}

"""

def esc(s): return html.escape(str(s or ""))

def meta_line(it, cls="meta"):
    dt = esc(it.get("date")); src = esc(it.get("source")); url = esc(it.get("url"))
    badge = f'<span class="dbadge">{dt}</span>' if dt else ""
    link = f' · <a href="{url}" target="_blank" rel="noopener">원문 보기 ↗</a>' if url else ""
    return f'<div class="{cls}">{badge}{src}{link}</div>'

def render_body(it):
    """기사 본문(한글 번역·편집본)을 접이식으로. body 없으면 빈 문자열."""
    body = it.get("body")
    if not body:
        return ""
    return f"""<details class="art">
  <summary>📄 기사 본문 보기 (한글 번역·편집본)</summary>
  <div class="bodytext">{body}</div>
</details>"""

def render_top(it):
    return f"""<div class="top">
  <div class="tk">🥇 오늘의 Top Pick</div>
  <div class="tt">{esc(it.get("title"))}</div>
  <div class="eye">{esc(it.get("summary"))} <b>{esc(it.get("tag"))}</b></div>
  {meta_line(it, "meta")}
  {render_body(it)}
</div>"""

def render_item(n, it):
    tag = f' <span class="lab">— {esc(it.get("tag"))}</span>' if it.get("tag") else ""
    return f"""<div class="item">
  <div class="num">{n}</div>
  <div class="ib">
    <div class="it">{esc(it.get("title"))}</div>
    <div class="eye">{esc(it.get("summary"))}{tag}</div>
    {meta_line(it)}
    {render_body(it)}
  </div>
</div>"""

def build_description(items):
    """그날 다룬 기사 제목 2~3개를 이어붙여 카드별로 고유한 검색용 요약을 만든다."""
    titles = [it.get("title", "").strip() for it in items if it.get("title")]
    if not titles:
        return "Next I/O가 선별하는 디스플레이 업계 뉴스 브리핑"
    picked, total = [], 0
    for t in titles[:3]:
        t = t if len(t) <= 60 else t[:57] + "..."
        picked.append(t)
        total += len(t)
        if total > 110:
            break
    return " / ".join(picked) + " 등 디스플레이 업계 뉴스 브리핑 — Next I/O"

def build(items, date_str, logo_svg, card_url=""):
    n = len(items)
    if n == 0:
        body = '<div style="padding:30px 0;text-align:center;color:#999">오늘은 선별할 신규 소식이 없습니다.</div>'
    else:
        body = render_top(items[0])
        rest = items[1:]
        if rest:
            body += '<div class="dt"></div>' + "\n".join(render_item(i+2, it) for i, it in enumerate(rest))
    title_text = f"디스플레이 데일리 — {esc(date_str)} | Next I/O"
    desc_text = esc(build_description(items))
    og_tags = ""
    if card_url:
        og_tags = f"""<link rel="canonical" href="{esc(card_url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Next I/O">
<meta property="og:title" content="{title_text}">
<meta property="og:description" content="{desc_text}">
<meta property="og:url" content="{esc(card_url)}">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="{OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="디스플레이 데일리 — Next I/O">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title_text}">
<meta name="twitter:description" content="{desc_text}">
<meta name="twitter:image" content="{OG_IMAGE}">
"""
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_text}</title>
<meta name="description" content="{desc_text}">
{og_tags}<style>{CSS}</style>
</head>
<body>
<div class="sheet">
  <div class="hd">
    <div class="logo">{logo_svg}</div>
    <div class="kick"><div class="k1">DISPLAY DAILY</div><div class="k2">AI 큐레이션 · 매일 업데이트</div></div>
  </div>
  <div class="inner">
    <h1 class="title">오늘의 디스플레이 Tech</h1>
    <div class="date">{esc(date_str)} · AI가 고른 소식 <b>{n}건</b></div>
    {body}
    <div class="cta">
      <div class="c1">이 브리핑, <b>Next I/O</b>가 AI로 <b>매일 자동 제작</b>합니다.</div>
      <div class="c2">학과·연구소·기업의 뉴스레터/매거진을 AI 파이프라인으로 위탁 개발합니다.<br><a href="https://www.nextio.ai.kr" target="_blank" rel="noopener">www.nextio.ai.kr</a></div>
      <div class="c3">다른 날짜의 기사도 확인하고 싶으면 → <a href="https://www.nextio.ai.kr/display-daily/" target="_blank" rel="noopener">디스플레이 데일리 아카이브</a></div>
    </div>
    <div class="foot">본 페이지는 공개된 기사 제목·출처를 AI가 선별하고 Next I/O가 한 줄 해설을 덧붙인 큐레이션입니다. 각 기사의 저작권은 해당 언론사에 있으며, 상세 내용은 원문 링크에서 확인하세요.</div>
  </div>
</div>
</body>
</html>"""

def main():
    if len(sys.argv) < 5:
        print("usage: make_promo.py <items.json> <output.html> <YYYY-MM-DD> <logo.svg>"); sys.exit(1)
    items_path, out_path, date_str, logo_path = sys.argv[1:5]
    with open(items_path, encoding="utf-8") as f:
        data = json.load(f)
    items = data.get("items", []) if isinstance(data, dict) else data
    with open(logo_path, encoding="utf-8") as f:
        logo_svg = f.read()
    card_url = f"https://www.nextio.ai.kr/display-daily/card_{date_str}.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(build(items, date_str, logo_svg, card_url))
    print(f"OK promo: {out_path} ({len(items)} items)")

if __name__ == "__main__":
    main()
