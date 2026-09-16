import "server-only";

import type { QueryResultRow } from "pg";

import type { BookingTimeSlot } from "@/contracts/booking";

import { databasePool } from "@/lib/database";

interface BookingTimeSlotRow extends QueryResultRow {
  starts_at: Date;
  local_date: string;
  local_start_time: string;
  available_professionals: number;
}

export async function listBookingTimeSlotsByUnit(
  organizationId: string,
  unitId: string,
  serviceId: string,
  date: string,
): Promise<BookingTimeSlot[]> {
  const result = await databasePool.query<BookingTimeSlotRow>(
    `
      with working_periods as (
        select
          ar.organization_id,
          ar.unit_id,
          ar.professional_id,
          coalesce(u.timezone, o.timezone) as timezone,
          $4::date + ar.start_time as working_period_start,
          $4::date + ar.end_time as working_period_end,
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
        where ar.organization_id = $1::uuid
          and ar.unit_id = $2::uuid
          and s.id = $3::uuid
          and ar.weekday = extract(dow from $4::date)
          and ar.active = true
          and p.active = true
          and pu.active = true
          and ps.active = true
          and s.active = true
          and u.active = true
          and o.active = true
      )
      select
        (slot.starts_at at time zone wp.timezone) as starts_at,
        to_char(slot.starts_at, 'YYYY-MM-DD') as local_date,
        to_char(slot.starts_at, 'HH24:MI') as local_start_time,
        count(distinct wp.professional_id)::integer
          as available_professionals
      from working_periods as wp
      cross join lateral generate_series(
        wp.working_period_start,
        wp.working_period_end - wp.service_duration - wp.service_buffer,
        interval '15 minutes'
      ) as slot(starts_at)
      where (slot.starts_at at time zone wp.timezone)
        > statement_timestamp()
        and not exists (
          select 1
          from public.blocked_periods as bp
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
          from public.appointments as a
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
      group by slot.starts_at, wp.timezone
      order by slot.starts_at
    `,
    [organizationId, unitId, serviceId, date],
  );

  return result.rows.map((slot) => ({
    startsAt: slot.starts_at.toISOString(),
    localDate: slot.local_date,
    localStartTime: slot.local_start_time,
    availableProfessionals: slot.available_professionals,
  }));
}
