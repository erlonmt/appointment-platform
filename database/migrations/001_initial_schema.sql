begin;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  timezone text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organizations_name_not_blank
    check (btrim(name) <> ''),

  constraint organizations_slug_not_blank
    check (btrim(slug) <> ''),

  constraint organizations_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  constraint organizations_timezone_not_blank
    check (btrim(timezone) <> ''),

  constraint organizations_slug_unique
    unique (slug)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  address text,
  timezone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint units_organization_foreign_key
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,

  constraint units_name_not_blank
    check (btrim(name) <> ''),

  constraint units_timezone_not_blank
    check (timezone is null or btrim(timezone) <> ''),

  constraint units_organization_id_id_unique
    unique (organization_id, id)
);

create unique index units_organization_name_unique
  on public.units (organization_id, lower(btrim(name)));

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

create trigger units_set_updated_at
before update on public.units
for each row
execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.units enable row level security;

commit;
