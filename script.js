const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');
const glow = document.querySelector('.cursor-glow');

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const name = form.elements.name.value.trim();
  const telegram = form.elements.telegram.value.trim();
  const message = form.elements.message.value.trim();
  submitButton.disabled = true;
  status.textContent = 'Отправляем заявку...';

  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, telegram, message })
  })
    .then((response) => {
      if (!response.ok) throw new Error('Request failed');
      status.textContent = `Спасибо, ${name}! Мы получили заявку и скоро свяжемся в Telegram.`;
      form.reset();
    })
    .catch(() => {
      const offlineLeads = JSON.parse(localStorage.getItem('kontur_leads') || '[]');
      offlineLeads.push({ name, telegram, message, createdAt: new Date().toISOString() });
      localStorage.setItem('kontur_leads', JSON.stringify(offlineLeads));
      status.textContent = `Заявка сохранена, ${name}. Мы свяжемся с вами в Telegram.`;
      form.reset();
    })
    .finally(() => {
      submitButton.disabled = false;
    });
});

document.addEventListener('pointermove', (event) => {
  if (glow) {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
