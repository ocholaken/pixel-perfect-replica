create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric(12,2) not null check (price >= 0),
  image text not null default '',
  description text not null default '',
  flavours jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists image_url text;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid references public.customers(id),
  fulfilment text not null,
  delivery_location text not null default '',
  order_date date not null,
  pickup_time time,
  instructions text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  payment_method text not null default 'mpesa',
  payment_status text not null default 'pending',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.cake_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid references public.customers(id),
  cake_type text not null,
  size text not null,
  tiers integer not null default 1,
  number_of_tiers integer not null default 1,
  flavour text not null,
  frosting text,
  colour_theme text,
  design_notes text,
  personalised_message text,
  order_date date not null,
  pickup_time time,
  fulfilment text not null,
  delivery_location text,
  additional_instructions text,
  estimated_total numeric(12,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.cake_orders add column if not exists tiers integer not null default 1;
alter table public.cake_orders add column if not exists number_of_tiers integer not null default 1;

alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.cake_orders enable row level security;

drop policy if exists "Allow all products" on public.products;
create policy "Allow all products" on public.products for all using (true) with check (true);
drop policy if exists "Allow all customers" on public.customers;
create policy "Allow all customers" on public.customers for all using (true) with check (true);
drop policy if exists "Allow all orders" on public.orders;
create policy "Allow all orders" on public.orders for all using (true) with check (true);
drop policy if exists "Allow all cake_orders" on public.cake_orders;
create policy "Allow all cake_orders" on public.cake_orders for all using (true) with check (true);

insert into public.products (slug, name, category, price, image, description, flavours, sizes, sort_order) values
('birthday-bliss','Birthday Bliss Cake','Birthday Cakes',3800,'/images/cakes/birthday.jpg','A joyful celebration cake with silky vanilla cream and delicate decorations.','["Vanilla","Chocolate"]','["6 inch","8 inch","10 inch"]',1),
('chocolate-fudge','Chocolate Fudge Indulgence','Chocolate Cakes',4200,'/images/cakes/chocolate-fudge.jpg','Deep cocoa sponge, glossy fudge and elegant chocolate finishing.','["Dark chocolate","Milk chocolate"]','["6 inch","8 inch","10 inch"]',2),
('red-velvet','Classic Red Velvet','Red Velvet Cakes',4000,'/images/cakes/red-velvet.jpg','Velvety cocoa sponge paired with smooth cream cheese frosting.','["Red velvet"]','["6 inch","8 inch","10 inch"]',3),
('vanilla-berry','Vanilla Berry Garden','Vanilla Cakes',3900,'/images/cakes/vanilla-berry.jpg','Light vanilla sponge layered with berry preserve and vanilla cream.','["Vanilla","Strawberry vanilla"]','["6 inch","8 inch","10 inch"]',4),
('graduation-celebration','Graduation Celebration','Graduation Cakes',4500,'/images/cakes/graduation.jpg','A polished celebration cake designed to honour an unforgettable achievement.','["Vanilla","Chocolate","Red velvet"]','["8 inch","10 inch","12 inch"]',5),
('blush-wedding','Blush Wedding Cake','Wedding Cakes',12000,'/images/cakes/wedding-blush.jpg','Soft romantic tiers finished with refined florals and delicate detail.','["Vanilla","Red velvet","Lemon"]','["3 tiers","4 tiers","5 tiers"]',6),
('ivory-wedding','Ivory Elegance','Wedding Cakes',13500,'/images/cakes/wedding-ivory.jpg','A timeless ivory wedding cake for elegant, memorable celebrations.','["Vanilla","Chocolate","Almond"]','["3 tiers","4 tiers","5 tiers"]',7),
('custom-floral','Custom Floral Cake','Custom Celebration Cakes',4800,'/images/cakes/custom-floral.jpg','A bespoke cake finished with handcrafted floral details in your colour palette.','["Vanilla","Chocolate","Red velvet"]','["6 inch","8 inch","10 inch"]',8),
('silver-tier', 'Silver Tier - Fondant Wedding Cake', 'Wedding Cakes', 14000, '/images/cakes/Tra.jpg', 'Elegant 3-tier fondant wedding cake with soft blush roses and delicate gold detail. Includes 3-tier main cake (3kg), 2 side cakes, non-alcoholic wine, cake stand and cutlery.', 'Vanilla, Chocolate, Red Velvet'),
('celebration-cupcakes','Celebration Cupcake Box','Cupcakes',2600,'/images/cakes/cupcakes.jpg','A box of twelve beautifully finished celebration cupcakes.','["Vanilla","Chocolate","Red velvet"]','["12 cupcakes","24 cupcakes"]',9),
('baby-shower','Baby Shower Celebration','Baby Shower Cakes',4600,'/images/cakes/baby-shower.jpg','A soft, joyful cake finished for a memorable baby shower celebration.','["Vanilla","Lemon","Red velvet"]','["6 inch","8 inch","10 inch"]',10)
on conflict (slug) do nothing;
