const SW_VERSION = "2.1.0";
const SHELL_CACHE = `lighthouse-shell-${SW_VERSION}`;
const RUNTIME_CACHE = `lighthouse-runtime-${SW_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json?v=2.1.0",
  "./app-icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const valid = new Set([SHELL_CACHE, RUNTIME_CACHE]);
    await Promise.all(keys.filter(key => !valid.has(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const reqUrl = new URL(event.request.url);
  if (reqUrl.origin !== self.location.origin) return;
  const scopePath = new URL(self.registration.scope).pathname.replace(/\/+$/, "");
  const reqPath = reqUrl.pathname.replace(/\/+$/, "");
  const isNavigate = event.request.mode === "navigate";
  const isRootRequest = reqPath === scopePath || reqPath === "";
  const isIndexRequest = reqPath.endsWith("/index.html") || isRootRequest;
  const isCriticalShell = isIndexRequest || reqPath.endsWith("/manifest.json");

  if (isNavigate || isCriticalShell) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh && fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request) || await caches.match(request);
    if (cached) return cached;
    return caches.match("./index.html");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request) || await caches.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || networkPromise;
}
