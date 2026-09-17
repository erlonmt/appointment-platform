import type { NextRequest } from "next/server";

import { DEMO_ORGANIZATION_ID, DEMO_UNIT_ID } from "@/config/demo";
import { listAvailableBookingProfessionalsByUnit } from "@/data-access/booking";
import { isValidStartsAt, isValidUuid } from "@/lib/booking-validation";
import type { BookingProfessionalsResponse } from "@/contracts/booking";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
};

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const startsAt = request.nextUrl.searchParams.get("startsAt");

  if (!isValidUuid(serviceId)) {
    return Response.json(
      {
        error: "Informe um serviço válido.",
      } satisfies BookingProfessionalsResponse,
      { status: 400, headers: responseHeaders },
    );
  }

  if (!isValidStartsAt(startsAt)) {
    return Response.json(
      {
        error: "Informe um horário válido.",
      } satisfies BookingProfessionalsResponse,
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const professionals = await listAvailableBookingProfessionalsByUnit(
      DEMO_ORGANIZATION_ID,
      DEMO_UNIT_ID,
      serviceId,
      startsAt,
    );

    return Response.json(
      { professionals } satisfies BookingProfessionalsResponse,
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("Falha ao consultar profissionais disponíveis.", error);

    return Response.json(
      {
        error: "Não foi possível consultar os profissionais. Tente novamente.",
      } satisfies BookingProfessionalsResponse,
      { status: 500, headers: responseHeaders },
    );
  }
}
