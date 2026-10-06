const { requireAdmin } = require('../_lib/auth');
const { getSupabaseAdmin } = require('../_lib/supabaseAdmin');
const { CATEGORIES } = require('../_lib/categories');
const { PRODUCT_COLUMNS } = require('../_lib/productColumns');

function validateProduct(body) {
  const errors = [];
  const out = {};

  if (typeof body.nombre !== 'string' || !body.nombre.trim()) {
    errors.push('nombre es requerido.');
  } else {
    out.nombre = body.nombre.trim().slice(0, 200);
  }

  const precio = Number(body.precio);
  if (!Number.isFinite(precio) || precio < 0) {
    errors.push('precio debe ser un número mayor o igual a 0.');
  } else {
    out.precio = Math.round(precio * 100) / 100;
  }

  if (!Object.prototype.hasOwnProperty.call(CATEGORIES, body.categoria)) {
    errors.push(`categoria debe ser una de: ${Object.keys(CATEGORIES).join(', ')}.`);
  } else {
    out.categoria = body.categoria;
  }

  if (body.subcategoria) {
    const validas = CATEGORIES[body.categoria] || [];
    if (!validas.includes(body.subcategoria)) {
      errors.push(`subcategoria debe ser una de: ${validas.join(', ')}.`);
    } else {
      out.subcategoria = body.subcategoria;
    }
  } else {
    out.subcategoria = null;
  }

  if (body.imagen_url !== undefined && body.imagen_url !== null && typeof body.imagen_url !== 'string') {
    errors.push('imagen_url inválida.');
  } else {
    out.imagen_url = body.imagen_url || null;
  }

  out.agotado = !!body.agotado;
  out.destacado = !!body.destacado;

  const orden = Number(body.orden);
  out.orden = Number.isFinite(orden) ? Math.trunc(orden) : 0;

  out.descripcion = typeof body.descripcion === 'string' && body.descripcion.trim()
    ? body.descripcion.trim().slice(0, 2000)
    : null;
  out.etiqueta = typeof body.etiqueta === 'string' && body.etiqueta.trim()
    ? body.etiqueta.trim().slice(0, 30)
    : null;
  out.colores = toList(body.colores);
  out.tallas = toList(body.tallas);

  return { errors, data: out };
}

// Acepta un arreglo o un texto separado por comas ("S, M, L").
function toList(value) {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const seen = new Set();
  return raw
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim().slice(0, 40))
    .filter((v) => v && !seen.has(v.toLowerCase()) && seen.add(v.toLowerCase()))
    .slice(0, 20);
}

// GET    /api/admin/products         -> listar (sin caché, para el panel)
// POST   /api/admin/products         -> crear
// PUT    /api/admin/products         -> editar (body incluye id)
// DELETE /api/admin/products?id=...  -> eliminar
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!requireAdmin(req, res)) return;

  try {
    const supabase = getSupabaseAdmin();

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_COLUMNS)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) {
        console.error('GET /api/admin/products', error);
        return res.status(500).json({ ok: false, error: 'No se pudieron cargar los productos. Revisa que sql/schema.sql se haya ejecutado en Supabase.' });
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, products: data });
    }

    if (req.method === 'POST') {
      const { errors, data } = validateProduct(req.body || {});
      if (errors.length) return res.status(400).json({ ok: false, error: errors.join(' ') });

      const { data: created, error } = await supabase.from('products').insert(data).select().single();
      if (error) {
        console.error('POST /api/admin/products', error);
        return res.status(500).json({ ok: false, error: 'No se pudo crear el producto.' });
      }
      return res.status(201).json({ ok: true, product: created });
    }

    if (req.method === 'PUT') {
      const { id, ...rest } = req.body || {};
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ ok: false, error: 'id es requerido.' });
      }
      const { errors, data } = validateProduct(rest);
      if (errors.length) return res.status(400).json({ ok: false, error: errors.join(' ') });

      const { data: updated, error } = await supabase.from('products').update(data).eq('id', id).select().maybeSingle();
      if (error) {
        console.error('PUT /api/admin/products', error);
        return res.status(500).json({ ok: false, error: 'No se pudo actualizar el producto.' });
      }
      if (!updated) return res.status(404).json({ ok: false, error: 'Producto no encontrado.' });
      return res.status(200).json({ ok: true, product: updated });
    }

    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ ok: false, error: 'id es requerido.' });
      }
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('DELETE /api/admin/products', error);
        return res.status(500).json({ ok: false, error: 'No se pudo eliminar el producto.' });
      }
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  } catch (err) {
    console.error('/api/admin/products unexpected', err);
    const notConfigured = /SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY/.test(String(err && err.message));
    return res.status(500).json({
      ok: false,
      error: notConfigured
        ? 'El panel aún no está conectado a la base de datos (faltan las variables de Supabase en Vercel).'
        : 'Error inesperado del servidor.',
    });
  }
};
