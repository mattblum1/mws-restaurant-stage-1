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
        'index.html',
        '/restaurant.html',
        'manifest.json',
        'css/styles.css',
        'css/xs.css',
        'css/sm.css',
        'css/md.css',
        'css/lg.css',
        // 'https://normalize-css.googlecode.com/svn/trunk/normalize.css', // 404 returned
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'icons/icon.png',
        'img/1.jpg',
        'img/2.jpg',
        'img/3.jpg',
        'img/4.jpg',
        'img/5.jpg',
        'img/6.jpg',
        'img/7.jpg',
        'img/8.jpg',
        'img/9.jpg',
        'img/10.jpg',
        'js/dbhelper.js',
        'js/idb.js',
        'js/main.js',
        'js/restaurant_info.js',
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

// Use cached HTML pages if available
self.addEventListener('fetch', event => {
  //   console.log(event.request);
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/'));
      return;
    } else if (requestUrl.pathname === '/restaurant.html') {
      event.respondWith(caches.match('/restaurant.html'));
      return;
    }
  }
});
