// Stockage en mémoire des compteurs d'utilisation
// Clé : IP utilisateur, Valeur : { count, resetAt }
const store = new Map();

// Nettoyage automatique des entrées expirées toutes les heures
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetAt + 48 * 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 60 * 60 * 1000);

export function get(key) {
  return store.get(key);
}

export function set(key, value) {
  store.set(key, value);
}

export function del(key) {
  store.delete(key);
}
