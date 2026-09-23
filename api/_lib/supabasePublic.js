const { createClient } = require('@supabase/supabase-js');

let client = null;

// Cliente con la anon key: respeta RLS (solo puede leer productos).
// Usado por /api/products, el único endpoint público.
function getSupabasePublic() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno.');
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

module.exports = { getSupabasePublic };
