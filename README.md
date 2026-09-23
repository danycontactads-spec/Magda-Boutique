# Madam Maison du Soleil by Magda — Panel Administrativo

Sitio estático (Vercel) + Supabase (base de datos y almacenamiento de imágenes) +
Vercel Serverless Functions como intermediario. El frontend público (`index.html`,
`swim.html`, `invisible.html`) nunca habla directo con Supabase: siempre pasa por
`/api/*`.

## 1. Crear el proyecto en Supabase

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta, en este orden:
   1. `sql/schema.sql` — crea la tabla `products`, sus políticas de seguridad
      (RLS) y deja comentado el SQL alternativo del bucket.
   2. `sql/seed.sql` — carga los productos que ya existían escritos a mano en
      `swim.html` e `invisible.html` (12 trajes + 12 esenciales).

## 2. Crear el bucket de imágenes

Desde el Dashboard de Supabase (más simple que por SQL):

1. **Storage** → **New bucket**.
2. Nombre exacto: `product-images`.
3. Activa **Public bucket** = ON (así las fotos se ven en el sitio sin firmar URLs).
4. Crear.

Con el bucket marcado como público, Supabase ya deja leer los objetos sin
configuración extra. Las subidas (escritura) solo las hace `/api/admin/upload`
con la service role key — nadie más puede escribir en el bucket.

## 3. Variables de entorno en Vercel

Project Settings → Environment Variables (agrégalas para Production **y** Preview):

| Variable | De dónde sale | Dónde se usa |
|---|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Todas las funciones `/api/*` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secreta) | Solo `/api/admin/*` (crear/editar/borrar/subir). **Nunca** se envía al navegador. |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon public` | Solo `/api/products` (lectura pública) |
| `ADMIN_PASSWORD` | La eliges tú | `/api/admin/login` — contraseña para entrar a `/admin.html` |

Después de agregarlas, vuelve a desplegar (Redeploy) para que las funciones las
lean.

## 4. Cómo funciona la seguridad

- El navegador **nunca** ve `SUPABASE_SERVICE_ROLE_KEY` ni `ADMIN_PASSWORD` — viven
  solo en `process.env` dentro de las funciones serverless.
- `/admin.html` pide la contraseña; si es correcta, el servidor entrega una
  cookie `httpOnly` firmada (no accesible por JavaScript) válida 12 horas. Todas
  las rutas de escritura (`/api/admin/products`, `/api/admin/upload`) exigen esa
  cookie.
- La tabla `products` tiene Row Level Security activado: el público (`anon`)
  solo puede leer (`SELECT`). Crear, editar y borrar solo lo puede hacer la
  service role key, que se usa exclusivamente dentro de `/api/admin/*`.
- El servidor valida que `categoria` sea `trajes` o `esenciales`, y que
  `subcategoria` corresponda a esa categoría (ver `api/_lib/categories.js` y el
  `check` constraint en `sql/schema.sql`) — aunque alguien manipule el panel,
  la base de datos rechaza combinaciones inválidas.
- `admin.html` no aparece en `sitemap.xml`, está bloqueado en `robots.txt`, trae
  `<meta name="robots" content="noindex">` y además el header `X-Robots-Tag`
  (ver `vercel.json`).

## 5. Estructura de archivos nueva

```
sql/schema.sql              Tabla products + RLS + policies
sql/seed.sql                Productos iniciales migrados desde el HTML
api/products.js             GET público (con ?categoria=trajes|esenciales)
api/admin/login.js          POST — valida ADMIN_PASSWORD, setea cookie de sesión
api/admin/logout.js         POST — borra la cookie
api/admin/session.js        GET — ¿hay sesión activa?
api/admin/products.js       POST/PUT/DELETE — requieren sesión
api/admin/upload.js         POST — sube imagen a Storage, requiere sesión
api/_lib/*.js                Helpers compartidos (auth, clientes de Supabase, categorías)
admin.html                  Panel administrativo
```

## 6. Uso del panel

1. Entra a `https://tu-dominio/admin.html`.
2. Ingresa la contraseña (`ADMIN_PASSWORD`).
3. "+ Agregar Producto" para crear uno nuevo: nombre, precio, categoría,
   subcategoría, foto (se comprime automáticamente en el navegador antes de
   subirse) y los interruptores "Agotado" / "Destacado".
4. Desde la lista puedes: cambiar "Agotado" con el interruptor rápido, "Editar"
   (abre el mismo formulario con los datos cargados) o "Eliminar" (pide
   confirmación).
5. Los cambios se reflejan en `index.html`, `swim.html` e `invisible.html` en
   cuanto recargas esas páginas (la API tiene un caché corto de 30s).

## 7. Validaciones

### Fase 1 — API (con `vercel dev` local o ya desplegado)
1. `GET /api/products` responde `200` con `{ ok: true, products: [...] }`.
2. `GET /api/products?categoria=trajes` solo trae productos de esa categoría.
3. `GET /api/products?categoria=algo-invalido` responde `400`.
4. `POST /api/admin/products` sin haber iniciado sesión responde `401`.
5. `POST /api/admin/login` con la contraseña correcta responde `200` y setea
   la cookie `mms_admin` (revisa en DevTools → Application → Cookies que sea
   `HttpOnly`).
6. `POST /api/admin/login` con contraseña incorrecta responde `401`.

### Fase 2 — Panel `/admin.html`
7. Entrar con contraseña incorrecta muestra el error sin dejar entrar.
8. Entrar con la contraseña correcta muestra la lista de productos del seed.
9. Crear un producto nuevo con foto: aparecen los estados "Comprimiendo
   imagen…" → "Subiendo imagen…" → "Imagen lista.", y luego "Guardando…" al
   guardar. Aparece en la lista con su foto.
10. Editar ese producto (cambiar precio o categoría) y confirmar que se
    actualiza en la lista.
11. Alternar el interruptor "Agotado" desde la lista sin abrir el formulario:
    cambia el badge a "Agotado" al instante.
12. Eliminar un producto: pide confirmación; al confirmar, desaparece de la
    lista.
13. Cerrar sesión y recargar `/admin.html`: vuelve a pedir contraseña.
14. Repetir 7–13 desde el celular (Chrome/Safari) para confirmar que es
    usable en móvil.

### Fase 3 — Storefront
15. `swim.html` muestra los productos de `categoria=trajes`; los filtros
    (Bikinis/Enterizos/Cover-Ups/Resort Wear) ahora sí ocultan y muestran
    productos según `subcategoria`.
16. `invisible.html` muestra los productos de `categoria=esenciales` con el
    mismo comportamiento de filtros.
17. `index.html` muestra en "The Vacation Edit" y en la franja de Esenciales
    Invisibles los productos marcados `destacado=true` (o los más recientes
    si faltan para completar 4).
18. Un producto marcado "Agotado" desde el panel muestra el badge "AGOTADO" y
    se ve atenuado en `index.html`, `swim.html` e `invisible.html`.
19. Desconecta a propósito una variable de entorno (o revisa con la consola
    de red que `/api/products` falle) y confirma que las tres páginas igual
    muestran productos de respaldo (los que ya estaban escritos a mano) sin
    verse rotas.
20. Sube una foto de celular sin comprimir manualmente (varios MB) y confirma
    que el panel la comprime sola y la subida no falla por tamaño.

## 8. Commit

Cuando confirmes lo anterior, aviso y hago:

```
git add <archivos nuevos y modificados>
git commit -m "Panel administrativo + productos dinámicos"
git push
```
