# NextIO 홍보팀

> **이 세션의 역할: 홍보팀장** — CFO 산하, 홈페이지·홍보·마케팅 총괄 (2026-05-24 승격)

이 폴더는 NextIO 회사 홈페이지(www.nextio.ai.kr)의 소스 코드와 작업 메모리를 담고 있습니다.
홍보팀은 홈페이지 운영을 넘어 회사 전반의 홍보·마케팅 활동을 담당합니다.

## 🌐 라이브 사이트
- **https://www.nextio.ai.kr** (HTTPS 활성화, HSTS 적용)
- GitHub Pages 자동 배포

## 📁 작업 폴더
`C:\Users\nackm\NEXTIO\01_Company\홈페이지`

## 🔗 GitHub
- 저장소: https://github.com/lackmang-code/nextio-web
- 브랜치: `master`
- 푸시 즉시 자동 배포 (~1분)

## 🗂️ 파일 구성
| 파일 | 역할 |
|---|---|
| `index.html` | 6섹션 (hero / about / services / profile+stats / program / contact) |
| `style.css` | 라이트블루(#F0F4FA) 배경 + 다크네이비(#1B2D6B) 포인트 |
| `main.js` | 가로 페이지 전환 + 카운트업 애니메이션 |
| `editor.css` / `editor.js` | WYSIWYG 편집 오버레이 (`?edit=1` URL 진입) |
| `CNAME` | `www.nextio.ai.kr` (커스텀 도메인) |
| `images/` | 로컬 이미지 자산 |

## 🎨 디자인 결정 (2026-05-16 기준)
- 컨테이너 max-width: two-col 1100px, split-icons 1300px, contact-wrap 1300px
- `.split-icons`는 `width: 100% + box-sizing: border-box` 필수 (flex-column 안에서 콘텐츠 너비로 축소되는 이슈)
- 본문 폰트: sec-body 16px, program/contact만 1.5× override
- 페이지 상단 패딩: about 44px, services/profile/program 64px
- Hero 폰트: Raleway 700, 서브 17px

## 🔄 워크플로
1. 로컬에서 수정
2. 미리보기: `npx serve -p 3000 .` → http://localhost:3000
3. `git add → git commit → git push origin master`
4. 1분 후 https://www.nextio.ai.kr 에 반영

## 🌐 도메인 DNS (가비아)
| 타입 | 호스트 | 값 |
|---|---|---|
| A | @ × 4 | 185.199.108-111.153 |
| CNAME | www | lackmang-code.github.io |
| MX/TXT | @ | worksmobile.com (네이버웍스 메일, 별도 유지) |

⚠️ **교훈:** GitHub Pages는 www 서브도메인을 반드시 CNAME으로 권장. A 레코드로 우회하면 "InvalidARecordError" 발생.

## 📦 관련 산출물 (외부 폴더 — 공용 자산 마스터)
공용 자산은 모두 `C:\Users\nackm\NEXTIO\01_Company\회사공용자료\` 에 마스터 보관:
- 명함 QR 코드: `회사공용자료\QR\` (3종: bw / navy / navy_logo, 1480×1480 @ 300dpi)
- 회사소개서 PPTX: `회사공용자료\넥스트아이오_회사소개서.pptx`
- 대표 명함: `회사공용자료\대표명함.pdf`
- 로고 원본: `회사공용자료\로고\`

⚠️ **자산 업데이트 패턴:** 회사공용자료\에서 수정 → `홈페이지\images\`에 복사본 배포 → git push

## 💡 자주 쓰는 명령

```bash
# 미리보기 서버
npx serve -p 3000 .

# 변경 푸시
git add -A && git commit -m "..." && git push origin master

# 편집기 오버레이 모드 진입
# 브라우저에서 http://localhost:3000/?edit=1
```

## 📰 디스플레이 데일리 (2026-06-10 홍보팀장으로 업무 이관)

> 디스플레이 업계 뉴스를 매일 한 장 카드로 만드는 **홍보·마케팅 자산**. 기존 비서실장이 하던 **고품질 업그레이드 + 홈페이지 게시**를 홍보팀장이 인수. (엔진=무인 자율, 사람 손맛=이 세션)

**역할 분담**
| 단계 | 담당 |
|---|---|
| 기본 카드 자동 생성 | 무인 인프라(스케줄러) — **건드리지 말 것** |
| 고품질 업그레이드 | **홍보팀장(이 세션)** |
| 홈페이지 게시(push) | **홍보팀장(이 세션)** |

**엔진 위치(외부 폴더, 절대경로로 접근)** `C:\Users\nackm\NEXTIO\_automation\display_daily\`
- `fetch_basic.py`(무인 RSS 수집) · `make_promo.py`(카드 생성기) · `make_index.py`(목차) · `run_basic.ps1`(무인 래퍼=스케줄러 `NextIO_DisplayDaily`, 매일 8시) · `run_log.txt`
- 로고(검정 헤더용 반전 락업) 영문 사본: `_automation\display_daily\assets\nextio_logo.svg` (원본 `회사공용자료\로고\svg\nextio-lockup-reverse.svg` — 한글 경로라 직접 인자전달 금지, 바뀌면 이 사본 재복사)
- 출력: `_automation\display_daily\public\card_YYYY-MM-DD.html` + `index.html`
- PY = `C:\Users\nackm\AppData\Local\Programs\Python\Python313\python.exe`

**★수집 마감 = 당일 오전 9시(KST).** 각 아침판 = **[전날 09:00, 당일 09:00) 24시간 창**. 9시 이후 기사는 다음날 건. (무인 fetch_basic은 자동 적용 / 고품질 업그레이드 때도 같은 컷오프 준수)

**고품질 업그레이드 절차 (세션에서)**
1. 소스 WebFetch — 디일렉 `https://www.thelec.kr/rss/allArticle.xml` + 구글뉴스 KR(디스플레이 OLED, 삼성/LG디스플레이) + `https://www.oled-info.com/rss.xml`. 9시 컷오프 내 기사만.
2. 직링크 본문 추출 → 외국어는 한글 번역, 재서술·압축 편집본 3~5단락(원문 복붙 금지, 끝에 "── 출처 편집본"). 직링크 잘 되는 곳: 디일렉 `articleView.html?idxno=`, OLED-Info.
3. **중요도순 정렬**(①원천기술·소재·특허 ②패널 신기술 ③세트제품 ④시황 ⑤거시), 맨 위=그날 임팩트 최대 Top Pick. 본문 못 가져온 외국기사는 맨 뒤.
4. JSON 작성 → `C:\Temp\daily_items_<D>.json` (items: title·date·source·url·summary·tag·body)
5. 생성:
```bash
PY="C:/Users/nackm/AppData/Local/Programs/Python/Python313/python.exe"
A="C:/Users/nackm/NEXTIO/_automation/display_daily"
LOGO="$A/assets/nextio_logo.svg"
"$PY" "$A/make_promo.py" "C:/Temp/daily_items_<D>.json" "$A/public/card_<D>.html" "<D>" "$LOGO"
"$PY" "$A/make_index.py" "$A/public" "$LOGO"
```

**홈페이지 게시 절차**
1. `_automation\display_daily\public\*` → `홈페이지\display-daily\` 복사 (없으면 폴더 신설; magazine\ 미러링)
2. `git add display-daily/` **(이 폴더만 — 다른 작업파일 섞지 말 것)** → `git commit` → `git push origin master`
3. ~1분 후 `www.nextio.ai.kr/display-daily/` 반영. 상단 메뉴 링크는 `index.html` `nav-links`에 한 줄 추가(자기 파일이라 OK).

**주의**
- 무인 엔진(`run_basic.ps1`·스케줄러)은 인프라 — 멋대로 수정 금지. 한글 든 `.ps1`은 BOM 포함 UTF-8 저장.
- **다운그레이드 방지**: 오늘 `card_<D>.html`이 이미 있으면 무인은 스킵. 세션 고품질판이 무인 기본판을 덮는 건 정상(같은 파일 재생성).
- 상세·이력: 메모리 `project_display_daily_automation.md`.

## 메모리 저장 규칙

중요한 결정이나 방향이 확정됐을 때 세션이 먼저 "이 내용 메모리에 저장할까요?" 하고 물어본다.

저장 제안 시점:
- 작업 방향·방식이 확정됐을 때
- 중요한 프로젝트 결정이 났을 때
- 새로운 피드백·선호도가 확인됐을 때
- 세션 종료 전 마무리 시점

## 총괄 보고 규칙

`보고_YYYYMMDD.md` 파일을 이 폴더(`홈페이지\`) 바로 아래에 작성·저장한다.
- 내용: 완료 항목, 진행 중 항목, 이슈
- 같은 날 여러 번 트리거되면 덮어쓰지 말고 항목을 추가한다

### 보고 트리거
| 트리거 | 예시 |
|---|---|
| 사용자가 마무리 인사를 할 때 | "수고", "수고했어", "오늘 여기까지" 등 |
| 세션이 완료 메시지를 출력한 직후 | "완료했습니다", "완료되었습니다" 등 |

## 🎯 다음 작업 후보
- 모바일 반응형 추가 점검
- SEO 메타태그 보강 (OG 이미지, description)
- 구글 애널리틱스/검색 콘솔 연동
- 도메인 메일 (info@nextio.ai.kr) 서명 표준화
