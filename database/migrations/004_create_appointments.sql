begin;

create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
  'no_show',
  'expired'
);

alter table public.professional_units
  add column active boolean not null default true,
  add column updated_at timestamptz not null default now();

create trigger professional_units_set_updated_at
before update on public.professional_units
for each row
execute function public.set_updated_at();

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  unit_id uuid not null,
  professional_id uuid not null,
  customer_id uuid not null,
  status public.appointment_status not null,
  confirmation_mode public.confirmation_mode not null,
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz not null,
  scheduled_range tstzrange generated always as (
    tstzrange(scheduled_start_at, scheduled_end_at, '[)')
  ) stored,
  expires_at timestamptz,
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  expected_amount_cents integer not null,
  final_amount_cents integer,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint appointments_professional_unit_foreign_key
    foreign key (organization_id, professional_id, unit_id)
    references public.professional_units (
      organization_id,
      professional_id,
      unit_id
    )
    on delete restrict,

  constraint appointments_customer_foreign_key
    foreign key (organization_id, customer_id)
    references public.customers (organization_id, id)
    on delete restrict,

  constraint appointments_schedule_order_valid
    check (scheduled_start_at < scheduled_end_at),

  constraint appointments_expected_amount_not_negative
    check (expected_amount_cents >= 0),

  constraint appointments_final_amount_not_negative
    check (final_amount_cents is null or final_amount_cents >= 0),

  constraint appointments_actual_period_valid
    check (
      actual_end_at is null
      or (
        actual_start_at is not null
        and actual_start_at < actual_end_at
      )
    ),

  constraint appointments_pending_requires_manual_confirmation
    check (
      status <> 'pending'
      or confirmation_mode = 'manual'
    ),

  constraint appointments_expired_requires_manual_confirmation
    check (
      status <> 'expired'
      or confirmation_mode = 'manual'
    ),

  constraint appointments_automatic_has_no_expiration
    check (
      confirmation_mode = 'manual'
      or expires_at is null
    ),

  constraint appointments_manual_pending_has_expiration
    check (
      confirmation_mode <> 'manual'
      or status <> 'pending'
      or expires_at is not null
    ),

  constraint appointments_expiration_after_creation
    check (
      expires_at is null
      or expires_at > created_at
    ),

  constraint appointments_completed_fields_required
    check (
      status <> 'completed'
      or (
        actual_start_at is not null
        and actual_end_at is not null
        and final_amount_cents is not null
        and completed_at is not null
      )
    ),

  constraint appointments_completion_time_valid
    check (
      completed_at is null
      or actual_end_at is null
      or completed_at >= actual_end_at
    ),

  constraint appointments_organization_id_id_unique
    unique (organization_id, id),

  constraint appointments_no_overlap
    exclude using gist (
      organization_id with =,
      professional_id with =,
      scheduled_range with &&
    )
    where (
      status in (
        'pending',
        'confirmed',
        'in_progress',
        'completed'
      )
    )
);

create table public.appointment_services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  appointment_id uuid not null,
  service_id uuid not null,
  service_name_snapshot text not null,
  price_cents_snapshot integer not null,
  duration_minutes_snapshot integer not null,
  buffer_minutes_snapshot integer not null,
  created_at timestamptz not null default now(),

  constraint appointment_services_appointment_foreign_key
    foreign key (organization_id, appointment_id)
    references public.appointments (organization_id, id)
    on delete cascade,

  constraint appointment_services_service_foreign_key
    foreign key (organization_id, service_id)
    references public.services (organization_id, id)
    on delete restrict,

  constraint appointment_services_name_not_blank
    check (btrim(service_name_snapshot) <> ''),

  constraint appointment_services_price_not_negative
    check (price_cents_snapshot >= 0),

  constraint appointment_services_duration_positive
    check (duration_minutes_snapshot > 0),

  constraint appointment_services_buffer_not_negative
    check (buffer_minutes_snapshot >= 0),

  constraint appointment_services_service_unique
    unique (organization_id, appointment_id, service_id)
);

create index appointments_unit_schedule_index
  on public.appointments (
    organization_id,
    unit_id,
    scheduled_start_at
  );

create index appointments_customer_history_index
  on public.appointments (
    organization_id,
    customer_id,
    scheduled_start_at desc
  );

create index appointments_revenue_index
  on public.appointments (
    organization_id,
    completed_at
  )
  where (status = 'completed');

create index appointments_pending_expiration_index
  on public.appointments (expires_at)
  where (status = 'pending');

create trigger appointments_set_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();

alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;

commit;
