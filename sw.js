var staticCacheName = 'restaurant-reviews-v1';

// self.addEventListener('fetch', function(event) {
//   console.log('event.request', event.request);
// });

self.addEventListener('install', function(event) {
  console.warn('entering the install event...');
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        'css/styles.css',
        'css/xs.css',
        'css/sm.css',
        'css/md.css',
        'css/lg.css',
        'js/restaurant_info.js',
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
        'js/main.js',
        // 'https://normalize-css.googlecode.com/svn/trunk/normalize.css', // 404 returned
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'https://fonts.googleapis.com/css?family=Roboto&display=swap'
      ]);
    })
  );
});
