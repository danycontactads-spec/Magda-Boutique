const Stripe = require('stripe');

let client = null;

// Cliente de Stripe con la secret key. Solo se usa en funciones serverless,
// nunca se debe importar desde código que corra en el navegador.
function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Falta STRIPE_SECRET_KEY en las variables de entorno.');
    client = new Stripe(key);
  }
  return client;
}

module.exports = { getStripe };
