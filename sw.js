/* ═══════════════════════════════════════════════════
   v6.1.4 (2026-11-12) — html2canvas 1.4.1 머리 태그 SRI(integrity sha384 · crossorigin) · 공통 인쇄 원본 MM-PRINT v1.0 → v1.1(지연 로더도 SRI)(정밀검토 B8 · html2canvas SRI) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-87 · 캐시명 v6.1.4 (종전 v6.1.3)
   v6.1.3 (2026-11-12) — Pretendard CSS SRI(integrity · crossorigin)(정밀검토 C2) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-82 · 캐시명 v6.1.3 (종전 v6.1.2)
   v6.1.2 (2026-11-12) — 환탕 30 W/m · Δt 5℃ 근거를 「MANMIN 참고값」 → KDS 31 30 20 : 2026 4.1.2(2)로 바로잡음(정밀검토 B12) — 계산 값 불변 · 작업지시서 §25-6-81 · 판 6.1 · 캐시명 v6.1.2 (종전 v6.1.1)
   v6.1.1 (2026-11-12) — 건물개요 공통 원본 MM-PROJECT v1.2 → v1.3(불러오기 창 표 칸 모양 고정 — 도구 CSS 가 새지 않음 · 저장값 같음, 정밀검토 C10) · 작업지시서 §25-6-80 · 판 6.1 · 캐시명 v6.1.1 (종전 v6.1.0)
   v6.1.0 (2026-11-12) — 건물개요 공통 원본 MM-PROJECT v1.2 새로 넣음(사업명 · 작성자(「사용방법」 창 프로젝트 정보 탭 — 화면 머리 표시는 「적용하기」 뒤 갱신) · 정밀검토 B6 · 작업지시서 §25-6-77) · 판 6.1 · 캐시명 v6.1.0 (종전 pump-v5.0.12)
   S6 회차 2026-09-05 — R24①② 표 선 separate·mono 한글 폴백 소급 동반 캐시명 v5.1.6
   S3-0 회차 2026-09-04 — R27 html2canvas 클론 정화 동반 캐시명 v5.1.5
   S2 회차 2026-09-04 — index 소급(R1·R21·R26 등) 동반 캐시명 v5.1.4
   R25 회차 2026-09-04 — 자기 접두어 캐시 조회 · cors 프리캐시 · opaque 가드 · 캐시명 v5.1.3 (S10)
   설비펌프 용량 자동선정 시스템  MANMIN Ver-6.1
   Service Worker — 오프라인 캐시 + 버전 업데이트
   ENGINEER KIM MANMIN

   v5.0.0 (2026-09-01)
   ───────────────────────────────────────────────────
   [변경] 문서(HTML)까지 Cache-first 로 처리하던 구조를 고쳤다.
          그 상태에서는 index.html 을 수정·배포해도 캐시명을 올리기 전에는
          사용자 화면에 영구히 반영되지 않는다(§11-2 ①②).
   ⛔ navigate 분기를 제거하지 말 것. 제거하면 배포가 화면에 반영되지 않는다.
   [변경] 캐시 삭제 범위를 자기 접두어(PREFIX)로 한정했다.
          caches.keys() 는 origin 전체를 반환해, 종전 `k !== CACHE` 필터는
          같은 origin 의 나머지 38종 캐시를 전부 지웠다.
   ⛔ cache.addAll 은 원자적이다. 목록 중 하나라도 404 면 설치가 통째로 실패해
      SW 가 아예 안 붙는다 → allSettled + 개별 catch 로 감쌌다(§11-3).
═══════════════════════════════════════════════════ */
const PREFIX = 'pump-';
/* ═ R25 (2026-09-04) — SW 캐시 origin 오염 차단 (S10 · 지시서 §21-1 R25)
   전역 caches 의 match 는 origin 전체를 검색한다. manminkim-eng.github.io 는 34종이 한 origin 이라
   다른 도구 캐시의 opaque 응답이 <script crossorigin>(cors) 요청에 돌아가 스크립트가 폐기됐다
   (30 #root 빈 화면 · 40 html2canvas undefined). 자기 접두어 캐시만 조회하고, cross-origin
   프리캐시는 cors 로 받으며, opaque↔cors 불일치 시 캐시를 쓰지 않는다. */
const MM_EXCLUDE = [];   /* 내 접두어로 시작하지만 남의 캐시인 이름 (§17-1 충돌) */
const mmOwn   = (k) => k.indexOf(PREFIX) === 0 && !MM_EXCLUDE.some((x) => k.indexOf(x) === 0);
const mmReq   = (u) => (typeof u === 'string' && u.indexOf('http') === 0) ? new Request(u, { mode: 'cors' }) : u;
const mmMatch = (req, opt) => caches.keys()
  .then((ks) => ks.filter(mmOwn))
  .then((ks) => ks.reduce((p, k) => p.then((r) => r || caches.open(k).then((c) => c.match(req, opt))), Promise.resolve(undefined)))
  .then((r) => (r && r.type === 'opaque' && req && req.mode === 'cors') ? undefined : r);

const CACHE = 'pump-v6.1.4';   /* 2026-11-08 매뉴얼 화면 이미지 23장 최신 화면으로 교체(§25-6-44) (종전 v5.0.11) */
//   /* 2026-10-14 v5.0.3 여유율 문구 · 지역 강우량 · 대수제어 */
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/brand-icon.jpg',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './icons/icon-32x32.png',
  './icons/icon-16x16.png',
  /* v5.0 — 로컬 폴백 폰트. CDN 차단·오프라인 시 한글 깨짐 방지 (§3-7 · §14-4) */
  './assets/fonts/manmin-fonts.css',
  './assets/fonts/NotoSansKR-var.woff2',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', e => {
  console.log('[SW] Install:', CACHE);
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(
        ASSETS.map(u => c.add(mmReq(u)).catch(err => console.warn('[SW] precache skip:', u, err)))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  console.log('[SW] Activate:', CACHE);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        /* ⛔ 자기 접두어만 지운다. caches.keys() 는 origin 전체를 반환하므로
           manminkim-eng.github.io 를 39종이 공유하는 이 구조에서 무조건 지우면
           나머지 38종의 캐시를 통째로 날린다. */
        keys.filter(k => k !== CACHE && mmOwn(k))
            .map(k => { console.log('[SW] 구버전 캐시 삭제:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  /* ══ ⛔ 핵심 ══ HTML 문서는 Network-first.
     네트워크가 되면 항상 최신을 보여주고, 끊겼을 때만 캐시로 떨어진다. */
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => mmMatch(e.request).then(c => c || mmMatch('./index.html')))
    );
    return;
  }

  /* ══ 정적 자산: Cache-First + 백그라운드 갱신 ══ */
  e.respondWith(
    mmMatch(e.request).then(cached => {
      if (cached) {
        fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => Response.error());   /* R19 (2026-09-04): 정적 자산 실패 시 index.html 을 돌려주면 SyntaxError 빈 화면 (§20-10) */
    })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'GET_VERSION' && e.ports[0]) {
    e.ports[0].postMessage({ version: CACHE });
  }
});

console.log('[SW] loaded:', CACHE);
