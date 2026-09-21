const loginPanel = document.querySelector('#login-panel');
const inbox = document.querySelector('#inbox');
const loginForm = document.querySelector('#login-form');
const loginStatus = document.querySelector('.login-status');
const leadList = document.querySelector('#lead-list');
const leadCount = document.querySelector('#lead-count');
const tokenKey = 'kontur_admin_token';
const demoPasswordHash = '1d2dc0822326580deb6bdfb7542a64a8a0efe5722f223dc36d4c514eea48b54b';

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function renderLeads(leads) {
  leadCount.textContent = `${leads.length} заявок`;
  leadList.innerHTML = leads.length ? leads.map((lead) => `<article class="lead-card"><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.telegram)}</small><p>${escapeHtml(lead.message)}</p><time>${new Date(lead.createdAt).toLocaleString('ru-RU')}</time></article>`).join('') : '<p class="empty-state">Новых заявок пока нет.</p>';
}

async function isDemoPasswordValid(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return hash === demoPasswordHash;
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
  loginStatus.textContent = 'Проверяем доступ...';

  try {
    const response = await fetch('/api/admin', { headers: { Authorization: `Bearer ${password}` } });
    if (response.ok) {
      localStorage.setItem(tokenKey, password);
      loginPanel.hidden = true;
      inbox.hidden = false;
      loadLeads();
      return;
    }
    if (response.status === 401) throw new Error('Invalid password');
  } catch (error) {
    if (error.message === 'Invalid password' || !(await isDemoPasswordValid(password))) {
      loginStatus.textContent = 'Неверный пароль.';
      return;
    }
  }

  if (!(await isDemoPasswordValid(password))) {
    loginStatus.textContent = 'Неверный пароль.';
    return;
  }

  localStorage.setItem(tokenKey, password);
  loginStatus.textContent = 'Локальный режим: доступ разрешён.';
  loginPanel.hidden = true;
  inbox.hidden = false;
  loadLeads();
});

document.querySelector('#refresh').addEventListener('click', loadLeads);
window.addEventListener('storage', (event) => {
  if (event.key === 'kontur_leads') loadLeads();
});
document.querySelector('#logout').addEventListener('click', () => { localStorage.removeItem(tokenKey); inbox.hidden = true; loginPanel.hidden = false; });