const loginPanel = document.querySelector('#login-panel');
const inbox = document.querySelector('#inbox');
const loginForm = document.querySelector('#login-form');
const loginStatus = document.querySelector('.login-status');
const leadList = document.querySelector('#lead-list');
const leadCount = document.querySelector('#lead-count');
const tokenKey = 'kontur_admin_token';

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function renderLeads(leads) {
  leadCount.textContent = `${leads.length} заявок`;
  leadList.innerHTML = leads.length ? leads.map((lead) => `<article class="lead-card"><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.telegram)}</small><p>${escapeHtml(lead.message)}</p><time>${new Date(lead.createdAt).toLocaleString('ru-RU')}</time></article>`).join('') : '<p class="empty-state">Новых заявок пока нет.</p>';
}

async function loadLeads() {
  const localLeads = JSON.parse(localStorage.getItem('kontur_leads') || '[]');
  try {
    const response = await fetch('/api/admin', { headers: { Authorization: `Bearer ${localStorage.getItem(tokenKey)}` } });
    if (!response.ok) throw new Error('API unavailable');
    renderLeads(await response.json());
  } catch {
    renderLeads(localLeads);
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = document.querySelector('#password').value;
  localStorage.setItem(tokenKey, password);
  loginStatus.textContent = 'Проверяем доступ...';
  try {
    const response = await fetch('/api/admin', { headers: { Authorization: `Bearer ${password}` } });
    if (!response.ok) throw new Error('Invalid password');
  } catch {
    loginStatus.textContent = 'Серверная проверка недоступна. Открыта локальная админка.';
  }
  loginPanel.hidden = true;
  inbox.hidden = false;
  loadLeads();
});

document.querySelector('#refresh').addEventListener('click', loadLeads);
document.querySelector('#logout').addEventListener('click', () => { localStorage.removeItem(tokenKey); inbox.hidden = true; loginPanel.hidden = false; });