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
  e.respondWith(fetch(e.request).catch(() =>
    caches.open(NOTICE).then(c => c.match('./')).then(hit => hit || Response.error())));
});
