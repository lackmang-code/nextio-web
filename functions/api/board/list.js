export async function onRequestGet({ env }) {
  const { results } = await env.BOARD_DB.prepare(
    `SELECT id, service, name, title, message, is_private, created_at, reply, replied_at FROM posts ORDER BY id DESC LIMIT 100`
  ).all();

  const posts = results.map((p) => {
    if (p.is_private) {
      return {
        id: p.id,
        service: p.service,
        name: p.name,
        title: '비밀글입니다',
        message: null,
        is_private: true,
        created_at: p.created_at,
        answered: !!p.replied_at,
        reply: null,
        replied_at: null
      };
    }
    return {
      id: p.id,
      service: p.service,
      name: p.name,
      title: p.title,
      message: p.message,
      is_private: false,
      created_at: p.created_at,
      answered: !!p.replied_at,
      reply: p.reply,
      replied_at: p.replied_at
    };
  });

  return new Response(JSON.stringify({ success: true, posts }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
