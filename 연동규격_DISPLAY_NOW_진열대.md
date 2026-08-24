# DISPLAY NOW ↔ 회사 홈페이지 진열대 연동 규격

> 작성: 홍보팀장 · 2026-08-23
> 대상: 디플(`04_Display_Now\`)
> 목적: 디플이 새 호를 낼 때 회사 홈페이지(www.nextio.ai.kr) 매거진 진열대의
> DISPLAY NOW 칸이 **자동으로 최신호를 가리키게** 한다.

---

## 한 줄 요약

**파일 3개만 갱신하고 커밋하면 끝난다. `index.html`은 절대 건드리지 않는다.**

| 갱신할 파일 | 내용 |
|---|---|
| `images/magazine-cover-display-now.webp` | 최신호 표지 (**파일명 고정 — 매번 덮어쓴다**) |
| `data/display-now-latest.json` | 호수·라벨·링크 |
| `data/display-now-articles.json` | **최신 기사 목록 5편** (2026-08-24 추가, 아래 3절) |

홈페이지가 이 JSON들을 읽어 표지·라벨·링크·기사목록을 스스로 바꾼다.

---

## 왜 이렇게 하나

`index.html`을 디플이 직접 고치면 홍보팀 작업과 **같은 파일을 두 세션이 편집**하게 되어 충돌한다. 데이터만 분리해두면 서로 건드리는 파일이 겹치지 않는다.

JSON을 못 읽거나 형식이 깨져도 **HTML에 적힌 기본값이 그대로 남는다.** 진열대가 비거나 깨지지 않으므로, 실패해도 홈페이지에 사고가 나지 않는다.

---

## 1. 표지 이미지

**경로**: `01_Company/홈페이지/images/magazine-cover-display-now.webp`

| 항목 | 규격 |
|---|---|
| 형식 | **webp** (png 금지 — 아래 "이미지 규칙" 참조) |
| 비율 | **2:3 세로** (창간호 기준 1000×1500) |
| 용량 | **100KB 이하** 권장 (창간호 실측 67KB) |
| 파일명 | **고정.** 호가 바뀌어도 이름은 그대로 두고 덮어쓴다 |

변환 예시 (Python + Pillow):

```python
from PIL import Image
src = "04_Display_Now/site/public/issues/issue-N-poster.png"
dst = "01_Company/홈페이지/images/magazine-cover-display-now.webp"
Image.open(src).convert("RGB").save(dst, "WEBP", quality=88, method=6)
```

## 2. 데이터 파일

**경로**: `01_Company/홈페이지/data/display-now-latest.json`

```json
{
  "issue": 1,
  "label": "DISPLAY NOW 제1호 · 8월",
  "cover": "images/magazine-cover-display-now.webp?v=1",
  "url": "https://display-now.nextio.ai.kr/issue/1",
  "alt": "DISPLAY NOW 제1호 표지",
  "updated": "2026-08-23"
}
```

| 필드 | 설명 | 주의 |
|---|---|---|
| `issue` | 호수 (숫자) | |
| `label` | 진열대에 표시될 문구 | 옆 칸이 `Vol.01 · 7월` 형식이므로 비슷한 길이로. 너무 길면 줄바꿈됨 |
| `cover` | 표지 경로 | **`?v=<호수>`를 반드시 붙일 것** — 안 붙이면 브라우저·Cloudflare 캐시 때문에 옛 표지가 계속 보인다 |
| `url` | 링크 대상 | `/issue/<N>` 권장. 루트(`/`)로 두면 다음 호가 나올 때 표지와 내용이 어긋난다 |
| `alt` | 이미지 대체 텍스트 | 생략하면 `issue`로 자동 생성 |
| `updated` | 갱신일 | 기록용. 홈페이지는 쓰지 않음 |

**`cover`의 `?v=` 를 빼먹는 것이 가장 흔한 실수다.** 파일명을 고정했기 때문에 이 값이 바뀌지 않으면 브라우저가 옛 이미지를 계속 쓴다.

---

## 3. 커밋

```bash
cd 01_Company/홈페이지
git add images/magazine-cover-display-now.webp data/display-now-latest.json
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
curl -s https://www.nextio.ai.kr/data/display-now-latest.json
curl -s https://www.nextio.ai.kr/data/display-now-articles.json

# 기사 링크가 서버 렌더로 찍혀 나오는지 (5개 나와야 정상)
curl -sL https://www.nextio.ai.kr/ | grep -c 'display-now.nextio.ai.kr/article/'

# 표지가 뜨는지 (200이어야 함)
curl -sL -o /dev/null -w "%{http_code}\n" \
  https://www.nextio.ai.kr/images/magazine-cover-display-now.webp
```

브라우저로는 https://www.nextio.ai.kr/#magazine 에서 진열대 아래 칸을 본다.
표지가 안 바뀌면 **`?v=` 를 올렸는지부터** 확인할 것.

---

## 5. 이미지 규칙 (전 저장소 공통)

**이미지는 커밋 전에 webp로 변환한다. 나중에는 못 줄인다.**

git은 파일을 지워도 히스토리에 남아 저장소 용량이 줄지 않는다. "일단 올리고 나중에 정리하자"가 원리적으로 통하지 않는다. 실제로 이 저장소는 education png 69MB를 뒤늦게 webp(3MB)로 바꿨지만, 이미 커밋된 69MB는 히스토리에 그대로 남아 있다.

주간 발행이면 연 50장이 쌓인다. **파일명을 고정해 덮어쓰는 이유가 여기에 있다** — 작업 폴더에는 항상 1장만 남는다.

---

## 문의

홈페이지 쪽 구조 변경이 필요하거나 이 규격으로 안 되는 경우, 임의로 `index.html`을
고치지 말고 홍보팀장에게 요청할 것. 진열대 레이아웃·CSS는 홍보팀 관할이다.
