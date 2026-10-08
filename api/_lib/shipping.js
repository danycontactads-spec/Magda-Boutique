// Tarifas de envío. El servidor es la fuente de verdad: assets/js/store.js
// tiene una copia solo para mostrar el resumen antes de pagar.
const SHIPPING = {
  estandar: { label: 'Envío estándar', price: 9.5, days: [5, 7] },
  express: { label: 'Envío express', price: 19, days: [2, 3] },
};
const FREE_SHIPPING_FROM = 100;

function shippingFor(method, subtotal) {
  const opt = SHIPPING[method] || SHIPPING.estandar;
  const free = opt === SHIPPING.estandar && subtotal >= FREE_SHIPPING_FROM;
  return { method: opt === SHIPPING.express ? 'express' : 'estandar', ...opt, price: free ? 0 : opt.price };
}

module.exports = { SHIPPING, FREE_SHIPPING_FROM, shippingFor };
