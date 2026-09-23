const { createClient } = require('@supabase/supabase-js');

let client = null;

// Cliente con la service role key: se salta RLS. Solo se usa en /api/admin/*,
// nunca se debe importar desde código que corra en el navegador.
function getSupabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.');
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

module.exports = { getSupabaseAdmin };
