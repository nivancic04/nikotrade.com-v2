-- Run this in Neon SQL Editor to create/seed air-freshener showcase tables.
-- Number of rows in air_freshener_featured_products controls number of horizontal showcase sections.
-- This script is migration-safe for older version that used title/subtitle/cards.

create table if not exists air_freshener_clubs (
  id integer primary key,
  slug text not null unique,
  name text not null,
  short_label text not null,
  logo_image_url text not null,
  website_url text not null,
  logo_scale numeric(4,2) not null default 1.00,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists air_freshener_featured_products (
  id integer primary key,
  club_id integer not null references air_freshener_clubs(id) on delete cascade,
  images jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table air_freshener_featured_products
  add column if not exists images jsonb not null default '[]'::jsonb;

alter table air_freshener_clubs
  add column if not exists logo_scale numeric(4,2) not null default 1.00;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'air_freshener_featured_products'
      and column_name = 'cards'
  ) then
    update air_freshener_featured_products
    set images = coalesce(
      (
        select jsonb_agg(card ->> 'imageUrl')
        from jsonb_array_elements(cards) as card
        where jsonb_typeof(card) = 'object'
          and card ? 'imageUrl'
      ),
      '[]'::jsonb
    )
    where images = '[]'::jsonb
      and cards is not null;
  end if;
end $$;

alter table air_freshener_featured_products
  drop constraint if exists air_freshener_cards_array;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'air_freshener_images_array'
  ) then
    alter table air_freshener_featured_products
      add constraint air_freshener_images_array
      check (jsonb_typeof(images) = 'array');
  end if;
end $$;

alter table air_freshener_featured_products
  drop column if exists title,
  drop column if exists subtitle,
  drop column if exists cards;

create index if not exists idx_air_freshener_clubs_sort on air_freshener_clubs (sort_order, id);
create index if not exists idx_air_freshener_clubs_active on air_freshener_clubs (active);
create index if not exists idx_air_freshener_featured_sort on air_freshener_featured_products (sort_order, id);
create index if not exists idx_air_freshener_featured_active on air_freshener_featured_products (active);
create index if not exists idx_air_freshener_featured_club on air_freshener_featured_products (club_id);

insert into air_freshener_clubs (
  id, slug, name, short_label, logo_image_url, website_url, logo_scale, sort_order, active
)
values
  (
    1,
    'gnk-dinamo-zagreb',
    'GNK Dinamo Zagreb',
    'Dinamo',
    '/img/automirisi/klubovi/logotipi/dinamo.png',
    'https://shop.gnkdinamo.hr/hr/p/710/miris-za-auto-fresh',
    1.00,
    1,
    true
  ),
  (
    2,
    'nk-slaven-belupo',
    'NK Slaven Belupo',
    'Slaven Belupo',
    '/img/automirisi/klubovi/logotipi/slaven-belupo.png',
    'https://webshop.nk-slaven-belupo.hr/navijacki-rekviziti/slaven-belupo-automiris-detail',
    1.16,
    2,
    true
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  short_label = excluded.short_label,
  logo_image_url = excluded.logo_image_url,
  website_url = excluded.website_url,
  logo_scale = excluded.logo_scale,
  sort_order = excluded.sort_order,
  active = excluded.active,
  updated_at = now();

insert into air_freshener_featured_products (
  id, club_id, images, sort_order, active
)
values
  (
    1,
    1,
    '[
      "/img/automirisi/izlozba/dinamo-stadion.png",
      "/img/automirisi/izlozba/dinamo-auto.png",
      "/img/automirisi/izlozba/dinamo-kartoncic.png"
    ]'::jsonb,
    1,
    true
  ),
  (
    2,
    2,
    '[
      "/img/automirisi/izlozba/slaven-stadion.png",
      "/img/automirisi/izlozba/slaven-auto.png",
      "/img/automirisi/izlozba/slaven-kartoncic.png"
    ]'::jsonb,
    2,
    true
  )
on conflict (id) do update set
  club_id = excluded.club_id,
  images = excluded.images,
  sort_order = excluded.sort_order,
  active = excluded.active,
  updated_at = now();
