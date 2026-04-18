// ===== TENDANCES IA =====

function switchTab(tab) {
  document.querySelectorAll('.trends-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.trends-section').forEach(s => s.style.display = 'none');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(tab === 'trends' ? 'tabTrends' : 'tabCompetitor').style.display = 'block';
}

// ===== RECHERCHE TENDANCES =====
async function searchTrends(e) {
  e.preventDefault();
  const token = window.getToken?.();
  if (!token) { openAuthModal?.('login'); return; }

  const sujet = document.getElementById('trendsSubject').value.trim();
  const plateforme = document.getElementById('trendsPlatform').value;
  const btn = document.getElementById('trendsBtn');
  const result = document.getElementById('trendsResult');

  if (!sujet) return;

  btn.disabled = true;
  btn.classList.add('loading');
  btn.querySelector('span:last-child').textContent = 'Recherche en cours…';
  result.style.display = 'block';
  result.innerHTML = `<div class="trends-skeleton"><span class="skeleton-pulse">🌐 Interrogation de Google Search via Gemini IA…</span></div>`;

  try {
    const res = await fetch('/api/trends/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ sujet, plateforme })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    result.innerHTML = renderTrendsResult(data, sujet, plateforme);
  } catch (err) {
    result.innerHTML = `<div class="trends-skeleton" style="color:var(--danger)">Erreur : ${escHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.querySelector('span:last-child').textContent = 'Rechercher les tendances';
  }
}

function renderTrendsResult(d, sujet, plateforme) {
  const tendances = Array.isArray(d.tendances_actuelles) ? d.tendances_actuelles : [];
  const hooks = Array.isArray(d.hooks_populaires) ? d.hooks_populaires : [];
  const mots = Array.isArray(d.mots_cles_tendance) ? d.mots_cles_tendance : [];
  const niches = Array.isArray(d.niches_emergentes) ? d.niches_emergentes : [];
  const angles = Array.isArray(d.angles_contenu) ? d.angles_contenu : [];
  const sources = Array.isArray(d.sources) ? d.sources : [];

  return `
    <div class="trends-grid">
      ${mots.length ? `<div class="trends-card">
        <div class="trends-card-title">🔥 Mots-clés tendance</div>
        <div class="tag-list">${mots.map(m => `<span class="tag">#${escHtml(m)}</span>`).join('')}</div>
      </div>` : ''}

      ${niches.length ? `<div class="trends-card">
        <div class="trends-card-title">🚀 Niches émergentes</div>
        <div class="tag-list">${niches.map(n => `<span class="tag">${escHtml(n)}</span>`).join('')}</div>
      </div>` : ''}
    </div>

    ${tendances.length ? `<div class="trends-full-card">
      <h3>📈 Tendances actuelles — ${escHtml(sujet)} sur ${escHtml(plateforme)}</h3>
      <ul class="trends-list">${tendances.map(t => `<li>${escHtml(t)}</li>`).join('')}</ul>
    </div>` : ''}

    ${hooks.length ? `<div class="trends-full-card">
      <h3>💡 Hooks populaires en ce moment</h3>
      <ul class="trends-list">${hooks.map(h => `<li>${escHtml(h)}</li>`).join('')}</ul>
    </div>` : ''}

    ${angles.length ? `<div class="trends-full-card">
      <h3>🎯 Angles de contenu à exploiter</h3>
      <ul class="trends-list">${angles.map(a => `<li>${escHtml(a)}</li>`).join('')}</ul>
    </div>` : ''}

    ${sources.length ? `<div class="sources-row">
      <strong>Sources :</strong> ${sources.map(s => escHtml(s)).join(' · ')}
    </div>` : ''}
  `;
}

// ===== ANALYSE CONCURRENT =====
async function analyzeCompetitor(e) {
  e.preventDefault();
  const token = window.getToken?.();
  if (!token) { openAuthModal?.('login'); return; }

  const concurrent = document.getElementById('competitorName').value.trim();
  const plateforme = document.getElementById('competitorPlatform').value;
  const btn = document.getElementById('competitorBtn');
  const result = document.getElementById('competitorResult');

  if (!concurrent) return;

  btn.disabled = true;
  btn.classList.add('loading');
  btn.querySelector('span:last-child').textContent = 'Analyse en cours…';
  result.style.display = 'block';
  result.innerHTML = `<div class="trends-skeleton"><span class="skeleton-pulse">🔍 Analyse du concurrent via Gemini + Google Search…</span></div>`;

  try {
    const res = await fetch('/api/trends/competitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ concurrent, plateforme })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    result.innerHTML = renderCompetitorResult(data, concurrent);
  } catch (err) {
    result.innerHTML = `<div class="trends-skeleton" style="color:var(--danger)">Erreur : ${escHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.querySelector('span:last-child').textContent = 'Analyser ce concurrent';
  }
}

function renderCompetitorResult(d, concurrent) {
  const profil = d.profil || {};
  const forts = Array.isArray(d.points_forts) ? d.points_forts : [];
  const faibles = Array.isArray(d.points_faibles) ? d.points_faibles : [];
  const formats = Array.isArray(d.formats_performants) ? d.formats_performants : [];
  const opps = Array.isArray(d.opportunites) ? d.opportunites : [];
  const sources = Array.isArray(d.sources) ? d.sources : [];
  const fiabilite = d.fiabilite || 'moyenne';

  const fiabiliteClass = fiabilite === 'élevée' || fiabilite === 'elevee' ? 'fiabilite-elevee'
    : fiabilite === 'faible' ? 'fiabilite-faible' : 'fiabilite-moyenne';

  const profilStats = [
    profil.abonnes && { val: profil.abonnes, lbl: 'Abonnés' },
    profil.vues_moyennes && { val: profil.vues_moyennes, lbl: 'Vues moy.' },
    profil.frequence && { val: profil.frequence, lbl: 'Fréquence' },
    profil.taux_engagement && { val: profil.taux_engagement, lbl: 'Engagement' },
  ].filter(Boolean);

  return `
    <div class="comp-profil-card">
      <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
        <h3 style="margin:0; flex:1">📊 ${escHtml(profil.nom || concurrent)}</h3>
        <span class="fiabilite-badge ${fiabiliteClass}">Fiabilité : ${escHtml(fiabilite)}</span>
      </div>
      ${profil.description ? `<p style="font-size:0.87rem; margin:0.5rem 0 0; color:var(--text-muted)">${escHtml(profil.description)}</p>` : ''}
      ${profilStats.length ? `<div class="comp-profil-grid">${profilStats.map(s => `
        <div class="comp-profil-stat">
          <span class="val">${escHtml(s.val)}</span>
          <span class="lbl">${escHtml(s.lbl)}</span>
        </div>`).join('')}</div>` : ''}
    </div>

    <div class="competitor-layout">
      ${forts.length ? `<div class="comp-card good">
        <div class="comp-card-title">Points forts</div>
        <ul class="comp-list">${forts.map(f => `<li>${escHtml(f)}</li>`).join('')}</ul>
      </div>` : ''}

      ${faibles.length ? `<div class="comp-card bad">
        <div class="comp-card-title">Points faibles</div>
        <ul class="comp-list">${faibles.map(f => `<li>${escHtml(f)}</li>`).join('')}</ul>
      </div>` : ''}
    </div>

    ${formats.length ? `<div class="comp-card neutral" style="margin-bottom:1rem">
      <div class="comp-card-title">Formats performants</div>
      <ul class="comp-list">${formats.map(f => `<li>${escHtml(f)}</li>`).join('')}</ul>
    </div>` : ''}

    ${opps.length ? `<div class="comp-card neutral" style="margin-bottom:1rem">
      <div class="comp-card-title">💡 Opportunités pour vous</div>
      <ul class="comp-list">${opps.map(o => `<li>${escHtml(o)}</li>`).join('')}</ul>
    </div>` : ''}

    ${sources.length ? `<div class="sources-row">
      <strong>Sources :</strong> ${sources.map(s => escHtml(s)).join(' · ')}
    </div>` : ''}
  `;
}

// ===== UTILS =====
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast toast-${type} show`;
  setTimeout(() => t.className = 'toast', 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initAuth?.();
});
