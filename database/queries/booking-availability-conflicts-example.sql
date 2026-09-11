with test_blocked_periods (
  organization_id,
  unit_id,
  professional_id,
  starts_at,
  ends_at
) as (
  values (
    '10000000-0000-4000-8000-000000000001'::uuid,
    '20000000-0000-4000-8000-000000000001'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    timestamptz '2026-09-14 14:00:00+00',
    timestamptz '2026-09-14 15:00:00+00'
  )
),
test_appointments (
  organization_id,
  professional_id,
  status,
  scheduled_start_at,
  scheduled_end_at
) as (
  values (
    '10000000-0000-4000-8000-000000000001'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    'confirmed'::public.appointment_status,
    timestamptz '2026-09-14 18:00:00+00',
    timestamptz '2026-09-14 19:00:00+00'
  )
),
working_periods as (
  select
    ar.organization_id,
    ar.unit_id,
    ar.professional_id,
    coalesce(u.timezone, o.timezone) as timezone,
    p.name as professional_name,
    date '2026-09-14' + ar.start_time as working_period_start,
    date '2026-09-14' + ar.end_time as working_period_end,
    coalesce(
      ps.duration_override_minutes,
      s.duration_minutes
    ) * interval '1 minute' as service_duration,
    s.buffer_minutes * interval '1 minute' as service_buffer
  from public.availability_rules as ar
  inner join public.professionals as p
    on p.organization_id = ar.organization_id
    and p.id = ar.professional_id
  inner join public.professional_units as pu
    on pu.organization_id = ar.organization_id
    and pu.professional_id = ar.professional_id
    and pu.unit_id = ar.unit_id
  inner join public.professional_services as ps
    on ps.organization_id = ar.organization_id
    and ps.professional_id = ar.professional_id
  inner join public.services as s
    on s.organization_id = ps.organization_id
    and s.id = ps.service_id
  inner join public.units as u
    on u.organization_id = ar.organization_id
    and u.id = ar.unit_id
  inner join public.organizations as o
    on o.id = ar.organization_id
  where ar.organization_id =
      '10000000-0000-4000-8000-000000000001'
    and ar.unit_id =
      '20000000-0000-4000-8000-000000000001'
    and ar.professional_id =
      '30000000-0000-4000-8000-000000000001'
    and s.id =
      '40000000-0000-4000-8000-000000000001'
    and ar.weekday = extract(dow from date '2026-09-14')
    and ar.active = true
    and p.active = true
    and pu.active = true
    and ps.active = true
    and s.active = true
    and u.active = true
    and o.active = true
)
select
  wp.professional_name,
  slot.starts_at::time as appointment_start,
  (slot.starts_at + wp.service_duration)::time as appointment_end,
  (slot.starts_at + wp.service_duration + wp.service_buffer)::time as occupied_until
from working_periods as wp
cross join lateral generate_series(
  wp.working_period_start,
  wp.working_period_end - wp.service_duration - wp.service_buffer,
  interval '15 minutes'
) as slot(starts_at)
where not exists (
  select 1
  from test_blocked_periods as bp
  where bp.organization_id = wp.organization_id
    and bp.unit_id = wp.unit_id
    and (
      bp.professional_id is null
      or bp.professional_id = wp.professional_id
    )
    and bp.starts_at <
      (slot.starts_at at time zone wp.timezone)
      + wp.service_duration
      + wp.service_buffer
    and bp.ends_at >
      (slot.starts_at at time zone wp.timezone)
)
and not exists (
  select 1
  from test_appointments as a
  where a.organization_id = wp.organization_id
    and a.professional_id = wp.professional_id
    and a.status in (
      'pending',
      'confirmed',
      'in_progress',
      'completed'
    )
    and a.scheduled_start_at <
      (slot.starts_at at time zone wp.timezone)
      + wp.service_duration
      + wp.service_buffer
    and a.scheduled_end_at >
      (slot.starts_at at time zone wp.timezone)
)
order by slot.starts_at;
