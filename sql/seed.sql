-- Madam Maison du Soleil by Magda — Seed inicial
-- Carga el mismo catálogo que muestra la tienda mientras Supabase no está
-- conectado (FALLBACK en assets/js/store.js), así la tienda se ve igual
-- antes y después de conectar la base de datos.
--
-- Ejecutar en Supabase → SQL Editor DESPUÉS de sql/schema.sql.
-- Solo inserta si la tabla está vacía: ejecutarlo dos veces no duplica nada.
-- Los productos sin foto (imagen_url = null) muestran un recuadro de marca
-- hasta que se les sube la foto real desde /admin.html.

insert into public.products
  (nombre, precio, categoria, subcategoria, imagen_url, etiqueta, destacado, agotado, colores, tallas, descripcion, orden)
select * from (values
  ('Bikini Riviera Rouge',          78.00, 'trajes', 'Bikinis',     '/assets/images/Producto-1.jpeg', 'Nuevo',       true,  false, array['Rojo Riviera'],         array[]::text[], 'Triángulo con cuello halter y eslabones dorados en tirantes y laterales. Satén elástico de brillo sutil, forro completo y lazos ajustables para un ajuste hecho a tu medida.', 0),
  ('Bikini Fleur de Soleil',        84.00, 'trajes', 'Bikinis',     '/assets/images/Producto-3.jpeg', 'Best Seller', true,  false, array['Magenta Floral'],       array[]::text[], 'Estampado floral dorado sobre magenta intenso, inspirado en los jardines del Caribe al atardecer. Top triángulo con copas suaves y braguita de corte brasileño con terminales metálicos.', 1),
  ('Bikini Champagne Rosé',         92.00, 'trajes', 'Bikinis',     '/assets/images/Producto-4.jpeg', 'Nuevo',       true,  false, array['Rosé Dorado'],          array[]::text[], 'Tejido con destello metalizado en tono rosé y herrajes grabados con el monograma de la Maison. Halter anudado al cuello y braguita con hebillas ajustables: lujo discreto bajo el sol.', 2),
  ('Enterizo Rosa Soleil',          96.00, 'trajes', 'Enterizos',   '/assets/images/Imagen-portada-trajes-izquierdo.jpeg', null, true, false, array['Rosa Palo','Negro'], array[]::text[], 'Silueta atlética de espalda nadadora y escote alto que estiliza. Tejido compresivo de tacto sedoso que abraza el cuerpo y se seca en minutos.', 3),
  ('Bikini Sandía Tropical',        72.00, 'trajes', 'Bikinis',     '/assets/images/Producto-2.jpeg', 'Popular',     false, false, array['Rojo Sandía'],          array[]::text[], 'Un guiño divertido al verano: top triángulo con semillas estampadas y braguita a rayas verdes. Tirantes regulables y herrajes dorados.', 4),
  ('Bikini Brasil Verde Oro',       76.00, 'trajes', 'Bikinis',     '/assets/images/Producto-5.jpeg', null,          false, false, array['Verde & Oro'],          array[]::text[], 'Verde esmeralda con ribetes amarillo sol y lazos anudables. Corte brasileño clásico hecho para lucirse en la arena.', 5),
  ('Suéter Off-Shoulder Nube Rosa', 88.00, 'trajes', 'Resort Wear', '/assets/images/Imagen-portada-trajes-derecho.jpeg', 'Nuevo', false, false, array['Rosa Nube'],          array[]::text[], 'Punto grueso de caída suave y hombro descubierto, perfecto para las noches frescas junto al mar. Oversize, cómodo y femenino.', 6),
  ('Cover-Up Arena Suave',          64.00, 'trajes', 'Cover-Ups',   null, null, false, false, array['Arena','Marfil'],        array[]::text[], null, 7),
  ('Kaftán Brisa de Mar',          110.00, 'trajes', 'Resort Wear', null, null, false, false, array['Azul Océano','Blanco'],  array[]::text[], null, 8),
  ('Enterizo Océano Perla',         92.00, 'trajes', 'Enterizos',   null, null, false, false, array['Perla','Azul Océano'],   array[]::text[], null, 9),
  ('Vestido Playa Mediterráneo',   124.00, 'trajes', 'Resort Wear', null, null, false, true,  array['Blanco'],                array[]::text[], null, 10),
  ('Pareo Champagne Silk',          58.00, 'trajes', 'Cover-Ups',   null, null, false, false, array['Champagne'],             array['Talla única'], null, 11),

  ('Thin Silicone Bra',             28.00, 'esenciales', 'Bras Adhesivos', null, 'Best Seller', true,  false, array['Skin','Transparente'], array[]::text[], 'Bra adhesivo ultrafino con cierre frontal. Silicona suave que se funde con la piel y se reutiliza lavándolo con agua tibia.', 0),
  ('Strong Self-Adhesive Bra',      30.00, 'esenciales', 'Bras Adhesivos', null, null,          false, false, array['Skin','Brown'],        array['A','B','C','D','E','F'], 'Adhesión reforzada para largas jornadas y escotes profundos. Reutilizable, con un realce natural y sin tirantes visibles.', 1),
  ('Invisible Mango Bra',           24.00, 'esenciales', 'Bras Adhesivos', null, 'Popular',     true,  false, array['Nude','Black'],        array[]::text[], 'Forma de mango que levanta y une. Esponja ligera con bio-adhesivo transpirable, ideal para vestidos de espalda descubierta.', 2),
  ('Side-Wing U-Shape Bra',         26.00, 'esenciales', 'Bras Adhesivos', null, null,          false, false, array['Nude','Black'],        array[]::text[], 'Alas laterales en forma de U para un ajuste sin costuras y seguro, incluso con escotes en V.', 3),
  ('Matt Silicone Nipple Cover',    18.00, 'esenciales', 'Cubre-Pezones',  null, 'Nuevo',       true,  false, array['Skin','Brown'],        array['7 cm','8 cm','10 cm','13 cm','15 cm'], 'Cubre-pezones 100% silicona con acabado mate, invisibles bajo telas finas. Bordes ultradelgados que no se marcan.', 4),
  ('Invisible Comfort Flower',      16.00, 'esenciales', 'Cubre-Pezones',  null, null,          false, false, array['Nude','Pink'],         array['6 cm','8 cm','10 cm','14 cm'], null, 5),
  ('Solid Triangle Covers',         17.00, 'esenciales', 'Cubre-Pezones',  null, null,          false, false, array['Nude','Coffee','Brown'], array['8 x 10.5 cm'], null, 6),
  ('Invisible Lift Bikini Pads',    20.00, 'esenciales', 'Bikini Pads',    null, null,          false, false, array['Nude','Clear'],        array[]::text[], null, 7),
  ('Double-Sided Glue Pads',        19.00, 'esenciales', 'Bikini Pads',    null, null,          false, false, array['Nude'],                array['11 x 11 cm'], null, 8),
  ('Boob Tape Premium',             22.00, 'esenciales', 'Boob Tape',      null, 'Best Seller', true,  false, array['Light Skin','Skin','Brown','Black'], array[]::text[], 'Cinta de 95% algodón y 5% spandex que levanta y moldea a tu gusto. Se corta a medida y resiste el sudor y el agua.', 9),
  ('Silicone Spoon-Cup Bra',        27.00, 'esenciales', 'Bras Adhesivos', null, null,          false, false, array['Skin','Transparente'], array['A','B','C'], null, 10),
  ('Liquid Silicone Cover',         15.00, 'esenciales', 'Cubre-Pezones',  null, null,          false, false, array['Skin'],                array['8 x 8 cm'], null, 11)
) as v(nombre, precio, categoria, subcategoria, imagen_url, etiqueta, destacado, agotado, colores, tallas, descripcion, orden)
where not exists (select 1 from public.products);
