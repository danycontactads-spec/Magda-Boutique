const { SESSION_RE, orderFromSession } = require('./_lib/orders');

// GET /api/order?session_id=cs_... -> resumen del pedido para gracias.html.
// Se lee de Stripe (no de Supabase) para que funcione aunque el webhook aún
// no haya llegado. El session_id es largo e imposible de adivinar.
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  res.setHeader('Cache-Control', 'no-store');

  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!SESSION_RE.test(sessionId)) return res.status(400).json({ ok: false, error: 'Pedido inválido.' });

  try {
    const order = await orderFromSession(sessionId);
    // Datos mínimos para la página de gracias: sin teléfono ni dirección exacta.
    const { telefono, direccion, ...cliente } = order.cliente;
    return res.status(200).json({ ok: true, order: { ...order, paymentIntent: undefined, cliente } });
  } catch (err) {
    if (err && err.statusCode === 404) return res.status(404).json({ ok: false, error: 'Pedido no encontrado.' });
    console.error('GET /api/order', err);
    return res.status(500).json({ ok: false, error: 'No pudimos cargar tu pedido.' });
  }
};
