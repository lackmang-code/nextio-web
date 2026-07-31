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

## 📰 디스플레이 데일리 (2026-07-29 대표 확정: 고품질(HQ) 전면 중단, 기본판이 최종 상태)

> 디스플레이 업계 뉴스를 매일 한 장 카드로 만드는 **홍보·마케팅 자산**. 무인 기본판(RSS 제목·링크 위주, 요약 없음)이 **완전 자동 생성부터 홈페이지 게시까지 100% 무인**으로 돈다.

**★ 고품질(HQ) 업그레이드는 완전히 중단된 상태 — 다시 제안·시도하지 말 것.**
"데일리카드 요약이 부실하다/원문을 봐야 한다"는 이야기가 나와도 개선을 제안하거나 시도하지 않는다. 요약/정리 강화 시도 자체가 반복 실패(작업당 45분 소요, 승인 대기, 게시 레이스 버그, 시스템 복잡도 증가)의 근본 원인이었다고 대표님이 자각·확정(2026-07-29). 유료 API·무료 헤드리스 우회 등 대안도 전부 같은 함정의 연장선이라 함께 중단. 상세 경위: 메모리 `project_display_daily_automation.md`.

**역할 분담**
| 단계 | 담당 |
|---|---|
| 기본 카드 생성 + 홈페이지 게시(git push까지) | 무인 인프라(스케줄러, `run_basic.ps1` → `publish_daily.ps1`) — **건드리지 말 것** |

**엔진 위치(외부 폴더, 절대경로로 접근)** `C:\Users\nackm\NEXTIO\_automation\display_daily\`
- `fetch_basic.py`(무인 RSS 수집) · `make_promo.py`(카드 생성기) · `make_index.py`(목차) · `run_basic.ps1`(무인 래퍼=스케줄러 `NextIO_DisplayDaily`, 매일 10:35, 카드 생성 후 `publish_daily.ps1` 자동 호출해 홈페이지 복사+커밋+푸시까지 완료) · `run_log.txt`
- 로고(검정 헤더용 반전 락업) 영문 사본: `_automation\display_daily\assets\nextio_logo.svg` (원본 `회사공용자료\로고\svg\nextio-lockup-reverse.svg` — 한글 경로라 직접 인자전달 금지, 바뀌면 이 사본 재복사)
- 출력: `_automation\display_daily\public\card_YYYY-MM-DD.html` + `index.html` → `홈페이지\display-daily\`로 자동 복사·게시
- PY = `C:\Users\nackm\AppData\Local\Programs\Python\Python313\python.exe`

**★수집 마감 = 당일 오전 10시 30분(KST).** 각 아침판 = **[전날 10:30, 당일 10:30) 24시간 창**. 10:30 이후 기사는 다음날 건.

**★휴일 운영 규칙 (한국 기준)**
- **토·일·공휴일**: 카드 생성 없음
- **다음 평일**: 직전 휴일 기간 전체의 기사를 모아서 카드 1장 발행 (예: 월요일이면 토~월 10:30, 연휴 뒤 첫 평일이면 연휴 전날 10:30~당일 10:30 전체)

**세션에서 할 일(있다면)**
- 무인 게시 결과 확인(오늘 카드 생성됐는지, 링크 깨짐 없는지) 정도의 점검만. 카드 내용 자체를 다시 만들거나 덮어쓰지 않는다.
- 무인 파이프라인이 실패(카드 미생성 등)했을 때만 원인 파악·수동 재실행 지원.

**주의**
- 무인 엔진(`run_basic.ps1`·`publish_daily.ps1`·스케줄러)은 인프라 — 멋대로 수정 금지. 한글 든 `.ps1`은 BOM 포함 UTF-8 저장.
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
