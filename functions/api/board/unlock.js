import { json, getIP, hashPassword, safeEqual, isBlocked, recordFail, clearFails, ensurePostsSchema } from './_lib.js';

// 네 자리 비밀번호는 만 번이면 뚫린다. 스크립트로는 몇 분이다.
// IP당 한 글에 10분 5회, IP를 돌려가며 두드리는 경우까지 막기 위해 글 하나당 10분 20회도 함께 건다.
const WINDOW_MS = 10 * 60 * 1000;
const PER_IP_MAX = 5;
const PER_POST_MAX = 20;

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ success: false, error: 'invalid_json' }, 400);
  }

  const { id, password } = data;
  if (!id || !password) return json({ success: false, error: 'missing_params' }, 400);

  const ip = getIP(request);
  const ipScope = `unlock:${id}`;
  const postScope = 'unlock-post';

  // 차단 중에는 비밀번호를 맞춰도 거부한다. 맞았는지 알려주면 대입의 단서가 되기 때문이다.
  const blocked =
    (await isBlocked(env, ipScope, ip, PER_IP_MAX, WINDOW_MS)) ||
    (await isBlocked(env, postScope, id, PER_POST_MAX, WINDOW_MS));
  if (blocked) {
    return json({ success: false, error: 'too_many_attempts' }, 429);
  }

  await ensurePostsSchema(env); // post_pw_salt 컬럼 보장

  const post = await env.BOARD_DB.prepare(
    `SELECT id, service, name, title, message, is_private, created_at, reply, replied_at, post_pw_hash, post_pw_salt FROM posts WHERE id = ?`
  ).bind(id).first();

  if (!post || !post.is_private || !post.post_pw_hash) {
    return json({ success: false, error: 'not_found' }, 404);
  }

  // salt가 없는 기존 글은 예전 방식(순수 SHA-256)으로 대조해 계속 열리게 한다.
  const hash = await hashPassword(password, post.post_pw_salt);
  if (!safeEqual(hash, post.post_pw_hash)) {
    await recordFail(env, ipScope, ip, WINDOW_MS);
    await recordFail(env, postScope, id, WINDOW_MS);
    return json({ success: false, error: 'wrong_password' }, 401);
  }

  // 본인 확인이 끝났으므로 이 IP의 실패 기록만 지운다.
  // 글 단위 카운터는 남긴다 — 비밀번호 하나를 아는 것으로 전체 제한이 풀리면 안 된다.
  await clearFails(env, ipScope, ip);

  return json({
    success: true,
    post: {
      id: post.id,
      service: post.service,
      name: post.name,
      title: post.title,
      message: post.message,
      created_at: post.created_at,
      reply: post.reply,
      replied_at: post.replied_at
    }
  }, 200);
}
