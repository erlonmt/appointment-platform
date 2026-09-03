begin;

-- Organização, unidade, profissional, cliente e serviço usados no teste.

insert into public.organizations (
  id,
  name,
  slug,
  timezone
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Organização Teste',
  'appointments-test',
  'America/Recife'
);

insert into public.units (
  id,
  organization_id,
  name
)
values (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Unidade Teste'
);

insert into public.professionals (
  id,
  organization_id,
  name
)
values (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000001',
  'Profissional Teste'
);

insert into public.customers (
  id,
  organization_id,
  name,
  phone
)
values (
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000001',
  'Cliente Teste',
  '81999999999'
);

insert into public.services (
  id,
  organization_id,
  name,
  price_cents,
  duration_minutes
)
values (
  '00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000001',
  'Corte Teste',
  3500,
  60
);

insert into public.professional_units (
  organization_id,
  professional_id,
  unit_id
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000101'
);

insert into public.professional_services (
  organization_id,
  professional_id,
  service_id
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000401'
);

-- Primeiro agendamento válido

insert into public.appointments (
  id,
  organization_id,
  unit_id,
  professional_id,
  customer_id,
  status,
  confirmation_mode,
  scheduled_start_at,
  scheduled_end_at,
  expected_amount_cents
)
values (
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000301',
  'confirmed',
  'automatic',
  '2026-01-15 10:00:00-03',
  '2026-01-15 11:00:00-03',
  3500
);

insert into public.appointment_services (
  organization_id,
  appointment_id,
  service_id,
  service_name_snapshot,
  price_cents_snapshot,
  duration_minutes_snapshot,
  buffer_minutes_snapshot
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000401',
  'Corte Teste',
  3500,
  60,
  0
);

-- Um horário sobreposto deve ser rejeitado.

do $$
begin
  begin
    insert into public.appointments (
      organization_id,
      unit_id,
      professional_id,
      customer_id,
      status,
      confirmation_mode,
      scheduled_start_at,
      scheduled_end_at,
      expected_amount_cents
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000301',
      'confirmed',
      'automatic',
      '2026-01-15 10:30:00-03',
      '2026-01-15 11:30:00-03',
      3500
    );

    raise exception 'Teste falhou: sobreposição foi aceita';
  exception
    when exclusion_violation then
      raise notice 'Teste passou: sobreposição foi rejeitada';
  end;
end;
$$;

-- Um agendamento manual pendente precisa de expires_at

do $$
begin
  begin
    insert into public.appointments (
      organization_id,
      unit_id,
      professional_id,
      customer_id,
      status,
      confirmation_mode,
      scheduled_start_at,
      scheduled_end_at,
      expected_amount_cents
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000301',
      'pending',
      'manual',
      '2026-01-15 12:00:00-03',
      '2026-01-15 13:00:00-03',
      3500
    );

    raise exception 'Teste falhou: reserva manual sem expiração foi aceita';
  exception
    when check_violation then
      raise notice 'Teste passou: expiração manual foi exigida';
  end;
end;
$$;

-- Atendimento concluído, adjacente ao primeiro horário.

insert into public.appointments (
  id,
  organization_id,
  unit_id,
  professional_id,
  customer_id,
  status,
  confirmation_mode,
  scheduled_start_at,
  scheduled_end_at,
  actual_start_at,
  actual_end_at,
  expected_amount_cents,
  final_amount_cents,
  completed_at
)
values (
  '00000000-0000-4000-8000-000000000504',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000301',
  'completed',
  'automatic',
  '2026-01-15 11:00:00-03',
  '2026-01-15 12:00:00-03',
  '2026-01-15 11:00:00-03',
  '2026-01-15 12:00:00-03',
  3500,
  4000,
  '2026-01-15 12:05:00-03'
);

insert into public.appointment_services (
  organization_id,
  appointment_id,
  service_id,
  service_name_snapshot,
  price_cents_snapshot,
  duration_minutes_snapshot,
  buffer_minutes_snapshot
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000504',
  '00000000-0000-4000-8000-000000000401',
  'Corte Teste',
  3500,
  60,
  0
);

select
  count(*) as appointments_created,
  count(*) filter (
    where status = 'completed'
  ) as completed_appointments,
  coalesce(
    sum(final_amount_cents) filter (
      where status = 'completed'
    ),
    0
  ) as revenue_cents
from public.appointments
where organization_id = '00000000-0000-4000-8000-000000000001';

rollback;
