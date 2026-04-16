// ===== ÉTAT AUTH =====
const AUTH_KEY = 'viral_auth';

function getAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}
function saveAuth(data) { localStorage.setItem(AUTH_KEY, JSON.stringify(data)); }
function clearAuth() { localStorage.removeItem(AUTH_KEY); }

function getToken() { return getAuth()?.token || null; }
window.getToken = getToken;

// ===== NAVBAR =====
function updateNavbar(user) {
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const navEmail = document.getElementById('navUserEmail');
  const navPremium = document.getElementById('navPremiumBadge');

  if (user) {
    if (navAuth) navAuth.style.display = 'none';
    if (navUser) navUser.style.display = 'flex';
    if (navEmail) navEmail.textContent = user.email.split('@')[0];
    if (navPremium) navPremium.style.display = user.isPremium ? 'inline-flex' : 'none';
  } else {
    if (navAuth) navAuth.style.display = 'flex';
    if (navUser) navUser.style.display = 'none';
  }
}

// ===== INIT =====
async function initAuth() {
  const auth = getAuth();
  if (!auth?.token) { updateNavbar(null); return null; }

  try {
    const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${auth.token}` } });
    if (!res.ok) { clearAuth(); updateNavbar(null); return null; }
    const user = await res.json();
    saveAuth({ ...auth, user });
    updateNavbar(user);
    return user;
  } catch {
    updateNavbar(auth.user || null);
    return auth.user || null;
  }
}

// ===== INJECTION MODAL =====
function injectAuthModal() {
  if (document.getElementById('authModal')) return;
  const html = `
  <div class="auth-overlay" id="authModal">
    <div class="auth-card">
      <button class="auth-close" onclick="closeAuthModal()">✕</button>
      <div class="auth-logo">Viral</div>
      <div class="auth-tabs">
        <button class="auth-tab active" id="tabLogin" onclick="switchAuthTab('login')">Connexion</button>
        <button class="auth-tab" id="tabRegister" onclick="switchAuthTab('register')">Inscription</button>
      </div>

      <form id="loginForm" class="auth-form">
        <div class="auth-field">
          <label>Email</label>
          <input type="email" id="loginEmail" placeholder="vous@exemple.com" autocomplete="email" required />
        </div>
        <div class="auth-field">
          <label>Mot de passe</label>
          <input type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password" required />
        </div>
        <p class="auth-error" id="loginError"></p>
        <button type="submit" class="btn btn-primary auth-submit" id="loginBtn">Se connecter</button>
        <p class="auth-switch">Pas de compte ? <span onclick="switchAuthTab('register')">S'inscrire</span></p>
      </form>

      <form id="registerForm" class="auth-form" style="display:none">
        <div class="auth-field">
          <label>Email</label>
          <input type="email" id="registerEmail" placeholder="vous@exemple.com" autocomplete="email" required />
        </div>
        <div class="auth-field">
          <label>Mot de passe</label>
          <input type="password" id="registerPassword" placeholder="6 caractères minimum" autocomplete="new-password" required minlength="6" />
        </div>
        <p class="auth-error" id="registerError"></p>
        <button type="submit" class="btn btn-primary auth-submit" id="registerBtn">Créer mon compte</button>
        <p class="auth-switch">Déjà un compte ? <span onclick="switchAuthTab('login')">Se connecter</span></p>
      </form>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('authModal').addEventListener('click', e => {
    if (e.target.id === 'authModal') closeAuthModal();
  });

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// ===== MODAL CONTROLS =====
function openAuthModal(tab = 'login') {
  injectAuthModal();
  document.getElementById('authModal').classList.add('open');
  switchAuthTab(tab);
}
function closeAuthModal() {
  document.getElementById('authModal')?.classList.remove('open');
}
function switchAuthTab(tab) {
  injectAuthModal();
  document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
}

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;

// ===== LOGIN =====
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  btn.disabled = true; btn.textContent = 'Connexion...';
  errEl.textContent = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; return; }

    saveAuth({ token: data.token, user: data.user });
    updateNavbar(data.user);
    closeAuthModal();
    removePageGuard();
    window._authPendingAction?.();
    window._authPendingAction = null;
  } catch {
    errEl.textContent = 'Connexion impossible. Réessayez.';
  } finally {
    btn.disabled = false; btn.textContent = 'Se connecter';
  }
}

// ===== REGISTER =====
async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const errEl = document.getElementById('registerError');
  const btn = document.getElementById('registerBtn');

  btn.disabled = true; btn.textContent = 'Création...';
  errEl.textContent = '';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; return; }

    saveAuth({ token: data.token, user: data.user });
    updateNavbar(data.user);
    closeAuthModal();
    removePageGuard();
    window._authPendingAction?.();
    window._authPendingAction = null;
  } catch {
    errEl.textContent = 'Erreur lors de la création. Réessayez.';
  } finally {
    btn.disabled = false; btn.textContent = 'Créer mon compte';
  }
}

// ===== LOGOUT =====
function authLogout() {
  clearAuth();
  updateNavbar(null);
  window.location.href = '/';
}
window.authLogout = authLogout;

// ===== PAGE GUARD (overlay pages protégées) =====
function showPageGuard() {
  if (document.getElementById('pageGuard')) return;
  const div = document.createElement('div');
  div.id = 'pageGuard';
  div.className = 'page-guard';
  div.innerHTML = `
    <h2>Connectez-vous pour continuer</h2>
    <p>Créez un compte gratuit pour accéder au générateur de contenu et à l'analyse IA.</p>
    <div class="page-guard-actions">
      <button class="btn btn-primary" onclick="openAuthModal('register')">Créer un compte gratuit</button>
      <button class="btn btn-secondary" onclick="openAuthModal('login')">Se connecter</button>
    </div>`;
  document.body.appendChild(div);
}

function removePageGuard() {
  document.getElementById('pageGuard')?.remove();
}

window.showPageGuard = showPageGuard;
window.removePageGuard = removePageGuard;

// ===== STRIPE — succès paiement =====
function checkPremiumSuccess() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('premium') === 'success') {
    const auth = getAuth();
    if (auth?.user) {
      auth.user.isPremium = true;
      saveAuth(auth);
      updateNavbar(auth.user);
    }
    history.replaceState({}, '', window.location.pathname);
    setTimeout(() => {
      const t = document.getElementById('toast');
      if (t) { t.textContent = '✦ Vous êtes maintenant Premium !'; t.className = 'toast success show'; setTimeout(() => t.classList.remove('show'), 4000); }
    }, 500);
  }
}

// ===== AUTO-INIT =====
initAuth().then(user => {
  checkPremiumSuccess();
  // Déclencher l'event pour que les pages protégées puissent réagir
  window.dispatchEvent(new CustomEvent('authReady', { detail: { user } }));
});
