const { isAuthenticated } = require('../_lib/auth');

// GET /api/admin/session -> permite al panel saber si ya hay sesión activa
// (cookie válida) sin tener que mostrar el login de nuevo en cada visita.
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  return res.status(200).json({ ok: true, authenticated: isAuthenticated(req) });
};
