# -*- coding: utf-8 -*-
"""
디스플레이 데일리 — 공개 아카이브 index 생성기
public 폴더의 card_YYYY-MM-DD.html 들을 모아 최신순 목록 페이지를 만든다.
사용법: python make_index.py <public_dir> <logo.svg> [--brand <key>]
"""
import sys, os, re, html, json

from make_promo import load_brand

CSS = ""

NL = chr(10)

def build_partner_html(brand, wrap_style="", link_color=""):
    """자매 매체 링크 한 줄. brands.json 에 partner_links 가 있는 브랜드에만 붙는다.
    타 기관 명의 쇼케이스 브랜드에는 이 키를 넣지 말 것(브랜드 파일 _note 참조).
    rel 은 noopener 만 — nofollow 를 붙이면 SEO 목적이 사라진다."""
    pl = brand.get("partner_links") or {}
    items = [it for it in (pl.get("items") or []) if it.get("label") and it.get("url")]
    if not items:
        return ""
    ls = ' style="color:%s;font-weight:600"' % link_color if link_color else ""
    links = " &middot; ".join(
        '<a href="%s" target="_blank" rel="noopener"%s>%s</a>' % (esc(it["url"]), ls, esc(it["label"]))
        for it in items)
    return NL + '      <div style="%s">%s &rarr; %s</div>' % (wrap_style, esc(pl.get("lead") or ""), links)

def esc(s): return html.escape(str(s or ""))

def main():
    argv = sys.argv[1:]
    brand_key = None
    if "--brand" in argv:
        i = argv.index("--brand")
        brand_key = argv[i + 1]
        del argv[i:i + 2]
    if len(argv) < 2:
        print("usage: make_index.py <public_dir> <logo.svg> [--brand <key>]"); sys.exit(1)
    pub, logo_path = argv[0], argv[1]
    brand = load_brand(brand_key)
    pub_name = esc(brand["publisher"])
    masthead = esc(brand["masthead"])
    topic = esc(brand["topic"])
    kicker = esc(brand["kicker"])
    index_kicker_sub = esc(brand.get("index_kicker_sub") or "아카이브 · 매일 업데이트")
    archive_label = esc(brand.get("archive_label") or (brand["masthead"] + " 아카이브"))
    archive_url = brand["base_url"].rstrip("/") + "/"
    og_image = esc(brand["og_image"])
    site_url = brand.get("site_url") or "https://www.nextio.ai.kr"
    site_label = site_url.replace("https://", "").replace("http://", "").rstrip("/")
    archive_desc = esc(brand.get("archive_desc") or
        ("%s가 AI로 매일 자동 제작하는 %s 업계 뉴스 브리핑 아카이브" % (brand["publisher"], brand["topic"])))
    archive_intro = esc(brand.get("archive_intro") or
        ("%s가 AI로 매일 자동 선별·해설하는 %s 업계 뉴스 브리핑. 날짜를 눌러 그날의 브리핑을 확인하세요." % (brand["publisher"], brand["topic"])))
    index_foot = brand.get("index_foot") or (
        'AI 자동 큐레이션 by <b>%s</b> · 온라인 매거진 위탁 개발 · <a href="%s" target="_blank" rel="noopener">%s</a>'
        % (pub_name, site_url, site_label))
    partner_html = build_partner_html(
        brand,
        wrap_style="margin-top:8px;font-size:11px;color:#999;text-align:center;line-height:1.6",
        link_color="#666")
    with open(logo_path, encoding="utf-8") as f:
        logo_svg = f.read()
    pat = re.compile(r'^card_(\d{4}-\d{2}-\d{2})\.html$')
    dates = sorted({m.group(1) for fn in os.listdir(pub) if (m := pat.match(fn))}, reverse=True)
    if dates:
        rows = "\n".join(
            f'<a class="row" href="card_{d}.html"><span class="d">{d}'
            + (' <span class="badge">최신</span>' if i == 0 else '')
            + '</span><span class="go">브리핑 보기 →</span></a>'
            for i, d in enumerate(dates))
    else:
        rows = '<div class="empty">아직 게시된 브리핑이 없습니다.</div>'
    out = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{archive_label} | {pub_name}</title>
<meta name="description" content="{archive_desc}">
<link rel="canonical" href="{archive_url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{pub_name}">
<meta property="og:title" content="{archive_label} | {pub_name}">
<meta property="og:description" content="{archive_desc}">
<meta property="og:url" content="{archive_url}">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="{og_image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{masthead} — {pub_name}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{archive_label} | {pub_name}">
<meta name="twitter:description" content="{archive_desc}">
<meta name="twitter:image" content="{og_image}">
<style>
/* Base Styles */
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#1a1a1a;background:#c8bfb0;line-height:1.6}}

/* App Layout */
.app-container {{
  display: flex; gap: 40px; max-width: 1100px; margin: 20px auto; align-items: stretch; height: 860px; padding: 0 20px;
}}
/* Left Sidebar */
.sidebar {{
  flex: 0 0 340px; display: flex; flex-direction: column;
}}
.sidebar-header {{
  background: #0a0a0a; padding: 20px 24px; border-radius: 20px; margin-bottom: 20px;
  box-shadow: 0 14px 44px rgba(0,0,0,0.25); flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
}}
.sidebar-header .logo svg {{ height: 32px; width: auto; border-radius: 4px; }}
.sidebar-header .kick {{ text-align: right; }}
.sidebar-header .k1 {{ font-size: 13px; font-weight: 700; color: #fbbf24; letter-spacing: 2px; line-height: 1.2; }}
.sidebar-header .k2 {{ font-size: 11px; color: #bbb; margin-top: 4px; }}

.index-box {{
  flex: 1; background: rgba(255, 255, 255, 0.85); border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08); padding: 24px; overflow-y: auto;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}}
.index-box::-webkit-scrollbar {{ width: 6px; }}
.index-box::-webkit-scrollbar-thumb {{ background: rgba(0,0,0,0.2); border-radius: 4px; }}

.row{{
  display:flex; align-items:center; justify-content:space-between;
  text-decoration:none; color:inherit; border:1px solid #e8e2d6; border-radius:12px;
  padding:16px 20px; margin-bottom:12px; background:rgba(255,255,255,0.9);
  transition:all 0.2s ease; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.03);
}}
.row:hover{{ border-color:#b45309; transform:translateY(-2px); background:#fff; }}
.row.active{{ border:2px solid #b45309; padding:15px 19px; transform:translateY(-2px); background:#fff; }}
.row .d{{font-size:1.05rem;font-weight:700;color:#111; display:flex; align-items:center; }}
.row .badge{{font-size:10px;font-weight:700;color:#1a1a1a;background:#fbbf24;border-radius:4px;padding:2px 7px;margin-left:10px;}}
.row .go{{color:#b45309;font-size:0.85rem;font-weight:600;opacity:0;transition:opacity 0.2s;}}
.row:hover .go, .row.active .go{{opacity:1;}}

.empty{{padding:30px 0;text-align:center;color:#999}}
.foot{{margin-top:18px;padding-top:14px;border-top:1px solid #e0e0e0;font-size:11px;color:#999;text-align:center;line-height:1.6}}
.foot a{{color:#b45309;text-decoration:none;font-weight:600}}

/* Right Viewer */
.viewer {{ flex: 1; display: flex; justify-content: center; align-items: center; min-width: 0; }}
.viewer iframe {{ width: 100%; height: 100%; border: none; background: transparent; }}

/* Mobile View: Fallback to single column list */
@media (max-width: 900px) {{
  .app-container {{ flex-direction: column; height: auto; margin: 0; padding: 0; gap: 0; }}
  .viewer {{ display: none; }}
  .sidebar {{ flex: none; width: 100%; }}
  .sidebar-header {{ border-radius: 0; margin-bottom: 0; }}
  .index-box {{ border-radius: 0; box-shadow: none; background: #fdf9f3; min-height: 100vh; }}
}}
</style>
</head>
<body>
<div class="app-container">
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo">{logo_svg}</div>
      <div class="kick"><div class="k1">{kicker}</div><div class="k2">{index_kicker_sub}</div></div>
    </div>
    <div class="index-box">
      <h1 style="font-size:1.45rem;font-weight:700;color:#000;margin-bottom:4px">{archive_label}</h1>
      <div style="font-size:0.88rem;color:#666;margin-bottom:18px;word-break:keep-all">{archive_intro}</div>
      {rows}
      <div class="foot">{index_foot}</div>{partner_html}
    </div>
  </div>
  <div class="viewer">
    <iframe src="" name="viewer_frame" id="viewer_frame"></iframe>
  </div>
</div>
<script>
const rows = document.querySelectorAll('.row');
const iframe = document.getElementById('viewer_frame');

// Parse URL ?date=YYYY-MM-DD
const params = new URLSearchParams(window.location.search);
const targetDate = params.get('date');

let initialUrl = '';
if (rows.length > 0) {{
    let activeRow = rows[0];
    if (targetDate) {{
        for (const row of rows) {{
            if (row.getAttribute('href') === 'card_' + targetDate + '.html') {{
                activeRow = row;
                break;
            }}
        }}
    }}
    initialUrl = activeRow.getAttribute('href');
    activeRow.classList.add('active');
    iframe.src = initialUrl;
}}

rows.forEach(row => {{
  row.addEventListener('click', (e) => {{
    if (window.innerWidth <= 900) return; // on mobile, let it navigate naturally
    e.preventDefault();
    iframe.src = row.getAttribute('href');
    rows.forEach(r => r.classList.remove('active'));
    row.classList.add('active');
    
    // Update URL history to support sharing/reloading
    const dateMatch = row.getAttribute('href').match(/card_(.*)\\.html/);
    if(dateMatch) {{
        window.history.replaceState({{}}, '', '?date=' + dateMatch[1]);
    }}
  }});
}});
</script>
</body>
</html>"""
    out = out.replace("#fbbf24", brand["accent"]).replace("#b45309", brand["accent2"])
    with open(os.path.join(pub, "index.html"), "w", encoding="utf-8") as f:
        f.write(out)
    with open(os.path.join(pub, "index.json"), "w", encoding="utf-8") as f:
        json.dump(dates, f, ensure_ascii=False)

    # 개별 카드 URL을 담은 사이트맵 — 카드가 생길 때마다 이 스크립트가 매번 재실행되므로 항상 최신 상태 유지
    base = brand["base_url"].rstrip("/")
    urls = [f"  <url><loc>{base}/</loc><changefreq>daily</changefreq><priority>0.7</priority></url>"]
    for d in dates:
        urls.append(
            f'  <url><loc>{base}/card_{d}.html</loc><lastmod>{d}</lastmod>'
            f'<changefreq>never</changefreq><priority>0.5</priority></url>'
        )
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls) + "\n</urlset>\n"
    )
    sitemap_name = brand.get("sitemap") or ("sitemap-%s.xml" % brand["key"])
    with open(os.path.join(pub, sitemap_name), "w", encoding="utf-8") as f:
        f.write(sitemap)

    print(f"OK index: {len(dates)} cards listed")

if __name__ == "__main__":
    main()
