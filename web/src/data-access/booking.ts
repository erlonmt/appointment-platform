import "server-only";

import type { QueryResultRow } from "pg";

import type { ConfirmationMode } from "@/contracts/professionals";
import { databasePool } from "@/lib/database";

export interface BookingProfessionalOption {
  serviceId: string;
  professionalId: string;
  professionalName: string;
  confirmationMode: ConfirmationMode;
  priceCents: number;
  durationMinutes: number;
  bufferMinutes: number;
}

interface BookingProfessionalOptionRow extends QueryResultRow {
  service_id: string;
  professional_id: string;
  professional_name: string;
  confirmation_mode: ConfirmationMode;
  price_cents: number;
  duration_minutes: number;
  buffer_minutes: number;
}

export async function listBookingProfessionalOptionsByUnit(
  organizationId: string,
  unitId: string,
): Promise<BookingProfessionalOption[]> {
  const result = await databasePool.query<BookingProfessionalOptionRow>(
    `
      select
        professional_services.service_id,
        professionals.id as professional_id,
        professionals.name as professional_name,
        professionals.confirmation_mode,
        coalesce(
          professional_services.price_override_cents,
          services.price_cents
        ) as price_cents,
        coalesce(
          professional_services.duration_override_minutes,
          services.duration_minutes
        ) as duration_minutes,
        services.buffer_minutes
      from public.professional_services
      inner join public.professionals
        on professionals.organization_id =
          professional_services.organization_id
        and professionals.id =
          professional_services.professional_id
      inner join public.professional_units
        on professional_units.organization_id =
          professionals.organization_id
        and professional_units.professional_id =
          professionals.id
      inner join public.services
        on services.organization_id =
          professional_services.organization_id
        and services.id =
          professional_services.service_id
      inner join public.units
        on units.organization_id =
          professional_units.organization_id
        and units.id =
          professional_units.unit_id
      inner join public.organizations
        on organizations.id =
          professional_services.organization_id
      where professional_services.organization_id = $1
        and professional_units.unit_id = $2
        and professional_services.active = true
        and professional_units.active = true
        and professionals.active = true
        and services.active = true
        and units.active = true
        and organizations.active = true
      order by
        professional_services.service_id,
        professionals.name,
        professionals.id
    `,
    [organizationId, unitId],
  );

  return result.rows.map((professional) => ({
    serviceId: professional.service_id,
    professionalId: professional.professional_id,
    professionalName: professional.professional_name,
    confirmationMode: professional.confirmation_mode,
    priceCents: professional.price_cents,
    durationMinutes: professional.duration_minutes,
    bufferMinutes: professional.buffer_minutes,
  }));
}

export async function listAvailableBookingProfessionalsByUnit(
  organizationId: string,
  unitId: string,
  serviceId: string,
  startsAt: string,
): Promise<BookingProfessionalOption[]> {
  const result = await databasePool.query<BookingProfessionalOptionRow>(
    `
      with context as (
        select
          coalesce(u.timezone, o.timezone) as timezone,
          (
            $4::timestamptz at time zone coalesce(u.timezone, o.timezone)
          )::date as local_date
        from public.units as u
        inner join public.organizations as o
          on o.id = u.organization_id
        where u.organization_id = $1::uuid
          and u.id = $2::uuid
          and u.active = true
          and o.active = true
      ),
      working_periods as (
        select
          ar.organization_id,
          ar.unit_id,
          ar.professional_id,
          ps.service_id,
          p.name as professional_name,
          p.confirmation_mode,
          coalesce(ps.price_override_cents, s.price_cents) as price_cents,
          coalesce(
            ps.duration_override_minutes,
            s.duration_minutes
          ) as duration_minutes,
          s.buffer_minutes,
          c.timezone,
          c.local_date + ar.start_time as working_period_start,
          c.local_date + ar.end_time as working_period_end
        from public.availability_rules as ar
        cross join context as c
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
        where ar.organization_id = $1::uuid
          and ar.unit_id = $2::uuid
          and s.id = $3::uuid
          and ar.weekday = extract(dow from c.local_date)
          and ar.active = true
          and p.active = true
          and pu.active = true
          and ps.active = true
          and s.active = true
      )
      select distinct
        wp.service_id,
        wp.professional_id,
        wp.professional_name,
        wp.confirmation_mode,
        wp.price_cents,
        wp.duration_minutes,
        wp.buffer_minutes
      from working_periods as wp
      cross join lateral generate_series(
        wp.working_period_start,
        wp.working_period_end
          - wp.duration_minutes * interval '1 minute'
          - wp.buffer_minutes * interval '1 minute',
        interval '15 minutes'
      ) as slot(starts_at)
      where (slot.starts_at at time zone wp.timezone) = $4::timestamptz
        and $4::timestamptz > statement_timestamp()
        and not exists (
          select 1
          from public.blocked_periods as bp
          where bp.organization_id = wp.organization_id
            and bp.unit_id = wp.unit_id
            and (
              bp.professional_id is null
              or bp.professional_id = wp.professional_id
            )
            and bp.starts_at < $4::timestamptz
              + wp.duration_minutes * interval '1 minute'
              + wp.buffer_minutes * interval '1 minute'
            and bp.ends_at > $4::timestamptz
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
            and a.scheduled_start_at < $4::timestamptz
              + wp.duration_minutes * interval '1 minute'
              + wp.buffer_minutes * interval '1 minute'
            and a.scheduled_end_at > $4::timestamptz
        )
      order by wp.professional_name, wp.professional_id
    `,
    [organizationId, unitId, serviceId, startsAt],
  );

  return result.rows.map((professional) => ({
    serviceId: professional.service_id,
    professionalId: professional.professional_id,
    professionalName: professional.professional_name,
    confirmationMode: professional.confirmation_mode,
    priceCents: professional.price_cents,
    durationMinutes: professional.duration_minutes,
    bufferMinutes: professional.buffer_minutes,
  }));
}
