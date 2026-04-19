// ===== DASHBOARD =====

async function loadProfile() {
  const token = window.getToken?.();

  if (!token) {
    renderLocalProfile();
    return;
  }

  try {
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) { renderLocalProfile(); return; }
    const data = await res.json();
    renderProfile(data);
  } catch {
    renderLocalProfile();
  }
}

// Vue locale — pas de connexion ni de base de données nécessaire
function renderLocalProfile() {
  const history = JSON.parse(localStorage.getItem('viral_historique') || '[]');
  const usage = JSON.parse(localStorage.getItem('viral_usage') || '{}');
  const today = new Date().toISOString().split('T')[0];
  const remaining = usage.date === today ? (usage.remaining ?? 3) : 3;
  const usedToday = Math.max(0, 3 - remaining);

  const avatar = document.getElementById('dashAvatar');
  if (avatar) avatar.textContent = '?';

  const emailEl = document.getElementById('dashEmail');
  if (emailEl) emailEl.textContent = 'Mon espace';

  const badges = document.getElementById('dashBadges');
  if (badges) badges.innerHTML = '<span class="badge-free">Plan Gratuit</span>';

  const upgradeBtn = document.getElementById('upgradeBtnHeader');
  if (upgradeBtn) upgradeBtn.style.display = 'inline-flex';

  setText('statUsed', usedToday);
  setText('statRemaining', remaining);
  setText('statTotal', history.length);
  setText('statMember', '—');

  renderPremiumStatus({ isPremium: false });
}

function renderProfile(data) {
  const avatar = document.getElementById('dashAvatar');
  if (avatar) avatar.textContent = (data.email || '?')[0].toUpperCase();

  const emailEl = document.getElementById('dashEmail');
  if (emailEl) emailEl.textContent = data.email || '—';

  const badges = document.getElementById('dashBadges');
  if (badges) {
    badges.innerHTML = data.isPremium
      ? '<span class="badge-premium">✦ Premium</span>'
      : '<span class="badge-free">Gratuit</span>';
  }

  const upgradeBtn = document.getElementById('upgradeBtnHeader');
  if (upgradeBtn) upgradeBtn.style.display = data.isPremium ? 'none' : 'inline-flex';

  setText('statUsed', data.usedToday ?? '—');
  setText('statRemaining', data.isPremium ? '∞' : (data.remainingToday ?? '—'));
  setText('statTotal', data.totalGenerations ?? '—');
  setText('statMember', data.memberSince ? formatDate(data.memberSince) : '—');

  renderPremiumStatus(data);
}

function renderPremiumStatus(data) {
  const el = document.getElementById('premiumStatus');
  if (!el) return;

  if (data.isPremium) {
    const until = data.premiumUntil
      ? new Date(data.premiumUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : null;
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
        <p class="hint">3 générations par jour. Passez Premium pour en créer autant que vous voulez.</p>
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
  if (!token) { showToast('Connectez-vous pour changer votre mot de passe.', 'error'); return; }

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
    container.innerHTML = '<div class="history-empty">Aucune génération pour l\'instant.<br>Utilisez le générateur pour créer votre premier contenu.</div>';
    return;
  }

  container.innerHTML = `<div class="history-list">${history.slice(0, 10).map(item => `
    <div class="history-item" onclick="goToGenerator('${encodeHistoryItem(item)}')">
      <div class="history-meta">
        <span class="history-platform">${escHtml(item.plateforme || '')}</span>
        <span class="history-date">${item.date || ''}</span>
      </div>
      <div class="history-hook">${escHtml(item.hook || item.theme || '(sans titre)')}</div>
      <div class="history-theme">${escHtml(item.theme || '')}</div>
    </div>`).join('')}
  </div>`;
}

function encodeHistoryItem(item) {
  return btoa(encodeURIComponent(JSON.stringify(item)));
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
document.addEventListener('DOMContentLoaded', async () => {
  await initAuth?.();
  await loadProfile();
  loadHistory();
});
