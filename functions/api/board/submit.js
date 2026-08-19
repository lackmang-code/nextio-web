import { json, makeSalt, hashPassword, ensurePostsSchema } from './_lib.js';

// 서버에서 잘라 저장한다. 폼의 maxlength는 사용자 안내용일 뿐 우회가 쉽다.
const LIMITS = { name: 40, email: 120, org: 80, title: 120, message: 4000, service: 60 };

function clip(v, n) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length > n ? s.slice(0, n) : s;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ success: false, error: 'invalid_json' }, 400);
  }

  const { service, name, email, org, title, message, is_private, post_password, website } = data;

  // 허니팟: 화면에서 숨긴 칸이라 사람은 채울 수 없다.
  // 값이 있으면 봇이므로 접수한 척만 하고 저장하지 않는다(봇에게 실패를 알리지 않는다).
  if (website) {
    return json({ success: true, id: 0 }, 200);
  }

  if (!name || !email || !title || !message) {
    return json({ success: false, error: 'missing_fields' }, 400);
  }

  if (is_private && (!post_password || String(post_password).length < 4)) {
    return json({ success: false, error: 'password_required' }, 400);
  }

  await ensurePostsSchema(env); // post_pw_salt 컬럼 보장

  const createdAt = new Date().toISOString();

  // 글마다 무작위 salt를 만들어 salt:password 로 해시한다.
  // DB가 유출돼도 1234·0000 같은 흔한 값을 대조표로 복원할 수 없다.
  let pwSalt = null;
  let pwHash = null;
  if (is_private) {
    pwSalt = makeSalt();
    pwHash = await hashPassword(post_password, pwSalt);
  }

  const result = await env.BOARD_DB.prepare(
    `INSERT INTO posts (service, name, email, org, title, message, is_private, created_at, post_pw_hash, post_pw_salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    clip(service, LIMITS.service) || null,
    clip(name, LIMITS.name),
    clip(email, LIMITS.email),
    clip(org, LIMITS.org) || null,
    clip(title, LIMITS.title),
    clip(message, LIMITS.message),
    is_private ? 1 : 0,
    createdAt,
    pwHash,
    pwSalt
  ).run();

  return json({ success: true, id: result.meta.last_row_id }, 200);
}
