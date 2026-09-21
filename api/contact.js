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

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (botToken && adminChatId) {
    const text = ['Новая заявка с сайта «контур»', '', `Имя: ${name.trim()}`, `Telegram: ${telegram.trim()}`, `Задача: ${message.trim()}`].join('\n');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminChatId, text })
    });
    if (!telegramResponse.ok) console.error('Telegram notification failed', telegramResponse.status);
  }
  return response.status(201).json({ ok: true });
}
