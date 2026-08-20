-- ============================================================
-- GENVAULT — Supabase / PostgreSQL schema
-- Run this in Supabase SQL editor (or `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. ROLES / PROFILES
-- Supabase Auth already gives us auth.users (email, password,
-- id). We extend it with a profiles table that carries the role.
-- ------------------------------------------------------------
create type user_role as enum ('customer', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'customer', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- helper used everywhere in RLS policies below
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ------------------------------------------------------------
-- 2. CATALOG
-- ------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- Tees, Shirts, Hoodies, Jackets, Pants, Accessories
  slug text not null unique
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- Summer Archive, Y2K Vault, After Dark, Rare Finds
  slug text not null unique,
  description text,
  hero_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_paise integer not null check (price_paise >= 0), -- amount in paise (INR); ₹1 = 100 paise
  category_id uuid references categories(id) on delete set null,
  collection_id uuid references collections(id) on delete set null,
  size text,                          -- e.g. 'M', '32', 'One Size'
  condition text not null default 'Good' check (condition in ('Fair','Good','Excellent','One of One')),
  measurements jsonb,                 -- { pit_to_pit_in, length_in, waist_in, inseam_in }
  material text,
  era_style text,
  is_one_of_one boolean not null default false,
  stock integer not null default 1 check (stock >= 0),
  is_featured boolean not null default false,
  is_sold boolean not null default false,
  status text not null default 'draft' check (status in ('draft','live','sold','archived')),
  tags text[] default '{}',           -- ['Vintage','Y2K','New Drops']
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,         -- path inside the 'product-images' storage bucket
  position integer not null default 0,
  alt_text text,
  created_at timestamptz not null default now()
);

create index idx_products_category on products(category_id);
create index idx_products_collection on products(collection_id);
create index idx_products_status on products(status);
create index idx_product_images_product on product_images(product_id);

-- ------------------------------------------------------------
-- 3. ORDERS
-- ------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','paid','packed','shipped','delivered','cancelled')),
  subtotal_paise integer not null,   -- all _paise columns: INR paise, ₹1 = 100 paise
  shipping_paise integer not null default 0,
  total_paise integer not null,
  shipping_address jsonb,             -- { name, line1, line2, city, state, postal_code, country, phone }
  contact_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,   -- preserved even if product is later edited/deleted
  price_paise_snapshot integer not null,
  size text,
  quantity integer not null default 1 check (quantity > 0)
);

create index idx_orders_user on orders(user_id);
create index idx_order_items_order on order_items(order_id);

-- ------------------------------------------------------------
-- 4. WISHLIST
-- ------------------------------------------------------------
create table wishlist_items (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ------------------------------------------------------------
-- 5. BLOG / JOURNAL
-- ------------------------------------------------------------
create table blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,           -- Style, Thrift, Fashion Guides, Trends...
  slug text not null unique
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  category_id uuid references blog_categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content jsonb,                       -- rich-text/blocks JSON from the editor
  cover_image_url text,
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_blog_posts_status on blog_posts(status);

-- ------------------------------------------------------------
-- 6. updated_at trigger helper
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated_at before update on products
  for each row execute procedure set_updated_at();
create trigger trg_orders_updated_at before update on orders
  for each row execute procedure set_updated_at();
create trigger trg_blog_posts_updated_at before update on blog_posts
  for each row execute procedure set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table collections enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlist_items enable row level security;
alter table blog_categories enable row level security;
alter table blog_posts enable row level security;

-- profiles: a user can read/update their own row; admins can read all
create policy "profiles: self read" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles: self update" on profiles for update using (id = auth.uid());

-- categories / collections: public read, admin write
create policy "categories: public read" on categories for select using (true);
create policy "categories: admin write" on categories for all using (is_admin()) with check (is_admin());

create policy "collections: public read" on collections for select using (is_active or is_admin());
create policy "collections: admin write" on collections for all using (is_admin()) with check (is_admin());

-- products: public can see only 'live' products, admin sees/edits everything
create policy "products: public read live" on products for select using (status = 'live' or is_admin());
create policy "products: admin write" on products for all using (is_admin()) with check (is_admin());

create policy "product_images: public read" on product_images for select using (
  exists (select 1 from products p where p.id = product_id and (p.status = 'live' or is_admin()))
);
create policy "product_images: admin write" on product_images for all using (is_admin()) with check (is_admin());

-- orders: a customer can see/create their own orders; admin sees all
create policy "orders: owner read" on orders for select using (user_id = auth.uid() or is_admin());
create policy "orders: owner insert" on orders for insert with check (user_id = auth.uid() or is_admin());
create policy "orders: admin update" on orders for update using (is_admin());

create policy "order_items: owner read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
);
create policy "order_items: owner insert" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
);

-- wishlist: strictly the owning user
create policy "wishlist: owner all" on wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- blog: public reads published posts, admin sees/edits everything
create policy "blog_categories: public read" on blog_categories for select using (true);
create policy "blog_categories: admin write" on blog_categories for all using (is_admin()) with check (is_admin());

create policy "blog_posts: public read published" on blog_posts for select using (status = 'published' or is_admin());
create policy "blog_posts: admin write" on blog_posts for all using (is_admin()) with check (is_admin());

-- ============================================================
-- STORAGE (run in Supabase Storage settings or via SQL below)
-- ============================================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true)
  on conflict (id) do nothing;

create policy "product-images: public read" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product-images: admin write" on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());
create policy "product-images: admin update" on storage.objects for update
  using (bucket_id = 'product-images' and is_admin());
create policy "product-images: admin delete" on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());

create policy "blog-images: public read" on storage.objects for select
  using (bucket_id = 'blog-images');
create policy "blog-images: admin write" on storage.objects for insert
  with check (bucket_id = 'blog-images' and is_admin());
