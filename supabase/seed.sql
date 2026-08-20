-- ============================================================
-- GENVAULT — sample seed data (matches the frontend demo)
-- Run AFTER schema.sql. Safe to re-run (uses upserts by slug).
-- ============================================================

insert into categories (name, slug) values
  ('Tees', 'tees'), ('Shirts', 'shirts'), ('Hoodies', 'hoodies'),
  ('Jackets', 'jackets'), ('Pants', 'pants'), ('Accessories', 'accessories')
on conflict (slug) do nothing;

insert into collections (name, slug, description, is_active) values
  ('Summer Archive', 'summer-archive', 'Lightweight pieces, relaxed silhouettes.', true),
  ('Y2K Vault', 'y2k-vault', 'Vintage-inspired, low-rise, chrome era.', true),
  ('After Dark', 'after-dark', 'Oversized fits, deep tonal layering.', true),
  ('Rare Finds', 'rare-finds', 'One-of-one pieces. Once gone, gone.', true)
on conflict (slug) do nothing;

insert into blog_categories (name, slug) values
  ('Style', 'style'), ('Thrift', 'thrift'), ('Fashion Guides', 'fashion-guides'),
  ('Trends', 'trends'), ('GenVault Stories', 'genvault-stories'),
  ('Outfit Inspiration', 'outfit-inspiration'), ('Sustainability', 'sustainability')
on conflict (slug) do nothing;

-- sample products — prices in paise (₹1 = 100 paise), matching GenVault.jsx
insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Oversized Flannel — 90s Wash', 'oversized-flannel-90s-wash',
  'A washed-out flannel with a worn-in softness you can''t fake new.',
  129900, c.id, 'Excellent', 'M', false, 3, true, 'live', '{Vintage}', 'Cotton flannel', '90s'
from categories c where c.slug = 'shirts'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Vault Cargo Pants', 'vault-cargo-pants',
  'Utility cargo pants with reinforced knees and a relaxed drop.',
  179900, c.id, 'Good', '32', false, 2, false, 'live', '{New Drops}', 'Cotton twill', 'Contemporary'
from categories c where c.slug = 'pants'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Y2K Zip Hoodie', 'y2k-zip-hoodie',
  'Full-zip hoodie with a chrome-era silhouette.',
  159900, c.id, 'Excellent', 'L', false, 4, true, 'live', '{Y2K}', 'Cotton-poly blend', 'Y2K'
from categories c where c.slug = 'hoodies'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Archive Tee — Blank 90s', 'archive-tee-blank-90s',
  'A blank single-stitch tee, the kind that doesn''t get made anymore.',
  69900, c.id, 'Good', 'M', false, 6, true, 'live', '{Vintage}', 'Cotton', '90s'
from categories c where c.slug = 'tees'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Silver Buckle Jacket', 'silver-buckle-jacket',
  'One physical piece. Metallic finish, buckle hardware, nothing else like it.',
  499900, c.id, 'One of One', 'L', true, 1, true, 'live', '{Rare}', 'Faux leather', 'Contemporary'
from categories c where c.slug = 'jackets'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Faded Denim Trucker', 'faded-denim-trucker',
  'Sun-faded trucker jacket, broken in the right way.',
  219900, c.id, 'Excellent', 'M', false, 2, false, 'live', '{Vintage}', 'Denim', 'Vintage'
from categories c where c.slug = 'jackets'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Wide Leg Trousers', 'wide-leg-trousers',
  'Drapey wide-leg trousers built for a relaxed daily uniform.',
  134900, c.id, 'Good', '30', false, 3, false, 'live', '{New Drops}', 'Cotton blend', 'Contemporary'
from categories c where c.slug = 'pants'
on conflict (slug) do nothing;

insert into products (name, slug, description, price_paise, category_id, condition, size, is_one_of_one, stock, is_featured, status, tags, material, era_style)
select
  'Mesh Layer Longsleeve', 'mesh-layer-longsleeve',
  'Sheer mesh longsleeve made for layering.',
  89900, c.id, 'Excellent', 'S', false, 1, false, 'live', '{Y2K}', 'Nylon mesh', 'Y2K'
from categories c where c.slug = 'tees'
on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, category_id, status, published_at, tags)
select
  'Why Thrifted Pieces Hit Different', 'why-thrifted-pieces-hit-different',
  'The case for clothes with a past — and how to find the ones worth keeping.',
  bc.id, 'published', now(), '{Thrift}'
from blog_categories bc where bc.slug = 'thrift'
on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, category_id, status, published_at, tags)
select
  '5 Ways to Style Oversized Tees', '5-ways-to-style-oversized-tees',
  'Proportion rules for making one tee do five different jobs.',
  bc.id, 'published', now(), '{Style}'
from blog_categories bc where bc.slug = 'style'
on conflict (slug) do nothing;
