import type { NextRequest } from "next/server";

import { DEMO_ORGANIZATION_ID, DEMO_UNIT_ID } from "@/config/demo";
import { listBookingTimeSlotsByUnit } from "@/data-access/booking-availability";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidDate(value: string | null): value is string {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000-")
  ) {
    return false;
  }

  const parsedDate = new Date(value + "T00:00:00.000Z");

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
}

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const date = request.nextUrl.searchParams.get("date");

  if (!serviceId || !uuidPattern.test(serviceId)) {
    return Response.json(
      { error: "Informe um serviço válido." },
      { status: 400, headers: responseHeaders },
    );
  }

  if (!isValidDate(date)) {
    return Response.json(
      { error: "Informe uma data válida no formato YYYY-MM-DD." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const slots = await listBookingTimeSlotsByUnit(
      DEMO_ORGANIZATION_ID,
      DEMO_UNIT_ID,
      serviceId,
      date,
    );

    return Response.json({ slots }, { headers: responseHeaders });
  } catch (error) {
    console.error("Falha ao consultar horários disponíveis.", error);

    return Response.json(
      {
        error: "Não foi possível consultar os horários. Tente novamente.",
      },
      { status: 500, headers: responseHeaders },
    );
  }
}
