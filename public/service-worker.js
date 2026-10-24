// Retire the old CRA cache only within this application's scope.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) {
    const cache = await caches.open(name)
    for (const request of await cache.keys()) {
      if (request.url.startsWith(self.registration.scope)) await cache.delete(request)
    }
    if ((await cache.keys()).length === 0) await caches.delete(name)
  }
  await self.registration.unregister()
  await self.clients.claim()
})()))
