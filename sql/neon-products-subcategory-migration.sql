-- Add secondary filtering column for products.
alter table products
  add column if not exists subcategory text;

create index if not exists idx_products_subcategory
  on products (subcategory);

-- Optional example values:
-- update products set subcategory = 'Kompleti trenirka' where slug in ('komplet1', 'komplet2');
-- update products set subcategory = 'Stucne' where slug in ('stucne-pro', 'stucne-basic');
-- update products set subcategory = 'Torbe' where slug in ('sportski-ruksak-team');
