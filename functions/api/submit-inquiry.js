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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return json({ success: false, error: 'invalid_json' }, 400);
  }

  // 서버 쪽에서도 필수값 최소 검증(클라이언트 검증 우회 대비)
  if (!body.name || !body.email || !body.title || !body.message) {
    return json({ success: false, error: 'missing_required_field' }, 400);
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

  let gfResp;
  try {
    gfResp = await fetch(GF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch (e) {
    return json({ success: false, error: 'network_error' }, 502);
  }

  if (gfResp.status >= 200 && gfResp.status < 400) {
    return json({ success: true });
  }
  return json({ success: false, error: 'google_rejected', status: gfResp.status }, 502);
}
