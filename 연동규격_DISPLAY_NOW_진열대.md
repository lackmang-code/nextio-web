# DISPLAY NOW ↔ 회사 홈페이지 진열대 연동 규격

> 작성: 홍보팀장 · 2026-08-23
> 대상: 디플(`04_Display_Now\`)
> **개정: 2026-08-25 — 표지·데이터 규격 변경(아래 경고 박스 필독)**
> 목적: 디플이 새 호를 낼 때 회사 홈페이지(www.nextio.ai.kr) 매거진 진열대에
> DISPLAY NOW **최신 3호가 나란히 진열되게** 한다.

---

## 한 줄 요약

**파일 3개만 갱신하고 커밋하면 끝난다. `index.html`은 절대 건드리지 않는다.**

| 갱신할 파일 | 내용 |
|---|---|
| `images/magazine-cover-display-now-<N>.webp` | 새 호 표지 (**호수별 파일 — 덮어쓰지 않는다**) |
| `data/display-now-issues.json` | 발행호 **배열** — 새 호를 맨 앞에 추가 |
| `data/display-now-articles.json` | 최신 기사 목록 5편 (2026-08-24 추가) |

홈페이지가 이 JSON들을 읽어 표지·라벨·링크·기사목록을 스스로 바꾼다.

> ### ⚠️ 2026-08-25 규격 변경 — 반드시 읽을 것
> **제2호를 내면서 제1호가 사라졌다.** 표지 파일명이 고정이라 덮어써졌고, JSON이 단일
> 객체라 이전 호 정보가 남지 않았다. **디플 잘못이 아니라 이 규격이 "최신호 한 칸" 전제였던
> 것이 원인**이며, 홍보팀이 구조를 고쳤다. 1호 표지는 git 히스토리에서 복구했다.
>
> | | 구 규격 (~08-24) | **신 규격 (08-25~)** |
> |---|---|---|
> | 표지 | `…display-now.webp` 고정, 덮어씀 | **`…display-now-<N>.webp` 호수별** |
> | 데이터 | `display-now-latest.json` 단일 객체 | **`display-now-issues.json` 배열** |
> | 진열 | 최신 1호 | **최신 3호 나란히** |
> | 라벨 | `DISPLAY NOW 제1호 · 8월` | **`제1호 · 8월`** (짧게) |
>
> 구형 `display-now-latest.json` 도 홈페이지가 아직 읽지만 **그 경로로 가면 다시 한 칸만
> 나온다.** 폴백일 뿐이니 신 규격으로 옮길 것.

---

## 왜 이렇게 하나

`index.html`을 디플이 직접 고치면 홍보팀 작업과 **같은 파일을 두 세션이 편집**하게 되어 충돌한다. 데이터만 분리해두면 서로 건드리는 파일이 겹치지 않는다.

JSON을 못 읽거나 형식이 깨져도 **HTML에 적힌 기본값이 그대로 남는다.** 진열대가 비거나 깨지지 않으므로, 실패해도 홈페이지에 사고가 나지 않는다.

---

## 1. 표지 이미지

**경로**: `01_Company/홈페이지/images/magazine-cover-display-now-<N>.webp`  (`<N>` = 호수)

| 항목 | 규격 |
|---|---|
| 형식 | **webp** (png 금지 — 아래 "이미지 규칙" 참조) |
| 비율 | **2:3 세로** (창간호 기준 1000×1500) |
| 용량 | **100KB 이하** 권장 (창간호 실측 67KB) |
| 파일명 | **호수별로 다르게.** 기존 파일을 덮어쓰지 말 것 |

⚠️ **덮어쓰면 지난 호 표지가 사라진다.** 2026-08-25에 실제로 발생했고 git 히스토리에서
겨우 복구했다. 진열대가 여러 호를 동시에 보여주므로 지난 호 표지가 계속 필요하다.
**배열에서 빠진 호의 표지 파일도 지우지 말 것.**

변환 예시 (Python + Pillow):

```python
from PIL import Image
src = "04_Display_Now/site/public/issues/issue-N-poster.png"
N = 3   # 호수
dst = f"01_Company/홈페이지/images/magazine-cover-display-now-{N}.webp"
Image.open(src).convert("RGB").save(dst, "WEBP", quality=88, method=6)
```

## 2. 데이터 파일

**경로**: `01_Company/홈페이지/data/display-now-issues.json`

**새 호는 `issues` 배열 맨 앞에 추가한다. 기존 항목을 지우지 않는다.**

```json
{
  "updated": "2026-09-01",
  "issues": [
    { "issue": 3, "label": "제3호 · 9월",
      "cover": "images/magazine-cover-display-now-3.webp?v=3",
      "url": "https://display-now.nextio.ai.kr/issue/3",
      "alt": "DISPLAY NOW 제3호 표지" },
    { "issue": 2, "label": "제2호 · 8월",
      "cover": "images/magazine-cover-display-now-2.webp?v=2",
      "url": "https://display-now.nextio.ai.kr/issue/2",
      "alt": "DISPLAY NOW 제2호 표지" },
    { "issue": 1, "label": "제1호 · 8월",
      "cover": "images/magazine-cover-display-now-1.webp?v=1",
      "url": "https://display-now.nextio.ai.kr/issue/1",
      "alt": "DISPLAY NOW 제1호 표지" }
  ]
}
```

| 필드 | 설명 | 주의 |
|---|---|---|
| `issue` | 호수 (숫자) | |
| `label` | 진열대 표시 문구 | **`제N호 · 월` 형식으로 짧게.** 길면 옆 칸 라벨과 겹친다(실제로 겹쳤다). 표지에 이미 "DISPLAY NOW"가 있으니 넣지 말 것 |
| `cover` | 표지 경로 | **`?v=<호수>`를 반드시 붙일 것** — 캐시 때문에 옛 이미지가 보일 수 있다 |
| `url` | 링크 대상 | `/issue/<N>`. **올리기 전에 그 주소가 실제로 200인지 확인할 것** — 2026-08-24에 아직 없는 `/issue/2`를 가리켜 되돌린 적이 있다 |
| `alt` | 대체 텍스트 | 생략 시 `issue`로 자동 생성 |

**진열 규칙 (홈페이지가 알아서 함, 디플이 신경 쓸 것 없음)**
- 배열 앞에서 **최대 3개**만 진열한다. 4호가 나오면 1호는 자동으로 빠진다
- **NEW 배지는 첫 항목에만** 붙는다
- `url`·`cover`가 없는 항목은 조용히 버린다
- 배열이 비거나 파일을 못 읽으면 **HTML 기본값이 남아** 진열대가 비지 않는다

---

## 3. 커밋

```bash
cd 01_Company/홈페이지
git add images/magazine-cover-display-now-*.webp data/display-now-issues.json
git commit -m "DISPLAY NOW 제N호 진열대 갱신"
git push origin master
```

**주의사항**

- 이 저장소(`nextio-web`)는 **Public**이다. 내부 문서·가격·계약 자료를 절대 함께 커밋하지 말 것.
- pre-commit 훅이 걸려 있다. 새로 클론했다면 `git config core.hooksPath .githooks` 를 1회 실행해야 한다.
- 푸시 후 **15~35초** 뒤 라이브에 반영된다(Cloudflare Pages 자동 배포).
- 다른 파일을 함께 커밋하지 말 것. 위 2개만.

---

## 3. 최신 기사 목록 (2026-08-24 신설)

**경로**: `01_Company/홈페이지/data/display-now-articles.json`

`index.html` 매거진 섹션 좌측의 "DISPLAY NOW 최신 기사" 목록을 그린다.
디플의 2026-08-24 요청(검색 색인 유입 확보)에 따라 홍보팀장이 승인·구현했다.

```json
{
  "updated": "2026-08-24",
  "articles": [
    {
      "title": "청색 인광 OLED(PHOLED) 특허 8건 분석",
      "url": "https://display-now.nextio.ai.kr/article/2026-08-18-blue-phosphorescent-oled-patents",
      "section": "특허",
      "publishedAt": "2026-08-18"
    }
  ]
}
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| `title` | ✅ | **화면에 그대로 앵커 텍스트로 나간다.** 기사 제목 원문을 쓸 것 |
| `url` | ✅ | **`https://display-now.nextio.ai.kr/` 로 시작해야 한다.** 아닌 항목은 렌더러가 버린다 |
| `section` | — | 현재 화면에 표시하지 않는다. 넣어도 무해 |
| `publishedAt` | — | 현재 화면에 표시하지 않는다. 넣어도 무해 |

**지켜야 할 것**

1. **최대 5편.** 6편 이상 넣으면 앞에서 5편만 쓰고 나머지는 버린다. 좌측 칼럼 높이가
   정해져 있어 늘리면 레이아웃이 무너진다 — 더 필요하면 홍보팀장에게 요청할 것
2. **제목은 짧을수록 좋다.** 40자를 넘으면 두 줄로 접힌다(깨지지는 않는다)
3. `title`·`url`이 없거나 도메인이 다른 항목은 **조용히 버려진다.**
   전부 버려져 0편이 되면 **HTML 기본값 5편이 그대로 남는다**(목록이 비지 않는다)
4. **`rel="nofollow"`는 붙지 않는다** — 렌더러가 `rel="noopener"`만 넣는다.
   이 목록의 존재 이유가 색인 유입이므로 이 동작을 바꿔달라고 요청하지 말 것

**기본값(폴백)에 대해**: `index.html`에는 2026-08-18자 기사 5편이 하드코딩돼 있다.
JSON이 정상이면 화면에는 JSON 내용만 보인다. 다만 **크롤러가 JS 없이 읽는 것은 이 기본값**이므로,
기본값이 오래돼 죽은 URL이 되면 홍보팀장에게 알려 갱신을 요청할 것.

---

## 4. 확인 방법

```bash
# 데이터가 올라갔는지
curl -s https://www.nextio.ai.kr/data/display-now-issues.json
curl -s https://www.nextio.ai.kr/data/display-now-articles.json

# 기사 링크가 서버 렌더로 찍혀 나오는지 (5개 나와야 정상)
curl -sL https://www.nextio.ai.kr/ | grep -c 'display-now.nextio.ai.kr/article/'

# 표지가 실제로 있는지 — ⚠️ 상태코드만 보면 안 된다
for n in 1 2 3; do
  curl -sL -o /dev/null -w "$n: %{http_code} %{content_type}
"     https://www.nextio.ai.kr/images/magazine-cover-display-now-$n.webp
done

# 링크 대상이 살아있는지 (200이어야 함)
curl -sL -o /dev/null -w "%{http_code}
" https://display-now.nextio.ai.kr/issue/3
```

⚠️ **없는 파일도 HTTP 200이 나온다.** Cloudflare Pages 가 없는 경로에 홈페이지 index 를
200으로 돌려주기 때문이다. 반드시 `content_type` 까지 볼 것 —
`image/webp` 여야 진짜 표지이고, `text/html` 이면 **그 파일은 없는 것이다.**

```
1: 200 image/webp           ← 진짜 표지
3: 200 text/html            ← 없는 파일 (홈페이지 HTML 이 대신 나온 것)
```

브라우저로는 https://www.nextio.ai.kr/#magazine 에서 진열대 아래 칸을 본다.
표지가 안 바뀌면 **`?v=` 를 올렸는지부터** 확인할 것.

---

## 5. 이미지 규칙 (전 저장소 공통)

**이미지는 커밋 전에 webp로 변환한다. 나중에는 못 줄인다.**

git은 파일을 지워도 히스토리에 남아 저장소 용량이 줄지 않는다. "일단 올리고 나중에 정리하자"가 원리적으로 통하지 않는다. 실제로 이 저장소는 education png 69MB를 뒤늦게 webp(3MB)로 바꿨지만, 이미 커밋된 69MB는 히스토리에 그대로 남아 있다.

주간 발행이면 연 50장이 쌓인다. 그래서 **커밋 전 webp 변환이 필수**다.

> ~~파일명을 고정해 덮어쓴다~~ → **2026-08-25 폐기.** 덮어쓰면 지난 호 표지가 사라져
> 여러 호를 진열할 수 없다. 호수별 파일로 남기되 100KB 이하를 지킨다
> (연 50장 × 100KB = 5MB, 감당 가능한 수준이다).

---

## 문의

홈페이지 쪽 구조 변경이 필요하거나 이 규격으로 안 되는 경우, 임의로 `index.html`을
고치지 말고 홍보팀장에게 요청할 것. 진열대 레이아웃·CSS는 홍보팀 관할이다.
