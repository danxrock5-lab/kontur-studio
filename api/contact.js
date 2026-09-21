import { createSubmission } from './store.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const { name, telegram, message } = request.body || {};
  if (![name, telegram, message].every((value) => typeof value === 'string' && value.trim())) {
    return response.status(400).json({ error: 'Заполните все поля' });
  }
  if (name.length > 100 || telegram.length > 100 || message.length > 3000) {
    return response.status(400).json({ error: 'Слишком длинное значение' });
  }

  try {
    await createSubmission({
      name: name.trim(),
      telegram: telegram.trim(),
      message: message.trim()
    });
  } catch (error) {
    console.error(error);
    return response.status(503).json({ error: 'Lead storage is unavailable' });
  }
  return response.status(201).json({ ok: true });
}
