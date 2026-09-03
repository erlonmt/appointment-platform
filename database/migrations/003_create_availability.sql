begin;

create extension if not exists btree_gist;

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  unit_id uuid not null,
  professional_id uuid not null,
  weekday smallint not null,
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  time_range int4range generated always as (
    int4range(
      extract(epoch from start_time)::integer,
      extract(epoch from end_time)::integer,
      '[)'
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint availability_rules_professional_unit_foreign_key
    foreign key (organization_id, professional_id, unit_id)
    references public.professional_units (
      organization_id,
      professional_id,
      unit_id
    )
    on delete cascade,

  constraint availability_rules_weekday_valid
    check (weekday between 0 and 6),

  constraint availability_rules_time_order_valid
    check (start_time < end_time),

  constraint availability_rules_organization_id_id_unique
    unique (organization_id, id),

  constraint availability_rules_no_overlap
    exclude using gist (
      organization_id with =,
      professional_id with =,
      unit_id with =,
      weekday with =,
      time_range with &&
    )
    where (active)
);

create table public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  unit_id uuid not null,
  professional_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  blocked_range tstzrange generated always as (
    tstzrange(starts_at, ends_at, '[)')
  ) stored,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint blocked_periods_unit_foreign_key
    foreign key (organization_id, unit_id)
    references public.units (organization_id, id)
    on delete cascade,

  constraint blocked_periods_professional_unit_foreign_key
    foreign key (organization_id, professional_id, unit_id)
    references public.professional_units (
      organization_id,
      professional_id,
      unit_id
    )
    on delete cascade,

  constraint blocked_periods_time_order_valid
    check (starts_at < ends_at),

  constraint blocked_periods_reason_not_blank
    check (reason is null or btrim(reason) <> ''),

  constraint blocked_periods_organization_id_id_unique
    unique (organization_id, id)
);

create index availability_rules_lookup_index
  on public.availability_rules (
    organization_id,
    unit_id,
    professional_id,
    weekday
  )
  where (active);

create index blocked_periods_range_index
  on public.blocked_periods using gist (
    organization_id,
    unit_id,
    blocked_range
  );

create trigger availability_rules_set_updated_at
before update on public.availability_rules
for each row
execute function public.set_updated_at();

create trigger blocked_periods_set_updated_at
before update on public.blocked_periods
for each row
execute function public.set_updated_at();

alter table public.availability_rules enable row level security;
alter table public.blocked_periods enable row level security;

commit;