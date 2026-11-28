// 옛 주소(/naegi-hwan/)의 서비스 워커. 앱은 https://harley-hwan.github.io/bet-game/ 으로 옮겼다.
//  - 옛 앱의 워커를 이어받는다: 옛 페이지는 게임 중이 아닐 때 'skipWaiting'을 보낸다. 넘어가면 옛 페이지가 다시 읽고,
//    그때부터 페이지 이동은 네트워크의 이사 안내(index.html)를 받는다.
//  - 옛 앱의 캐시('naegi-…')는 지운다. 안내 화면 한 장만 'moved-notice'에 두고, 인터넷이 없을 때 그걸 보여 준다.
const NOTICE = 'moved-notice';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(NOTICE).then(c => c.add(new Request('./', { cache: 'no-cache' }))).catch(() => {}));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('naegi-')).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.mode !== 'navigate') return;
  // 인터넷이 될 때 받은 첫 화면으로 기억해 둔 안내를 새로 고친다 (문구가 바뀌어도 오프라인 안내가 옛 문구로 남지 않게).
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && new URL(e.request.url).pathname.replace(/index\.html$/, '') === new URL('./', self.registration.scope).pathname) {
      const copy = r.clone();
      caches.open(NOTICE).then(c => c.put('./', copy)).catch(() => {});
    }
    return r;
  }).catch(() =>
    caches.open(NOTICE).then(c => c.match('./')).then(hit => hit || Response.error())));
});
