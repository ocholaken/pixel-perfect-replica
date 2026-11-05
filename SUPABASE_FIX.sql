-- Run this in Supabase Dashboard > SQL Editor.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  user_name text,
  cake_name text,
  items jsonb DEFAULT '[]'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_email_created_at_idx ON public.orders (user_email, created_at DESC);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers read own orders" ON public.orders;
CREATE POLICY "Customers read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

DROP POLICY IF EXISTS "Customers create own orders" ON public.orders;
CREATE POLICY "Customers create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Atelier admin read all orders" ON public.orders;
CREATE POLICY "Atelier admin read all orders" ON public.orders
  FOR SELECT USING (lower(auth.jwt() ->> 'email') IN ('samuleumtiti12@gmail.com', 'ocholakenna1@gmail.com'));

DROP POLICY IF EXISTS "Atelier admin update orders" ON public.orders;
CREATE POLICY "Atelier admin update orders" ON public.orders
  FOR UPDATE USING (lower(auth.jwt() ->> 'email') IN ('samuleumtiti12@gmail.com', 'ocholakenna1@gmail.com'))
  WITH CHECK (lower(auth.jwt() ->> 'email') IN ('samuleumtiti12@gmail.com', 'ocholakenna1@gmail.com'));

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send atelier messages" ON public.messages;
CREATE POLICY "Anyone can send atelier messages" ON public.messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Atelier admin reads messages" ON public.messages;
CREATE POLICY "Atelier admin reads messages" ON public.messages
  FOR SELECT USING (lower(auth.jwt() ->> 'email') IN ('samuleumtiti12@gmail.com', 'ocholakenna1@gmail.com'));

DROP POLICY IF EXISTS "Atelier admin updates messages" ON public.messages;
CREATE POLICY "Atelier admin updates messages" ON public.messages
  FOR UPDATE USING (lower(auth.jwt() ->> 'email') IN ('samuleumtiti12@gmail.com', 'ocholakenna1@gmail.com'))
  WITH CHECK (lower(auth.jwt() ->> 'email') IN ('samuleumtiti12@gmail.com', 'ocholakenna1@gmail.com'));

DROP POLICY IF EXISTS "Atelier admin deletes messages" ON public.messages;
CREATE POLICY "Atelier admin deletes messages" ON public.messages
  FOR DELETE USING (lower(auth.jwt() ->> 'email') IN ('samuleumtiti12@gmail.com', 'ocholakenna1@gmail.com'));

-- In Supabase Dashboard > Authentication > Providers > Email, disable Confirm Email for testing.
