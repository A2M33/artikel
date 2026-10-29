/*
 * Service worker for artikel: keeps every file of the site in a cache so the
 * game works offline after the first visit.
 *
 * Bump VERSION whenever FILES changes. Files already in the list update on
 * their own: the worker answers from the cache and refreshes that copy from
 * the network in the background, so the next visit gets the new version.
 */
var VERSION = "v1";
var CACHE = "artikel-" + VERSION;
var FILES = [
  "./",
  "index.html",
  "style.css",
  "words.js",
  "rules.js",
  "app.js",
  "favicon.svg",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FILES);
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

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (cached) {
        var fresh = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(req, res.clone());
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
