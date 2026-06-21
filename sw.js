const CACHE_NAME = 'rittai-nmoku-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;600;900&family=Noto+Sans+JP:wght@300;400;500;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // --- Firebase など動的な通信はサービスワーカーを通さない ---
  // （オンライン対戦のリアルタイム同期をキャッシュで壊さないため）
  const BYPASS_HOSTS = [
    'firebasedatabase.app',
    'firebaseio.com',
    'firebase.googleapis.com',
    'firebaseinstallations.googleapis.com',
    'identitytoolkit.googleapis.com',
    'google-analytics.com',
    'analytics.google.com'
  ];
  if (BYPASS_HOSTS.some(h => url.hostname.includes(h))) {
    return; // 何もせずブラウザの通常通信に任せる
  }

  // --- ページ本体(HTML)はネットワーク優先 ---
  // 更新を即反映。オフライン時だけキャッシュを表示。
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }) // ブラウザの裏キャッシュも使わせず、必ず最新を取りに行く
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put('./index.html', copy))
            .catch(() => {});
          return response;
        })
        .catch(() =>
          caches.match('./index.html').then(c => c || caches.match('./'))
        )
    );
    return;
  }

  // --- それ以外（three.js / フォント / アイコン等）はキャッシュ優先 ---
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(req, copy))
          .catch(() => {});
        return response;
      });
    })
  );
});
