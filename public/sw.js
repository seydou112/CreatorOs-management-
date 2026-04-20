const CACHE_NAME = 'viral-v7';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/blog.html',
  '/blog-post.html',
  '/analyze.html',
  '/library.html',
  '/trends.html',
  '/dashboard.html',
  '/manifest.json',
  '/css/style.css',
  '/css/home.css',
  '/css/app.css',
  '/css/blog.css',
  '/css/analyze.css',
  '/css/auth.css',
  '/css/library.css',
  '/css/trends.css',
  '/css/dashboard.css',
  '/js/home.js',
  '/js/app.js',
  '/js/blog.js',
  '/js/analyze.js',
  '/js/auth.js',
  '/js/pwa.js',
  '/js/library.js',
  '/js/trends.js',
  '/js/dashboard.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

// ===== INSTALLATION =====
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ===== ACTIVATION =====
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ===== FETCH — Network First pour tout sauf images =====
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API : Network First — erreur hors ligne générique
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

  // Images : Cache First (changent rarement)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // HTML + CSS + JS : Network First → cache en fallback hors ligne
  // Garantit que les déploiements sont visibles immédiatement sans rien bumper
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200 && e.request.method === 'GET') {
          caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
        }
        return response;
      })
      .catch(() =>
        caches.match(e.request).then(cached => cached || caches.match('/index.html'))
      )
  );
});

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (e) => {
  let data = { title: 'Viral', body: 'Nouvelle astuce virale disponible !', url: '/blog.html' };
  try { data = { ...data, ...e.data?.json() }; } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-maskable-512.png',
      vibrate: [100, 50, 100],
      tag: 'viral-notification',
      renotify: true,
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'dismiss', title: 'Ignorer' }
      ]
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const target = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus().then(c => c.navigate(target));
      return clients.openWindow(target);
    })
  );
});

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-library') {
    e.waitUntil(syncPendingData());
  }
  if (e.tag === 'sync-analytics') {
    e.waitUntil(syncAnalytics());
  }
});

async function syncPendingData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.add('/api/widget/data');
  } catch {}
}

async function syncAnalytics() {
  return Promise.resolve();
}

// ===== PERIODIC BACKGROUND SYNC =====
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'update-blog') {
    e.waitUntil(refreshBlogCache());
  }
  if (e.tag === 'update-widget') {
    e.waitUntil(refreshWidgetData());
  }
});

async function refreshBlogCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch('/api/blog');
    if (response.ok) await cache.put('/api/blog', response);
  } catch {}
}

async function refreshWidgetData() {
  try {
    const response = await fetch('/api/widget/data');
    if (!response.ok) return;
    const clients = await self.clients.matchAll();
    clients.forEach(client => client.postMessage({ type: 'widget-update' }));
  } catch {}
}

// ===== WIDGET EVENTS (Windows 11) =====
self.addEventListener('widgetclick', (e) => {
  const { action, widget } = e;
  if (action === 'activate' || !action) {
    e.waitUntil(clients.openWindow('/app.html?source=widget'));
  }
});

self.addEventListener('widgetinstall', (e) => {
  e.waitUntil(updateWidget(e.widget));
});

self.addEventListener('widgetuninstall', () => {});

self.addEventListener('widgetresume', (e) => {
  e.waitUntil(updateWidget(e.widget));
});

async function updateWidget(widget) {
  try {
    const data = await fetch('/api/widget/data').then(r => r.json());
    await self.registration.widgets?.updateByTag('viral-generator', { data });
  } catch {}
}

// ===== MESSAGE HANDLER =====
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'CACHE_URLS') {
    e.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(e.data.urls || []))
    );
  }
});
