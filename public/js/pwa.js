// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Bannière hors ligne
const offlineBanner = document.getElementById('offlineBanner');

function updateOnlineStatus() {
  if (offlineBanner) {
    offlineBanner.classList.toggle('visible', !navigator.onLine);
  }
  // Désactiver les formulaires si hors ligne
  document.querySelectorAll('.generate-btn, .analyze-btn').forEach(btn => {
    if (!navigator.onLine) {
      btn.title = 'Connexion requise';
    }
  });
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
