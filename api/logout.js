import { clearSession, requireCsrf, requireSession } from './_auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  if (!requireSession(request, response) || !requireCsrf(request, response)) return;
  clearSession(response);
  return response.status(200).json({ ok: true });
}
