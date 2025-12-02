const CACHE_NAME = 'pictogo-v1'; // Si haces cambios futuros, sube este número (v2, v3...)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './css/styles.css',
  './js/app.js',
  './js/automata.js',
  './js/ui.js',
  './js/tts.js',
  './data/automata.json'
];

// 1. INSTALACIÓN: Guardar archivos en la mochila
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza la instalación inmediata
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando archivos de PictoGo...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: Limpiar versiones viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim(); // Toma el control de la página inmediatamente
});

// 3. INTERCEPTOR: Servir desde la caché si no hay internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si está en caché, lo devolvemos (Modo Offline)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si no, lo pedimos a internet
      return fetch(event.request);
    })
  );
});