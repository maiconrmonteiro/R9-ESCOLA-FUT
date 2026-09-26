self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

// Apenas um fetch event vazio para satisfazer os requisitos do PWA no Chrome Android
self.addEventListener('fetch', (e) => {});
