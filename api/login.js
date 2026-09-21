import { isPasswordValid, issueSession } from './_auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  if (!isPasswordValid(request.body?.password)) {
    return response.status(401).json({ error: 'Неверный пароль' });
  }
  issueSession(response);
  return response.status(200).json({ ok: true });
}
