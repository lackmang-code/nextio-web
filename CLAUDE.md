# NextIO 홍보팀

> **이 세션의 역할: 홍보팀장** — 비서실장 직속, 홈페이지·홍보·마케팅 총괄 (2026-05-24 승격) + **회사공용자료(브랜드 자산) 관리** (2026-08-12 CFO 폐지·흡수)
> **단, SNS 채널 운영은 제외** — 카카오톡 채널·링크드인 운영은 2026-08-19부로 디플(`04_Display_Now\`)이 담당한다. 아래 "SNS 채널" 절 참조.

이 폴더는 NextIO 회사 홈페이지(www.nextio.ai.kr)의 소스 코드와 작업 메모리를 담고 있습니다.
홍보팀은 홈페이지 운영을 넘어 회사 전반의 홍보·마케팅 활동, 그리고 회사 브랜드 자산(로고·명함·회사소개서) 관리를 담당합니다.

> **2026-08-12**: 기존 CFO(`01_Company\` 상위 세션) 폐지. 홍보팀·재무팀이 각각 비서실장 직속으로 독립. CFO가 맡던 회사공용자료 관리는 홍보팀이 흡수.

## 🌐 라이브 사이트
- **https://www.nextio.ai.kr** (HTTPS 활성화, HSTS 적용)
- 자동 배포 (2026-08-17 확인: GitHub Pages 아님 — `has_pages:false`. Cloudflare 경유로 서비스되며 Cloudflare Pages GitHub 연동으로 추정. 상세는 아래 "도메인 DNS" 섹션)

## 📁 작업 폴더
`C:\Users\nackm\NEXTIO\01_Company\홈페이지`

## 🔗 GitHub
- 저장소: https://github.com/lackmang-code/nextio-web (**Public**)
- 브랜치: `master`
- 푸시 즉시 자동 배포 (보통 ~30초, 간헐적으로 지연되는 경우 있었음 — 2026-08-17)

## 🔒 보안: Public 저장소 커밋 전 필수 확인 (2026-08-17 도입)

**이 저장소는 Public입니다.** `education/handbook/`(NDA·견적서·계약서·리드DB 등 내부문서)가 실수로 2개월 넘게 공개돼있던 사건 이후 도입.

- **pre-commit 훅 설치됨**: `.githooks/pre-commit` — 파일명에 `NDA·견적·계약서·리드DB·컨택리스트·독소조항·내부문서·기밀·연봉` 등이 들어가거나, 내용에 API 키·비밀번호 패턴이 있으면 커밋 자체를 차단.
- **클론 직후 1회 필요**: `git config core.hooksPath .githooks` (훅 경로는 git 설정이라 저장소에 자동 포함 안 됨 — 새로 클론하면 다시 설정해야 함). 이 로컬 환경엔 이미 설정 완료.
- **원칙**: 내부 전용 문서(가격·계약·리드·기밀 등)는 애초에 이 저장소에 저장하지 말 것 — `01_Company\회사공용자료\` 등 비공개 위치에 보관. "education/" 같은 폴더명이 내부적으로 보여도 이 저장소 전체가 public이라는 점을 항상 기억할 것.
- 훅을 의도적으로 우회해야 하는 경우(오탐): `git commit --no-verify`

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

⚠️ **2026-08-17 추가 확인**: `gh api repos/lackmang-code/nextio-web` → **`has_pages: false`** — 이 저장소는 GitHub Pages가 아예 꺼져있음. 즉 실제 서비스는 **Cloudflare Pages(GitHub 연동, GitHub App 방식이라 classic webhook에는 안 잡힘 — `/hooks` API도 빈 배열)**로 도는 것으로 추정. `git push`하면 보통 정상 반영되지만(관찰상 15~35초), **force-push(히스토리 재작성) 이후엔 반영이 눈에 띄게 느림/지연될 수 있음**을 확인함(2026-08-17, `education/handbook` 삭제 force-push 후 10분 넘게 구버전 서빙). 원인 미상 — Cloudflare Pages 빌드 큐 지연인지 다른 문제인지는 Cloudflare 대시보드 접근 권한이 있어야 확정 가능(이 세션은 접근 불가).

✅ **2026-08-23 확정 (대시보드 직접 확인)**: 위 "추정"이 사실로 확인됐다. **홈페이지는 Cloudflare Pages 프로젝트 `skk-display-magazine`이 배포한다.**

| Cloudflare Pages 프로젝트 | 실제 용도 | 연결 저장소 / 도메인 |
|---|---|---|
| **`skk-display-magazine`** | **회사 홈페이지** ★ | `lackmang-code/nextio-web` → `nextio.ai.kr`, `www.nextio.ai.kr` (활성) |
| `display-magazine` | 성대 첨디공 매거진 | `display-magazine.pages.dev` |
| `display-now` | DISPLAY NOW (디플) | `display-now.nextio.ai.kr` |

⚠️ **`wrangler.toml`의 `name = "skk-display-magazine"`은 오타가 아니라 정답이다. "홈페이지 폴더에 매거진 이름이 잘못 적혔다"고 오해해서 고치지 말 것.** 과거 매거진용으로 만든 프로젝트를 홈페이지에 전용하면서 이름만 남은 것으로 보인다. 이름을 바꾸면 그 순간 수동 배포(`wrangler pages deploy`)가 엉뚱한 프로젝트로 나간다. Cloudflare Pages는 프로젝트명 변경이 불가하므로 정리하려면 프로젝트를 새로 만들고 도메인을 옮겨야 한다(권장하지 않음). 2026-08-23 디플이 이 값을 "설정 오류"로 보고했으나 실물 확인 결과 오진이었다 — 같은 오해가 반복될 수 있으니 이 표를 근거로 삼을 것.

아래 표는 과거(GitHub Pages 직결 시절) 기록으로, 지금은 참고용 — 실제 현재 A/CNAME 값은 가비아 대시보드에서 확인 필요:
| 타입 | 호스트 | 값 (과거 기록) |
|---|---|---|
| A | @ × 4 | 185.199.108-111.153 (GitHub Pages, Cloudflare 도입 전) |
| CNAME | www | lackmang-code.github.io (GitHub Pages, Cloudflare 도입 전) |
| MX/TXT | @ | worksmobile.com (네이버웍스 메일, 별도 유지) |

⚠️ **과거 교훈(여전히 유효):** GitHub Pages는 www 서브도메인을 반드시 CNAME으로 권장. A 레코드로 우회하면 "InvalidARecordError" 발생.
⚠️ **Cloudflare 경유 시 주의:** 캐시 설정에 따라 배포 직후에도 일부 엣지 노드가 구버전을 서빙할 수 있음(검색엔진 소유확인 등에서 "찾을 수 없음" 오류로 나타날 수 있으니, 재시도 전에 캐시 반영 시간을 감안할 것).

## 📱 SNS 채널 — 운영은 디플, 자산은 홍보팀 (2026-08-19 대표 결정)

**카카오톡 채널과 링크드인 운영은 디플(`04_Display_Now\`)이 담당한다.** 홍보팀은 더 이상 SNS 계정을 직접 운영하지 않는다.

- **넘긴 것**: 콘텐츠 발행, 프로필·소개글 관리, 사이트 연결
- **안 넘긴 것**: 브랜드 자산(로고·배너·프로필 이미지)의 **제작과 보관**은 홍보팀이 계속 맡는다 → `01_Company\회사공용자료\sns\`

**인수인계 문서**: `회사공용자료\sns\kakao\SNS채널_인수인계_디플.md` — 결정 근거, 채널 정보, 비용 구조, 링크드인 계정 주의사항, 체크리스트가 모두 여기에 있다. SNS 관련 질문이 오면 이 문서부터 볼 것.

**카카오톡 채널 (DISPLAY NOW)**

| 항목 | 값 |
|---|---|
| 채널 URL | https://pf.kakao.com/_ZGQiX |
| 검색용 아이디 | `displaynow` — **영구 변경 불가** |
| 채널명 변경권 | 친구 100명 이하일 때 **1회만**, 아직 미사용 |

- 회사(Next I/O) 채널은 **만들지 않는다.** 교육사업은 정기 발송 콘텐츠가 없어 죽은 채널이 되고, 검색용 아이디가 이미 `displaynow`로 고정돼 이름만 바꾸면 주소와 어긋난다.
- **친구톡(푸시)은 건당 유료** — 텍스트 15원 / 이미지 20원 / 와이드 23원. 데일리카드를 매일 푸시하면 친구 1,000명 기준 **연 730만원**. 채널이 잘될수록 비용이 커진다. 채널홈 **소식(포스트)은 무료**지만 푸시가 안 간다.
- 회사 홈페이지 매거진 섹션에 채널 버튼이 걸려 있다 (커밋 `93c08e8`).
- Next I/O용으로 만들어둔 프로필·커버 5종이 `회사공용자료\sns\kakao\`에 **미사용 보관** 중 — 나중에 회사 채널을 열면 그대로 쓴다.

**링크드인**

- **회사 페이지가 아니라 대표 개인 프로필**이다(`nackmann@skku.edu`). 글이 대표 명의로 나가므로 톤에 주의.
- 2026-08-18에 구계정 해킹으로 폐쇄 후 재구축한 계정이다. 상세는 메모리 `project_linkedin_account.md`.
- 2단계 인증(인증앱)과 **복구 코드 모두 완료**(2026-08-19, 대표 보관). 계정 보안 미완 항목 없음.

## 🔑 자격증명 취급 규칙 (2026-08-20 도입 — 실제 사고에서 나옴)

**시크릿 값(토큰·비밀번호·API 키)을 대화창이나 명령줄에 절대 태우지 않는다.**

세션 로그(`~/.claude/projects/<프로젝트>/*.jsonl`)는 **세션을 닫아도 지워지지 않고 평문으로 영구 보관**된다(이 프로젝트만 30개 누적). 여기에 값이 한 번 들어가면 ①로컬 평문 파일로 남고 ②모델 서버를 경유하며 ③다음 세션에서 다시 컨텍스트로 올라와 실수로 커밋될 위험이 생긴다. **이 저장소는 Public이다.**

**금지 (실제로 이렇게 해서 로그에 값이 남았다)**
- `echo <값> | gh secret set NAME` / `gh secret set NAME --body <값>`
- `wrangler secret put NAME <값>` 처럼 값을 인자로 주는 형태
- 브라우저 자동화로 비밀번호·토큰 칸을 대신 타이핑하는 것
- 대표에게 "값을 복사해서 알려달라"고 요청하는 것

**대신 이렇게 한다**
- 웹 콘솔(GitHub Secrets·Cloudflare 대시보드) 입력칸에 **대표가 직접** 붙여넣게 하고, 세션은 화면 위치만 안내한다
- 필요한 헤더·설정은 세션이 다 채워두고 **값 칸 하나만 비워서** 넘긴다
- CLI가 꼭 필요하면 값을 stdin으로 물어보는 형태로 **대표가 `! <명령>`으로 직접 실행**한다

**이미 노출된 값은 지우려 하지 말고 폐기·재발급한다.** 로그 파일을 사후 편집하는 것보다 값을 무효화하는 편이 확실하다. 재발급 후에는 그 값을 쓰던 곳(GitHub Secrets, cron-job.org 헤더 등)을 **반드시 함께 갱신**할 것.

**2026-08-20 점검·교체 이력**
- Gmail 앱 비밀번호: 교체 완료(`nextio-daily-2`). 구 `nextio-github-dailycard`·미사용 `클로드 루틴` 삭제. 파이프라인 정상 확인
- 문의게시판 `ADMIN_PASSWORD`: 교체 완료 → 재배포로 반영
- GitHub PAT `nextio-daily-cron`: 노출됐으나 권한이 좁아(저장소 1개×Actions만) 교체 보류 — 대표 판단
- 점검 결과 **저장소 소스·git 히스토리에는 자격증명 0건**(pre-commit 훅 정상 작동), Cloudflare API 토큰은 애초에 미발급

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

## 📰 디스플레이 데일리 (무인 자동 발행 — cron-job.org가 매일 09:45 KST 트리거, GitHub 예약은 백업)

> 디스플레이 업계 뉴스를 매일 한 장 카드로 만드는 **홍보·마케팅 자산**.

**★ 현재 프로세스: cron-job.org(외부 스케줄러)가 매일 09:45 KST에 GitHub Actions를 트리거해 무인 발행한다. GitHub 자체 예약(09:43·12:17 KST)은 백업으로 남겨둔다. 사람 개입 불필요.**

| 항목 | 값 |
|---|---|
| 워크플로 | `.github/workflows/display-daily.yml` |
| **주 트리거** | **cron-job.org** — 매일 **09:45 KST**(Asia/Seoul, crontab `45 9 * * *`), 잡 ID `8292885` |
| 백업 스케줄 | GitHub Actions cron `43 0 * * *`(09:43 KST) + `17 3 * * *`(12:17 KST) — 상습 지연되지만 안전망으로 유지 |
| 실행 스크립트 | `_automation/run_daily.py` (**저장소 안**, 로컬 `NEXTIO\_automation\display_daily\`가 아님) |
| Secrets | `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD` (Gmail 앱 비밀번호) |
| 수동 실행 | `gh workflow run display-daily.yml --ref master` (`workflow_dispatch` 있음) |

**동작:** Gmail IMAP으로 최근 5일 내 `일간 디스플레이 탐사 보도 다이제스트` 메일 중 최신 것을 찾아 → 파싱 → `make_promo.py`·`make_index.py`로 카드·인덱스 생성 → `latest.html` 갱신 → `display-daily/`에 직접 커밋·푸시. **해당 날짜 카드가 이미 있으면 스킵(멱등성)** 이라 중복 실행해도 안전하다. 요일·공휴일 무관.

**⚠️ 메일함에 다이제스트가 3종 온다 (2026-08-21~)** — 디스플레이 외에 **반도체**·**배터리** 일일 다이제스트가 같은 주소(`lackmang@gmail.com`)로 매일 08:30 도착한다. **반드시 디스플레이 것만 써야 한다**(대표 지시).
- 제목 매칭은 `SUBJECT_KEYWORD = "일간 디스플레이 탐사 보도 다이제스트"` **전체 문구 포함**을 요구하므로 오선택 위험은 없다. 실제 제목: `[일간 디스플레이 탐사 보도 다이제스트] 2026년 8월 20일자`. 새 것들은 `반도체 일일 …`·`배터리 일일 …` 형태라 "일간"·"디스플레이" 두 군데서 걸러진다.
- **`SUBJECT_KEYWORD`를 느슨하게(예: "다이제스트"만) 바꾸지 말 것** — 엉뚱한 산업 기사가 디스플레이 카드로 발행된다.
- 실행 로그에 **`선택한 메일: <제목>`** 이 찍힌다. 카드가 이상하면 이 줄부터 확인할 것.
- **디스플레이 다이제스트를 못 찾으면 `exit 1`로 실패**한다(2026-08-20 변경, 이전에는 조용히 성공 종료). 그래야 GitHub이 실패 알림을 보내 발행 누락을 알 수 있다. 단 디스플레이 메일이 09:45보다 늦게 오는 날은 1차가 실패로 잡힐 수 있다 — 12:17 백업이 성공하면 발행은 정상이니 알림을 받으면 먼저 사이트를 확인하고, 오탐이 잦아지면 1차 시각을 늦추는 것을 검토한다.

**운영 시 알아둘 것**
- **GitHub Actions 예약은 정시를 보장하지 않는다 — 시각을 옮겨도 해결되지 않았다.** 무료 예약은 공용 큐 최저 우선순위라 상습적으로 밀린다. 실측: 8/19 `43 0`→01:58Z(75분 지연), 8/19 `17 3`→03:59Z(42분), 8/20 `43 0`→02:05Z(82분). 8/18에 시각을 43분으로 옮긴 조치는 효과가 없었다. **그래서 2026-08-20에 외부 트리거(cron-job.org)를 주 경로로 두고 GitHub 예약은 백업으로 강등했다.** 파이프라인이 멱등(같은 날짜 카드 있으면 스킵)이라 셋 다 돌아도 카드는 하루 한 장만 생긴다.
- **예약이 또 안 돌면** `gh run list --workflow=display-daily.yml --json event,createdAt`로 `schedule` 이벤트 유무를 먼저 확인하고, 없으면 `gh workflow run display-daily.yml --ref master`로 수동 발행한 뒤 시각 조정을 검토한다.
- **cron 시각을 바꾸면 그날 하루는 공백이 생길 수 있다** — 새 시각이 이미 지났고 구 시각은 삭제되므로 양쪽 다 안 돈다(2026-08-18 실제 발생). 변경한 날은 수동 dispatch로 메울 것.
- 60일간 저장소 활동이 없으면 GitHub이 schedule을 자동 비활성화한다.
- 실행 확인: `gh run list --workflow=display-daily.yml` / 로그: `gh run view <id> --log`

**외부 트리거(cron-job.org) 상세 — 2026-08-20 도입**

| 항목 | 값 |
|---|---|
| 콘솔 | https://console.cron-job.org/jobs/8292885 (계정: `lackmang@gmail.com`) |
| 호출 | `POST https://api.github.com/repos/lackmang-code/nextio-web/actions/workflows/display-daily.yml/dispatches` · body `{"ref":"master"}` |
| 헤더 | `Accept: application/vnd.github+json` · `Authorization: Bearer <PAT>` · `X-GitHub-Api-Version: 2022-11-28` · `Content-Type: application/json` · `User-Agent: nextio-cron` |
| 성공 응답 | HTTP **204 No Content** |
| 인증 토큰 | GitHub fine-grained PAT `nextio-daily-cron` — **저장소 `nextio-web` 하나 × Actions: Read and write 만**, 만료 없음 |
| 알림 | 실행 실패 시 대표 메일로 알림 ON · 응답 기록 저장 ON |

- **토큰을 재발급하면** cron-job.org 잡의 `Authorization` 헤더 값(`Bearer ` + 토큰)을 **반드시 함께 갱신**해야 한다. 안 하면 401로 조용히 실패한다(실패 알림은 오도록 켜둠).
- 외부 트리거가 죽어도 GitHub 백업 예약이 그날 안에는 발행하므로 완전 공백은 생기지 않는다.

**금지 사항 (변경 없음)**
- **고품질(HQ) 업그레이드**(3소스 병렬 수집·재서술)는 2026-07-29에 전면 중단 확정 — 다시 제안·시도하지 말 것.
- "데일리카드 요약이 부실하다/원문을 봐야 한다"는 이야기가 나와도 개선을 제안하거나 시도하지 않는다(2026-07-29 결정).

**로컬 엔진(수동 작업용 원본, 참고)** `C:\Users\nackm\NEXTIO\_automation\display_daily\`
- 저장소 안 `_automation\`이 이 폴더의 사본이다. 생성기(`make_promo.py` 등)를 수정하면 **양쪽 다 반영**할 것 — Actions는 저장소 안 사본만 본다.
- 로고(검정 헤더용 반전 락업): `_automation\assets\nextio_logo.svg` (원본 `회사공용자료\로고\svg\nextio-lockup-reverse.svg` — 한글 경로라 직접 인자전달 금지, 바뀌면 이 사본 재복사)
- PY = `C:\Users\nackm\AppData\Local\Programs\Python\Python313\python.exe`

**폐지 이력**
- 2026-08-17: Windows 작업 스케줄러 태스크(`NextIO_DisplayDaily` 10:35, `DailyDisplayNewsCardGenerator` 11:00)와 전용 스크립트(`run_basic.ps1`·`run_daily.ps1`·`run_hq.ps1`·`fetch_basic.py`·`routine_prompt.txt`), 폐기된 HQ Workflow를 실행하던 `.claude/skills/display-daily.md`·`.claude/workflows/display-daily.js` 전부 삭제. 이후 GitHub Actions 방식으로 재구축.
- 2026-08-04~08-17에 쓰던 "데일리카드" 수동 트리거 절차는 GitHub Actions 도입으로 상시 사용하지 않는다. 자동 발행이 실패한 날의 백업 수단으로는 `gh workflow run`(위)이 더 간단하다.
- 상세·이력: 메모리 `project_display_daily_automation.md`.

## 🎴 쇼케이스 3종 (위탁제작 샘플 — 2026-08-23 신설, 매일 자동 발행)

> 데일리카드 섹션이 "귀사의 이름으로 발행합니다"라고 말하면서 정작 로고가 바뀐 카드를 한 장도 못 보여주던 문제를 해결하기 위해 만든 **영업용 진열장**.

| 브랜드 키 | 명의 | 성격 | 색 | 다이제스트 제목 |
|---|---|---|---|---|
| `skku-display` | 성균관대 첨단디스플레이공학과 | **위탁제작 샘플** | 초록 `#4ADE80` | `일간 디스플레이 탐사 보도 다이제스트` |
| `semiconductor` | Next I/O | 자체 발행 | 파랑 `#60A5FA` | `반도체 탐사 보도 다이제스트` |
| `battery` | 에이프로머티리얼즈 | **위탁제작 샘플** | 주황 `#FB923C` | `배터리 탐사 보도 다이제스트` |

**동작**: `_automation/run_showcase.py`가 브랜드별로 Gmail에서 자기 다이제스트를 찾아 카드·아카이브·`latest.html`을 만든다. `display-daily.yml` 워크플로에 **별도 스텝**으로 붙어 있고 `continue-on-error`로 감싸져 있어, 여기서 실패해도 **디스플레이 데일리 실발행은 정상 커밋된다**. 실패는 마지막 스텝이 job을 실패시켜 알림으로 알린다. 출력은 `showcase/<브랜드키>/`.

**핵심 파일**

| 파일 | 역할 |
|---|---|
| `_automation/brands.json` | 브랜드별 제호·발행처·색·로고·URL·CTA. `_note`에 동의 상태 기록 |
| `_automation/digest_md_to_items.py` | 반도체·배터리용 **마크다운 형식** 파서 + 날짜 필터. `--legacy`로 디스플레이 구형식도 처리 |
| `_automation/run_showcase.py` | 쇼케이스 전용 오케스트레이터 |
| `make_promo.py` / `make_index.py` | `--brand <키>` 옵션 추가됨. **옵션 없이 실행하면 기존 발행분과 바이트 단위로 동일** |

**⚠️ 반드시 지킬 것**
- ~~**`digest_to_items.py`와 `run_daily.py`는 건드리지 말 것.**~~ → **2026-08-24 해제.** 날짜 필터 적용을 위해 대표 지시로 두 파일을 수정했다(아래 "기사 날짜 필터" 절). 여전히 **실발행 경로이므로 신중히** 다루되 금지는 아니다. 다만 **변경 전 과거 카드에 소급 시뮬레이션으로 영향을 실측하고, 쇼케이스 출력 회귀를 바이트 비교로 확인하는 절차는 유지할 것.**
- **타사·타기관 명의(에이프로·성대) 카드에는 헤더·CTA의 "위탁제작 샘플" 표기를 유지할 것.** 지우면 실제 수주 건으로 오인된다. 자사 브랜드(반도체)에는 반대로 이 표기를 넣지 말 것.
- **명의 사용은 2026-08-23 대표 구두 동의뿐이고 서면이 없다.** 로고도 임시 워드마크다(실제 CI 확보 시 `assets/brand_battery.svg`·`brand_skku.svg` 교체).
- 생성기를 고치면 저장소 `_automation/`과 로컬 `NEXTIO\_automation\display_daily\` **양쪽 다** 반영.

**기사 날짜 필터** (2026-08-23 대표 지시 — "다이제스트 기사 그대로 해당 날짜 기사만")
다이제스트 발행일보다 **3일 넘게 지난 기사는 제외**한다(`--max-age`). 판정은 **URL 경로의 날짜만** 인정하고 **쿼리스트링은 무시**한다 — `?idxno=2023092168625` 같은 값은 기사 일련번호라 날짜로 읽으면 당일 기사가 잘못 걸러진다. 보도일을 알 수 없으면 남긴다(다 버리면 카드가 절반이 된다).

✅ **실운영에도 적용 완료 (2026-08-24, 대표 지시)** — `article_date`·`filter_by_age`를 `digest_to_items.py`(공용)에 두고 `digest_md_to_items.py`가 import한다. **두 경로가 같은 판정 로직을 공유하므로 고칠 때는 공용 함수 하나만 고치면 된다.**

| 항목 | 값 |
|---|---|
| 기본 임계값 | **3일** (`digest_to_items.DEFAULT_MAX_AGE_DAYS`) |
| 조정 방법 | 환경변수 `DAILY_MAX_AGE_DAYS` — 코드 수정 없이 워크플로에서 설정 가능 |
| CLI | `digest_to_items.py ... --max-age N` |
| 전부 걸러진 경우 | **`exit 1`** — 빈 카드를 내보내지 않고 실패시켜 알림을 받는다 |

⚠️ **이 필터는 보증이 아니라 보조 장치다.** 과거 카드 44장 400건 실측 결과 **87%가 URL에 날짜가 없어 판정 불가**이며 판정 불가는 남긴다(다 버리면 카드가 빈다). "묵은 기사가 절대 안 들어간다"고 말할 수 없다. 3일 기준 실측 효과는 21건(5.2%) 제외·영향 카드 14장·카드당 최대 2건이었다.

**홈페이지 진열장**: `index.html` 데일리카드 섹션의 브랜드 3칸 버튼. 목업은 각 브랜드의 `latest.html`을 가리키므로 **발행 스크립트가 매일 그 파일을 덮어쓰면 홈페이지는 손댈 필요가 없다.** 날짜 목록은 2026-08-23 폐지(목업이 늘 최신본이라 중복).

## 🔗 타 세션 연동 규격 (2026-08-23 신설)

다른 세션이 홈페이지 저장소를 갱신해야 할 때, **`index.html`을 직접 편집하지 않도록 데이터를 분리**하고 규격서를 준다. 두 세션이 같은 파일을 편집하면 충돌한다.

| 규격서 | 대상 | 내용 |
|---|---|---|
| `연동규격_DISPLAY_NOW_진열대.md` | 디플 | 새 호 발행 시 `data/display-now-latest.json` + 표지 webp + **`data/display-now-articles.json`(최신 기사 5편, 2026-08-24 추가)** 갱신. `index.html`은 JSON을 읽어 스스로 바뀐다. JSON을 못 읽어도 HTML 기본값이 남아 진열대·기사목록이 비지 않는다 |
| `연동규격_시뮬레이터_소개페이지.md` | 비서실장 | `simulators/` 비공개 페이지 틀. **문안 미작성·커밋 보류 상태** (담당 미배정) |

## 🔗 DISPLAY NOW 유입 링크 (2026-08-24 신설 — SEO)

디플 요청으로 회사 홈페이지에서 `display-now.nextio.ai.kr` 로 나가는 링크를 늘렸다.
배경: display-now 기사 44개가 구글에서 **"발견됨, 현재 색인이 생성되지 않음"** 상태였고,
차단·noindex·중복이 하나도 없어 **외부 링크 부족**이 유일한 병목이었다.
회사 홈페이지는 이미 잘 색인돼 있어(구글 `site:` 3페이지) 크롤러 유입 경로로 적합하다.

| 위치 | 링크 | 반영 |
|---|---|---|
| `index.html` 매거진 섹션 **좌측** | 최신 기사 5편(직접 URL) | 2026-08-24 |
| `display-daily/index.html` 하단 | 섹션 4개 + `/tag` | 2026-08-24 |
| `display-daily/card_*.html` 하단 | 섹션 4개 + `/tag` | **2026-08-24 (기존 44장 소급 적용 완료)** · 이후 자동 |

**⚠️ 반드시 지킬 것**

- **`brands.json`의 `partner_links` 는 `display`(자사) 브랜드에만 둔다.**
  성대 첨디공·에이프로 명의 쇼케이스 카드에 우리 매체 링크를 심으면
  "위탁제작 샘플" 표기 원칙과 충돌한다. `semiconductor` 에도 넣지 않았다(주제 불일치)
- **`rel="nofollow"`를 붙이지 말 것.** 붙이는 순간 이 작업의 목적이 사라진다
- 기사 목록의 **HTML 기본값(폴백)이 크롤러가 실제로 읽는 것**이다.
  JS로만 주입하면 의미가 없으므로 서버 렌더 `<a href>` 패턴을 유지할 것
- 앵커 텍스트는 **기사 제목 원문**. "자세히 보기" 같은 문구는 효과가 없다

**소급 적용 완료 (2026-08-24, 커밋 `6b8dee9`)**: 이미 발행된 카드 44장 + `latest.html`에도
같은 줄을 넣었다. 이 44장은 이미 구글에 색인돼 있어 유입 경로로서 가치가 가장 컸다.
삽입 문자열은 `make_promo.py`의 `build_partner_html`이 직접 생성해 **앞으로 나올 카드와
바이트 단위로 동일**하다. 6월 카드 9장은 `c3`(아카이브 링크)가 없는 구형 구조라
`.cta`의 마지막 자식으로 넣는 방식으로 두 구조를 함께 처리했다.

**오해 주의 (2026-08-24 디플 점검 오진 2건)**
- "카드에 display-now 링크가 1개 있다" → **0개였다.** 카드는 `make_promo.py`가 만드는
  독립 페이지라 `index.html` 진열대와 무관하다
- "회사 사이트맵에 카드가 없다" → **`display-daily/sitemap-display-daily.xml` 에 45개 이미 등록.**
  `robots.txt` 선언까지 돼 있고 매일 자동 갱신된다. 조치 불필요

---

## 🧹 저장소 히스토리 재작성 (2026-08-24 완료)

**199MB → 16MB.** `git filter-repo`로 HEAD에 없는 대용량 blob 43개(205.6MB)를 히스토리에서 제거하고 force-push했다.

| | 전 | 후 |
|---|---|---|
| GitHub 저장소 | 199 MB | **16 MB** |
| 로컬 `.git` | 200 MB | **16 MB** |
| 커밋 수 | 249 | 242 |
| 현재 파일 139개 | — | **sha 단위 전부 동일(무손실)** |

**방식**: 크기 기준(`--strip-blobs-bigger-than`)이 아니라 **"HEAD에 없는 blob 중 500KB 이상"의 sha 목록을 만들어 `--strip-blobs-with-ids`로 제거**했다. 크기 기준을 쓰면 HEAD에 있는 히어로 영상 2개(각 2.4MB)까지 지워진다 — **다시 할 일이 있으면 반드시 이 방식으로 할 것.**

사라진 커밋 7개는 삭제된 대용량 이미지·프리뷰만 담고 있어 빈 커밋이 된 것들이다(현재 파일 손실 없음).

**백업**: `01_Company\_백업_nextio-web_20260824
extio-web-backup.git` (mirror, 200MB). 재작성 직전 상태 그대로. **문제 없음이 확인되면 지워도 되지만, 최소 몇 주는 남길 것.**

⚠️ **유출 PDF는 아직 지워지지 않았다 — 남은 조치**

`magazine/2026-07/학과제출/…창간호 (책자 인쇄용).pdf` (47.8MB)는 새 히스토리에서 제거됐지만, **옛 커밋 SHA로는 여전히 익명 다운로드가 된다**(재작성 직후 실측 HTTP 200). GitHub은 도달 불가 오브젝트를 즉시 지우지 않는다.

- 확실히 없애려면 **GitHub Support에 "unreachable objects 정리(GC)" 요청**을 넣어야 한다
- 다만 그 PDF는 **이미 공개 발행된 매거진의 인쇄본**이라 기밀은 아니다. 긴급도는 낮다
- 8/17에 지운 `education/handbook/`(NDA·견적·계약·리드DB)은 **히스토리에서 완전히 사라진 것을 확인**했다. 진짜 위험했던 건 그때 처리됐다

⚠️ **`git clean` 계열 명령을 이 폴더에서 쓰지 말 것.** 미추적 `보고_*.md` 19개와 동결된 시뮬레이터 세트가 git 밖에 있다.

---

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
