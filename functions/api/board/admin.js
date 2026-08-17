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

  const { password, action } = data;

  if (!password || password !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ success: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'list') {
    const { results } = await env.BOARD_DB.prepare(
      `SELECT id, service, name, email, org, title, message, is_private, created_at, reply, replied_at FROM posts ORDER BY id DESC LIMIT 200`
    ).all();
    return new Response(JSON.stringify({ success: true, posts: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'reply') {
    const { id, reply } = data;
    if (!id || !reply) {
      return new Response(JSON.stringify({ success: false, error: 'missing_fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const repliedAt = new Date().toISOString();
    await env.BOARD_DB.prepare(
      `UPDATE posts SET reply = ?, replied_at = ? WHERE id = ?`
    ).bind(reply, repliedAt, id).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: false, error: 'unknown_action' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}
