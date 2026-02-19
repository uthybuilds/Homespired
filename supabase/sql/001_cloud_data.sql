-- Extensions
create extension if not exists pgcrypto;

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_reviews_product_created
  on public.reviews (product_id, created_at desc);
alter table public.reviews enable row level security;
create policy if not exists reviews_select on public.reviews
  for select using (true);
create policy if not exists reviews_insert_anon on public.reviews
  for insert to anon with check (true);
create policy if not exists reviews_insert_auth on public.reviews
  for insert to authenticated with check (true);
create policy if not exists reviews_delete_admin on public.reviews
  for delete to authenticated
  using (lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com');

-- Profiles for checkout prefill
create table if not exists public.profiles (
  email text primary key,
  name text default '',
  phone text default '',
  address text default '',
  city text default '',
  state text default '',
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy if not exists profiles_select on public.profiles
  for select using (true);
create policy if not exists profiles_insert_guest on public.profiles
  for insert with check (true);
create policy if not exists profiles_update_guest on public.profiles
  for update using (true) with check (true);

-- Signed-in carts
create table if not exists public.carts (
  user_id uuid primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.carts enable row level security;
create policy if not exists carts_select_owner on public.carts
  for select to authenticated
  using (auth.uid() = user_id);
create policy if not exists carts_upsert_owner on public.carts
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy if not exists carts_update_owner on public.carts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Guest carts (service role via edge function)
create table if not exists public.carts_guest (
  token text primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Requests
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  type text default 'request',
  payload jsonb not null default '{}'::jsonb,
  status text default 'Pending',
  number bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.requests enable row level security;
create policy if not exists requests_insert_anon on public.requests
  for insert to anon with check (true);
create policy if not exists requests_select_admin on public.requests
  for select to authenticated
  using (lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com');
create policy if not exists requests_update_admin on public.requests
  for update to authenticated
  using (lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com');

-- Global counters + RPC
create table if not exists public.counters (
  key text primary key,
  value bigint not null default 0
);
insert into public.counters(key, value)
  values ('order', 0), ('request', 0)
on conflict (key) do nothing;
alter table public.counters enable row level security;
create policy if not exists counters_select_admin on public.counters
  for select to authenticated
  using (lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com');
create policy if not exists counters_update_admin on public.counters
  for update to authenticated
  using (lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'uthmanajanaku@gmail.com');

create or replace function public.next_counter(p_key text)
returns bigint
language plpgsql
as $$
declare
  new_val bigint;
begin
  update public.counters
     set value = value + 1
   where key = p_key
  returning value into new_val;

  if not found then
    insert into public.counters(key, value) values (p_key, 1)
    returning value into new_val;
  end if;

  return new_val;
end;
$$;
