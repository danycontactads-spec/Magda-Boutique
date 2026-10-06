-- Madam Maison du Soleil by Magda — Panel Administrativo
-- Ejecutar en Supabase → SQL Editor. Se puede volver a ejecutar sin romper nada
-- (por ejemplo, para agregar las columnas nuevas a una tabla ya creada).

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio numeric(10,2) not null check (precio >= 0),
  categoria text not null check (categoria in ('trajes', 'esenciales')),
  subcategoria text,
  imagen_url text,
  agotado boolean not null default false,
  destacado boolean not null default false,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- Detalles que se muestran en la ficha del producto (producto.html).
-- colores/tallas vacíos = la tienda usa tallas por defecto según subcategoría.
alter table public.products add column if not exists descripcion text;
alter table public.products add column if not exists etiqueta text;
alter table public.products add column if not exists colores text[] not null default '{}';
alter table public.products add column if not exists tallas text[] not null default '{}';

-- Restringe subcategoria a las opciones válidas de cada categoría
alter table public.products drop constraint if exists subcategoria_valida;
alter table public.products
  add constraint subcategoria_valida check (
    subcategoria is null
    or (categoria = 'trajes' and subcategoria in ('Bikinis', 'Enterizos', 'Cover-Ups', 'Resort Wear'))
    or (categoria = 'esenciales' and subcategoria in ('Bras Adhesivos', 'Cubre-Pezones', 'Bikini Pads', 'Boob Tape'))
  );

create index if not exists products_categoria_idx on public.products (categoria);
create index if not exists products_orden_idx on public.products (orden);

-- Row Level Security: el sitio público solo puede LEER.
-- Crear/editar/borrar solo lo hacen las funciones serverless con la
-- service role key, la cual siempre se salta RLS (por eso no hace
-- falta ninguna policy de insert/update/delete aquí).
alter table public.products enable row level security;

drop policy if exists "Lectura pública de productos" on public.products;
create policy "Lectura pública de productos"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- ── Storage: bucket público de imágenes de productos ──
-- Las subidas solo las hace /api/admin/upload con la service role key,
-- por eso no se agregan policies de insert/update/delete en storage.objects.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
