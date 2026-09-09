import "server-only";

import type { QueryResultRow } from "pg";

import type { ConfirmationMode } from "@/data-access/professionals";
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
