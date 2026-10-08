-- Madam Maison du Soleil by Magda — Pedidos pagados con Stripe
-- Ejecutar en Supabase → SQL Editor. Se puede volver a ejecutar sin romper nada.
-- Las filas las crea solo /api/stripe-webhook (service role key) cuando Stripe
-- confirma el pago.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  stripe_session_id text not null unique,     -- evita duplicados si Stripe reintenta el webhook
  stripe_payment_intent text,
  estado text not null default 'pagado'
    check (estado in ('pagado', 'preparando', 'enviado', 'entregado', 'cancelado', 'reembolsado')),
  livemode boolean not null default false,    -- false = pedido de prueba (claves test)
  email text,
  nombre text,
  telefono text,
  direccion text,
  ciudad text,
  pais text,
  metodo_envio text check (metodo_envio in ('estandar', 'express')),
  items jsonb not null default '[]',          -- [{ id, nombre, talla, color, qty, precio, total, imagen }]
  subtotal numeric(10,2) not null,
  envio numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  moneda text not null default 'USD',
  email_enviado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_email_idx on public.orders (email);

-- Row Level Security activado y SIN policies: nadie con la anon key puede
-- leer ni escribir pedidos (tienen datos personales). Solo las funciones
-- serverless con la service role key, que siempre se salta RLS.
alter table public.orders enable row level security;
