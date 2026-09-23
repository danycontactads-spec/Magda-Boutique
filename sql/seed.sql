-- Madam Maison du Soleil by Magda — Seed inicial
-- Migra los productos que ya estaban escritos a mano en swim.html e invisible.html.
-- Ejecutar en Supabase → SQL Editor DESPUÉS de sql/schema.sql (una sola vez).
--
-- Los 5 primeros trajes ya tenían foto real en /assets/images (Producto-1..5.jpeg)
-- y se cargan con esa ruta. El resto de productos no tenía foto real (solo un
-- bloque de color de relleno en el HTML), así que quedan con imagen_url = NULL:
-- el storefront les mostrará automáticamente un placeholder hasta que subas
-- la foto real desde el panel /admin.html.

insert into public.products (nombre, precio, categoria, subcategoria, imagen_url, destacado, orden) values
  ('Bikini Riviera Dorado',        78.00, 'trajes', 'Bikinis',      '/assets/images/Producto-1.jpeg', true,  0),
  ('Enterizo Océano Perla',        92.00, 'trajes', 'Enterizos',    '/assets/images/Producto-2.jpeg', true,  1),
  ('Cover-Up Arena Suave',         64.00, 'trajes', 'Cover-Ups',    '/assets/images/Producto-3.jpeg', true,  2),
  ('Bikini Soleil Champagne',      84.00, 'trajes', 'Bikinis',      '/assets/images/Producto-4.jpeg', true,  3),
  ('Enterizo Marfil Clásico',      96.00, 'trajes', 'Enterizos',    '/assets/images/Producto-5.jpeg', false, 4),
  ('Bikini Caribe Dorado',         82.00, 'trajes', 'Bikinis',      null, false, 5),
  ('Kaftán Brisa de Mar',         110.00, 'trajes', 'Resort Wear',  null, false, 6),
  ('Bikini Rosa Palo',             76.00, 'trajes', 'Bikinis',      null, false, 7),
  ('Vestido Playa Mediterráneo',  124.00, 'trajes', 'Resort Wear',  null, false, 8),
  ('Enterizo Escote V Ocean',      98.00, 'trajes', 'Enterizos',    null, false, 9),
  ('Bikini Triángulo Soleil',      74.00, 'trajes', 'Bikinis',      null, false, 10),
  ('Pareo Champagne Silk',         58.00, 'trajes', 'Cover-Ups',    null, false, 11);

insert into public.products (nombre, precio, categoria, subcategoria, imagen_url, destacado, orden) values
  ('Thin Silicone Bra',            28.00, 'esenciales', 'Bras Adhesivos', null, true,  0),
  ('Strong Self-Adhesive Bra',     30.00, 'esenciales', 'Bras Adhesivos', null, false, 1),
  ('Invisible Mango Bra',          24.00, 'esenciales', 'Bras Adhesivos', null, true,  2),
  ('Side-Wing U-Shape Bra',        26.00, 'esenciales', 'Bras Adhesivos', null, false, 3),
  ('Matt Silicone Nipple Cover',   18.00, 'esenciales', 'Cubre-Pezones',  null, true,  4),
  ('Invisible Comfort Flower',     16.00, 'esenciales', 'Cubre-Pezones',  null, false, 5),
  ('Solid Triangle Covers',        17.00, 'esenciales', 'Cubre-Pezones',  null, false, 6),
  ('Invisible Lift Bikini Pads',   20.00, 'esenciales', 'Bikini Pads',    null, false, 7),
  ('Double-Sided Glue Pads',       19.00, 'esenciales', 'Bikini Pads',    null, false, 8),
  ('Boob Tape Premium',            22.00, 'esenciales', 'Boob Tape',      null, true,  9),
  ('Silicone Spoon-Cup Bra',       27.00, 'esenciales', 'Bras Adhesivos', null, false, 10),
  ('Liquid Silicone Cover',        15.00, 'esenciales', 'Cubre-Pezones',  null, false, 11);
