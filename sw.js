// Шпаргалка оператора: офлайн-кеш. Версия меняется при каждом обновлении файлов.
const CACHE = 'dp-cheatsheet-073d34a8';
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "fonts/fira-sans-extra-condensed-cyrillic-400-normal.woff2", "fonts/fira-sans-extra-condensed-cyrillic-500-normal.woff2", "fonts/fira-sans-extra-condensed-cyrillic-600-normal.woff2", "fonts/fira-sans-extra-condensed-latin-400-normal.woff2", "fonts/fira-sans-extra-condensed-latin-500-normal.woff2", "fonts/fira-sans-extra-condensed-latin-600-normal.woff2", "fonts/golos-text-cyrillic-400-normal.woff2", "fonts/golos-text-cyrillic-500-normal.woff2", "fonts/golos-text-cyrillic-600-normal.woff2", "fonts/golos-text-latin-400-normal.woff2", "fonts/golos-text-latin-500-normal.woff2", "fonts/golos-text-latin-600-normal.woff2"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Страница: сначала сеть (чтобы подтянуть обновление), без сети — из кеша.
  if (e.request.mode === 'navigate') {
    const net = fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); } return r; });
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000));
    e.respondWith(Promise.race([net, timeout]).catch(() => caches.match('index.html').then(r => r || net)));
    return;
  }
  // Шрифты, иконки: из кеша, если нет — из сети.
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
