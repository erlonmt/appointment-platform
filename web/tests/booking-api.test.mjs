import assert from "node:assert/strict";
import test from "node:test";

const serviceId = "40000000-0000-4000-8000-000000000001";
const baseUrl = process.env.BOOKING_API_BASE_URL ?? "http://localhost:3000";

function futureMonday() {
  const date = new Date();
  const daysUntilMonday = (8 - date.getUTCDay()) % 7 || 7;

  date.setUTCDate(date.getUTCDate() + daysUntilMonday + 14);
  return date.toISOString().slice(0, 10);
}

async function getJson(path, params) {
  const url = new URL(path, baseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  assert.equal(response.status, 200, `GET ${url} returned ${response.status}`);

  return response.json();
}

test("availability counts match professional lists", async () => {
  const date = futureMonday();
  const availability = await getJson("/api/booking/availability", {
    serviceId,
    date,
  });
  const slots = availability.slots;

  assert.ok(Array.isArray(slots) && slots.length > 0);

  const sampleIndexes = new Set([
    0,
    Math.floor(slots.length / 2),
    slots.length - 1,
  ]);

  for (const index of sampleIndexes) {
    const slot = slots[index];
    const result = await getJson("/api/booking/professionals", {
      serviceId,
      startsAt: slot.startsAt,
    });

    assert.ok(Array.isArray(result.professionals));
    assert.equal(
      slot.availableProfessionals,
      result.professionals.length,
      `Different professional counts at ${slot.startsAt}`,
    );
  }
});
