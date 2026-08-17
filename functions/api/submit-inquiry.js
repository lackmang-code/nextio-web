// Cloudflare Pages Function — 문의 게시판 제출을 서버에서 대신 처리.
// 브라우저 → 여기(같은 출처, 상태코드 확인 가능) → 구글폼(서버 간 통신, 상태코드 확인 가능)
// 이렇게 우회해야 "구글이 400을 반환해도 브라우저는 절대 알 수 없는" 문제를 피할 수 있다.

const GF_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeKenhxndfa-ABL8X9gIDL1VvNdYS6DBNIieSPI5xlI96ZqXw/formResponse';

const ENTRY_MAP = {
  service: 'entry.391658267',
  name:    'entry.2005620554',
  email:   'entry.1045781291',
  org:     'entry.1065046570',
  title:   'entry.1166974658',
  message: 'entry.839337160',
};

// CORS: 커스텀 도메인(www.nextio.ai.kr)에서 이 함수의 POST 요청이 502로 막히는
// Cloudflare 커스텀 도메인 특이 현상이 있어, 프론트엔드가 안정적인 *.pages.dev 고정
// production 주소로 직접 이 함수를 호출한다. 그래서 크로스 오리진 허용이 필요하다.
const ALLOWED_ORIGINS = new Set([
  'https://www.nextio.ai.kr',
  'https://nextio.ai.kr',
]);

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.nextio.ai.kr';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, origin, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
    },
  });
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin') || '';

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return json({ success: false, error: 'invalid_json' }, origin, 400);
  }

  // 서버 쪽에서도 필수값 최소 검증(클라이언트 검증 우회 대비)
  if (!body.name || !body.email || !body.title || !body.message) {
    return json({ success: false, error: 'missing_required_field' }, origin, 400);
  }

  const params = new URLSearchParams();
  for (const key of Object.keys(ENTRY_MAP)) {
    params.append(ENTRY_MAP[key], body[key] || '');
  }
  params.append('fvv', '1');
  params.append('pageHistory', '0');
  const fbzx = String(Math.floor(Math.random() * 9e18) * -1);
  params.append('fbzx', fbzx);
  params.append('partialResponse', `[null,null,"${fbzx}"]`);
  params.append('submissionTimestamp', '-1');

  let gfResp, gfText;
  try {
    gfResp = await fetch(GF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    gfText = await gfResp.text();
  } catch (e) {
    // 항상 HTTP 200으로 응답하고 성공 여부는 body로만 전달한다(엣지가 비-2xx 응답을
    // 자체 에러 페이지로 치환해버리는 것을 피하기 위함 — 오늘 실제로 겪은 문제).
    return json({ success: false, error: 'network_error' }, origin, 200);
  }

  if (gfResp.status >= 200 && gfResp.status < 400) {
    return json({ success: true }, origin, 200);
  }
  return json(
    { success: false, error: 'google_rejected', status: gfResp.status, detail: gfText.slice(0, 500) },
    origin,
    200
  );
}
