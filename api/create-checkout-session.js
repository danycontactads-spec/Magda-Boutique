const crypto = require('crypto');
const { getStripe } = require('./_lib/stripe');
const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');
const { shippingFor } = require('./_lib/shipping');

const MAX_LINES = 30;
const MAX_QTY = 10;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function orderNumber() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const rand = crypto.randomInt(10000, 100000);
  return `MMS-${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${rand}`;
}

function siteUrl(req) {
  const fromEnv = String(process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

// POST /api/create-checkout-session
// Body: { items: [{ id, qty, talla, color }], envio: 'estandar'|'express', cliente: {...} }
// El precio NUNCA se toma del navegador: se lee de Supabase por id.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const body = req.body || {};
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (!rawItems.length) return res.status(400).json({ ok: false, error: 'Tu bolsa está vacía.' });
  if (rawItems.length > MAX_LINES) return res.status(400).json({ ok: false, error: 'Demasiados productos en un solo pedido.' });

  const c = body.cliente || {};
  const cliente = {
    email: text(c.email, 200),
    telefono: text(c.telefono, 40),
    nombre: text(c.nombre, 120),
    direccion: text(c.direccion, 200),
    ciudad: text(c.ciudad, 100),
    pais: text(c.pais, 60),
  };
  if (!EMAIL_RE.test(cliente.email)) return res.status(400).json({ ok: false, error: 'Revisa tu email.' });
  if (!cliente.nombre || !cliente.direccion || !cliente.ciudad || !cliente.pais) {
    return res.status(400).json({ ok: false, error: 'Completa tus datos de envío.' });
  }

  const items = [];
  for (const i of rawItems) {
    const id = text(i && i.id, 64);
    const qty = parseInt(i && i.qty, 10);
    if (!UUID_RE.test(id)) {
      return res.status(409).json({ ok: false, code: 'unavailable', error: 'Algunos productos de tu bolsa ya no están disponibles. Quítalos para continuar.' });
    }
    if (!(qty >= 1 && qty <= MAX_QTY)) return res.status(400).json({ ok: false, error: 'Cantidad inválida.' });
    items.push({ id, qty, talla: text(i.talla, 40), color: text(i.color, 60) });
  }

  try {
    const supabase = getSupabaseAdmin();
    const ids = [...new Set(items.map((i) => i.id))];
    const { data: products, error } = await supabase
      .from('products')
      .select('id, nombre, precio, imagen_url, agotado')
      .in('id', ids);
    if (error) {
      console.error('create-checkout-session: supabase', error);
      return res.status(500).json({ ok: false, error: 'No pudimos verificar los productos. Intenta de nuevo.' });
    }

    const byId = new Map((products || []).map((p) => [p.id, p]));
    const unavailable = ids.filter((id) => !byId.has(id) || byId.get(id).agotado);
    if (unavailable.length) {
      return res.status(409).json({
        ok: false,
        code: 'unavailable',
        ids: unavailable,
        error: 'Algunos productos de tu bolsa ya no están disponibles o se agotaron. Quítalos para continuar.',
      });
    }

    let subtotalCents = 0;
    const lineItems = items.map((i) => {
      const p = byId.get(i.id);
      const unit = Math.round(Number(p.precio) * 100);
      subtotalCents += unit * i.qty;
      const variant = [i.talla && `Talla ${i.talla}`, i.color].filter(Boolean).join(' · ');
      const productData = {
        name: p.nombre,
        metadata: { product_id: p.id, talla: i.talla, color: i.color },
      };
      if (variant) productData.description = variant;
      if (/^https:\/\//.test(p.imagen_url || '')) productData.images = [p.imagen_url];
      return { quantity: i.qty, price_data: { currency: 'usd', unit_amount: unit, product_data: productData } };
    });

    const ship = shippingFor(body.envio, subtotalCents / 100);
    const numero = orderNumber();
    const base = siteUrl(req);

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      line_items: lineItems,
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: ship.price ? ship.label : `${ship.label} (gratis)`,
          fixed_amount: { amount: Math.round(ship.price * 100), currency: 'usd' },
          delivery_estimate: {
            minimum: { unit: 'business_day', value: ship.days[0] },
            maximum: { unit: 'business_day', value: ship.days[1] },
          },
        },
      }],
      customer_email: cliente.email,
      client_reference_id: numero,
      metadata: {
        order_number: numero,
        metodo_envio: ship.method,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        ciudad: cliente.ciudad,
        pais: cliente.pais,
      },
      payment_intent_data: { description: `Pedido ${numero} — Madam Maison du Soleil` },
      success_url: `${base}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout?cancelado=1`,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (err) {
    console.error('create-checkout-session: error', err);
    return res.status(500).json({ ok: false, error: 'No pudimos iniciar el pago. Intenta de nuevo.' });
  }
};
