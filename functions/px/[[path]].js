// /px/* — 1×1 투명 GIF 집계 픽셀
//
// 첨디공 ON 매거진(display-magazine.pages.dev)은 우리 도메인 밖이라 존 트래픽에
// 안 잡히고, JS 비콘은 카톡 인앱브라우저를 놓친다. 그래서 매거진 페이지가 열릴 때
// 이 경로로 이미지 요청 하나를 보내고, nextio.ai.kr 존 Analytics 에서 /px/ 경로를
// 필터해 독자 수를 센다. (요청: 성대첨디공팀, 2026-09-03)
//
// 파일명 규칙은 매거진 쪽이 정한다 — mag-<연월>-<book|phone>.gif.
// 호가 늘어날 때마다 파일을 추가하지 않아도 되도록 /px/ 아래 전부를 여기서 받는다.
// (발행 3개 호의 정적 파일 6개도 px/ 에 함께 두었다 — 라우팅이 어느 쪽으로 붙든
//  같은 43바이트 GIF가 나가도록 한 이중화다.)
//
// ⚠️ no-store 가 이 작업의 성패다. 캐시되면 두 번째 방문부터 요청 자체가 나가지
//    않아 과소집계된다. 캐시 헤더를 완화하지 말 것.

const GIF = Uint8Array.from(
  atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
  (c) => c.charCodeAt(0)
);

export function onRequest() {
  return new Response(GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(GIF.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      'Access-Control-Allow-Origin': '*',
      'Timing-Allow-Origin': '*',
    },
  });
}
