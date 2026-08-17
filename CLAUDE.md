# NextIO 홍보팀

> **이 세션의 역할: 홍보팀장** — 비서실장 직속, 홈페이지·홍보·마케팅 총괄 (2026-05-24 승격) + **회사공용자료(브랜드 자산) 관리** (2026-08-12 CFO 폐지·흡수)

이 폴더는 NextIO 회사 홈페이지(www.nextio.ai.kr)의 소스 코드와 작업 메모리를 담고 있습니다.
홍보팀은 홈페이지 운영을 넘어 회사 전반의 홍보·마케팅 활동, 그리고 회사 브랜드 자산(로고·명함·회사소개서) 관리를 담당합니다.

> **2026-08-12**: 기존 CFO(`01_Company\` 상위 세션) 폐지. 홍보팀·재무팀이 각각 비서실장 직속으로 독립. CFO가 맡던 회사공용자료 관리는 홍보팀이 흡수.

## 🌐 라이브 사이트
- **https://www.nextio.ai.kr** (HTTPS 활성화, HSTS 적용)
- GitHub Pages 자동 배포

## 📁 작업 폴더
`C:\Users\nackm\NEXTIO\01_Company\홈페이지`

## 🔗 GitHub
- 저장소: https://github.com/lackmang-code/nextio-web
- 브랜치: `master`
- 푸시 즉시 자동 배포 (~1분)

## 🗂️ 파일 구성 (2026-06-23 v2 전면 개편 기준)

> ⚠️ 2026-06-23: index.html이 nextio-hero-v2로 전면 교체됨. style.css·main.js·editor.* 는 더 이상 index.html에서 사용하지 않음 (단일 파일 구조).

| 파일 | 역할 |
|---|---|
| `index.html` | **7페이지 단일파일** (hero / unicorn / research / daily / magazine / book / contact) — nextio-hero-v2 |
| `education/unicorn.html` | AI 유니콘 과정 상세페이지 |
| `education/research.html` | AI 연구역량 강화 과정 상세페이지 ← 2026-06-23 추가 |
| `education/images/` | 과정 상세페이지 이미지 (hero.png, hero2.png, research_*.png 등) |
| `images/` | 로컬 이미지 자산 (로고·cs-*.png 등) |
| `display-daily/` | 디스플레이 데일리 아카이브 |
| `magazine/` | 매거진 프리뷰 |
| `CNAME` | `www.nextio.ai.kr` (커스텀 도메인) |
| `style.css` / `main.js` / `editor.*` | 구버전 파일 — index.html에서 미사용, 삭제 검토 가능 |

**v2 주요 설계:**
- 3D 글로브 Three.js 히어로 (coreGroup scale/position 반응형)
- 모바일: `.pu1-bg` 숨김, `.pu1-top` 글박스 숨김, 배지+슬로건 상단 배치
- 구글폼 문의 (GF_URL: `1FAIpQLSeKenhxndfa-ABL8X9gIDL1VvNdYS6DBNIieSPI5xlI96ZqXw`)
- 테스트 파일: `02_Education\테스트_랜딩페이지\nextio-hero-v2.html`

## 🤝 에이전트(안티그라비티 & 클로드코드) 협업 및 R&R 규정

작업 시 두 에이전트 간의 역할을 용도와 기능 기준으로 수평 분담합니다.

### 1. 안티그라비티 (비주얼 검수 & 기획/에셋)
* **임무**: 홈페이지 시안 제작, 이미지 에셋 생성, 비주얼 레이아웃 검수, 필요 시 `modify_plan.md` 작성.
* **커밋 제약**: 소스 코드 커밋 금지. 안티그라비티 작성 문서에 한해 환경 변수 격리 후 직접 커밋.
  * `$env:GIT_AUTHOR_NAME="Antigravity-Planner"; $env:GIT_COMMITTER_NAME="Antigravity-Planner"; git commit -m "[AG] ..."`
* **CLAUDE.md 수정 금지**: 의사결정은 `modify_plan.md`에만 기록. `CLAUDE.md` 직접 수정 불가.

### 2. 클로드코드 (개발 & 배포)
* **임무**: HTML/CSS/JS 구현, 로컬 서버 테스트, Git 커밋·푸시, `CLAUDE.md` 최종 편집 전담.

### 3. 바톤 터치 규칙
* 안티그라비티 시안 → 대표님이 클코에 전달 → 클코가 실제 파일 확인 후 구현 → 배포.
* 단순 작업: 클코 단독 즉시 처리.

## 🔄 워크플로
1. 로컬에서 수정
2. 미리보기: `npx serve -p 3000 .` → http://localhost:3000
3. `git add → git commit → git push origin master`
4. 1분 후 https://www.nextio.ai.kr 에 반영

## 🌐 도메인 DNS (가비아 등록, 2026-08-17 기준 Cloudflare 프록시 경유)

⚠️ **2026-08-17 발견**: 실제 서비스는 더 이상 GitHub Pages IP로 직결되지 않고 **Cloudflare를 경유**해서 나간다(`nslookup www.nextio.ai.kr` → `172.67.165.148`, `104.21.34.213` 등 Cloudflare IP, 응답 헤더 `Server: cloudflare`). 대표님 확인: "깃허브에만 하면 뭔가 안 되는 게 있다고 해서 무료 서버(Cloudflare)를 통해 배포한 것" — 의도된 설정. 정확히 무엇이 안 됐는지는 미상, 필요시 대표님께 재확인.

아래 표는 과거(GitHub Pages 직결 시절) 기록으로, 지금은 참고용 — 실제 현재 A/CNAME 값은 가비아·Cloudflare 대시보드에서 직접 확인 필요(이 세션은 접근 권한 없음):
| 타입 | 호스트 | 값 (과거 기록) |
|---|---|---|
| A | @ × 4 | 185.199.108-111.153 (GitHub Pages, Cloudflare 도입 전) |
| CNAME | www | lackmang-code.github.io (GitHub Pages, Cloudflare 도입 전) |
| MX/TXT | @ | worksmobile.com (네이버웍스 메일, 별도 유지) |

⚠️ **과거 교훈(여전히 유효):** GitHub Pages는 www 서브도메인을 반드시 CNAME으로 권장. A 레코드로 우회하면 "InvalidARecordError" 발생.
⚠️ **Cloudflare 경유 시 주의:** 캐시 설정에 따라 배포 직후에도 일부 엣지 노드가 구버전을 서빙할 수 있음(검색엔진 소유확인 등에서 "찾을 수 없음" 오류로 나타날 수 있으니, 재시도 전에 캐시 반영 시간을 감안할 것).

## 📦 회사공용자료 관리 (2026-08-12 CFO로부터 흡수)

**위치**: `C:\Users\nackm\NEXTIO\01_Company\회사공용자료\` — 회사 브랜드 자산의 **마스터 원본** 보관소. 홈페이지뿐 아니라 강의자료·매거진 등 전사 모든 매체가 공통으로 참조하는 자산이다.

- **자산 업데이트 시**: 여기서 수정 → 각 사용처(홈페이지\images\ 등)에 복사본 배포. 새 버전은 `_v01`, `_v02` 식으로 보존(옛 파일 덮어쓰지 않기).
- **로고 파일** (2026-06-20 체계 개편): `회사공용자료\로고\png\` / `로고\svg\`. 구 파일(`nextio-lockup_final.svg`, `nextio-lockup-1024_final.png`) 사용 금지 — 상세는 `NEXTIO\CLAUDE.md` 문서 로고 삽입 지침 참조.
- **대표 명함** (2026-05-20 교체 확정, `대표명함.pdf`는 구버전이므로 사용 금지):

| 파일 | 용도 |
|---|---|
| `nextio-business-card-print-cmyk.pdf` | **인쇄소 제출용** — CMYK, 600dpi, 블리드 포함 ★ |
| `nextio-business-card-600dpi-cmyk.tiff` | 인쇄소 원본 요청 시 — CMYK TIFF |
| `nextio-business-card-print.pdf` | RGB 버전 (디지털 용도) |
| `nextio-business-card-600dpi.png` | 마스터 원본 (RGBA) |

- 명함 QR 코드: `회사공용자료\QR\` (3종: bw / navy / navy_logo, 1480×1480 @ 300dpi)
- 회사소개서 PPTX: `회사공용자료\넥스트아이오_회사소개서.pptx`

⚠️ **자산 업데이트 패턴:** 회사공용자료\에서 수정 → `홈페이지\images\`에 복사본 배포 → git push

## 회사 핵심 메시지
- AI 기반 학술/연구 실습 교육 전문
- Claude Code + Scientific-agent-skills 활용 자동화 파이프라인
- 온라인 매거진 위탁 개발 (학과 뉴스레터, 계간지)

## 💡 자주 쓰는 명령

```bash
# 미리보기 서버
npx serve -p 3000 .

# 변경 푸시
git add -A && git commit -m "..." && git push origin master

# 편집기 오버레이 모드 진입
# 브라우저에서 http://localhost:3000/?edit=1
```

## 📰 디스플레이 데일리 (2026-08-17 확정: 무인 스케줄러 전면 폐지, "데일리카드" 반자동 트리거 단일 프로세스)

> 디스플레이 업계 뉴스를 매일 한 장 카드로 만드는 **홍보·마케팅 자산**.

**★ 무인 스케줄러는 전부 삭제됨(2026-08-17). 유일하게 유효한 프로세스는 대표님이 "데일리카드"라고 트리거하면 세션이 그 자리에서 직접 처리하는 반자동 방식뿐이다.**
- 삭제한 태스크: `NextIO_DisplayDaily`(RSS 무인 기본판, 매일 10:35 — 다이제스트 없는 날의 백업으로 유지해왔으나 이제 불필요 판단), `DailyDisplayNewsCardGenerator`(Antigravity `auto_news_card.py`, 매일 11:00 — 6월 이후 방치되어 매일 조용히 실패하던 좀비 태스크).
- **고품질(HQ) 업그레이드**(3소스 병렬 수집·재서술)는 이미 2026-07-29에 전면 중단 확정됨 — 다시 제안·시도하지 말 것. Skill `display-daily`가 로드하는 `Workflow({name:"display-daily"})`는 이 폐기된 HQ 경로이니 절대 실행하지 말 것.
- "데일리카드 요약이 부실하다/원문을 봐야 한다"는 이야기가 나와도 개선을 제안하거나 시도하지 않는다(2026-07-29 결정, 상세는 메모리 참고).

**"데일리카드" 트리거 시 처리 절차 (세션이 직접 수행, 2026-08-04 도입)**
1. Gmail에서 오늘자 다이제스트 검색: `subject:"일간 디스플레이 탐사 보도 다이제스트"` (발신자 주소는 바뀔 수 있어 제목 기준으로 검색)
2. 본문을 `digest_to_items.py` 입력 포맷(`N. 제목` / `- 내용:` / `- 분석:` / `- 출처: 이름 (URL)`, 출처가 여러 개면 대표 하나만 남기고 정리)에 맞춰 `C:/Temp/digest_YYYY-MM-DD.txt`로 재구성
3. `digest_to_items.py`로 파싱 → `make_promo.py` + `make_index.py`로 카드 생성
4. `latest.html`도 반드시 함께 최신 카드로 교체(누락하기 쉬움 — 메인 홈페이지·모바일이 이 파일을 봄)
5. `_automation/display_daily/public/`와 `홈페이지/display-daily/` 양쪽에 복사(index.json 포함)
6. git add/commit/push
7. 요일·공휴일 여부는 무관 — 다이제스트가 와 있고 트리거를 받으면 그대로 처리(휴일 규칙은 폐지된 RSS 무인판 전용이었음)

**엔진 위치(외부 폴더, 절대경로로 접근)** `C:\Users\nackm\NEXTIO\_automation\display_daily\`
- `digest_to_items.py`(다이제스트 파서) · `make_promo.py`(카드 생성기) · `make_index.py`(목차)
- 로고(검정 헤더용 반전 락업) 영문 사본: `_automation\display_daily\assets\nextio_logo.svg` (원본 `회사공용자료\로고\svg\nextio-lockup-reverse.svg` — 한글 경로라 직접 인자전달 금지, 바뀌면 이 사본 재복사)
- 출력: `_automation\display_daily\public\card_YYYY-MM-DD.html` + `index.html` → `홈페이지\display-daily\`로 복사·게시
- PY = `C:\Users\nackm\AppData\Local\Programs\Python\Python313\python.exe`

**주의**
- 2026-08-17에 스케줄러(`NextIO_DisplayDaily`, `DailyDisplayNewsCardGenerator`)와 그 전용 스크립트(`run_basic.ps1`·`run_daily.ps1`·`run_hq.ps1`·`fetch_basic.py`·`routine_prompt.txt`), 그리고 "데일리카드" 트리거를 가로채 폐기된 HQ 3소스 Workflow를 실행하던 `.claude/skills/display-daily.md`·`.claude/workflows/display-daily.js`까지 전부 삭제 완료. `publish_daily.ps1`(범용 복사+커밋+푸시 스크립트)만 현재 프로세스에서 재사용.
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
