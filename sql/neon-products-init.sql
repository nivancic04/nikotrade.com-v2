-- Run this in Neon SQL Editor to create product tables and seed existing products.
-- Image paths point to existing template images in /public/img/products.

create table if not exists products (
  id integer primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  short_description text not null,
  description text not null,
  scent text not null,
  material text not null,
  duration text not null,
  price_eur numeric(10, 2) not null,
  stock integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_category_check check (category in ('Automirisi', 'Sportska oprema', 'Case'))
);

create table if not exists product_images (
  product_id integer not null references products(id) on delete cascade,
  sort_order smallint not null default 0,
  image_url text not null,
  primary key (product_id, sort_order)
);

create index if not exists idx_products_category on products (category);
create index if not exists idx_products_featured on products (featured);
create index if not exists idx_product_images_product on product_images (product_id);

insert into products (
  id, slug, name, category, short_description, description, scent, material, duration, price_eur, stock, featured
)
values
  (1, 'dinamo-plavi-automiris', 'Dinamo Plavi Automiris', 'Automirisi', 'Personalizirani dres automiris u plavoj varijanti.', 'Premium automiris u obliku dresa kluba, sa postojanim mirisom i jacom zasicenoscu boje za dugotrajan vizualni dojam.', 'Ocean Breeze', 'Cellulose fiber + premium tinta', '30-45 dana', 8.90, 32, true),
  (2, 'slaven-belupo-automiris', 'Slaven Belupo Automiris', 'Automirisi', 'Klupski automiris sa prepoznatljivim detaljima.', 'Automiris dizajniran za navijace koji zele klupski identitet u automobilu. Vizual i miris ostaju stabilni kroz duzi period.', 'Fresh Citrus', 'Cellulose fiber + matte print', '25-40 dana', 8.50, 21, true),
  (3, 'personalizirani-dres-automiris', 'Personalizirani Dres Automiris', 'Automirisi', 'Model sa custom imenom i brojem.', 'Potpuno personaliziran model automirisa: birate boje, ime i broj. Idealan kao poklon ili promo artikl za timove.', 'Black Ice', 'Cellulose fiber + UV print', '30-50 dana', 9.90, 17, true),
  (4, 'sport-majica-performance', 'Sport Majica Performance', 'Sportska oprema', 'Lagana i prozracna majica za trening.', 'Majica od brzosuseceg materijala sa ergonomskim krojem. Namijenjena za intenzivne treninge i svakodnevno nosenje.', 'N/A', 'Polyester blend', 'N/A', 24.90, 58, false),
  (5, 'sportski-ruksak-team', 'Sportski Ruksak Team', 'Sportska oprema', 'Ruksak s vise pretinaca i jacim dnom.', 'Praktican ruksak za trening i putovanja. Ojacao podlogu, bocne dzepove i prostor za osnovnu opremu.', 'N/A', 'Water-resistant textile', 'N/A', 34.90, 14, false),
  (6, 'fitness-boca-pro', 'Fitness Boca Pro', 'Sportska oprema', 'Izolirana boca za trening i teretanu.', 'Kompaktna i cvrsta boca sa sigurnim zatvaranjem i minimalistickim izgledom. Lako odrzavanje i dugotrajna upotreba.', 'N/A', 'Stainless steel', 'N/A', 19.90, 40, false),
  (7, 'gravirana-casa-classic', 'Gravirana Casa Classic', 'Case', 'Staklena casa sa personaliziranom gravurom.', 'Elegantna casa sa preciznom gravurom po zelji. Pogodna za poklone, evente i posebne prigode.', 'N/A', 'Premium glass', 'N/A', 14.90, 27, false),
  (8, 'gravirana-casa-deluxe', 'Gravirana Casa Deluxe', 'Case', 'Deblje staklo i detaljna personalizacija.', 'Model vise klase sa jacim staklom i finijom obradom gravure. Namijenjen za premium poklone i setove.', 'N/A', 'Thick-cut crystal glass', 'N/A', 19.50, 11, false),
  (9, 'gravirani-set-case-2x', 'Gravirani Set Casa 2x', 'Case', 'Set od dvije case sa custom natpisom.', 'Par case sa uskladjenom gravurom, idealan za poklon set. Moguce kombinirati logo, ime i datum.', 'N/A', 'Premium glass set', 'N/A', 29.90, 9, false)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category,
  short_description = excluded.short_description,
  description = excluded.description,
  scent = excluded.scent,
  material = excluded.material,
  duration = excluded.duration,
  price_eur = excluded.price_eur,
  stock = excluded.stock,
  featured = excluded.featured,
  updated_at = now();

insert into product_images (product_id, sort_order, image_url)
select
  p.id as product_id,
  i.sort_order,
  i.image_url
from products p
cross join (
  values
    (0, '/img/products/placeholder-product.svg'),
    (1, '/img/products/placeholder-product-alt.svg'),
    (2, '/img/products/placeholder-product-tertiary.svg')
) as i(sort_order, image_url)
on conflict (product_id, sort_order) do update set
  image_url = excluded.image_url;
