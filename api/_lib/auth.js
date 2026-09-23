const crypto = require('crypto');

const COOKIE_NAME = 'mms_admin';
const SESSION_HOURS = 12;

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('Falta ADMIN_PASSWORD en las variables de entorno.');
  return secret;
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Compara contraseñas en tiempo constante para evitar timing attacks.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''));
  const bufB = Buffer.from(String(b ?? ''));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

function isHttps(req) {
  return req.headers['x-forwarded-proto'] === 'https';
}

function setSessionCookie(req, res) {
  const token = sign({ exp: Date.now() + SESSION_HOURS * 3600 * 1000 });
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${SESSION_HOURS * 3600}`,
  ];
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req, res) {
  const parts = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return !!verify(cookies[COOKIE_NAME]);
}

// Devuelve false y ya envió la respuesta 401 si no hay sesión válida.
function requireAdmin(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ ok: false, error: 'Sesión inválida o expirada. Inicia sesión de nuevo.' });
    return false;
  }
  return true;
}

module.exports = {
  safeEqual,
  setSessionCookie,
  clearSessionCookie,
  isAuthenticated,
  requireAdmin,
};
