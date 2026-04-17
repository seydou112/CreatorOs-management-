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
  fill.style.background = r <= 1 ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #7c3aed, #06b6d4)';
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

// ===== RÉFÉRENCES =====
const form = document.getElementById('generateForm');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
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

// ===== PROGRESSION EN ÉTAPES =====
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function setStep(id, state, timeLabel = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `gen-step ${state}`;
  const t = document.getElementById(id + 'time');
  if (t) t.textContent = timeLabel;
}

function resetSteps() {
  ['gstep1','gstep2','gstep3','gstep4','gstep5','gstep6'].forEach(id => setStep(id, '', ''));
}

// Gestion de la pause questions
let _resolveQuestions = null;

function showQuestionsPanel() {
  return new Promise(resolve => {
    _resolveQuestions = resolve;
    document.getElementById('genQuestions').style.display = 'block';
  });
}

document.getElementById('continueGenBtn')?.addEventListener('click', () => {
  const ton = document.querySelector('#tonPills .gen-pill.active')?.dataset.val || 'audacieux';
  const duree = document.querySelector('#dureePills .gen-pill.active')?.dataset.val || '30s';
  document.getElementById('genQuestions').style.display = 'none';
  _resolveQuestions?.({ ton, duree });
  _resolveQuestions = null;
});

// Sélection des pills
['tonPills', 'dureePills'].forEach(groupId => {
  document.getElementById(groupId)?.addEventListener('click', e => {
    const pill = e.target.closest('.gen-pill');
    if (!pill) return;
    document.querySelectorAll(`#${groupId} .gen-pill`).forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// ===== APPEL API =====
async function callGenerateAPI(body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.getToken?.() || ''}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (res.status === 401) {
      window._authPendingAction = () => form.dispatchEvent(new Event('submit'));
      window.openAuthModal?.('login');
      throw new Error('auth');
    }

    const remaining = res.headers.get('X-Remaining-Generations');
    if (remaining !== null) updateUsageDisplay(remaining);

    if (res.status === 429) {
      limitModal?.classList.add('open');
      throw new Error('limit');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== FLUX DE GÉNÉRATION AVEC ÉTAPES =====
async function runGenerationFlow(body) {
  const placeholder = document.getElementById('resultPlaceholder');
  const content = document.getElementById('resultContent');
  const progress = document.getElementById('genProgress');
  const headerLabel = document.getElementById('genHeaderLabel');

  placeholder.style.display = 'none';
  content.style.display = 'none';
  progress.style.display = 'flex';
  resetSteps();

  try {
    // Étape 1 — Analyse
    setStep('gstep1', 'active');
    await delay(850);
    setStep('gstep1', 'done', '✓');

    // Étape 2 — Tendances
    setStep('gstep2', 'active');
    await delay(1050);
    setStep('gstep2', 'done', '✓');

    // Étape 3 — PAUSE : questions personnalisation
    setStep('gstep3', 'pause');
    if (headerLabel) headerLabel.textContent = 'Quelques questions rapides…';
    const { ton, duree } = await showQuestionsPanel();
    if (headerLabel) headerLabel.textContent = 'L\'IA crée votre contenu';
    setStep('gstep3', 'done', '✓');

    // Étape 4 — Lancement de l'API + hook
    setStep('gstep4', 'active');
    const enrichedBody = { ...body, ton, duree };
    const apiPromise = callGenerateAPI(enrichedBody);
    await Promise.race([apiPromise.catch(() => {}), delay(1400)]);
    setStep('gstep4', 'done', '✓');

    // Étape 5 — Script
    setStep('gstep5', 'active');
    await Promise.race([apiPromise.catch(() => {}), delay(1100)]);
    setStep('gstep5', 'done', '✓');

    // Étape 6 — CTA + attente résultat final
    setStep('gstep6', 'active');
    const result = await apiPromise;
    await delay(350);
    setStep('gstep6', 'done', '✓');

    if (headerLabel) headerLabel.textContent = 'Contenu prêt ✓';
    await delay(500);

    progress.style.display = 'none';
    displayResults(result);
    saveToHistory({ ...enrichedBody, ...result });
    renderHistory();

  } catch (err) {
    progress.style.display = 'none';
    placeholder.style.display = 'flex';
    if (err.message === 'auth' || err.message === 'limit') return;
    if (err.name === 'AbortError') {
      showToast('Le serveur met du temps à répondre. Réessayez dans 30 secondes.', 'error');
    } else {
      showToast(err.message || 'Une erreur est survenue.', 'error');
    }
  } finally {
    setLoading(false);
  }
}

// ===== FORMULAIRE =====
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const theme = document.getElementById('theme').value.trim();
  if (!theme) {
    document.getElementById('themeError').textContent = 'Le sujet est obligatoire.';
    document.getElementById('theme').focus();
    return;
  }
  document.getElementById('themeError').textContent = '';

  if (!window.getToken?.()) {
    window._authPendingAction = () => form.dispatchEvent(new Event('submit'));
    window.openAuthModal?.('login');
    return;
  }

  if (!navigator.onLine) {
    showToast('Vous êtes hors ligne — génération impossible.', 'error');
    return;
  }

  setLoading(true);

  await runGenerationFlow({
    theme,
    cible: document.getElementById('cible').value,
    objectif: document.getElementById('objectif').value,
    plateforme: document.getElementById('plateforme').value,
    mode: document.getElementById('mode').value
  });
});

// ===== AFFICHAGE RÉSULTATS =====
let _variations = [];
let _activeVar = 0;

function displayResults(data) {
  document.getElementById('resultPlaceholder').style.display = 'none';
  document.getElementById('resultContent').style.display = 'flex';

  // Support ancien format (hook/script/cta) + nouveau (variations)
  _variations = data.variations || [{ hook: data.hook, script: data.script, call_to_action: data.call_to_action }];
  _activeVar = 0;

  const tabsEl = document.getElementById('variationTabs');
  if (tabsEl) tabsEl.style.display = _variations.length > 1 ? 'flex' : 'none';
  document.querySelectorAll('.var-tab').forEach((t, i) => t.classList.toggle('active', i === 0));

  displayVariation(_variations[0], true);

  if (data.score_viral !== undefined) showScoreCard(data.score_viral, data.score_explication);
  if (data.hashtags) showHashtagsCard(data.hashtags);

  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayVariation({ hook, script, call_to_action }, animate = false) {
  const hookEl = document.getElementById('hookText');
  hookEl.textContent = hook;
  hookEl.classList.remove('shimmer');

  const scriptEl = document.getElementById('scriptText');
  scriptEl.innerHTML = '';
  script.split('\n\n').forEach(para => {
    if (para.trim()) { const p = document.createElement('p'); p.textContent = para.trim(); scriptEl.appendChild(p); }
  });
  if (!scriptEl.children.length) { const p = document.createElement('p'); p.textContent = script; scriptEl.appendChild(p); }

  document.getElementById('ctaText').textContent = call_to_action;

  if (animate) {
    ['hookCard', 'scriptCard', 'ctaCard'].forEach((id, i) => {
      const card = document.getElementById(id);
      card.classList.remove('visible');
      setTimeout(() => {
        card.classList.add('visible');
        if (id === 'hookCard') setTimeout(() => { hookEl.classList.add('shimmer'); setTimeout(() => hookEl.classList.remove('shimmer'), 2100); }, 400);
      }, i * 180);
    });
  }
}

// Tabs A/B/C
document.getElementById('variationTabs')?.addEventListener('click', e => {
  const tab = e.target.closest('.var-tab');
  if (!tab || !_variations.length) return;
  const idx = parseInt(tab.dataset.var);
  if (!_variations[idx]) return;
  document.querySelectorAll('.var-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
  _activeVar = idx;
  displayVariation(_variations[idx], false);
  showToast(`Version ${['A','B','C'][idx]} sélectionnée`);
});

// Score viral
function showScoreCard(score, explication) {
  const card = document.getElementById('scoreCard');
  const numEl = document.getElementById('scoreNumber');
  const fillEl = document.getElementById('scoreBarFill');
  const explEl = document.getElementById('scoreExplication');
  if (!card) return;

  card.className = 'result-card score-card';
  if (score >= 76) card.classList.add('score-high');
  else if (score >= 51) card.classList.add('score-medium');
  else card.classList.add('score-low');

  if (explEl) explEl.textContent = explication || '';

  setTimeout(() => {
    card.classList.add('visible');
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / 1200, 1);
      numEl.textContent = Math.round((1 - Math.pow(1 - p, 3)) * score);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { if (fillEl) fillEl.style.width = `${score}%`; }, 150);
  }, 650);
}

// Hashtags
function showHashtagsCard(hashtags) {
  const card = document.getElementById('hashtagsCard');
  if (!card) return;
  ['tendance', 'niche', 'volume'].forEach(g => {
    const el = document.getElementById('hashtags' + g.charAt(0).toUpperCase() + g.slice(1));
    if (!el || !hashtags[g]) return;
    el.innerHTML = (hashtags[g] || []).map(tag =>
      `<button class="hashtag-pill" onclick="copyTag('${tag}')">${tag}</button>`
    ).join('');
  });
  setTimeout(() => card.classList.add('visible'), 950);
}

window.copyTag = tag => navigator.clipboard.writeText(tag).then(() => showToast(`${tag} copié !`));

document.getElementById('copyAllHashtags')?.addEventListener('click', () => {
  const tags = [...document.querySelectorAll('.hashtag-pill')].map(p => p.textContent).join(' ');
  navigator.clipboard.writeText(tags).then(() => showToast('Tous les hashtags copiés !'));
});

// ===== COPIE =====
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const el = document.getElementById(btn.dataset.target);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent || el.innerText).then(() => showToast('Copié !'));
  });
});

document.getElementById('copyAllBtn')?.addEventListener('click', () => {
  const v = _variations[_activeVar] || {};
  navigator.clipboard.writeText(`HOOK\n${v.hook || ''}\n\nSCRIPT\n${v.script || ''}\n\nCALL TO ACTION\n${v.call_to_action || ''}`)
    .then(() => showToast('Contenu complet copié !'));
});

document.getElementById('regenerateBtn')?.addEventListener('click', () => {
  form?.dispatchEvent(new Event('submit'));
});

// ===== BIBLIOTHÈQUE =====
const LIBRARY_KEY = 'viral_library';
let _lastSavedData = null;

document.getElementById('saveLibraryBtn')?.addEventListener('click', () => {
  if (!_variations.length) return;
  const v = _variations[_activeVar] || _variations[0];
  _lastSavedData = v;
  const titleInput = document.getElementById('saveTitle');
  const themeVal = document.getElementById('theme')?.value.trim();
  if (titleInput) titleInput.value = themeVal ? themeVal.slice(0, 80) : '';
  const tagsInput = document.getElementById('saveTags');
  if (tagsInput) tagsInput.value = '';
  document.getElementById('saveModal')?.classList.add('open');
  setTimeout(() => titleInput?.focus(), 100);
});

document.getElementById('confirmSaveBtn')?.addEventListener('click', () => {
  if (!_lastSavedData) return;
  const title = document.getElementById('saveTitle')?.value.trim() || 'Sans titre';
  const tagsRaw = document.getElementById('saveTags')?.value || '';
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const plateforme = document.getElementById('plateforme')?.value || '';
  const lib = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
  lib.unshift({
    id: Date.now(),
    title,
    tags,
    plateforme,
    date: new Date().toLocaleDateString('fr-FR'),
    ..._lastSavedData
  });
  if (lib.length > 100) lib.splice(100);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
  document.getElementById('saveModal')?.classList.remove('open');
  _lastSavedData = null;
  showToast('Contenu sauvegardé dans la bibliothèque !');
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

  history.forEach(item => {
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

// Gérer share_target et protocol_handler (?theme= dans l'URL)
(function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const sharedTheme = params.get('theme') || params.get('text') || params.get('title');
  if (sharedTheme) {
    const themeInput = document.getElementById('theme');
    if (themeInput) {
      themeInput.value = decodeURIComponent(sharedTheme).slice(0, 200);
      themeInput.focus();
    }
  }
  // Nettoyer l'URL sans rechargement
  if (params.has('theme') || params.has('text') || params.has('title') || params.has('source')) {
    const clean = window.location.pathname;
    window.history.replaceState({}, '', clean);
  }
})();
