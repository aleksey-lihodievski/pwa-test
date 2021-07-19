/* eslint-disable no-restricted-globals */
const staticCacheName = "s-app-v1";
const dynamicCacheName = "d-app-v1";

const assetsUrl = ["./", "./index.html", "./manifest.json", "scripts/index.js", "styles/index.css", "images/maskable.png", "images/5.jpg"];

self.addEventListener("install", async (event) => {
  const cache = await caches.open(staticCacheName);
  cache.addAll(assetsUrl);

  //   event.waitUntil(
  //     caches.open(staticCacheName).then((cache) => cache.addAll(assetsUrl))
  //   );
  console.log("SW: install");
});

self.addEventListener("activate", async (event) => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name !== staticCacheName)
      .filter((name) => name !== dynamicCacheName)
      .map((name) => caches.delete(name))
  );
  console.log("SW: activate");
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
  //   console.log("request " + event.request.url);
});

async function cacheFirst(request) {
  const cached = await caches.match(request);

  return cached ?? (await fetch(request));
}

async function networkFirst(request) {
  const cache = await caches.open(dynamicCacheName);
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    return cached ?? caches.match("./offline.html");
  }
}
