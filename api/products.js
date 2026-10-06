const { getSupabasePublic } = require('./_lib/supabasePublic');
const { CATEGORIES } = require('./_lib/categories');
const { PRODUCT_COLUMNS } = require('./_lib/productColumns');

// GET /api/products            -> todos los productos
// GET /api/products?categoria=trajes|esenciales
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria : undefined;
  if (categoria && !Object.prototype.hasOwnProperty.call(CATEGORIES, categoria)) {
    return res.status(400).json({ ok: false, error: `categoria debe ser una de: ${Object.keys(CATEGORIES).join(', ')}.` });
  }

  try {
    const supabase = getSupabasePublic();
    let query = supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });

    if (categoria) query = query.eq('categoria', categoria);

    const { data, error } = await query;
    if (error) {
      console.error('GET /api/products', error);
      return res.status(500).json({ ok: false, error: 'No se pudieron cargar los productos.' });
    }

    // Caché corta en el CDN: los cambios del panel se ven en la tienda en segundos.
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    return res.status(200).json({ ok: true, products: data });
  } catch (err) {
    console.error('GET /api/products unexpected', err);
    return res.status(500).json({ ok: false, error: 'Error inesperado del servidor.' });
  }
};
