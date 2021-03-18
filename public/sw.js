
var CACHE_STATIC_NAME = 'static-v2';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});

self.addEventListener('fetch', function (event) {
  var url = 'https://httpbin.org/ip';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (res) {
              cache.put(event.request, res.clone());
              return res;
            });
        })
    );
  } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                  });
              })
              .catch(function (err) {

              });
          }
        })
    );
  }

  // event.respondWith(
  //   // Network, cache fallback
  //   fetch(event.request)
  //     .then(function (res) {
  //       return caches.open(CACHE_DYNAMIC_NAME)
  //         .then(function (cache) {
  //           cache.put(event.request.url, res.clone());
  //           return res;
  //         })
  //     })
  //     .catch(function (err) {
  //       return caches.match(event.request);
  //     })

  //   // Cache only
  //   // caches.match(event.request)

  //   // Nework only
  //   // fetch(event.request)

  //   // Cache, network fallback
  //   // caches.match(event.request)
  //   //   .then(function(response) {
  //   //     if (response) {
  //   //       return response;
  //   //     } else {
  //   //       return fetch(event.request)
  //   //         .then(function(res) {
  //   //           return caches.open(CACHE_DYNAMIC_NAME)
  //   //             .then(function(cache) {
  //   //               cache.put(event.request.url, res.clone());
  //   //               return res;
  //   //             });
  //   //         })
  //   //         .catch(function(err) {

  //   //         });
  //   //     }
  //   //   })
  // );
});