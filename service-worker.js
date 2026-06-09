/*
 * Service worker for Mathe-Schatzreise.
 * Implements an offline-first cache so the game works without a network
 * connection after the first successful load. No tracking, no external calls.
 */

// Bump this version whenever cached assets change to invalidate old caches.
const CACHE_VERSION = "mathe-schatzreise-v2";

// All files required for the app to run fully offline.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/favicon.svg",
];

// Pre-cache the app shell during installation.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// Remove outdated caches when a new service worker activates.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Cache-first strategy with a network fallback that also refreshes the cache.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests; ignore everything else (there is no backend).
  if (request.method !== "GET") {
    return;
  }

  // Never try to handle cross-origin requests (there are none by design).
  if (new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          // Cache successful same-origin responses for future offline use.
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const copy = response.clone();
            caches
              .open(CACHE_VERSION)
              .then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // When offline and the document is requested, serve the app shell.
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return undefined;
        });
    }),
  );
});
