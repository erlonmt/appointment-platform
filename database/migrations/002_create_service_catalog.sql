begin;

create type public.confirmation_mode as enum (
  'automatic',
  'manual'
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  confirmation_mode public.confirmation_mode not null default 'automatic',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint professionals_organization_foreign_key
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,

  constraint professionals_name_not_blank
    check (btrim(name) <> ''),

  constraint professionals_organization_id_id_unique
    unique (organization_id, id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  description text,
  price_cents integer not null,
  duration_minutes integer not null,
  buffer_minutes integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint services_organization_foreign_key
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,

  constraint services_name_not_blank
    check (btrim(name) <> ''),

  constraint services_price_not_negative
    check (price_cents >= 0),

  constraint services_duration_positive
    check (duration_minutes > 0),

  constraint services_buffer_not_negative
    check (buffer_minutes >= 0),

  constraint services_organization_id_id_unique
    unique (organization_id, id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  phone text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customers_organization_foreign_key
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,

  constraint customers_name_not_blank
    check (btrim(name) <> ''),

  constraint customers_phone_not_blank
    check (btrim(phone) <> ''),

  constraint customers_email_not_blank
    check (email is null or btrim(email) <> ''),

  constraint customers_organization_id_id_unique
    unique (organization_id, id)
);

create table public.professional_units (
  organization_id uuid not null,
  professional_id uuid not null,
  unit_id uuid not null,
  created_at timestamptz not null default now(),

  constraint professional_units_primary_key
    primary key (organization_id, professional_id, unit_id),

  constraint professional_units_professional_foreign_key
    foreign key (organization_id, professional_id)
    references public.professionals (organization_id, id)
    on delete cascade,

  constraint professional_units_unit_foreign_key
    foreign key (organization_id, unit_id)
    references public.units (organization_id, id)
    on delete cascade
);

create table public.professional_services (
  organization_id uuid not null,
  professional_id uuid not null,
  service_id uuid not null,
  price_override_cents integer,
  duration_override_minutes integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint professional_services_primary_key
    primary key (organization_id, professional_id, service_id),

  constraint professional_services_professional_foreign_key
    foreign key (organization_id, professional_id)
    references public.professionals (organization_id, id)
    on delete cascade,

  constraint professional_services_service_foreign_key
    foreign key (organization_id, service_id)
    references public.services (organization_id, id)
    on delete cascade,

  constraint professional_services_price_not_negative
    check (price_override_cents is null or price_override_cents >= 0),

  constraint professional_services_duration_positive
    check (
      duration_override_minutes is null
      or duration_override_minutes > 0
    )
);

create unique index services_organization_name_unique
  on public.services (organization_id, lower(btrim(name)));

create index customers_organization_phone_index
  on public.customers (organization_id, phone);

create trigger professionals_set_updated_at
before update on public.professionals
for each row
execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

create trigger professional_services_set_updated_at
before update on public.professional_services
for each row
execute function public.set_updated_at();

alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.professional_units enable row level security;
alter table public.professional_services enable row level security;

commit;
