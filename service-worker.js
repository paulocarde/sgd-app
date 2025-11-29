const CACHE_NAME = 'sgd-v5'; // IMPORTANTE: Cambia el número aquí
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/automata.js',
  './js/tts.js',
  './js/ui.js',
  './js/app.js',
  './data/automata.json',
  './manifest.json'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});