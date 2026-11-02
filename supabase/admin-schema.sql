-- Run in Supabase SQL editor with the service role.
alter table public.profiles add column if not exists phone text;
alter table public.orders add column if not exists user_id uuid references auth.users(id);
alter table public.orders add column if not exists user_email text;
alter table public.orders add column if not exists cake_name text;
alter table public.orders add column if not exists cake_type text;
alter table public.orders add column if not exists quantity integer default 1;
alter table public.orders add column if not exists price numeric;
alter table public.orders add column if not exists total numeric;
alter table public.orders add column if not exists delivery_date date;
alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists phone text;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  type text not null default 'footer' check (type in ('footer','inquiry')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;
create policy if not exists "contacts public insert" on public.contacts for insert to anon, authenticated with check (true);
create policy if not exists "contacts admin read" on public.contacts for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy if not exists "contacts admin update" on public.contacts for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy if not exists "contacts admin delete" on public.contacts for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
