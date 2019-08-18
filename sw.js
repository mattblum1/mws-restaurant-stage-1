// import idb from 'idb';

var cacheName = 'restaurant-reviews';
var cacheVersion = 'v1';
var staticCacheName = `${cacheName}-${cacheVersion}`;

// Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/manifest.json',
        'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
        '/css/styles.css',
        '/css/xs.css',
        '/css/sm.css',
        '/css/md.css',
        '/css/lg.css',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/img/1-576.jpg',
        '/img/1-800.jpg',
        '/img/2-576.jpg',
        '/img/2-800.jpg',
        '/img/3-576.jpg',
        '/img/3-800.jpg',
        '/img/4-576.jpg',
        '/img/4-800.jpg',
        '/img/5-576.jpg',
        '/img/5-800.jpg',
        '/img/6-576.jpg',
        '/img/6-800.jpg',
        '/img/7-576.jpg',
        '/img/7-800.jpg',
        '/img/8-576.jpg',
        '/img/8-800.jpg',
        '/img/9-576.jpg',
        '/img/9-800.jpg',
        '/img/10-576.jpg',
        '/img/10-800.jpg',
        '/sw.js',
        '/js/dbhelper.js',
        '/js/idb.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        'https://fonts.googleapis.com/css?family=Roboto&display=swap'
        // 'http://localhost:1337/restaurants' // Use IndexDB for cahcing JSON
      ]);
    })
  );
});

// Delete all caches except for the current version
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return (
              cacheName.startsWith(cacheName) && cacheName != staticCacheName
            );
          })
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (event.request.url.indexOf(staticCacheName) > -1) {
        return fetch(event.request);
      }
      if (response) {
        console.log('Serve from cache', response);
        return response;
      }
      return fetch(event.request).then(response =>
        caches.open(CURRENT_CACHES.prefetch).then(cache => {
          // Cache response after making a request
          cache.put(event.request, response.clone());
          // Return original response
          return response;
        })
      );
    })
  );
});
