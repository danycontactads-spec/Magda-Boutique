const { safeEqual, setSessionCookie } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('login: falta ADMIN_PASSWORD en el entorno.');
    return res.status(500).json({ ok: false, error: 'Falta configurar ADMIN_PASSWORD en Vercel.' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ ok: false, error: 'Ingresa la contraseña.' });
  }

  if (!safeEqual(password, adminPassword)) {
    return res.status(401).json({ ok: false, error: 'Contraseña incorrecta.' });
  }

  setSessionCookie(req, res);
  return res.status(200).json({ ok: true });
};
