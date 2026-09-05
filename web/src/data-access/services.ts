import "server-only";

import type { QueryResultRow } from "pg";

import { databasePool } from "@/lib/database";

export interface ServiceSummary {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
  bufferMinutes: number;
}

interface ServiceRow extends QueryResultRow {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes: number;
  buffer_minutes: number;
}

export async function listActiveServicesByOrganization(
  organizationId: string,
): Promise<ServiceSummary[]> {
  const result = await databasePool.query<ServiceRow>(
    `
      select
        id,
        name,
        price_cents,
        duration_minutes,
        buffer_minutes
      from public.services
      where organization_id = $1
        and active = true
      order by name
    `,
    [organizationId],
  );

  return result.rows.map((service) => ({
    id: service.id,
    name: service.name,
    priceCents: service.price_cents,
    durationMinutes: service.duration_minutes,
    bufferMinutes: service.buffer_minutes,
  }));
}
