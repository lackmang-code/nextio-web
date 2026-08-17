export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!id || !token) {
    return new Response(JSON.stringify({ success: false, error: 'missing_params' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const post = await env.BOARD_DB.prepare(
    `SELECT id, service, name, title, message, is_private, created_at, reply, replied_at, access_token FROM posts WHERE id = ?`
  ).bind(id).first();

  if (!post || post.access_token !== token) {
    return new Response(JSON.stringify({ success: false, error: 'not_found' }), {
      status: 404,
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
      is_private: !!post.is_private,
      created_at: post.created_at,
      reply: post.reply,
      replied_at: post.replied_at
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
