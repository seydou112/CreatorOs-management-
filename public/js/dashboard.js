// ===== DASHBOARD =====

async function loadProfile() {
  const token = window.getToken?.();
  if (!token) {
    window.location.href = '/';
    return;
  }

  try {
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) { window.location.href = '/'; return; }
    const data = await res.json();
    renderProfile(data);
  } catch {
    showToast('Erreur de chargement du profil.', 'error');
  }
}

function renderProfile(data) {
  // Avatar
  const avatar = document.getElementById('dashAvatar');
  if (avatar) avatar.textContent = (data.email || '?')[0].toUpperCase();

  // Email
  const emailEl = document.getElementById('dashEmail');
  if (emailEl) emailEl.textContent = data.email || '—';

  // Badges
  const badges = document.getElementById('dashBadges');
  if (badges) {
    badges.innerHTML = data.isPremium
      ? '<span class="badge-premium">✦ Premium</span>'
      : '<span class="badge-free">Gratuit</span>';
  }

  // Bouton upgrade
  const upgradeBtn = document.getElementById('upgradeBtnHeader');
  if (upgradeBtn) upgradeBtn.style.display = data.isPremium ? 'none' : 'inline-flex';

  // Stats
  const limit = parseInt(window.__FREE_LIMIT__ || '3');
  setText('statUsed', data.usedToday ?? '—');
  setText('statRemaining', data.isPremium ? '∞' : (data.remainingToday ?? '—'));
  setText('statTotal', data.totalGenerations ?? '—');
  setText('statMember', data.memberSince ? formatDate(data.memberSince) : '—');

  // Abonnement
  renderPremiumStatus(data);
}

function renderPremiumStatus(data) {
  const el = document.getElementById('premiumStatus');
  if (!el) return;

  if (data.isPremium) {
    const until = data.premiumUntil ? new Date(data.premiumUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
    el.innerHTML = `
      <div class="premium-active">
        <div class="premium-active-icon">✦</div>
        <div>
          <h3>Plan Premium actif</h3>
          <p>Générations illimitées${until ? ` — expire le ${until}` : ''}.</p>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="premium-free">
        <p>Vous êtes sur le plan <strong>Gratuit</strong></p>
        <p class="hint">3 générations par jour. Passez Premium pour des générations illimitées.</p>
        <button class="btn btn-primary" style="margin-top:1rem; width:100%" onclick="openPremiumModal()">
          ⚡ Passer Premium
        </button>
      </div>`;
  }
}

// ===== MOT DE PASSE =====
async function changePassword(e) {
  e.preventDefault();
  const token = window.getToken?.();
  const errEl = document.getElementById('pwdError');
  const btn = document.getElementById('pwdBtn');
  const current = document.getElementById('currentPwd').value;
  const newPwd = document.getElementById('newPwd').value;
  const confirm = document.getElementById('confirmPwd').value;

  errEl.textContent = '';

  if (!current || !newPwd || !confirm) { errEl.textContent = 'Tous les champs sont requis.'; return; }
  if (newPwd.length < 6) { errEl.textContent = 'Le nouveau mot de passe doit faire au moins 6 caractères.'; return; }
  if (newPwd !== confirm) { errEl.textContent = 'Les mots de passe ne correspondent pas.'; return; }

  btn.disabled = true;
  btn.textContent = 'Mise à jour…';

  try {
    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: current, newPassword: newPwd })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Erreur.'; return; }
    document.getElementById('passwordForm').reset();
    showToast('Mot de passe mis à jour.', 'success');
  } catch {
    errEl.textContent = 'Erreur réseau.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Mettre à jour le mot de passe';
  }
}

// ===== HISTORIQUE LOCAL =====
function loadHistory() {
  const container = document.getElementById('dashHistory');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('viral_historique') || '[]');
  if (!history.length) {
    container.innerHTML = '<div class="history-empty">Aucune génération pour l\'instant.<br>Utilisez le générateur pour créer du contenu.</div>';
    return;
  }

  container.innerHTML = `<div class="history-list">${history.slice(0, 10).map(item => `
    <div class="history-item" onclick="goToGenerator(${encodeHistoryItem(item)})">
      <div class="history-meta">
        <span class="history-platform">${escHtml(item.plateforme || 'unknown')}</span>
        <span class="history-date">${item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}</span>
      </div>
      <div class="history-hook">${escHtml(item.hook || '(sans titre)')}</div>
      <div class="history-theme">${escHtml(item.theme || '')}</div>
    </div>`).join('')}
  </div>`;
}

function encodeHistoryItem(item) {
  return `'${btoa(encodeURIComponent(JSON.stringify(item)))}'`;
}

function goToGenerator(encoded) {
  try {
    const item = JSON.parse(decodeURIComponent(atob(encoded)));
    localStorage.setItem('viral_prefill', JSON.stringify(item));
    window.location.href = '/app.html';
  } catch { /* ignore */ }
}

// ===== UTILS =====
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast toast-${type} show`;
  setTimeout(() => t.className = 'toast', 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  await initAuth?.();
  await loadProfile();
  loadHistory();
});
