/* ═══════════════════════════════════════════════════════════════
   설비펌프 용량 자동선정 시스템 — Service Worker
   MANMIN-Ver2.0 | Cache-First + Network Fallback 전략
   ════════════════════════════════════════════════════════════════ */

const CACHE_NAME    = 'pump-calc-v2.0.1';
const STATIC_CACHE  = 'pump-static-v2.0.1';
const CDN_CACHE     = 'pump-cdn-v2.0.1';

/* ── 앱 셸 (로컬) — 반드시 캐시 ── */
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-maskable-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
];

/* ── CDN 리소스 — 네트워크 우선, 실패 시 캐시 ── */
const CDN_URLS = [
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
];

/* ══ INSTALL ══ */
self.addEventListener('install', function(e) {
  e.waitUntil(
    Promise.all([
      /* 앱 셸 캐시 */
      caches.open(STATIC_CACHE).then(function(cache) {
        return cache.addAll(APP_SHELL.map(function(url) {
          return new Request(url, { cache: 'reload' });
        })).catch(function(err) {
          console.warn('[SW] 앱 셸 일부 캐시 실패:', err);
        });
      }),
      /* CDN 캐시 (실패해도 설치 진행) */
      caches.open(CDN_CACHE).then(function(cache) {
        return Promise.allSettled(CDN_URLS.map(function(url) {
          return cache.add(new Request(url, { mode: 'cors', cache: 'no-cache' }));
        }));
      })
    ]).then(function() {
      console.log('[SW] ✅ 설치 완료 — 캐시 구성 완료');
      return self.skipWaiting();
    })
  );
});

/* ══ ACTIVATE ══ */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          /* 현재 버전이 아닌 캐시 삭제 */
          return key !== STATIC_CACHE && key !== CDN_CACHE && key !== CACHE_NAME;
        }).map(function(key) {
          console.log('[SW] 🗑️ 구 캐시 삭제:', key);
          return caches.delete(key);
        })
      );
    }).then(function() {
      console.log('[SW] ✅ 활성화 완료 — 모든 클라이언트 제어');
      return self.clients.claim();
    })
  );
});

/* ══ FETCH ══ */
self.addEventListener('fetch', function(e) {
  var req = e.request;
  var url = new URL(req.url);

  /* POST 등 GET 이외는 처리하지 않음 */
  if (req.method !== 'GET') return;

  /* ─ CDN 리소스: 캐시 우선 → 네트워크 폴백 ─ */
  if (url.origin !== location.origin) {
    e.respondWith(
      caches.open(CDN_CACHE).then(function(cache) {
        return cache.match(req).then(function(cached) {
          if (cached) return cached;
          return fetch(req.clone(), { mode: 'cors' }).then(function(res) {
            if (res && res.status === 200) {
              cache.put(req, res.clone());
            }
            return res;
          }).catch(function() {
            /* CDN 오프라인: 빈 응답 반환 */
            return new Response('', { status: 503, statusText: 'CDN Offline' });
          });
        });
      })
    );
    return;
  }

  /* ─ 앱 셸 (HTML): 네트워크 우선 → 캐시 폴백 ─ */
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(req).then(function(res) {
        var clone = res.clone();
        caches.open(STATIC_CACHE).then(function(c) { c.put(req, clone); });
        return res;
      }).catch(function() {
        return caches.match('./index.html').then(function(cached) {
          return cached || caches.match('./');
        });
      })
    );
    return;
  }

  /* ─ 정적 자원: 캐시 우선 → 네트워크 → 오프라인 폴백 ─ */
  e.respondWith(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.match(req).then(function(cached) {
        var networkFetch = fetch(req).then(function(res) {
          if (res && res.status === 200) {
            cache.put(req, res.clone());
          }
          return res;
        }).catch(function() {
          /* 오프라인 폴백 */
          if (req.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
              '<rect width="64" height="64" fill="#dbeafe" rx="8"/>' +
              '<text x="32" y="36" text-anchor="middle" font-size="24">💧</text>' +
              '</svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('', { status: 503 });
        });
        return cached || networkFetch;
      });
    })
  );
});

/* ══ MESSAGE — SKIP_WAITING (업데이트 적용) ══ */
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('[SW] 🔄 업데이트 적용 — skipWaiting');
    self.skipWaiting();
  }
});

/* ══ BACKGROUND SYNC (지원 시) ══ */
self.addEventListener('sync', function(e) {
  if (e.tag === 'pump-data-sync') {
    console.log('[SW] 🔄 백그라운드 동기화 시작');
  }
});

/* ══ PUSH NOTIFICATION 준비 ══ */
self.addEventListener('push', function(e) {
  if (!e.data) return;
  var data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || '설비펌프 산정 시스템', {
      body: data.body || '새로운 업데이트가 있습니다.',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-96x96.png',
      tag: 'pump-notification',
      renotify: false,
    })
  );
});
