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
  const accessToken = crypto.randomUUID().replace(/-/g, '');

  const result = await env.BOARD_DB.prepare(
    `INSERT INTO posts (service, name, email, org, title, message, is_private, created_at, access_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(service || null, name, email, org || null, title, message, is_private ? 1 : 0, createdAt, accessToken).run();

  const id = result.meta.last_row_id;

  return new Response(JSON.stringify({ success: true, id, access_token: accessToken }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
