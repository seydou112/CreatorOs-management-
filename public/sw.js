const CACHE_NAME = 'viral-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/blog.html',
  '/blog-post.html',
  '/analyze.html',
  '/manifest.json',
  '/css/style.css',
  '/css/home.css',
  '/css/app.css',
  '/css/blog.css',
  '/css/analyze.css',
  '/js/home.js',
  '/js/app.js',
  '/js/blog.js',
  '/js/analyze.js',
  '/js/pwa.js'
];

// Installation : mise en cache des fichiers statiques
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : stratégie selon le type de requête
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API : Network First (pas de cache des réponses API)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Vous êtes hors ligne.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Fichiers statiques : Cache First
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
