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

  const { id, password } = data;

  if (!id || !password) {
    return new Response(JSON.stringify({ success: false, error: 'missing_params' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const post = await env.BOARD_DB.prepare(
    `SELECT id, service, name, title, message, is_private, created_at, reply, replied_at, post_pw_hash FROM posts WHERE id = ?`
  ).bind(id).first();

  if (!post || !post.is_private || !post.post_pw_hash) {
    return new Response(JSON.stringify({ success: false, error: 'not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const hash = await hashPassword(password);
  if (hash !== post.post_pw_hash) {
    return new Response(JSON.stringify({ success: false, error: 'wrong_password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
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
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
