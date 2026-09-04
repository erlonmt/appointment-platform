begin;

insert into public.organizations (
  id,
  name,
  slug,
  timezone
)
values (
  '10000000-0000-4000-8000-000000000001',
  'Barbearia Modelo',
  'barbearia-modelo',
  'America/Recife'
)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  timezone = excluded.timezone,
  active = true,
  updated_at = now();

insert into public.units (
  id,
  organization_id,
  name,
  address
)
values (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Unidade Centro',
  'Endereço de demonstração'
)
on conflict (id) do update
set
  name = excluded.name,
  address = excluded.address,
  active = true,
  updated_at = now();

insert into public.professionals (
  id,
  organization_id,
  name,
  confirmation_mode
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Alexandre',
    'automatic'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Bruno',
    'manual'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'Carlos',
    'automatic'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    'Diego',
    'manual'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    'Eduardo',
    'automatic'
  )
on conflict (id) do update
set
  name = excluded.name,
  confirmation_mode = excluded.confirmation_mode,
  active = true,
  updated_at = now();

insert into public.services (
  id,
  organization_id,
  name,
  description,
  price_cents,
  duration_minutes,
  buffer_minutes
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Corte',
    'Corte de cabelo',
    3500,
    45,
    5
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Barba',
    'Modelagem e acabamento da barba',
    2500,
    30,
    5
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'Sobrancelha',
    'Acabamento de sobrancelha',
    1500,
    20,
    0
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    'Progressiva',
    'Tratamento e alinhamento dos fios',
    12000,
    120,
    15
  ),
  (
    '40000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    'Luzes',
    'Aplicação de luzes',
    15000,
    150,
    15
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  duration_minutes = excluded.duration_minutes,
  buffer_minutes = excluded.buffer_minutes,
  active = true,
  updated_at = now();

insert into public.customers (
  id,
  organization_id,
  name,
  phone,
  email
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Maria da Silva',
    '81999990001',
    'maria@example.com'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'João Santos',
    '81999990002',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'Ana Oliveira',
    '81999990003',
    'ana@example.com'
  )
on conflict (id) do update
set
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  updated_at = now();

insert into public.professional_units (
  organization_id,
  professional_id,
  unit_id
)
select
  '10000000-0000-4000-8000-000000000001',
  professionals.id,
  '20000000-0000-4000-8000-000000000001'
from public.professionals
where organization_id = '10000000-0000-4000-8000-000000000001'
on conflict (
  organization_id,
  professional_id,
  unit_id
) do update
set
  active = true,
  updated_at = now();

insert into public.professional_services (
  organization_id,
  professional_id,
  service_id
)
select
  professionals.organization_id,
  professionals.id,
  services.id
from public.professionals
cross join public.services
where professionals.organization_id =
    '10000000-0000-4000-8000-000000000001'
  and services.organization_id =
    '10000000-0000-4000-8000-000000000001'
  and services.id in (
    '40000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000003'
  )
on conflict (
  organization_id,
  professional_id,
  service_id
) do update
set
  active = true,
  updated_at = now();

insert into public.professional_services (
  organization_id,
  professional_id,
  service_id
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000004'
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000004'
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000005'
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000005'
  )
on conflict (
  organization_id,
  professional_id,
  service_id
) do update
set
  active = true,
  updated_at = now();

insert into public.availability_rules (
  organization_id,
  unit_id,
  professional_id,
  weekday,
  start_time,
  end_time
)
select
  professionals.organization_id,
  '20000000-0000-4000-8000-000000000001',
  professionals.id,
  weekdays.weekday,
  schedules.start_time,
  schedules.end_time
from public.professionals
cross join generate_series(1, 6) as weekdays(weekday)
cross join (
  values
    ('10:00'::time, '13:00'::time),
    ('14:00'::time, '20:00'::time)
) as schedules(start_time, end_time)
where professionals.organization_id =
    '10000000-0000-4000-8000-000000000001'
on conflict do nothing;

commit;
