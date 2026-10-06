/* Madam Maison du Soleil — Meta Pixel.
   El ID vive en Vercel (variable META_PIXEL_ID) y llega por /api/config.
   Sin ID, el Pixel no se carga y window.mmsTrack() no hace nada.
   Uso: mmsTrack('AddToCart', { value: 78, currency: 'USD' }). */
(function () {
  'use strict';

  var CFG_KEY = 'mms_cfg_v1';
  var status = 'pending'; // pending | on | off
  var queue = [];

  window.mmsTrack = function (event, params) {
    if (status === 'on') window.fbq('track', event, params || {});
    else if (status === 'pending') queue.push([event, params]);
  };

  function off() { status = 'off'; queue = []; }

  function enable(id) {
    /* Snippet oficial de Meta */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
    status = 'on';
    queue.forEach(function (q) { window.fbq('track', q[0], q[1] || {}); });
    queue = [];
  }

  function apply(id) { if (id) enable(id); else off(); }

  if (location.protocol === 'file:' || !window.fetch) return off();

  try {
    var cached = JSON.parse(sessionStorage.getItem(CFG_KEY) || 'null');
    if (cached && typeof cached.metaPixelId === 'string') return apply(cached.metaPixelId);
  } catch (e) { /* sin sessionStorage: se consulta la API */ }

  fetch('/api/config')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) {
      var id = cfg && cfg.ok && typeof cfg.metaPixelId === 'string' ? cfg.metaPixelId : '';
      try { sessionStorage.setItem(CFG_KEY, JSON.stringify({ metaPixelId: id })); } catch (e) { /* ignorar */ }
      apply(id);
    })
    .catch(off);
})();
