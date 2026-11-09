/*
 * Service worker for artikel: keeps every file of the site in a cache so the
 * game works offline after the first visit.
 *
 * The worker answers from the cache and refreshes that copy in the background,
 * so a visit can end with some files refreshed and others not. Bump VERSION
 * with every release that changes a file: the new worker then fetches the
 * whole list at once and all files switch together on the next visit.
 */
var VERSION = "v4";
var CACHE = "artikel-" + VERSION;
var FILES = [
  "./",
  "index.html",
  "tokens.css",
  "style.css",
  "words.js",
  "rules.js",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-32.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "fonts/Archivo-400.woff2",
  "fonts/Archivo-500.woff2",
  "fonts/Archivo-600.woff2",
  "fonts/Archivo-700.woff2",
  "fonts/JetBrainsMono-400.woff2",
  "fonts/JetBrainsMono-500.woff2",
  "fonts/Vazirmatn-Regular.woff2",
  "fonts/Vazirmatn-Medium.woff2",
  "fonts/Vazirmatn-SemiBold.woff2"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Past the HTTP cache: GitHub Pages lets browsers keep files for 10
      // minutes, which could put an old file into the new cache.
      return cache.addAll(FILES.map(function (file) {
        return new Request(file, { cache: "reload" });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf("artikel-") === 0 && key !== CACHE) return caches.delete(key);
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // One copy per file, so a link with a query string adds nothing to the cache.
  var key = req.url.split("#")[0].split("?")[0];

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(key).then(function (cached) {
        var fresh = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(key, res.clone());
          return res;
        }).catch(function () {
          // Offline: a page request falls back to the cached game.
          return cached || (req.mode === "navigate" ? cache.match("index.html") : Response.error());
        });
        if (cached) {
          event.waitUntil(fresh.catch(function () {}));
          return cached;
        }
        return fresh;
      });
    })
  );
});
