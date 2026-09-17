import type { NextRequest } from "next/server";

import { DEMO_ORGANIZATION_ID, DEMO_UNIT_ID } from "@/config/demo";
import { listAvailableBookingProfessionalsByUnit } from "@/data-access/booking";
import type { BookingProfessionalsResponse } from "@/contracts/booking";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const startsAtPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function isValidStartsAt(value: string | null): value is string {
  if (!value || !startsAtPattern.test(value) || value.startsWith("0000-")) {
    return false;
  }

  const parsedStartsAt = new Date(value);

  return (
    !Number.isNaN(parsedStartsAt.getTime()) &&
    parsedStartsAt.toISOString() === value
  );
}

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const startsAt = request.nextUrl.searchParams.get("startsAt");

  if (!serviceId || !uuidPattern.test(serviceId)) {
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
