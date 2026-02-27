create extension if not exists "pgcrypto";

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  date timestamptz not null,
  price numeric not null,
  total_supply integer not null,
  created_at timestamptz not null default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  mint_address text not null unique,
  event_id uuid not null references events(id) on delete cascade,
  owner_wallet text not null,
  checked_in boolean not null default false,
  created_at timestamptz not null default now()
);
