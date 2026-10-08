const { getStripe } = require('./stripe');

const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

const cents = (n) => Math.round(Number(n) || 0) / 100;

// Arma el pedido a partir de la Checkout Session de Stripe (fuente de verdad
// de lo que realmente se cobró). Lo usan el webhook y /api/order.
async function orderFromSession(sessionId) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const lines = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ['data.price.product'],
  });
  const md = session.metadata || {};
  const items = lines.data.map((li) => {
    const product = (li.price && li.price.product) || {};
    const pm = product.metadata || {};
    return {
      id: pm.product_id || '',
      nombre: product.name || li.description,
      talla: pm.talla || '',
      color: pm.color || '',
      imagen: (product.images && product.images[0]) || '',
      qty: li.quantity,
      precio: cents(li.price && li.price.unit_amount),
      total: cents(li.amount_total),
    };
  });
  const details = session.customer_details || {};
  return {
    numero: md.order_number || session.client_reference_id || session.id,
    sessionId: session.id,
    paymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent && session.payment_intent.id) || null,
    pagado: session.payment_status === 'paid',
    livemode: !!session.livemode,
    fecha: new Date(session.created * 1000).toISOString(),
    moneda: String(session.currency || 'usd').toUpperCase(),
    items,
    subtotal: cents(session.amount_subtotal),
    envio: cents(session.total_details && session.total_details.amount_shipping),
    metodoEnvio: md.metodo_envio === 'express' ? 'express' : 'estandar',
    total: cents(session.amount_total),
    cliente: {
      nombre: md.nombre || details.name || '',
      email: details.email || session.customer_email || '',
      telefono: md.telefono || details.phone || '',
      direccion: md.direccion || '',
      ciudad: md.ciudad || '',
      pais: md.pais || '',
    },
  };
}

module.exports = { SESSION_RE, orderFromSession };
