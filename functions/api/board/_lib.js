// 게시판 API 공용 유틸 — Cloudflare Pages Functions
// 파일명이 '_'로 시작하므로 라우트로 노출되지 않는다.

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function getIP(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

export async function sha256hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(str)));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 글마다 무작위 salt. 같은 비밀번호라도 해시가 달라져 대조표 공격이 통하지 않는다.
export function makeSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

// salt가 없으면 예전 방식(순수 SHA-256)으로 계산 → 기존 글이 계속 열린다.
export async function hashPassword(pw, salt) {
  return sha256hex(salt ? `${salt}:${pw}` : String(pw));
}

// 길이와 무관하게 같은 시간이 걸리도록 한 글자씩 XOR로 비교한다.
// 해시끼리만 비교하므로 길이는 항상 같다.
export function safeEqual(a, b) {
  const x = String(a ?? '');
  const y = String(b ?? '');
  // 빈 값끼리는 같다고 보지 않는다. 해시가 없는 글에 빈 비밀번호로 통과되는 사고를 막는다.
  if (!x || !y) return false;
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

// 비밀글은 내용을 가려도 누가 문의했는지가 드러난다.
// 특정 기관·경쟁사 이름이 목록에 뜨면 그 사실 자체가 정보가 된다.
// 첫 글자만 남겨 작성자 본인은 알아보되 제3자에게는 드러나지 않게 한다.
export function maskName(name) {
  const s = String(name || '').trim();
  if (!s) return '비공개';
  return s.length === 1 ? s : s[0] + '○'.repeat(s.length - 1);
}

// ─────────────────────────── 대입 시도 제한 ───────────────────────────
// D1에 시도 기록을 남겨 창(window) 단위로 센다.
// 마이그레이션을 수동으로 돌릴 수 없는 환경이라 코드에서 테이블을 만든다.

let tableReady = false;

async function ensureTable(env) {
  if (tableReady) return;
  await env.BOARD_DB.prepare(
    `CREATE TABLE IF NOT EXISTS rate_limits (
       scope        TEXT    NOT NULL,
       rl_key       TEXT    NOT NULL,
       fails        INTEGER NOT NULL DEFAULT 0,
       window_start INTEGER NOT NULL,
       PRIMARY KEY (scope, rl_key)
     )`
  ).run();
  tableReady = true;
}

// posts 테이블에 salt 컬럼을 더한다. 이미 있으면 ALTER가 실패하는데, 그게 정상 종료다.
// (수동 마이그레이션을 돌릴 수 없는 환경이라 코드에서 처리한다)
let postsSchemaReady = false;

export async function ensurePostsSchema(env) {
  if (postsSchemaReady) return;
  try {
    await env.BOARD_DB.prepare(`ALTER TABLE posts ADD COLUMN post_pw_salt TEXT`).run();
  } catch (e) {
    // 이미 컬럼이 있는 경우 — 정상
  }
  postsSchemaReady = true;
}

// 차단 여부만 본다(카운트 증가 없음).
// 기록 조회가 실패하면 통과시킨다(fail-open) — 표가 깨졌다고 관리자가 로그인조차 못 하면 안 된다.
export async function isBlocked(env, scope, key, limit, windowMs) {
  try {
    await ensureTable(env);
    const row = await env.BOARD_DB.prepare(
      `SELECT fails, window_start FROM rate_limits WHERE scope = ? AND rl_key = ?`
    ).bind(scope, String(key)).first();
    if (!row) return false;
    if (Date.now() - Number(row.window_start) > windowMs) return false; // 창이 지났으면 초기화된 셈
    return Number(row.fails) >= limit;
  } catch (e) {
    return false;
  }
}

export async function recordFail(env, scope, key, windowMs) {
  try {
    await ensureTable(env);
    const now = Date.now();
    const k = String(key);
    const row = await env.BOARD_DB.prepare(
      `SELECT fails, window_start FROM rate_limits WHERE scope = ? AND rl_key = ?`
    ).bind(scope, k).first();

    if (!row) {
      await env.BOARD_DB.prepare(
        `INSERT INTO rate_limits (scope, rl_key, fails, window_start) VALUES (?, ?, 1, ?)`
      ).bind(scope, k, now).run();
    } else if (now - Number(row.window_start) > windowMs) {
      await env.BOARD_DB.prepare(
        `UPDATE rate_limits SET fails = 1, window_start = ? WHERE scope = ? AND rl_key = ?`
      ).bind(now, scope, k).run();
    } else {
      await env.BOARD_DB.prepare(
        `UPDATE rate_limits SET fails = fails + 1 WHERE scope = ? AND rl_key = ?`
      ).bind(scope, k).run();
    }
  } catch (e) {
    // 기록 실패는 무시한다. 차단이 안 걸릴 뿐, 정상 이용을 막지는 않는다.
  }
}

export async function clearFails(env, scope, key) {
  try {
    await env.BOARD_DB.prepare(
      `DELETE FROM rate_limits WHERE scope = ? AND rl_key = ?`
    ).bind(scope, String(key)).run();
  } catch (e) {}
}
