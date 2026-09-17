import type {
  CreateBookingRequest,
  BookingCustomerDetails,
} from "@/contracts/booking";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const startsAtPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function isValidUuid(value: string | null): value is string {
  return value !== null && uuidPattern.test(value);
}

export function isValidStartsAt(value: string | null): value is string {
  if (!value || !startsAtPattern.test(value) || value.startsWith("0000-")) {
    return false;
  }

  const parsedStartsAt = new Date(value);

  return (
    !Number.isNaN(parsedStartsAt.getTime()) &&
    parsedStartsAt.toISOString() === value
  );
}

export function parseBookingCustomerDetails(
  value: unknown,
): BookingCustomerDetails | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const customer = value as Record<string, unknown>;
  const rawEmail = customer.email;

  if (
    typeof customer.name !== "string" ||
    typeof customer.phone !== "string" ||
    (rawEmail !== null &&
      rawEmail !== undefined &&
      typeof rawEmail !== "string")
  ) {
    return null;
  }

  const name = customer.name.trim();
  const phone = customer.phone.trim();
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

  if (
    !name ||
    name.length > 120 ||
    !phone ||
    phone.length > 30 ||
    email.length > 254 ||
    (email !== "" && !emailPattern.test(email))
  ) {
    return null;
  }

  return { name, phone, email: email || null };
}

export function parseCreateBookingRequest(
  value: unknown,
): CreateBookingRequest | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const {
    serviceId,
    professionalId,
    startsAt,
    quotedPriceCents,
    quotedDurationMinutes,
  } = input;

  if (
    typeof serviceId !== "string" ||
    !isValidUuid(serviceId) ||
    typeof professionalId !== "string" ||
    !isValidUuid(professionalId) ||
    typeof startsAt !== "string" ||
    !isValidStartsAt(startsAt) ||
    typeof quotedPriceCents !== "number" ||
    !Number.isSafeInteger(quotedPriceCents) ||
    quotedPriceCents < 0 ||
    typeof quotedDurationMinutes !== "number" ||
    !Number.isSafeInteger(quotedDurationMinutes) ||
    quotedDurationMinutes <= 0
  ) {
    return null;
  }

  const customer = parseBookingCustomerDetails(input.customer);

  if (!customer) {
    return null;
  }

  return {
    serviceId,
    professionalId,
    startsAt,
    customer,
    quotedPriceCents,
    quotedDurationMinutes,
  };
}
