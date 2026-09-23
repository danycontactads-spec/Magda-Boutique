const crypto = require('crypto');
const { requireAdmin } = require('../_lib/auth');
const { getSupabaseAdmin } = require('../_lib/supabaseAdmin');

// Límite conservador: el body de una Vercel Function tiene un tope de 4.5MB
// (y base64 pesa ~33% más que el binario), así que dejamos margen amplio.
// admin.html comprime la imagen en el navegador antes de enviarla, así que
// en la práctica casi nunca se llega a este límite.
const MAX_BYTES = 2.5 * 1024 * 1024;
const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// POST /api/admin/upload  { contentType, dataBase64 } -> { url }
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  if (!requireAdmin(req, res)) return;

  const { contentType, dataBase64 } = req.body || {};
  if (!Object.prototype.hasOwnProperty.call(EXT_BY_TYPE, contentType)) {
    return res.status(400).json({ ok: false, error: 'Formato de imagen no soportado. Usa JPG, PNG o WEBP.' });
  }
  if (typeof dataBase64 !== 'string' || !dataBase64) {
    return res.status(400).json({ ok: false, error: 'No se recibió ninguna imagen.' });
  }

  let buffer;
  try {
    buffer = Buffer.from(dataBase64, 'base64');
  } catch {
    return res.status(400).json({ ok: false, error: 'La imagen está corrupta o mal codificada.' });
  }
  if (!buffer.length) {
    return res.status(400).json({ ok: false, error: 'La imagen está vacía.' });
  }
  if (buffer.length > MAX_BYTES) {
    return res.status(413).json({ ok: false, error: 'La imagen es demasiado grande (máx. ~2.5MB tras comprimir).' });
  }

  const path = `${crypto.randomUUID()}.${EXT_BY_TYPE[contentType]}`;

  try {
    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error('POST /api/admin/upload', uploadError);
      return res.status(500).json({ ok: false, error: 'No se pudo subir la imagen. Verifica que el bucket "product-images" exista y sea público.' });
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return res.status(200).json({ ok: true, url: data.publicUrl });
  } catch (err) {
    console.error('/api/admin/upload unexpected', err);
    return res.status(500).json({ ok: false, error: 'Error inesperado al subir la imagen.' });
  }
};
