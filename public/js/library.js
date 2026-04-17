// ===== NAV =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 20));
navToggle?.addEventListener('click', () => navLinks?.classList.toggle('open'));

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== STATE =====
const LIBRARY_KEY = 'viral_library';
let _items = [];
let _activeFilter = '';
let _activeTag = '';
let _previewId = null;

function loadLibrary() {
  _items = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
}

function saveLibrary() {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(_items));
}

// ===== FILTRAGE =====
function getFiltered() {
  const q = document.getElementById('libSearch')?.value.toLowerCase().trim() || '';
  return _items.filter(item => {
    if (_activeFilter && item.plateforme !== _activeFilter) return false;
    if (_activeTag && !item.tags?.includes(_activeTag)) return false;
    if (q) {
      const hay = (item.title + ' ' + (item.tags || []).join(' ') + ' ' + item.hook).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ===== RENDU TAGS POPULAIRES =====
function renderPopularTags() {
  const container = document.getElementById('popularTags');
  if (!container) return;
  const freq = {};
  _items.forEach(item => (item.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0]);
  container.innerHTML = top.map(tag =>
    `<button class="lib-tag-chip${_activeTag === tag ? ' active' : ''}" data-tag="${tag}">${tag}</button>`
  ).join('');
}

// ===== RENDU GRILLE =====
const platformLabel = { tiktok: '🎵 TikTok', instagram: '📸 Instagram', facebook: '👥 Facebook' };

function renderGrid() {
  const grid = document.getElementById('libGrid');
  const empty = document.getElementById('libEmpty');
  const stats = document.getElementById('libStats');
  if (!grid) return;

  const filtered = getFiltered();
  const total = _items.length;

  if (stats) stats.textContent = total === 0 ? '' : `${filtered.length} sur ${total} contenus`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = total === 0 ? 'block' : 'none';
    if (total > 0 && empty) {
      empty.style.display = 'block';
      empty.querySelector('h3').textContent = 'Aucun résultat';
      empty.querySelector('p').textContent = 'Essayez d\'autres filtres ou termes de recherche.';
      empty.querySelector('.btn')?.remove();
    }
    return;
  }

  if (empty) empty.style.display = 'none';
  grid.innerHTML = '';

  filtered.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'lib-card';
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      <div class="lib-card-top">
        <span class="lib-card-platform">${platformLabel[item.plateforme] || item.plateforme || 'Inconnu'}</span>
        <span class="lib-card-date">${item.date || ''}</span>
      </div>
      <div class="lib-card-title">${escHtml(item.title || 'Sans titre')}</div>
      <div class="lib-card-hook">${escHtml(item.hook || '')}</div>
      ${item.tags?.length ? `<div class="lib-card-tags">${item.tags.map(t => `<span class="lib-card-tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
      <div class="lib-card-actions">
        <button class="lib-card-btn" data-action="preview" data-id="${item.id}">Voir</button>
        <button class="lib-card-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== ACTIONS GRILLE =====
document.getElementById('libGrid')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) {
    const card = e.target.closest('.lib-card');
    if (card) {
      const id = parseInt(card.querySelector('[data-id]')?.dataset.id);
      openPreview(id);
    }
    return;
  }
  const id = parseInt(btn.dataset.id);
  if (btn.dataset.action === 'preview') openPreview(id);
  if (btn.dataset.action === 'delete') deleteItem(id);
});

// ===== MODAL APERÇU =====
function openPreview(id) {
  const item = _items.find(i => i.id === id);
  if (!item) return;
  _previewId = id;

  document.getElementById('previewTitle').textContent = item.title || 'Sans titre';
  document.getElementById('previewMeta').textContent =
    `${platformLabel[item.plateforme] || item.plateforme || ''}  ·  ${item.date || ''}`;

  const tagsEl = document.getElementById('previewTags');
  tagsEl.innerHTML = (item.tags || []).map(t => `<span class="lib-card-tag">${escHtml(t)}</span>`).join('');

  document.getElementById('previewHook').textContent = item.hook || '';

  const scriptEl = document.getElementById('previewScript');
  scriptEl.innerHTML = '';
  (item.script || '').split('\n\n').forEach(para => {
    if (para.trim()) { const p = document.createElement('p'); p.textContent = para.trim(); scriptEl.appendChild(p); }
  });

  document.getElementById('previewCta').textContent = item.call_to_action || '';

  document.getElementById('libPreviewModal')?.classList.add('open');
}

window.closePreview = () => {
  document.getElementById('libPreviewModal')?.classList.remove('open');
  _previewId = null;
};

document.getElementById('libPreviewModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('libPreviewModal')) closePreview();
});

document.getElementById('previewCopyAll')?.addEventListener('click', () => {
  const item = _items.find(i => i.id === _previewId);
  if (!item) return;
  navigator.clipboard.writeText(`HOOK\n${item.hook || ''}\n\nSCRIPT\n${item.script || ''}\n\nCALL TO ACTION\n${item.call_to_action || ''}`)
    .then(() => showToast('Contenu complet copié !'));
});

document.getElementById('previewUseInGen')?.addEventListener('click', () => {
  const item = _items.find(i => i.id === _previewId);
  if (!item) return;
  const params = new URLSearchParams({ theme: item.title || '' });
  window.location.href = `/app.html?${params}`;
});

document.getElementById('previewDelete')?.addEventListener('click', () => {
  if (_previewId !== null) {
    deleteItem(_previewId);
    closePreview();
  }
});

function deleteItem(id) {
  if (!confirm('Supprimer ce contenu de la bibliothèque ?')) return;
  _items = _items.filter(i => i.id !== id);
  saveLibrary();
  renderPopularTags();
  renderGrid();
  showToast('Contenu supprimé.');
}

// ===== FILTRES =====
document.querySelectorAll('.lib-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lib-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _activeFilter = btn.dataset.platform;
    renderGrid();
  });
});

document.getElementById('popularTags')?.addEventListener('click', e => {
  const chip = e.target.closest('.lib-tag-chip');
  if (!chip) return;
  const tag = chip.dataset.tag;
  _activeTag = _activeTag === tag ? '' : tag;
  renderPopularTags();
  renderGrid();
});

document.getElementById('libSearch')?.addEventListener('input', () => renderGrid());

// ===== INIT =====
loadLibrary();
renderPopularTags();
renderGrid();
