const { getStripe } = require('./_lib/stripe');
const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');
const { orderFromSession } = require('./_lib/orders');
const { sendOrderEmail } = require('./_lib/orderEmail');

// La firma se verifica sobre el cuerpo crudo, así que no se debe parsear.
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function saveOrder(sessionId) {
  const order = await orderFromSession(sessionId);
  if (!order.pagado) {
    console.log('stripe-webhook: sesión sin pagar todavía', sessionId);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('orders').insert({
    order_number: order.numero,
    stripe_session_id: order.sessionId,
    stripe_payment_intent: order.paymentIntent,
    estado: 'pagado',
    livemode: order.livemode,
    email: order.cliente.email,
    nombre: order.cliente.nombre,
    telefono: order.cliente.telefono,
    direccion: order.cliente.direccion,
    ciudad: order.cliente.ciudad,
    pais: order.cliente.pais,
    metodo_envio: order.metodoEnvio,
    items: order.items,
    subtotal: order.subtotal,
    envio: order.envio,
    total: order.total,
    moneda: order.moneda,
  });

  // Stripe reintenta los webhooks: si el pedido ya existe, no se duplica ni se reenvía el email.
  if (error && error.code === '23505') return;
  if (error) throw error;

  try {
    if (await sendOrderEmail(order)) {
      await supabase.from('orders').update({ email_enviado: true }).eq('stripe_session_id', order.sessionId);
    }
  } catch (err) {
    console.error('stripe-webhook: no se pudo enviar el email', err);
  }
}

// POST /api/stripe-webhook — lo llama Stripe, no el navegador.
async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('stripe-webhook: falta STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ ok: false, error: 'Webhook no configurado.' });
  }

  let event;
  try {
    const raw = await readRawBody(req);
    event = getStripe().webhooks.constructEvent(raw, req.headers['stripe-signature'], secret);
  } catch (err) {
    console.error('stripe-webhook: firma inválida', err.message);
    return res.status(400).json({ ok: false, error: 'Firma inválida.' });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await saveOrder(event.data.object.id);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    // 500 = Stripe reintenta más tarde (por ejemplo, si Supabase no respondió).
    console.error('stripe-webhook: error al guardar el pedido', err);
    return res.status(500).json({ ok: false, error: 'No se pudo guardar el pedido.' });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
