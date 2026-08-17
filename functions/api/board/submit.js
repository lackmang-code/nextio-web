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

  const { service, name, email, org, title, message, is_private } = data;

  if (!name || !email || !title || !message) {
    return new Response(JSON.stringify({ success: false, error: 'missing_fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const createdAt = new Date().toISOString();

  await env.BOARD_DB.prepare(
    `INSERT INTO posts (service, name, email, org, title, message, is_private, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(service || null, name, email, org || null, title, message, is_private ? 1 : 0, createdAt).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
