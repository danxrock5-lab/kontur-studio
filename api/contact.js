import { submissions } from './store.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { name, telegram, message } = request.body || {};
  if (!name || !telegram || !message) {
    return response.status(400).json({ error: 'Заполните все поля' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!botToken || !adminChatId) {
    return response.status(500).json({ error: 'Telegram is not configured' });
  }

  submissions.unshift({ name, telegram, message, createdAt: new Date().toISOString() });

  const text = [
    'Новая заявка с сайта «контур»',
    '',
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Задача: ${message}`
  ].join('\n');

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: adminChatId, text })
  });

  if (!telegramResponse.ok) {
    return response.status(502).json({ error: 'Telegram request failed' });
  }

  return response.status(200).json({ ok: true });
}
