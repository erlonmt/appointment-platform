begin;

insert into public.organizations (
  id,
  name,
  slug,
  timezone
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Organização Teste',
  'availability-test',
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

insert into public.availability_rules (
  organization_id,
  professional_id,
  unit_id,
  weekday,
  start_time,
  end_time
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101',
    1,
    '10:00',
    '12:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101',
    1,
    '12:00',
    '14:00'
  );

do $$
begin
  begin
    insert into public.availability_rules (
      organization_id,
      professional_id,
      unit_id,
      weekday,
      start_time,
      end_time
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000101',
      1,
      '11:00',
      '13:00'
    );

    raise exception 'Teste falhou: horário sobreposto foi aceito';
  exception
    when exclusion_violation then
      raise notice 'Teste passou: horário sobreposto foi rejeitado';
  end;
end;
$$;

select
  weekday,
  start_time,
  end_time,
  time_range
from public.availability_rules
order by start_time;

rollback;
