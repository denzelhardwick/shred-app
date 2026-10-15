/* Shred PWA service worker: offline-first cache */
const VERSION = 'shred-v3';
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "data.js",
  "manifest.json",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "assets/demos/cable-high-to-low.gif",
  "assets/demos/cable-low-to-high.gif",
  "assets/demos/cable-seated-row.jpg",
  "assets/demos/cable-tricep-ext.gif",
  "assets/demos/cable-wide-grip-row.gif",
  "assets/demos/calf-raises.gif",
  "assets/demos/chest-press-machine.gif",
  "assets/demos/chest-supported-row.gif",
  "assets/demos/close-grip-bench.gif",
  "assets/demos/crossbody-situps.gif",
  "assets/demos/db-incline-curls.gif",
  "assets/demos/db-incline-press-b.gif",
  "assets/demos/db-incline-press.jpg",
  "assets/demos/db-shoulder-press.gif",
  "assets/demos/hack-squat-b.gif",
  "assets/demos/hack-squat.gif",
  "assets/demos/hammer-curls.jpg",
  "assets/demos/hamstring-curls.jpg",
  "assets/demos/lat-pulldown.gif",
  "assets/demos/lat-pushdowns.jpg",
  "assets/demos/lateral-raises.gif",
  "assets/demos/leg-extensions.jpg",
  "assets/demos/leg-press-a.gif",
  "assets/demos/leg-press-b.gif",
  "assets/demos/leg-raises.gif",
  "assets/demos/med-ball-twist.jpg",
  "assets/demos/neutral-grip-pullups.jpg",
  "assets/demos/pec-deck-fly.jpg",
  "assets/demos/push-ups.gif",
  "assets/demos/rdl.gif",
  "assets/demos/rear-delt-fly.gif",
  "assets/demos/rope-cable-curls.gif",
  "assets/demos/single-arm-cable-pulldown.gif",
  "assets/demos/single-arm-row.gif",
  "assets/demos/sit-ups.gif",
  "assets/demos/smith-bent-row.gif",
  "assets/demos/smith-incline-press.jpg",
  "assets/demos/squats.gif",
  "assets/demos/tricep-ext.gif"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Network-first for the app shell (picks up updates), cache-first for images.
  const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(new URL(req.url).pathname);
  if (isImg) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return res; })));
  } else {
    e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
  }
});
