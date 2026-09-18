import "server-only";

import type { QueryResultRow } from "pg";
import type { CreateBookingRequest } from "@/contracts/booking";
import { listAvailableBookingProfessionalsByUnit } from "./booking";
import { databasePool } from "@/lib/database";

interface IdRow extends QueryResultRow {
  id: string;
}

interface ServiceRow extends QueryResultRow {
  name: string;
}

type ConflictKind = "unavailable" | "details_changed";

export type AutomaticBookingResult =
  | { kind: "created"; appointmentId: string }
  | { kind: "unavailable" }
  | { kind: "details_changed" };

class BookingConflict extends Error {
  constructor(readonly kind: ConflictKind) {
    super(kind);
  }
}

export async function createAutomaticBooking(
  organizationId: string,
  unitId: string,
  request: CreateBookingRequest,
): Promise<AutomaticBookingResult> {
  const client = await databasePool.connect();
  let discardClient = false;

  try {
    await client.query("BEGIN");

    const professional = await client.query(
      `
        select p.id
        from public.professionals as p
        inner join public.professional_units as pu
          on pu.organization_id = p.organization_id
          and pu.professional_id = p.id
        where p.organization_id = $1::uuid
          and p.id = $2::uuid
          and pu.unit_id = $3::uuid
          and p.active = true
          and pu.active = true
          and p.confirmation_mode = 'automatic'
        for update of p, pu
      `,
      [organizationId, request.professionalId, unitId],
    );

    if (professional.rowCount !== 1) {
      throw new BookingConflict("unavailable");
    }

    const service = await client.query<ServiceRow>(
      `
        select s.name
        from public.services as s
        inner join public.professional_services as ps
          on ps.organization_id = s.organization_id
          and ps.service_id = s.id
        where s.organization_id = $1::uuid
          and s.id = $2::uuid
          and ps.professional_id = $3::uuid
        for share of s, ps
      `,
      [organizationId, request.serviceId, request.professionalId],
    );

    const serviceName = service.rows[0]?.name;

    if (!serviceName) {
      throw new BookingConflict("unavailable");
    }

    const available = await listAvailableBookingProfessionalsByUnit(
      organizationId,
      unitId,
      request.serviceId,
      request.startsAt,
      client,
    );

    const selected = available.find(
      (option) => option.professionalId === request.professionalId,
    );

    if (!selected || selected.confirmationMode !== "automatic") {
      throw new BookingConflict("unavailable");
    }

    if (
      selected.priceCents !== request.quotedPriceCents ||
      selected.durationMinutes !== request.quotedDurationMinutes
    ) {
      throw new BookingConflict("details_changed");
    }

    const customer = await client.query<IdRow>(
      `
        insert into public.customers (
          organization_id, name, phone, email
        )
        values ($1::uuid, $2, $3, $4)
        returning id
      `,
      [
        organizationId,
        request.customer.name,
        request.customer.phone,
        request.customer.email,
      ],
    );

    const customerId = customer.rows[0]?.id;

    if (!customerId) {
      throw new Error("Cliente não foi criado.");
    }

    const appointment = await client.query<IdRow>(
      `
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
          $1::uuid,
          $2::uuid,
          $3::uuid,
          $4::uuid,
          'confirmed',
          'automatic',
          $5::timestamptz,
          $5::timestamptz
            + $6::integer * interval '1 minute'
            + $7::integer * interval '1 minute',
          $8::integer
        )
        returning id
      `,
      [
        organizationId,
        unitId,
        request.professionalId,
        customerId,
        request.startsAt,
        selected.durationMinutes,
        selected.bufferMinutes,
        selected.priceCents,
      ],
    );

    const appointmentId = appointment.rows[0]?.id;

    if (!appointmentId) {
      throw new Error("Agendamento não foi criado.");
    }

    await client.query(
      `
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
          $1::uuid, $2::uuid, $3::uuid, $4, $5::integer, $6::integer, $7::integer
        )
      `,
      [
        organizationId,
        appointmentId,
        request.serviceId,
        serviceName,
        selected.priceCents,
        selected.durationMinutes,
        selected.bufferMinutes,
      ],
    );

    await client.query("COMMIT");

    return { kind: "created", appointmentId };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      discardClient = true;
    }

    if (error instanceof BookingConflict) {
      return { kind: error.kind };
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23P01"
    ) {
      return { kind: "unavailable" };
    }

    throw error;
  } finally {
    client.release(discardClient);
  }
}
