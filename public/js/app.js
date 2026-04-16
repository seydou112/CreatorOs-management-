// ===== NAV =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 20));
navToggle?.addEventListener('click', () => navLinks?.classList.toggle('open'));

// ===== ÉTAT =====
const FREE_LIMIT = 3;
const HISTORY_KEY = 'viral_historique';
const USAGE_KEY = 'viral_usage';

function getTodayKey() { return new Date().toISOString().split('T')[0]; }

function loadUsage() {
  const stored = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
  if (stored.date === getTodayKey()) return stored.remaining ?? FREE_LIMIT;
  return FREE_LIMIT;
}

function saveUsage(remaining) {
  localStorage.setItem(USAGE_KEY, JSON.stringify({ date: getTodayKey(), remaining }));
}

function updateUsageDisplay(remaining) {
  const txt = document.getElementById('usageText');
  const fill = document.getElementById('usageFill');
  if (!txt || !fill) return;

  const isUnlimited = remaining === 'unlimited';
  if (isUnlimited) {
    txt.textContent = 'Générations illimitées (Premium)';
    fill.style.width = '100%';
    fill.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
    return;
  }

  const r = parseInt(remaining);
  const pct = Math.max(0, (r / FREE_LIMIT)) * 100;
  txt.textContent = r > 0 ? `${r} génération${r > 1 ? 's' : ''} restante${r > 1 ? 's' : ''} aujourd'hui` : 'Limite atteinte — Passez Premium';
  fill.style.width = pct + '%';
  fill.style.background = r <= 1
    ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
    : 'linear-gradient(90deg, #7c3aed, #06b6d4)';
  saveUsage(r);
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== GÉNÉRATION =====
const form = document.getElementById('generateForm');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const btnFill = document.getElementById('btnFill');
const limitModal = document.getElementById('limitModal');

function setLoading(on) {
  generateBtn.disabled = on;
  generateBtn.classList.toggle('loading', on);
  btnText.textContent = on ? 'Génération en cours...' : 'Générer le contenu';
  if (on) {
    btnFill.classList.add('running');
  } else {
    btnFill.classList.remove('running');
    btnFill.style.transition = 'none';
    btnFill.style.width = '0';
    setTimeout(() => { btnFill.style.transition = ''; }, 50);
  }
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const theme = document.getElementById('theme').value.trim();
  if (!theme) {
    document.getElementById('themeError').textContent = 'Le sujet est obligatoire.';
    document.getElementById('theme').focus();
    return;
  }
  document.getElementById('themeError').textContent = '';

  if (!navigator.onLine) {
    showToast('Vous êtes hors ligne — génération impossible.', 'error');
    return;
  }

  setLoading(true);
  document.getElementById('resultContent').style.display = 'none';
  document.getElementById('resultPlaceholder').style.display = 'flex';

  const body = {
    theme,
    cible: document.getElementById('cible').value,
    objectif: document.getElementById('objectif').value,
    plateforme: document.getElementById('plateforme').value,
    mode: document.getElementById('mode').value
  };

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const remaining = res.headers.get('X-Remaining-Generations');
    if (remaining !== null) updateUsageDisplay(remaining);

    if (res.status === 429) {
      limitModal?.classList.add('open');
      return;
    }

    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Une erreur est survenue.', 'error'); return; }

    displayResults(data);
    saveToHistory({ ...body, ...data });
    renderHistory();
  } catch {
    showToast('Connexion impossible. Vérifiez votre connexion.', 'error');
  } finally {
    setLoading(false);
  }
});

function displayResults({ hook, script, call_to_action }) {
  document.getElementById('resultPlaceholder').style.display = 'none';
  document.getElementById('resultContent').style.display = 'flex';

  // Hook
  const hookEl = document.getElementById('hookText');
  hookEl.textContent = hook;
  hookEl.classList.remove('shimmer');

  // Script
  const scriptEl = document.getElementById('scriptText');
  scriptEl.innerHTML = '';
  script.split('\n\n').forEach(para => {
    if (para.trim()) {
      const p = document.createElement('p');
      p.textContent = para.trim();
      scriptEl.appendChild(p);
    }
  });
  // Si pas de double saut de ligne, diviser par ligne simple
  if (!scriptEl.children.length) {
    const p = document.createElement('p');
    p.textContent = script;
    scriptEl.appendChild(p);
  }

  // CTA
  document.getElementById('ctaText').textContent = call_to_action;

  // Animations en cascade
  const cards = ['hookCard', 'scriptCard', 'ctaCard'];
  cards.forEach((id, i) => {
    const card = document.getElementById(id);
    card.classList.remove('visible');
    setTimeout(() => {
      card.classList.add('visible');
      if (id === 'hookCard') {
        setTimeout(() => {
          hookEl.classList.add('shimmer');
          setTimeout(() => hookEl.classList.remove('shimmer'), 2100);
        }, 400);
      }
    }, i * 180);
  });

  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== COPIE =====
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const el = document.getElementById(targetId);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent || el.innerText).then(() => {
      showToast('Copié dans le presse-papiers !');
    });
  });
});

document.getElementById('copyAllBtn')?.addEventListener('click', () => {
  const hook = document.getElementById('hookText')?.textContent || '';
  const script = document.getElementById('scriptText')?.innerText || '';
  const cta = document.getElementById('ctaText')?.textContent || '';
  const full = `HOOK\n${hook}\n\nSCRIPT\n${script}\n\nCALL TO ACTION\n${cta}`;
  navigator.clipboard.writeText(full).then(() => showToast('Contenu complet copié !'));
});

document.getElementById('regenerateBtn')?.addEventListener('click', () => {
  form?.dispatchEvent(new Event('submit'));
});

// ===== HISTORIQUE =====
function saveToHistory(entry) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  history.unshift({ date: new Date().toLocaleDateString('fr-FR'), ...entry });
  if (history.length > 20) history.splice(20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const section = document.getElementById('historySection');
  const grid = document.getElementById('historyGrid');
  if (!section || !grid || !history.length) return;

  section.style.display = 'block';
  grid.innerHTML = '';

  history.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-meta">
        <span class="history-platform">${item.plateforme || ''}</span>
        <span>${item.date || ''}</span>
      </div>
      <div class="history-hook">${item.hook || item.theme || ''}</div>
    `;
    div.addEventListener('click', () => {
      displayResults(item);
      if (item.theme) document.getElementById('theme').value = item.theme;
    });
    grid.appendChild(div);
  });
}

// ===== INIT =====
updateUsageDisplay(loadUsage());
renderHistory();
