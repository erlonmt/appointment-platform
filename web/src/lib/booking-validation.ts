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
