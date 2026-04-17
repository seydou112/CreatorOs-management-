// ===== ENREGISTREMENT DU SERVICE WORKER =====
let _swRegistration = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      _swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      // Écouter les mises à jour du SW
      _swRegistration.addEventListener('updatefound', () => {
        const newWorker = _swRegistration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });

      // Écouter les messages du SW
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data?.type === 'widget-update') refreshWidgetIfVisible();
      });

    } catch (err) {
      console.warn('Service Worker non enregistré :', err.message);
    }
  });
}

// ===== BANNIÈRE MISE À JOUR =====
function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.style.cssText = `
    position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%);
    background:#0d0d15; border:1px solid rgba(124,58,237,0.5);
    border-radius:12px; padding:0.85rem 1.25rem; z-index:9999;
    display:flex; gap:1rem; align-items:center; box-shadow:0 8px 32px rgba(0,0,0,0.5);
    font-family:inherit; font-size:0.88rem; color:#f1f5f9;
  `;
  banner.innerHTML = `
    <span>✦ Nouvelle version disponible</span>
    <button onclick="applyUpdate()" style="
      background:#7c3aed; border:none; border-radius:8px; color:#fff;
      padding:0.35rem 0.85rem; font-size:0.82rem; font-weight:700;
      cursor:pointer; font-family:inherit;
    ">Mettre à jour</button>
    <button onclick="this.parentElement.remove()" style="
      background:transparent; border:none; color:#94a3b8;
      cursor:pointer; font-size:1.1rem; padding:0 0.25rem;
    ">✕</button>
  `;
  document.body.appendChild(banner);
}

window.applyUpdate = () => {
  _swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
};

// ===== NOTIFICATIONS PUSH =====
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

async function subscribeToPush() {
  if (!_swRegistration || !('PushManager' in window)) return null;
  try {
    const existing = await _swRegistration.pushManager.getSubscription();
    if (existing) return existing;

    const sub = await _swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    return sub;
  } catch { return null; }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

window.requestPushPermission = async () => {
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    await subscribeToPush();
    return true;
  }
  return false;
};

// ===== BACKGROUND SYNC =====
window.registerBackgroundSync = async (tag = 'sync-library') => {
  if (!_swRegistration || !('SyncManager' in window)) return false;
  try {
    await _swRegistration.sync.register(tag);
    return true;
  } catch { return false; }
};

// ===== PERIODIC BACKGROUND SYNC =====
async function registerPeriodicSync() {
  if (!_swRegistration || !('periodicSync' in _swRegistration)) return;
  try {
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (status.state !== 'granted') return;
    await _swRegistration.periodicSync.register('update-blog', { minInterval: 24 * 60 * 60 * 1000 });
    await _swRegistration.periodicSync.register('update-widget', { minInterval: 60 * 60 * 1000 });
  } catch {}
}

// Lancer periodic sync après enregistrement du SW
navigator.serviceWorker?.ready.then(reg => {
  _swRegistration = _swRegistration || reg;
  registerPeriodicSync();
});

// ===== WIDGET REFRESH =====
function refreshWidgetIfVisible() {
  if (document.visibilityState === 'visible') {
    window.dispatchEvent(new CustomEvent('widget-refresh'));
  }
}

// ===== HORS LIGNE =====
const offlineBanner = document.getElementById('offlineBanner');

function updateOnlineStatus() {
  if (offlineBanner) offlineBanner.classList.toggle('visible', !navigator.onLine);
  document.querySelectorAll('.generate-btn, .analyze-btn').forEach(btn => {
    btn.title = navigator.onLine ? '' : 'Connexion requise';
  });
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
