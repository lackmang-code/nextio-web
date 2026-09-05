// 단행본 출간 알림 신청 (사전예약 명단) — Cloudflare Pages Functions
//
// 왜 만들었나: /book-preview/ 의 "출간 소식 가장 먼저 받기" 버튼이 mailto: 였다.
// mailto 는 ①메일 앱이 없는 모바일·웹메일에서 아무 일도 일어나지 않고
// ②보낸 사람이 info@ 메일함에 흩어질 뿐 명단이 되지 않는다.
// 출간일에 "누구에게 알릴 것인가"의 답이 없었다.
//
// 문의 게시판이 쓰는 D1(BOARD_DB)을 그대로 쓴다. 새 인프라가 아니다.

import { json, getIP, sha256hex, isBlocked, recordFail } from '../board/_lib.js';

// 같은 IP에서 1시간에 5건. 가입 폼에는 넉넉하고, 스팸 봇에는 좁다.
// 게시판 submit 에는 레이트리밋이 없는데(허니팟만 있다), 이 폼은 진입 장벽이
// 이메일 한 칸뿐이라 훨씬 쉽게 밀어넣을 수 있어 따로 건다.
const RL_WINDOW_MS = 60 * 60 * 1000;
const RL_MAX = 5;

const LIMITS = { email: 120, name: 40, source: 40 };

// 서버에서 자른다. 폼의 maxlength 는 안내용일 뿐 우회가 쉽다.
function clip(v, n) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length > n ? s.slice(0, n) : s;
}

// 완벽한 이메일 검증은 불가능하고 시도할 필요도 없다.
// 오타를 걸러 명단이 쓰레기가 되는 것만 막으면 된다.
function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s));
}

// 수동 마이그레이션을 돌릴 수 없는 환경이라 코드에서 테이블을 만든다(_lib.js 와 같은 방식).
let tableReady = false;

export async function ensureNotifyTable(env) {
  if (tableReady) return;
  await env.BOARD_DB.prepare(
    `CREATE TABLE IF NOT EXISTS book_notify (
       id         INTEGER PRIMARY KEY AUTOINCREMENT,
       email      TEXT    NOT NULL UNIQUE,
       name       TEXT,
       source     TEXT,
       consent_at TEXT    NOT NULL,
       created_at TEXT    NOT NULL,
       ip_hash    TEXT
     )`
  ).run();
  tableReady = true;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ success: false, error: 'invalid_json' }, 400);
  }

  const { email, name, source, consent, website } = data;

  // 허니팟: 화면에서 숨긴 칸이라 사람은 채울 수 없다.
  // 값이 있으면 봇이므로 접수한 척만 하고 저장하지 않는다.
  if (website) {
    return json({ success: true }, 200);
  }

  if (!email || !looksLikeEmail(email)) {
    return json({ success: false, error: 'invalid_email' }, 400);
  }

  // 개인정보 수집·이용 동의는 선택이 아니다. 동의 없이 받은 이메일은 쓸 수 없다.
  if (!consent) {
    return json({ success: false, error: 'consent_required' }, 400);
  }

  const ip = getIP(request);
  if (await isBlocked(env, 'book_notify', ip, RL_MAX, RL_WINDOW_MS)) {
    return json({ success: false, error: 'too_many_requests' }, 429);
  }

  await ensureNotifyTable(env);

  const now = new Date().toISOString();

  // IP 를 평문으로 두지 않는다. 남용 추적에는 해시로 충분하고,
  // 명단이 유출돼도 접속 위치까지 함께 새지는 않는다.
  const ipHash = (await sha256hex(ip)).slice(0, 16);

  // 이미 신청한 이메일이면 조용히 넘어간다(INSERT OR IGNORE).
  // "이미 등록된 주소입니다"라고 알려주면 그 주소의 신청 여부가 외부에 드러난다.
  // 신청자 입장에서도 두 번 눌렀을 때 오류가 뜨는 것보다 이 편이 낫다.
  await env.BOARD_DB.prepare(
    `INSERT OR IGNORE INTO book_notify (email, name, source, consent_at, created_at, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    clip(email, LIMITS.email).toLowerCase(),
    clip(name, LIMITS.name) || null,
    clip(source, LIMITS.source) || null,
    now,
    now,
    ipHash
  ).run();

  // 성공·중복을 구분하지 않고 센다. 여기서는 '실패 횟수'가 아니라 '제출 횟수'다.
  await recordFail(env, 'book_notify', ip, RL_WINDOW_MS);

  return json({ success: true }, 200);
}
