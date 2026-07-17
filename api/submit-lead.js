const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const { email } = req.body || {};

  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ ok: false, error: 'Correo electrónico inválido.' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    console.error('submit-lead: faltan BREVO_API_KEY o BREVO_LIST_ID en el entorno.');
    return res.status(500).json({ ok: false, error: 'Configuración del servidor incompleta.' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: email.trim(),
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    });

    if (!brevoRes.ok && brevoRes.status !== 204) {
      const errBody = await brevoRes.json().catch(() => ({}));
      console.error('submit-lead: error de Brevo', brevoRes.status, errBody);
      return res.status(502).json({ ok: false, error: 'No se pudo completar la suscripción.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-lead: error inesperado', err);
    return res.status(500).json({ ok: false, error: 'Error inesperado. Intenta de nuevo.' });
  }
};
