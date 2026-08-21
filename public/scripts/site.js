const body = document.body;
const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuOpen = document.querySelector('[data-menu-open]');
const menuClose = document.querySelector('[data-menu-close]');
const search = document.querySelector('[data-search]');
const searchOpenButtons = document.querySelectorAll('[data-search-open]');
const searchInput = document.querySelector('[data-search-input]');
const results = document.querySelector('[data-search-results]');
const searchStatus = document.querySelector('[data-search-status]');

const setPanel = (panel, open) => {
  if (!panel) return;
  panel.setAttribute('aria-hidden', String(!open));
  panel.classList.toggle('is-open', open);
  body.classList.toggle('panel-open', open);
};

menuOpen?.addEventListener('click', () => { setPanel(menu, true); menuOpen.setAttribute('aria-expanded', 'true'); menuClose?.focus(); });
menuClose?.addEventListener('click', () => { setPanel(menu, false); menuOpen?.setAttribute('aria-expanded', 'false'); menuOpen?.focus(); });
searchOpenButtons.forEach((button) => button.addEventListener('click', () => { setPanel(search, true); setTimeout(() => searchInput?.focus(), 80); }));
document.querySelector('[data-search-close]')?.addEventListener('click', () => setPanel(search, false));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setPanel(menu, false); setPanel(search, false); menuOpen?.setAttribute('aria-expanded', 'false'); } });
window.addEventListener('scroll', () => header?.classList.toggle('is-scrolled', scrollY > 24), { passive: true });

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('[data-reveal]').forEach((node) => revealObserver.observe(node));

if (searchInput) {
  let index = [];
  fetch('/search-index.json').then((response) => response.json()).then((data) => { index = data; });
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) { results.innerHTML = ''; searchStatus.textContent = 'Enter at least two characters.'; return; }
    const matches = index.filter((item) => item.search.includes(query)).slice(0, 7);
    searchStatus.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'} in the publication index.` : 'No exact match. Try a chassis code, product or broader topic.';
    results.innerHTML = matches.map((item) => `<a href="${item.url}"><small>${item.category} · ${item.evidence}</small><strong>${item.title}</strong><span>${item.description}</span></a>`).join('');
  });
}

if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((panel) => {
    panel.addEventListener('pointermove', (event) => {
      const rect = panel.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      panel.style.setProperty('--rx', `${-y * 4}deg`);
      panel.style.setProperty('--ry', `${x * 5}deg`);
      panel.style.setProperty('--px', `${(x + .5) * 100}%`);
    });
    panel.addEventListener('pointerleave', () => { panel.style.setProperty('--rx', '0deg'); panel.style.setProperty('--ry', '0deg'); });
  });
}
