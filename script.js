const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');
const glow = document.querySelector('.cursor-glow');
const calculator = document.querySelector('.calculator');

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

if (calculator) {
  const productOptions = calculator.querySelectorAll('[data-group="product"] .calc-option');
  const timingOptions = calculator.querySelectorAll('[data-group="timing"] .calc-option');
  const addons = calculator.querySelectorAll('.addons .calc-option');
  const total = calculator.querySelector('#calc-total');
  const link = calculator.querySelector('#calc-link');
  const formatPrice = (value) => `${Math.round(value / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';

  const updateCalculator = () => {
    const base = Number(calculator.querySelector('.calc-option.active[data-price]')?.dataset.price || 90000);
    const additions = [...addons].filter((option) => option.classList.contains('active')).reduce((sum, option) => sum + Number(option.dataset.price), 0);
    const multiplier = Number(calculator.querySelector('[data-group="timing"] .calc-option.active')?.dataset.multiplier || 1);
    const result = (base + additions) * multiplier;
    total.textContent = formatPrice(result);
    link.href = `https://t.me/konturstudiolbot?text=${encodeURIComponent(`Хочу обсудить проект примерно на ${formatPrice(result)}`)}`;
  };

  [...productOptions, ...timingOptions].forEach((option) => option.addEventListener('click', () => {
    option.parentElement.querySelectorAll('.calc-option').forEach((item) => item.classList.remove('active'));
    option.classList.add('active');
    updateCalculator();
  }));
  addons.forEach((option) => option.addEventListener('click', () => { option.classList.toggle('active'); updateCalculator(); }));
  updateCalculator();
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const name = form.elements.name.value.trim();
  const telegram = form.elements.telegram.value.trim();
  const message = form.elements.message.value.trim();
  submitButton.disabled = true;
  status.textContent = 'Отправляем заявку...';

  const apiBase = window.KONTUR_API_URL || '';
  fetch(`${apiBase}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, telegram, message })
  })
    .then((response) => {
      if (!response.ok) throw new Error('Request failed');
      status.textContent = `Спасибо, ${name}! Заявка отправлена в админку.`;
      form.reset();
    })
    .catch(() => {
      const offlineLeads = JSON.parse(localStorage.getItem('kontur_leads') || '[]');
      offlineLeads.push({ name, telegram, message, createdAt: new Date().toISOString() });
      localStorage.setItem('kontur_leads', JSON.stringify(offlineLeads));
      status.textContent = `Заявка сохранена в админке, ${name}.`;
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
