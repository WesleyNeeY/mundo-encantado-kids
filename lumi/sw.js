const CACHE = 'lumi-v43';
const ASSETS = ['./', 'index.html', 'lumi3d.js', 'vendor/three.module.min.js', 'vendor/RoomEnvironment.js', 'data.js', 'lines.js', 'stories.js', 'scenes.js', 'app.js', 'fx.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url), own = url.origin === location.origin, nav = e.request.mode === 'navigate';
  // páginas e código sempre conferidos no servidor (pega versão nova na hora); áudios e imagens seguem o cache normal
  const fresh = own && (nav || url.pathname.endsWith('/') || /\.(?:html|js|css|json|webmanifest)$/.test(url.pathname));
  const req = !fresh ? e.request : nav ? new Request(url.href, { cache: 'no-cache', credentials: 'same-origin' }) : new Request(e.request, { cache: 'no-cache' });
  e.respondWith(fetch(req).then((r) => {
    if (nav && r.redirected) r = new Response(r.body, { status: r.status, statusText: r.statusText, headers: r.headers }); // Safari não aceita página redirecionada vinda do service worker
    const copy = r.clone(); if (r.ok && own) caches.open(CACHE).then((c) => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request)));
});
