// Email de confirmación de pedido vía Brevo (API transaccional).
// Se envía solo si existen BREVO_API_KEY y BREVO_SENDER_EMAIL (un remitente
// verificado en Brevo). ORDER_NOTIFY_EMAIL (opcional) recibe copia oculta.

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

function emailConfigured() {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

function renderHtml(o) {
  const rows = o.items.map((i) => {
    const meta = [i.talla && `Talla ${i.talla}`, i.color, `Cantidad: ${i.qty}`].filter(Boolean).join(' · ');
    return `<tr><td style="padding:10px 0;border-bottom:1px solid #eee"><b>${esc(i.nombre)}</b><br><span style="color:#888;font-size:13px">${esc(meta)}</span></td>` +
      `<td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right">${money(i.total)}</td></tr>`;
  }).join('');
  const first = (o.cliente.nombre || '').split(' ')[0];
  return `<!doctype html><html><body style="margin:0;background:#faf6ef;font-family:Georgia,serif;color:#2b2420">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
  <p style="text-align:center;font-size:26px;margin:0;color:#b08d57">&#9819;</p>
  <h1 style="text-align:center;font-weight:normal;font-size:24px;margin:6px 0 2px">Madam Maison du Soleil</h1>
  <p style="text-align:center;letter-spacing:3px;font-size:11px;color:#b08d57;margin:0 0 28px">BY MAGDA</p>
  <div style="background:#fff;padding:28px 24px;border-radius:6px">
    <h2 style="font-weight:normal;font-size:20px;margin:0 0 8px">¡Gracias por tu compra${first ? ', ' + esc(first) : ''}!</h2>
    <p style="margin:0 0 20px;line-height:1.6">Recibimos tu pago y tu pedido <b>#${esc(o.numero)}</b> ya está en manos de la Maison. Lo prepararemos en 1–2 días hábiles y te avisaremos cuando vaya en camino.</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px">${rows}
      <tr><td style="padding:10px 0 2px;color:#888">Subtotal</td><td style="padding:10px 0 2px;text-align:right">${money(o.subtotal)}</td></tr>
      <tr><td style="padding:2px 0;color:#888">${o.metodoEnvio === 'express' ? 'Envío express' : 'Envío estándar'}</td><td style="padding:2px 0;text-align:right">${o.envio ? money(o.envio) : 'Gratis'}</td></tr>
      <tr><td style="padding:12px 0 0;font-size:17px"><b>Total pagado</b></td><td style="padding:12px 0 0;text-align:right;font-size:17px"><b>${money(o.total)} ${esc(o.moneda)}</b></td></tr>
    </table>
    <p style="margin:24px 0 0;line-height:1.6;font-size:14px"><b>Enviar a</b><br>${esc(o.cliente.nombre)}<br>${esc(o.cliente.direccion)}<br>${esc([o.cliente.ciudad, o.cliente.pais].filter(Boolean).join(', '))}</p>
  </div>
  <p style="text-align:center;font-size:13px;color:#888;margin:24px 0 0;line-height:1.6">¿Dudas con tu pedido? Escríbenos por WhatsApp al +1 786 667 0539.</p>
</div></body></html>`;
}

async function sendOrderEmail(order) {
  if (!emailConfigured() || !order.cliente.email) return false;
  const payload = {
    sender: { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME || 'Madam Maison du Soleil' },
    to: [{ email: order.cliente.email, name: order.cliente.nombre || undefined }],
    subject: `Tu pedido #${order.numero} está confirmado`,
    htmlContent: renderHtml(order),
  };
  const notify = String(process.env.ORDER_NOTIFY_EMAIL || '').trim();
  if (notify) payload.bcc = [{ email: notify }];

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    console.error('sendOrderEmail: error de Brevo', r.status, await r.text().catch(() => ''));
    return false;
  }
  return true;
}

module.exports = { sendOrderEmail, emailConfigured };
