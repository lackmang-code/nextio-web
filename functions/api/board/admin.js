import { json, getIP, sha256hex, safeEqual, isBlocked, recordFail, clearFails } from './_lib.js';

// 관리자 비밀번호는 게시판 전체(비밀글 본문·문의자 이메일 전부)를 지키는 단 하나의 문이다.
// IP당 15분 5회로 제한한다. 전역 차단은 두지 않는다 — IP를 돌려가며 두드려
// 관리자 본인을 잠가버리는 서비스 거부가 되기 때문이다.
const ADMIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_MAX_FAILS = 5;

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ success: false, error: 'invalid_json' }, 400);
  }

  const { password, action } = data;
  const ip = getIP(request);

  // 차단 중에는 정답을 넣어도 거부한다 (맞았는지 알려주지 않는다)
  if (await isBlocked(env, 'admin', ip, ADMIN_MAX_FAILS, ADMIN_WINDOW_MS)) {
    return json({ success: false, error: 'too_many_attempts' }, 429);
  }

  const authed =
    !!password &&
    !!env.ADMIN_PASSWORD &&
    safeEqual(await sha256hex(password), await sha256hex(env.ADMIN_PASSWORD));

  if (!authed) {
    await recordFail(env, 'admin', ip, ADMIN_WINDOW_MS);
    return json({ success: false, error: 'unauthorized' }, 401);
  }

  await clearFails(env, 'admin', ip);

  if (action === 'list') {
    const { results } = await env.BOARD_DB.prepare(
      `SELECT id, service, name, email, org, title, message, is_private, created_at, reply, replied_at FROM posts ORDER BY id DESC LIMIT 200`
    ).all();
    return json({ success: true, posts: results }, 200);
  }

  if (action === 'reply') {
    const { id, reply } = data;
    if (!id || !reply) return json({ success: false, error: 'missing_fields' }, 400);

    const repliedAt = new Date().toISOString();
    await env.BOARD_DB.prepare(
      `UPDATE posts SET reply = ?, replied_at = ? WHERE id = ?`
    ).bind(reply, repliedAt, id).run();
    return json({ success: true }, 200);
  }

  // 스팸·욕설이 회사 첫 화면에 박제되는 것을 막는다.
  // 이 액션이 없어서 그동안 D1 콘솔에서 SQL을 직접 쳐야 지울 수 있었다.
  if (action === 'delete') {
    const { id } = data;
    if (!id) return json({ success: false, error: 'missing_id' }, 400);

    const res = await env.BOARD_DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run();
    const removed = res && res.meta ? res.meta.changes : undefined;
    if (removed === 0) return json({ success: false, error: 'not_found' }, 404);
    return json({ success: true }, 200);
  }

  return json({ success: false, error: 'unknown_action' }, 400);
}
