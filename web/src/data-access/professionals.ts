import "server-only";

import type { QueryResultRow } from "pg";

import { databasePool } from "@/lib/database";

export type ConfirmationMode = "automatic" | "manual";

export interface ProfessionalSummary {
  id: string;
  name: string;
  confirmationMode: ConfirmationMode;
  services: string[];
}

interface ProfessionalRow extends QueryResultRow {
  id: string;
  name: string;
  confirmation_mode: ConfirmationMode;
  services: string[];
}

export async function listActiveProfessionalsByOrganization(
  organizationId: string,
): Promise<ProfessionalSummary[]> {
  const result = await databasePool.query<ProfessionalRow>(
    `
      select
        professionals.id,
        professionals.name,
        professionals.confirmation_mode,
        coalesce(
          array_agg(services.name order by services.name)
            filter (where services.id is not null),
          '{}'::text[]
        ) as services
      from public.professionals
      left join public.professional_services
        on professional_services.organization_id =
          professionals.organization_id
        and professional_services.professional_id = professionals.id
        and professional_services.active = true
      left join public.services
        on services.organization_id =
          professional_services.organization_id
        and services.id = professional_services.service_id
        and services.active = true
      where professionals.organization_id = $1
        and professionals.active = true
      group by
        professionals.id,
        professionals.name,
        professionals.confirmation_mode
      order by professionals.name
    `,
    [organizationId],
  );

  return result.rows.map((professional) => ({
    id: professional.id,
    name: professional.name,
    confirmationMode: professional.confirmation_mode,
    services: professional.services,
  }));
}
