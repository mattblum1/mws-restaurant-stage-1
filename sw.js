self.addEventListener('fetch', function(event) {
  console.warn('>>>>', event.request);
});
