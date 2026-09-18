import { DEMO_ORGANIZATION_ID, DEMO_UNIT_ID } from "@/config/demo";
import { createAutomaticBooking } from "@/data-access/booking-create";
import { parseCreateBookingRequest } from "@/lib/booking-validation";
import type { CreateBookingResponse } from "@/contracts/booking";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Envie um JSON válido." } satisfies CreateBookingResponse,
      { status: 400, headers: responseHeaders },
    );
  }

  const booking = parseCreateBookingRequest(body);

  if (!booking) {
    return Response.json(
      {
        error: "Informe dados válidos para o agendamento.",
      } satisfies CreateBookingResponse,
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const result = await createAutomaticBooking(
      DEMO_ORGANIZATION_ID,
      DEMO_UNIT_ID,
      booking,
    );

    if (result.kind === "unavailable") {
      return Response.json(
        {
          error: "Este horário não está mais disponível. Escolha outro.",
        } satisfies CreateBookingResponse,
        { status: 409, headers: responseHeaders },
      );
    }

    if (result.kind === "details_changed") {
      return Response.json(
        {
          error: "O preço ou a duração mudou. Revise o agendamento.",
        } satisfies CreateBookingResponse,
        { status: 409, headers: responseHeaders },
      );
    }

    return Response.json(
      {
        appointmentId: result.appointmentId,
        status: "confirmed",
      } satisfies CreateBookingResponse,
      { status: 201, headers: responseHeaders },
    );
  } catch (error) {
    console.error("Falha ao criar agendamento.", error);

    return Response.json(
      {
        error: "Não foi possível confirmar o agendamento. Tente novamente.",
      } satisfies CreateBookingResponse,
      { status: 500, headers: responseHeaders },
    );
  }
}
