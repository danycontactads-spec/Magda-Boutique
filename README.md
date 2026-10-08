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
| `STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys → **Publishable key** (`pk_test_…` / `pk_live_…`) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → **Secret key** (`sk_test_…` / `sk_live_…`; secreta) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → tu endpoint → **Signing secret** (`whsec_…`; secreta). Ver punto 9. |
| `BREVO_SENDER_EMAIL` | *(Opcional)* Remitente **verificado** en Brevo (Senders & IPs) para el email de confirmación de pedido. Sin él no se envía. |
| `BREVO_SENDER_NAME` | *(Opcional)* Nombre del remitente. Por defecto: *Madam Maison du Soleil*. |
| `ORDER_NOTIFY_EMAIL` | *(Opcional)* Email de Magda: recibe copia oculta de cada confirmación. |
| `SITE_URL` | *(Opcional)* Dominio para volver desde Stripe, p. ej. `https://magda-boutique.vercel.app`. Sin él se usa el dominio de la visita. |

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
- `Purchase` se dispara en `gracias.html` cuando Stripe confirma el pago, con
  el total real cobrado, una sola vez por pedido.

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
- RLS en `products`: el público solo puede leer. RLS en `orders`: nadie desde
  el navegador puede leer ni escribir pedidos.
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` solo existen en las funciones
  serverless. La tarjeta se ingresa en la página de Stripe, y el precio y el
  envío se calculan en el servidor, nunca se toman del navegador.
- El servidor y la base de datos validan categoría y subcategoría.

### 7. Archivos
```
index.html, swim.html, invisible.html   Tienda (portada, catálogos)
producto.html                           Ficha de producto
checkout.html, gracias.html             Checkout (Stripe) y confirmación
info.html, 404.html                     Ayuda / políticas y página de error
admin.html                              Panel de Magda
assets/js/store.js                      Catálogo, carrito, catálogo de respaldo
assets/js/pixel.js                      Meta Pixel (se activa con META_PIXEL_ID)
assets/css/store.css, shell.css         Estilos compartidos
api/products.js                         GET público de productos
api/config.js                           Config pública (ID del Pixel)
api/submit-lead.js                      Newsletter → Brevo
api/create-checkout-session.js          Crea el pago en Stripe (precios desde Supabase)
api/stripe-webhook.js                   Stripe confirma el pago → guarda en orders + email
api/order.js                            Resumen del pedido para gracias.html
api/admin/*.js                          Login, sesión, CRUD y subida de fotos
sql/schema.sql, sql/seed.sql            Base de datos (productos)
sql/orders.sql                          Tabla de pedidos
```

### 8. Pendiente
- **Stripe en modo real (live)**: cuando la cuenta de Magda esté verificada
  (punto 9, paso 4).
- **Pedidos en el panel**: por ahora se consultan en Supabase → Table Editor →
  `orders`.
- **Dominio propio**: conectarlo en Vercel → Settings → Domains y actualizar las
  URLs (punto 5).

### 9. Pagos con Stripe
El checkout usa **Stripe Checkout** (la página de pago alojada por Stripe): la
tarjeta se escribe en stripe.com y nunca pasa por este sitio.

**Cómo funciona un pedido**
1. `checkout.html` envía a `/api/create-checkout-session` solo los ids,
   cantidades, talla/color, método de envío y los datos de contacto. **Nunca
   precios.**
2. El servidor lee el precio real de cada producto en Supabase, rechaza los
   agotados o inexistentes, recalcula el envío (estándar $9.50, express $19,
   estándar gratis desde $100) y crea la sesión de Stripe en USD.
3. El cliente paga en Stripe y vuelve a `/gracias?session_id=…`. Si cancela,
   vuelve a `/checkout` con la bolsa y sus datos intactos.
4. `gracias.html` confirma el pago con `/api/order` (que consulta a Stripe),
   muestra el número de pedido y el resumen, vacía la bolsa y dispara
   `Purchase` en el Meta Pixel con el total real.
5. Stripe avisa a `/api/stripe-webhook`. Se verifica la firma y el pedido se
   guarda en la tabla `orders` con estado `pagado`. Si Brevo está configurado,
   se envía el email de confirmación. Los reintentos de Stripe no duplican
   pedidos ni emails.

> Solo se pueden cobrar productos que existan en Supabase. Los del catálogo de
> respaldo (`demo-…`) se quitan de la bolsa al intentar pagar.

**Paso 1 — Tabla de pedidos.** Supabase → SQL Editor → New query → pega
`sql/orders.sql` → **Run**. Crea la tabla `orders` con RLS activado y sin
policies, así que nadie desde el navegador puede leer los pedidos.

**Paso 2 — Webhook en Stripe (modo prueba)**
1. Dashboard de Stripe con el interruptor **Test mode / Entorno de prueba**
   activado → **Developers → Webhooks** (o *Workbench → Webhooks*) →
   **Add endpoint / Add destination**.
2. Endpoint URL: `https://magda-boutique.vercel.app/api/stripe-webhook`
3. Eventos: **`checkout.session.completed`** (opcional:
   `checkout.session.async_payment_succeeded`). Guardar.
4. En la página del endpoint, **Signing secret → Reveal**: copia el valor
   `whsec_…`.
5. Vercel → Settings → Environment Variables → agrega
   `STRIPE_WEBHOOK_SECRET` con ese valor.
6. **Deployments → … → Redeploy.** Sin redeploy la función no ve la variable y
   el webhook responde 500.

**Paso 3 — Probar.** Usa la tarjeta `4242 4242 4242 4242`, cualquier fecha
futura y cualquier CVC. En el checkout aparece el aviso *"Modo prueba"* y en
gracias *"Pedido de prueba"*. Los pedidos de prueba quedan con
`livemode = false`. En Stripe → Webhooks → el endpoint, cada entrega debe
mostrar **200**.

**Paso 4 — Pasar a modo real (live)**, cuando la cuenta de Magda esté
verificada en Stripe (datos del negocio y cuenta bancaria):
1. En Stripe, desactiva *Test mode* → **Developers → API keys**: copia la
   *Publishable key* (`pk_live_…`) y la *Secret key* (`sk_live_…`).
2. Crea **otro** webhook, ahora en modo live, con la misma URL y el mismo
   evento. Copia su *Signing secret* (es distinto al de prueba).
3. En Vercel (Production), reemplaza `STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` por los valores live →
   **Redeploy**.
4. Haz una compra real pequeña y reembólsala desde Stripe → Payments.
5. Opcional: deja las claves de prueba solo en el entorno **Preview** para
   seguir probando sin cobrar.

Los pedidos de prueba se pueden borrar en Supabase con
`delete from orders where livemode = false;`.
