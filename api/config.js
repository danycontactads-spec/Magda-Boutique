// GET /api/config -> configuración pública del sitio (nada secreto).
// El ID del Meta Pixel se pone en Vercel como META_PIXEL_ID; vacío = Pixel apagado.
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  const pixelId = String(process.env.META_PIXEL_ID || '').trim();
  // Modo de Stripe según la clave publicable (es pública): 'test', 'live' o '' sin configurar.
  const pk = String(process.env.STRIPE_PUBLISHABLE_KEY || '').trim();
  const stripeMode = pk.startsWith('pk_live_') ? 'live' : pk.startsWith('pk_test_') ? 'test' : '';
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ ok: true, metaPixelId: /^\d{5,20}$/.test(pixelId) ? pixelId : '', stripeMode });
};
