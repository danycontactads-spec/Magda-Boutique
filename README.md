# Madam Maison du Soleil by Magda — Tienda online

Sitio estático en **Vercel** + **Supabase** (base de datos y fotos) + funciones
serverless en `/api`. El navegador nunca habla directo con Supabase: siempre pasa
por `/api/*`.

- Tienda en vivo: https://magda-boutique.vercel.app
- Panel de administración: https://magda-boutique.vercel.app/admin

**Pendiente (se hará después):** pago real con Stripe (hoy el checkout es una
demo que no cobra) y el dominio propio.

---

## Guía para Magda: cómo manejar tus productos

### Entrar al panel
1. Abre en el navegador (computadora o celular):
   **https://magda-boutique.vercel.app/admin**
2. Escribe tu contraseña y pulsa **Entrar**.
3. La sesión dura 12 horas. Para salir, pulsa **Cerrar sesión** (arriba a la
   derecha).

> Guarda el enlace en favoritos. El panel no aparece en Google ni en la tienda;
> solo entra quien tenga el enlace y la contraseña.

### Agregar un producto
1. Pulsa **+ Agregar Producto**.
2. Llena:
   - **Nombre**: por ejemplo, *Bikini Riviera Rouge*.
   - **Precio (USD)**: solo el número, por ejemplo `78` o `78.50`.
   - **Categoría**: *Trajes de Baño* o *Esenciales Invisibles*.
   - **Subcategoría**: aparecen solo las de la categoría elegida (por ejemplo, Bikinis).
   - **Descripción** (opcional): la tela, el corte y los detalles. Si la dejas
     vacía, se muestra un texto general.
   - **Colores** (opcional): separados por coma, por ejemplo `Rosa, Negro`.
   - **Tallas** (opcional): separadas por coma, por ejemplo `S, M, L`. Si lo
     dejas vacío, se usan las tallas normales de esa subcategoría (el panel te
     dice cuáles).
   - **Etiqueta** (opcional): un texto corto que sale sobre la foto, como
     *Nuevo*, *Best Seller* u *Oferta*.
3. **Foto**: pulsa *Seleccionar archivo* y elige la foto (JPG, PNG o WEBP).
   Puede ser una foto pesada del celular, porque se achica sola. Espera a que
   diga **"✓ Foto lista"**. Mientras se sube, el botón Guardar queda bloqueado.
4. Marca **Destacado** si quieres que salga en la página de inicio, y
   **Agotado** si no hay stock.
5. Pulsa **Guardar**. Verás *"Producto creado. Ya se ve en la tienda."*

### Editar un producto
1. Busca el producto en la lista. Arriba puedes filtrar por *Trajes* o *Esenciales*.
2. Pulsa **Editar**, cambia lo que necesites y pulsa **Guardar**.
3. Para cambiar la foto, elige una nueva. Para dejarlo sin foto, pulsa **Quitar foto**.

### Marcar agotado o destacado (sin abrir el formulario)
En cada producto hay dos interruptores:
- **Agotado**: en rojo, el producto muestra el sello *AGOTADO* y no se puede
  comprar.
- **Destacado en inicio**: en dorado, el producto aparece en la página principal.

### Borrar un producto
Pulsa **Eliminar** y confirma. **No se puede deshacer.** Si solo no hay stock,
es mejor marcarlo como *Agotado*.

### Ver cómo quedó
Cada producto tiene el enlace **"Ver en la tienda ↗"**. Los cambios aparecen
en la tienda en unos segundos; si no, recarga la página.

### Orden de los productos
El campo **Orden** decide la posición en el catálogo: el número más bajo sale
primero (0, 1, 2…).

---

## Puesta en marcha técnica

### 1. Crear el proyecto en Supabase
1. Entra a [supabase.com](https://supabase.com) → **New project**. Nombre:
   `magda-boutique`. Región: *East US*. Guarda la contraseña de la base de datos.
2. Ve a **SQL Editor** → **New query**, pega el contenido de `sql/schema.sql`
   y pulsa **Run**. Esto crea:
   - la tabla `products`;
   - la seguridad (el público solo puede leer);
   - el bucket público `product-images`.
3. Nueva query: pega `sql/seed.sql` y pulsa **Run**. Esto carga los 24
   productos iniciales, iguales a los que ya muestra la tienda. Si la tabla ya
   tiene datos, no inserta nada, así que no se duplican.
4. Verifica el bucket en **Storage**: debe existir `product-images` con la
   etiqueta *Public*. Si no aparece, créalo a mano: **New bucket** → nombre
   `product-images` → **Public bucket ON** → Create.

`schema.sql` se puede volver a ejecutar sin romper nada (sirve para agregar
columnas nuevas a una tabla ya creada).

### 2. Variables de entorno en Vercel
Vercel → proyecto **magda-boutique** → **Settings → Environment Variables**.
Agrégalas marcando **Production** y **Preview**:

| Variable | Valor / de dónde sale |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** (`https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** (secreta; nunca va al navegador) |
| `ADMIN_PASSWORD` | La contraseña del panel. Usa una larga, de 12 o más caracteres. |
| `BREVO_API_KEY` | Brevo → SMTP & API → API Keys |
| `BREVO_LIST_ID` | Brevo → Contacts → Lists → el número (ID) de la lista del newsletter |
| `META_PIXEL_ID` | *(Opcional)* Meta Events Manager → el número del Pixel. Vacío = Pixel apagado. |

Después de agregarlas o cambiarlas: **Deployments → … → Redeploy**. Las
funciones solo leen las variables al desplegar.

### 3. Sin Supabase configurado
Mientras falten las variables de Supabase, la tienda muestra un **catálogo de
respaldo** completo (`FALLBACK` en `assets/js/store.js`), con los mismos 24
productos, fotos, precios, tallas y colores. Se puede presentar y navegar
igual. El panel sí necesita Supabase para guardar cambios; sin él muestra
*"El panel aún no está conectado a la base de datos"*.

### 4. Meta Pixel
`assets/js/pixel.js` lee el ID desde `/api/config` (la variable `META_PIXEL_ID`).
- **Con ID:** dispara `PageView` en todas las páginas, `ViewContent` en la ficha
  del producto, `AddToCart` al agregar al carrito, `InitiateCheckout` al entrar
  al checkout y `Lead` al suscribirse al newsletter.
- **Sin ID:** no se carga nada y no da errores.
- `Purchase` queda listo pero comentado en `gracias.html`, para activarlo con
  Stripe, porque hoy no hay cobros reales.

### 5. SEO y vista al compartir
Todas las páginas tienen título, descripción, Open Graph y Twitter Card con
`assets/images/og-image.jpg` (1200×630). Además:
- **JSON-LD:** inicio (Organization + WebSite), catálogos (Breadcrumb), ayuda
  (FAQPage) y ficha de producto (Product + Breadcrumb, generado al cargar).
- **No indexados:** `admin.html` está bloqueado en `robots.txt`, con `noindex`
  y el header `X-Robots-Tag`. Checkout y gracias también son `noindex`.

**Al conectar el dominio propio:** reemplaza `https://magda-boutique.vercel.app`
por el dominio nuevo en todos los `.html`, `sitemap.xml` y `robots.txt` (buscar
y reemplazar).

### 6. Seguridad
- `SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_PASSWORD` viven solo en el servidor.
- El login entrega una cookie `httpOnly` firmada, válida por 12 h. Todas las
  rutas de escritura la exigen.
- RLS en `products`: el público solo puede leer.
- El servidor y la base de datos validan categoría y subcategoría.

### 7. Archivos
```
index.html, swim.html, invisible.html   Tienda (portada, catálogos)
producto.html                           Ficha de producto
checkout.html, gracias.html             Checkout (demo) y confirmación
info.html, 404.html                     Ayuda / políticas y página de error
admin.html                              Panel de Magda
assets/js/store.js                      Catálogo, carrito, catálogo de respaldo
assets/js/pixel.js                      Meta Pixel (se activa con META_PIXEL_ID)
assets/css/store.css, shell.css         Estilos compartidos
api/products.js                         GET público de productos
api/config.js                           Config pública (ID del Pixel)
api/submit-lead.js                      Newsletter → Brevo
api/admin/*.js                          Login, sesión, CRUD y subida de fotos
sql/schema.sql, sql/seed.sql            Base de datos
```

### 8. Pendiente
- **Stripe (pago real)**: ver el comentario `TODO: integrar Stripe aquí` en
  `checkout.html`.
- **Dominio propio**: conectarlo en Vercel → Settings → Domains y actualizar las
  URLs (punto 5).
