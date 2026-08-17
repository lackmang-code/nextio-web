async function hashPassword(pw) {
  const enc = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { service, name, email, org, title, message, is_private, post_password } = data;

  if (!name || !email || !title || !message) {
    return new Response(JSON.stringify({ success: false, error: 'missing_fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (is_private && (!post_password || post_password.length < 4)) {
    return new Response(JSON.stringify({ success: false, error: 'password_required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const createdAt = new Date().toISOString();
  const pwHash = is_private ? await hashPassword(post_password) : null;

  const result = await env.BOARD_DB.prepare(
    `INSERT INTO posts (service, name, email, org, title, message, is_private, created_at, post_pw_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(service || null, name, email, org || null, title, message, is_private ? 1 : 0, createdAt, pwHash).run();

  const id = result.meta.last_row_id;

  return new Response(JSON.stringify({ success: true, id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
