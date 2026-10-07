/* Madam Maison du Soleil by Magda — tienda: catálogo, carrito y drawer.
   Sin dependencias. Expone window.MMS para las páginas. */
(function () {
  'use strict';

  var CART_KEY = 'mms_cart_v1';
  var ORDER_KEY = 'mms_last_order';
  var FREE_SHIPPING_FROM = 100;
  var SHIPPING = { estandar: 9.5, express: 19 };
  var MAX_QTY = 10;

  var CAT_LABEL = { trajes: 'Trajes de Baño', esenciales: 'Esenciales Invisibles' };
  var CAT_PAGE = { trajes: 'swim.html', esenciales: 'invisible.html' };

  var DEFAULT_DESC = {
    trajes: 'Confeccionado en tejido premium de secado rápido, con forro completo y un ajuste que realza tu silueta. Diseñado en la Maison para acompañarte del mar a la mesa con la elegancia europea y el alma caribeña que nos definen.',
    esenciales: 'Soporte invisible en silicona suave con adhesivo amable con la piel. Reutilizable, discreto bajo cualquier escote y pensado para que te sientas segura y cómoda durante todo el día.'
  };

  var SIZES_BY_SUB = {
    'Bikinis': ['S', 'M', 'L'],
    'Enterizos': ['S', 'M', 'L'],
    'Cover-Ups': ['S', 'M', 'L'],
    'Resort Wear': ['S', 'M', 'L'],
    'Bras Adhesivos': ['A', 'B', 'C', 'D'],
    'Cubre-Pezones': ['Talla única'],
    'Bikini Pads': ['M', 'L'],
    'Boob Tape': ['Talla única']
  };

  var IMG = 'assets/images/';

  // Catálogo de respaldo: se muestra cuando Supabase no está configurado o no responde.
  var FALLBACK = [
    { id: 'demo-bikini-riviera-rouge', nombre: 'Bikini Riviera Rouge', precio: 78, categoria: 'trajes', subcategoria: 'Bikinis', imagenes: [IMG + 'Producto-1.jpeg'], etiqueta: 'Nuevo', destacado: true, colores: ['Rojo Riviera'],
      descripcion: 'Triángulo con cuello halter y eslabones dorados en tirantes y laterales. Satén elástico de brillo sutil, forro completo y lazos ajustables para un ajuste hecho a tu medida.' },
    { id: 'demo-bikini-fleur-de-soleil', nombre: 'Bikini Fleur de Soleil', precio: 84, categoria: 'trajes', subcategoria: 'Bikinis', imagenes: [IMG + 'Producto-3.jpeg'], etiqueta: 'Best Seller', destacado: true, colores: ['Magenta Floral'],
      descripcion: 'Estampado floral dorado sobre magenta intenso, inspirado en los jardines del Caribe al atardecer. Top triángulo con copas suaves y braguita de corte brasileño con terminales metálicos.' },
    { id: 'demo-bikini-champagne-rose', nombre: 'Bikini Champagne Rosé', precio: 92, categoria: 'trajes', subcategoria: 'Bikinis', imagenes: [IMG + 'Producto-4.jpeg'], etiqueta: 'Nuevo', destacado: true, colores: ['Rosé Dorado'],
      descripcion: 'Tejido con destello metalizado en tono rosé y herrajes grabados con el monograma de la Maison. Halter anudado al cuello y braguita con hebillas ajustables: lujo discreto bajo el sol.' },
    { id: 'demo-enterizo-rosa-soleil', nombre: 'Enterizo Rosa Soleil', precio: 96, categoria: 'trajes', subcategoria: 'Enterizos', imagenes: [IMG + 'Imagen-portada-trajes-izquierdo.jpeg'], foco: 'center 30%', destacado: true, colores: ['Rosa Palo', 'Negro'],
      descripcion: 'Silueta atlética de espalda nadadora y escote alto que estiliza. Tejido compresivo de tacto sedoso que abraza el cuerpo y se seca en minutos.' },
    { id: 'demo-bikini-sandia-tropical', nombre: 'Bikini Sandía Tropical', precio: 72, categoria: 'trajes', subcategoria: 'Bikinis', imagenes: [IMG + 'Producto-2.jpeg'], etiqueta: 'Popular', colores: ['Rojo Sandía'],
      descripcion: 'Un guiño divertido al verano: top triángulo con semillas estampadas y braguita a rayas verdes. Tirantes regulables y herrajes dorados.' },
    { id: 'demo-bikini-brasil-verde-oro', nombre: 'Bikini Brasil Verde Oro', precio: 76, categoria: 'trajes', subcategoria: 'Bikinis', imagenes: [IMG + 'Producto-5.jpeg'], foco: 'center 72%', colores: ['Verde & Oro'],
      descripcion: 'Verde esmeralda con ribetes amarillo sol y lazos anudables. Corte brasileño clásico hecho para lucirse en la arena.' },
    { id: 'demo-sueter-nube-rosa', nombre: 'Suéter Off-Shoulder Nube Rosa', precio: 88, categoria: 'trajes', subcategoria: 'Resort Wear', imagenes: [IMG + 'Imagen-portada-trajes-derecho.jpeg'], foco: 'center 40%', etiqueta: 'Nuevo', colores: ['Rosa Nube'],
      descripcion: 'Punto grueso de caída suave y hombro descubierto, perfecto para las noches frescas junto al mar. Oversize, cómodo y femenino.' },
    { id: 'demo-cover-up-arena-suave', nombre: 'Cover-Up Arena Suave', precio: 64, categoria: 'trajes', subcategoria: 'Cover-Ups', imagenes: [], colores: ['Arena', 'Marfil'] },
    { id: 'demo-kaftan-brisa-de-mar', nombre: 'Kaftán Brisa de Mar', precio: 110, categoria: 'trajes', subcategoria: 'Resort Wear', imagenes: [], colores: ['Azul Océano', 'Blanco'] },
    { id: 'demo-enterizo-oceano-perla', nombre: 'Enterizo Océano Perla', precio: 92, categoria: 'trajes', subcategoria: 'Enterizos', imagenes: [], colores: ['Perla', 'Azul Océano'] },
    { id: 'demo-vestido-playa-mediterraneo', nombre: 'Vestido Playa Mediterráneo', precio: 124, categoria: 'trajes', subcategoria: 'Resort Wear', imagenes: [], agotado: true, colores: ['Blanco'] },
    { id: 'demo-pareo-champagne-silk', nombre: 'Pareo Champagne Silk', precio: 58, categoria: 'trajes', subcategoria: 'Cover-Ups', imagenes: [], tallas: ['Talla única'], colores: ['Champagne'] },

    { id: 'demo-thin-silicone-bra', nombre: 'Thin Silicone Bra', precio: 28, categoria: 'esenciales', subcategoria: 'Bras Adhesivos', imagenes: [], etiqueta: 'Best Seller', destacado: true, colores: ['Skin', 'Transparente'],
      descripcion: 'Bra adhesivo ultrafino con cierre frontal. Silicona suave que se funde con la piel y se reutiliza lavándolo con agua tibia.' },
    { id: 'demo-strong-adhesive-bra', nombre: 'Strong Self-Adhesive Bra', precio: 30, categoria: 'esenciales', subcategoria: 'Bras Adhesivos', imagenes: [], tallas: ['A', 'B', 'C', 'D', 'E', 'F'], colores: ['Skin', 'Brown'],
      descripcion: 'Adhesión reforzada para largas jornadas y escotes profundos. Reutilizable, con un realce natural y sin tirantes visibles.' },
    { id: 'demo-invisible-mango-bra', nombre: 'Invisible Mango Bra', precio: 24, categoria: 'esenciales', subcategoria: 'Bras Adhesivos', imagenes: [], etiqueta: 'Popular', destacado: true, colores: ['Nude', 'Black'],
      descripcion: 'Forma de mango que levanta y une. Esponja ligera con bio-adhesivo transpirable, ideal para vestidos de espalda descubierta.' },
    { id: 'demo-side-wing-u-bra', nombre: 'Side-Wing U-Shape Bra', precio: 26, categoria: 'esenciales', subcategoria: 'Bras Adhesivos', imagenes: [], colores: ['Nude', 'Black'],
      descripcion: 'Alas laterales en forma de U para un ajuste sin costuras y seguro, incluso con escotes en V.' },
    { id: 'demo-matt-nipple-cover', nombre: 'Matt Silicone Nipple Cover', precio: 18, categoria: 'esenciales', subcategoria: 'Cubre-Pezones', imagenes: [], etiqueta: 'Nuevo', destacado: true, tallas: ['7 cm', '8 cm', '10 cm', '13 cm', '15 cm'], colores: ['Skin', 'Brown'],
      descripcion: 'Cubre-pezones 100% silicona con acabado mate, invisibles bajo telas finas. Bordes ultradelgados que no se marcan.' },
    { id: 'demo-comfort-flower', nombre: 'Invisible Comfort Flower', precio: 16, categoria: 'esenciales', subcategoria: 'Cubre-Pezones', imagenes: [], tallas: ['6 cm', '8 cm', '10 cm', '14 cm'], colores: ['Nude', 'Pink'] },
    { id: 'demo-solid-triangle-covers', nombre: 'Solid Triangle Covers', precio: 17, categoria: 'esenciales', subcategoria: 'Cubre-Pezones', imagenes: [], tallas: ['8 x 10.5 cm'], colores: ['Nude', 'Coffee', 'Brown'] },
    { id: 'demo-lift-bikini-pads', nombre: 'Invisible Lift Bikini Pads', precio: 20, categoria: 'esenciales', subcategoria: 'Bikini Pads', imagenes: [], colores: ['Nude', 'Clear'] },
    { id: 'demo-double-sided-pads', nombre: 'Double-Sided Glue Pads', precio: 19, categoria: 'esenciales', subcategoria: 'Bikini Pads', imagenes: [], tallas: ['11 x 11 cm'], colores: ['Nude'] },
    { id: 'demo-boob-tape-premium', nombre: 'Boob Tape Premium', precio: 22, categoria: 'esenciales', subcategoria: 'Boob Tape', imagenes: [], etiqueta: 'Best Seller', destacado: true, colores: ['Light Skin', 'Skin', 'Brown', 'Black'],
      descripcion: 'Cinta de 95% algodón y 5% spandex que levanta y moldea a tu gusto. Se corta a medida y resiste el sudor y el agua.' },
    { id: 'demo-spoon-cup-bra', nombre: 'Silicone Spoon-Cup Bra', precio: 27, categoria: 'esenciales', subcategoria: 'Bras Adhesivos', imagenes: [], tallas: ['A', 'B', 'C'], colores: ['Skin', 'Transparente'] },
    { id: 'demo-liquid-silicone-cover', nombre: 'Liquid Silicone Cover', precio: 15, categoria: 'esenciales', subcategoria: 'Cubre-Pezones', imagenes: [], tallas: ['8 x 8 cm'], colores: ['Skin'] }
  ].map(function (p) { p.demo = true; return normalize(p); });

  /* ── Utilidades ── */
  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + (Number(n) || 0).toFixed(2); }
  // Eventos del Meta Pixel (assets/js/pixel.js). Sin Pixel configurado no hace nada.
  function track(event, params) { if (typeof window.mmsTrack === 'function') window.mmsTrack(event, params); }
  function strList(v) { return Array.isArray(v) ? v.map(function (x) { return String(x).trim(); }).filter(Boolean) : []; }

  // Acepta productos de Supabase (imagen_url) o del respaldo (imagenes[]).
  // Si en el futuro se agregan columnas descripcion/tallas/colores/imagenes, se usan automáticamente.
  function normalize(p) {
    var cat = p.categoria === 'esenciales' ? 'esenciales' : 'trajes';
    var imgs = Array.isArray(p.imagenes) ? p.imagenes.filter(Boolean) : [];
    if (!imgs.length && p.imagen_url) imgs = [p.imagen_url];
    var tallas = strList(p.tallas).length ? strList(p.tallas)
      : (SIZES_BY_SUB[p.subcategoria] || (cat === 'esenciales' ? ['Talla única'] : ['S', 'M', 'L']));
    var desc = p.descripcion && String(p.descripcion).trim();
    return {
      id: String(p.id),
      nombre: p.nombre || 'Pieza de la Maison',
      precio: Number(p.precio) || 0,
      categoria: cat,
      subcategoria: p.subcategoria || '',
      imagenes: imgs,
      foco: p.foco || '',
      agotado: !!p.agotado,
      destacado: !!p.destacado,
      etiqueta: p.etiqueta || '',
      descripcion: desc || DEFAULT_DESC[cat],
      tallas: tallas,
      colores: strList(p.colores),
      demo: !!p.demo
    };
  }

  /* ── Catálogo ── */
  var apiPromise = null;
  var known = {}; // id -> producto, para "agregar" desde las tarjetas
  function remember(list) { (list || []).forEach(function (p) { known[p.id] = p; }); return list; }
  function fetchApi() {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(function (resolve) {
      if (location.protocol === 'file:' || !window.fetch) return resolve(null);
      var settled = false;
      var timer = setTimeout(function () { if (!settled) { settled = true; resolve(null); } }, 4000);
      fetch('/api/products')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (json) {
          var list = json && json.ok && Array.isArray(json.products) ? json.products.map(normalize) : null;
          if (!settled) { settled = true; clearTimeout(timer); resolve(list && list.length ? list : null); }
        })
        .catch(function () { if (!settled) { settled = true; clearTimeout(timer); resolve(null); } });
    });
    return apiPromise;
  }

  // Productos de Supabase si hay; si una categoría viene vacía, usa el respaldo de esa categoría.
  function loadProducts(categoria) {
    return fetchApi().then(function (list) {
      var byCat = function (arr) { return categoria ? arr.filter(function (p) { return p.categoria === categoria; }) : arr; };
      if (!list) return remember(byCat(FALLBACK));
      if (categoria) { var own = byCat(list); return remember(own.length ? own : byCat(FALLBACK)); }
      var out = list.slice();
      ['trajes', 'esenciales'].forEach(function (c) {
        if (!list.some(function (p) { return p.categoria === c; })) {
          out = out.concat(FALLBACK.filter(function (p) { return p.categoria === c; }));
        }
      });
      return remember(out);
    });
  }

  function findFallback(id) {
    for (var i = 0; i < FALLBACK.length; i++) if (FALLBACK[i].id === id) return FALLBACK[i];
    return null;
  }

  function getProduct(id) {
    if (!id) return Promise.resolve(null);
    if (id.indexOf('demo-') === 0) return Promise.resolve(findFallback(id));
    return fetchApi().then(function (list) {
      var hit = list && list.filter(function (p) { return p.id === id; })[0];
      return hit || findFallback(id);
    });
  }

  function productUrl(p) { return 'producto.html?id=' + encodeURIComponent(p.id); }

  function placeholderHtml(p) {
    var label = p.subcategoria || CAT_LABEL[p.categoria] || 'La Maison';
    return '<span class="mms-ph mms-ph-' + (p.categoria === 'esenciales' ? 'es' : 'tr') + '">' +
      '<span class="mms-ph-crown">♛</span><span class="mms-ph-name">' + esc(label) + '</span>' +
      '<span class="mms-ph-brand">Maison du Soleil</span></span>';
  }

  function imgHtml(p, index, eager) {
    var src = p.imagenes[index || 0];
    if (!src) return placeholderHtml(p);
    return '<img src="' + esc(src) + '" alt="' + esc(p.nombre) + '"' + (eager ? '' : ' loading="lazy"') +
      (p.foco ? ' style="object-position:' + esc(p.foco) + '"' : '') + '>';
  }

  function tagHtml(p) {
    if (p.agotado) return '<span class="tag tag-agotado">Agotado</span>';
    return p.etiqueta ? '<span class="tag">' + esc(p.etiqueta) + '</span>' : '';
  }

  /* ── Carrito (localStorage, con respaldo en memoria) ── */
  var memCart = null;
  function readCart() {
    if (memCart) return memCart.slice();
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      memCart = Array.isArray(raw) ? raw.filter(function (i) { return i && i.key && i.qty > 0; }) : [];
    } catch (e) { memCart = []; }
    return memCart.slice();
  }
  function writeCart(items) {
    memCart = items.slice();
    try { localStorage.setItem(CART_KEY, JSON.stringify(memCart)); } catch (e) { /* modo privado: queda en memoria */ }
    refresh();
  }

  function addToCart(p, opts) {
    opts = opts || {};
    var talla = opts.talla || '';
    var color = opts.color || '';
    var qty = Math.max(1, Math.min(MAX_QTY, parseInt(opts.qty, 10) || 1));
    var key = p.id + '|' + talla + '|' + color;
    var items = readCart();
    var existing = items.filter(function (i) { return i.key === key; })[0];
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
    else items.push({ key: key, id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagenes[0] || '', foco: p.foco || '', categoria: p.categoria, subcategoria: p.subcategoria, talla: talla, color: color, qty: qty });
    writeCart(items);
    track('AddToCart', { value: p.precio * qty, currency: 'USD', content_ids: [p.id], content_name: p.nombre, content_type: 'product' });
  }

  function setQty(key, qty) {
    var items = readCart();
    items.forEach(function (i) { if (i.key === key) i.qty = Math.max(1, Math.min(MAX_QTY, qty)); });
    writeCart(items);
  }
  function removeItem(key) { writeCart(readCart().filter(function (i) { return i.key !== key; })); }
  function clearCart() { writeCart([]); }

  function totals(items, method) {
    items = items || readCart();
    var subtotal = items.reduce(function (s, i) { return s + i.precio * i.qty; }, 0);
    var count = items.reduce(function (s, i) { return s + i.qty; }, 0);
    var shipping = 0;
    if (count) {
      if (method === 'express') shipping = SHIPPING.express;
      else shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING.estandar;
    }
    return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping, count: count };
  }

  function thumbHtml(item) {
    if (item.imagen) return '<img src="' + esc(item.imagen) + '" alt=""' + (item.foco ? ' style="object-position:' + esc(item.foco) + '"' : '') + '>';
    return '<span class="mms-ph mms-ph-' + (item.categoria === 'esenciales' ? 'es' : 'tr') + ' mms-ph-mini"><span class="mms-ph-crown">♛</span></span>';
  }
  function variantText(item) {
    return [item.talla && item.talla !== 'Talla única' ? 'Talla ' + item.talla : item.talla, item.color].filter(Boolean).join(' · ');
  }

  /* ── Drawer ── */
  var drawer, overlay, lastFocus;
  function buildDrawer() {
    overlay = document.createElement('div');
    overlay.className = 'mms-overlay';
    overlay.setAttribute('data-cart-close', '');
    drawer = document.createElement('aside');
    drawer.className = 'mms-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'mmsDrawerTitle');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML =
      '<div class="mms-drawer-head"><h3 id="mmsDrawerTitle">Tu Bolsa <span class="mms-drawer-count"></span></h3>' +
      '<button type="button" class="mms-x" data-cart-close aria-label="Cerrar carrito">&times;</button></div>' +
      '<div class="mms-ship"></div>' +
      '<div class="mms-drawer-body"></div>' +
      '<div class="mms-drawer-foot">' +
        '<div class="mms-row mms-row-total"><span>Subtotal</span><strong class="mms-subtotal"></strong></div>' +
        '<p class="mms-note">Envío calculado en el checkout.</p>' +
        '<a href="checkout.html" class="mms-btn mms-btn-gold">Proceder al pago</a>' +
        '<button type="button" class="mms-btn mms-btn-ghost" data-cart-close>Seguir comprando</button>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  function renderDrawer() {
    if (!drawer) return;
    var items = readCart();
    var t = totals(items);
    drawer.querySelector('.mms-drawer-count').textContent = t.count ? '(' + t.count + ')' : '';
    var body = drawer.querySelector('.mms-drawer-body');
    var foot = drawer.querySelector('.mms-drawer-foot');
    var ship = drawer.querySelector('.mms-ship');

    if (!items.length) {
      ship.style.display = 'none';
      foot.style.display = 'none';
      body.innerHTML =
        '<div class="mms-empty"><div class="mms-empty-icon">♛</div>' +
        '<h4>Tu bolsa está vacía</h4>' +
        '<p>Descubre piezas creadas para brillar bajo el sol.</p>' +
        '<a href="swim.html" class="mms-btn mms-btn-gold">Ver Trajes de Baño</a>' +
        '<a href="invisible.html" class="mms-btn mms-btn-ghost">Esenciales Invisibles</a></div>';
      return;
    }

    ship.style.display = '';
    foot.style.display = '';
    var missing = FREE_SHIPPING_FROM - t.subtotal;
    var pct = Math.min(100, (t.subtotal / FREE_SHIPPING_FROM) * 100);
    ship.innerHTML = (missing > 0
      ? 'Te faltan <strong>' + money(missing) + '</strong> para el envío gratis'
      : '✦ ¡Tu pedido tiene <strong>envío gratis</strong>!') +
      '<span class="mms-ship-bar"><span style="width:' + pct.toFixed(0) + '%"></span></span>';

    body.innerHTML = items.map(function (i) {
      var k = esc(i.key);
      return '<div class="mms-item">' +
        '<a class="mms-item-img" href="producto.html?id=' + encodeURIComponent(i.id) + '">' + thumbHtml(i) + '</a>' +
        '<div class="mms-item-info">' +
          '<a class="mms-item-name" href="producto.html?id=' + encodeURIComponent(i.id) + '">' + esc(i.nombre) + '</a>' +
          (variantText(i) ? '<div class="mms-item-meta">' + esc(variantText(i)) + '</div>' : '') +
          '<div class="mms-item-price">' + money(i.precio) + '</div>' +
          '<div class="mms-item-actions">' +
            '<div class="mms-qty"><button type="button" data-qty="-1" data-key="' + k + '" aria-label="Quitar uno"' + (i.qty <= 1 ? ' disabled' : '') + '>−</button>' +
            '<span>' + i.qty + '</span>' +
            '<button type="button" data-qty="1" data-key="' + k + '" aria-label="Agregar uno"' + (i.qty >= MAX_QTY ? ' disabled' : '') + '>+</button></div>' +
            '<button type="button" class="mms-remove" data-remove="' + k + '">Eliminar</button>' +
          '</div>' +
        '</div>' +
        '<div class="mms-item-total">' + money(i.precio * i.qty) + '</div>' +
      '</div>';
    }).join('');
    drawer.querySelector('.mms-subtotal').textContent = money(t.subtotal);
  }

  function openCart() {
    if (!drawer) return;
    renderDrawer();
    lastFocus = document.activeElement;
    document.documentElement.classList.add('mms-lock');
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    setTimeout(function () { var x = drawer.querySelector('.mms-x'); if (x) x.focus(); }, 60);
  }
  function closeCart() {
    if (!drawer || !drawer.classList.contains('open')) return;
    document.documentElement.classList.remove('mms-lock');
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function refresh() {
    var count = totals().count;
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count > 99 ? '99+' : String(count);
      el.hidden = !count;
    });
    renderDrawer();
    document.dispatchEvent(new CustomEvent('mms:cart'));
  }

  function bump() {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    });
  }

  var toastTimer;
  function toast(msg) {
    var el = document.querySelector('.mms-toast');
    if (!el) { el = document.createElement('div'); el.className = 'mms-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* ── Agregar desde las tarjetas del catálogo ── */
  function quickAddHtml(p) {
    if (p.agotado) return '';
    return '<button type="button" class="mms-qa" data-quick-add="' + esc(p.id) + '">Agregar al carrito</button>';
  }

  function lookup(id) { return known[id] || findFallback(id); }

  function chipRow(label, list, attr) {
    return '<div class="mms-qa-row"><span class="mms-qa-label">' + label + '</span><div class="mms-qa-chips">' +
      list.map(function (v) { return '<button type="button" ' + attr + '="' + esc(v) + '">' + esc(v) + '</button>'; }).join('') +
      '</div></div>';
  }

  function closePickers() {
    document.querySelectorAll('.mms-qa-pick').forEach(function (el) { el.remove(); });
  }

  function addedFeedback() {
    bump();
    toast('Agregado al carrito ✓');
    openCart();
  }

  // Con una sola talla (y un solo color) se agrega directo; si no, se abre un
  // selector sobre la foto y no se agrega nada hasta elegir.
  function quickAdd(btn) {
    var id = btn.getAttribute('data-quick-add');
    var card = btn.closest('.prod-card') || btn.parentNode;
    var p = lookup(id);
    if (!p) { location.href = productUrl({ id: id }); return; }
    var talla = p.tallas.length === 1 ? p.tallas[0] : '';
    var color = p.colores.length === 1 ? p.colores[0] : '';
    if (talla && (color || !p.colores.length)) { addToCart(p, { talla: talla, color: color, qty: 1 }); addedFeedback(); return; }

    var existing = card.querySelector('.mms-qa-pick');
    if (existing) { pickerSubmit(existing); return; }
    closePickers();
    var pick = document.createElement('div');
    pick.className = 'mms-qa-pick';
    pick.setAttribute('data-qa-id', p.id);
    pick.setAttribute('data-talla', talla);
    pick.setAttribute('data-color', color);
    pick.innerHTML = '<button type="button" class="mms-qa-x" data-qa-close aria-label="Cerrar">&times;</button>' +
      (p.colores.length > 1 ? chipRow('Color', p.colores, 'data-qa-color') : '') +
      (p.tallas.length > 1 ? chipRow('Elige tu talla', p.tallas, 'data-qa-talla') : '') +
      '<div class="mms-qa-err" role="alert"></div>';
    (card.querySelector('.prod-img') || card).appendChild(pick);
  }

  function pickerSubmit(pick) {
    var p = lookup(pick.getAttribute('data-qa-id'));
    var talla = pick.getAttribute('data-talla');
    var color = pick.getAttribute('data-color');
    var err = pick.querySelector('.mms-qa-err');
    if (p.colores.length > 1 && !color) { err.textContent = 'Elige un color'; toast('Elige un color'); return; }
    if (!talla) { err.textContent = 'Elige tu talla'; toast('Elige tu talla'); return; }
    addToCart(p, { talla: talla, color: color, qty: 1 });
    pick.remove();
    addedFeedback();
  }

  function pickerChoose(chip, kind) {
    var pick = chip.closest('.mms-qa-pick');
    pick.setAttribute('data-' + kind, chip.getAttribute('data-qa-' + kind));
    chip.parentNode.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === chip); });
    pick.querySelector('.mms-qa-err').textContent = '';
    var p = lookup(pick.getAttribute('data-qa-id'));
    // Con todo elegido, agrega sin pedir otro clic.
    if (pick.getAttribute('data-talla') && (pick.getAttribute('data-color') || p.colores.length < 2)) pickerSubmit(pick);
  }

  /* ── Pedido (solo datos no sensibles; nunca datos de tarjeta) ── */
  function saveLastOrder(order) { try { sessionStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch (e) { window.__mmsOrder = order; } }
  function readLastOrder() {
    try { var o = JSON.parse(sessionStorage.getItem(ORDER_KEY) || 'null'); if (o) return o; } catch (e) { /* ignorar */ }
    return window.__mmsOrder || null;
  }

  /* ── Eventos globales ── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var qa = t.closest('[data-quick-add], .mms-qa-pick');
    if (qa) {
      // Viven dentro de la tarjeta <a>: el clic no debe navegar a la ficha.
      e.preventDefault();
      var b = t.closest('[data-quick-add], [data-qa-talla], [data-qa-color], [data-qa-close]');
      if (!b) return;
      if (b.hasAttribute('data-quick-add')) quickAdd(b);
      else if (b.hasAttribute('data-qa-talla')) pickerChoose(b, 'talla');
      else if (b.hasAttribute('data-qa-color')) pickerChoose(b, 'color');
      else b.closest('.mms-qa-pick').remove();
      return;
    }
    if (!t.closest('.prod-card')) closePickers();
    var open = t.closest('[data-cart-open]');
    if (open) { e.preventDefault(); openCart(); return; }
    if (t.closest('[data-cart-close]')) { e.preventDefault(); closeCart(); return; }
    var q = t.closest('[data-qty]');
    if (q) {
      var key = q.getAttribute('data-key');
      var item = readCart().filter(function (i) { return i.key === key; })[0];
      if (item) setQty(key, item.qty + parseInt(q.getAttribute('data-qty'), 10));
      return;
    }
    var rm = t.closest('[data-remove]');
    if (rm) { removeItem(rm.getAttribute('data-remove')); return; }
    var menu = t.closest('[data-menu-toggle]');
    if (menu) {
      e.preventDefault();
      var nav = document.querySelector('.nav-menu');
      if (nav) {
        var isOpen = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) { memCart = null; refresh(); } });

  // Carrito flotante (abajo a la izquierda; WhatsApp ocupa la derecha).
  function buildFab() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'mms-fab';
    fab.setAttribute('data-cart-open', '');
    fab.setAttribute('aria-label', 'Abrir carrito');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>' +
      '<span class="mms-fab-count" data-cart-count hidden>0</span>';
    document.body.appendChild(fab);
  }

  function init() {
    if (!document.body.hasAttribute('data-no-drawer')) { buildDrawer(); buildFab(); }
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.MMS = {
    esc: esc,
    money: money,
    CAT_LABEL: CAT_LABEL,
    CAT_PAGE: CAT_PAGE,
    FREE_SHIPPING_FROM: FREE_SHIPPING_FROM,
    SHIPPING: SHIPPING,
    MAX_QTY: MAX_QTY,
    loadProducts: loadProducts,
    quickAddHtml: quickAddHtml,
    getProduct: getProduct,
    productUrl: productUrl,
    imgHtml: imgHtml,
    tagHtml: tagHtml,
    placeholderHtml: placeholderHtml,
    thumbHtml: thumbHtml,
    variantText: variantText,
    cart: {
      items: readCart,
      add: addToCart,
      setQty: setQty,
      remove: removeItem,
      clear: clearCart,
      totals: totals,
      open: openCart,
      close: closeCart,
      bump: bump
    },
    toast: toast,
    track: track,
    saveLastOrder: saveLastOrder,
    readLastOrder: readLastOrder
  };
})();
