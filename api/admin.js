import { submissions } from './store.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = (request.headers.authorization || '').replace('Bearer ', '');
  if (!expectedPassword || providedPassword !== expectedPassword) return response.status(401).json({ error: 'Unauthorized' });
  return response.status(200).json(submissions);
}