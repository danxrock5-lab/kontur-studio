import { getCsrfToken, requireSession } from './_auth.js';
import { listSubmissions } from './store.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  if (!requireSession(request, response)) return;
  try {
    return response.status(200).json({ leads: await listSubmissions(), csrfToken: getCsrfToken(request) });
  } catch (error) {
    console.error(error);
    return response.status(503).json({ error: 'Lead storage is unavailable' });
  }
}
