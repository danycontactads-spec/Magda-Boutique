const { getSupabasePublic } = require('./_lib/supabasePublic');
const { CATEGORIES } = require('./_lib/categories');

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
      .select('id, nombre, precio, categoria, subcategoria, imagen_url, agotado, destacado, orden, created_at')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });

    if (categoria) query = query.eq('categoria', categoria);

    const { data, error } = await query;
    if (error) {
      console.error('GET /api/products', error);
      return res.status(500).json({ ok: false, error: 'No se pudieron cargar los productos.' });
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    return res.status(200).json({ ok: true, products: data });
  } catch (err) {
    console.error('GET /api/products unexpected', err);
    return res.status(500).json({ ok: false, error: 'Error inesperado del servidor.' });
  }
};
