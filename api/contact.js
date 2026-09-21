import { submissions } from './store.js';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { name, telegram, message } = request.body || {};
  if (!name || !telegram || !message) {
    return response.status(400).json({ error: 'Заполните все поля' });
  }

  submissions.unshift({ name, telegram, message, createdAt: new Date().toISOString() });
  return response.status(200).json({ ok: true });
}
