-- Run this once in Neon SQL Editor.
create extension if not exists pgcrypto;

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  reply_email text not null,
  product_slug text,
  product_name text,
  status text not null default 'novo',
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint inquiries_status_check check (status in ('novo', 'u-obradi', 'odgovoreno', 'zatvoreno'))
);

create index if not exists idx_inquiries_email_created
  on inquiries (reply_email, created_at desc);

create table if not exists inquiry_access_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists idx_tokens_email_created
  on inquiry_access_tokens (email, created_at desc);

create index if not exists idx_tokens_expires
  on inquiry_access_tokens (expires_at);

