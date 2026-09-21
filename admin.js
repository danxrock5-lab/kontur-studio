const loginPanel = document.querySelector('#login-panel');
const inbox = document.querySelector('#inbox');
const loginForm = document.querySelector('#login-form');
const loginStatus = document.querySelector('.login-status');
const leadList = document.querySelector('#lead-list');
const leadCount = document.querySelector('#lead-count');
let csrfToken = '';

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function renderLeads(leads) {
  leadCount.textContent = `${leads.length} заявок`;
  leadList.innerHTML = leads.length
    ? leads.map((lead) => `<article class="lead-card"><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.telegram)}</small><p>${escapeHtml(lead.message)}</p><time>${new Date(lead.createdAt).toLocaleString('ru-RU')}</time></article>`).join('')
    : '<p class="empty-state">Новых заявок пока нет.</p>';
}

async function loadLeads() {
  const response = await fetch('/api/admin', { credentials: 'same-origin' });
  if (response.status === 401) {
    inbox.hidden = true;
    loginPanel.hidden = false;
    return;
  }
  if (!response.ok) throw new Error('Не удалось загрузить заявки');
  const data = await response.json();
  csrfToken = data.csrfToken;
  renderLeads(data.leads);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = document.querySelector('#password').value;
  loginStatus.textContent = 'Проверяем доступ...';
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Не удалось войти');
    loginPanel.hidden = true;
    inbox.hidden = false;
    await loadLeads();
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});

document.querySelector('#refresh').addEventListener('click', () => {
  loadLeads().catch((error) => { loginStatus.textContent = error.message; });
});

document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRF-Token': csrfToken }
  });
  csrfToken = '';
  inbox.hidden = true;
  loginPanel.hidden = false;
});

loadLeads().catch(() => {});
