"use client";

import { useState } from "react";

import type { BookingTimeSlot } from "@/data-access/booking-availability";

interface BookingTimeSlotSelectionProps {
  serviceId: string;
  selectedSlot: BookingTimeSlot | null;
  onSelectSlot: (slot: BookingTimeSlot | null) => void;
}

interface BookingAvailabilityResponse {
  slots?: BookingTimeSlot[];
  error?: string;
}

export function BookingTimeSlotSelection({
  serviceId,
  selectedSlot,
  onSelectSlot,
}: BookingTimeSlotSelectionProps) {
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<BookingTimeSlot[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  function handleDateChange(value: string) {
    setDate(value);
    setTimeSlots(null);
    setErrorMessage(null);
    onSelectSlot(null);
  }

  async function handleSearch() {
    if (!date || isLoading) {
      return;
    }

    setIsLoading(true);
    setTimeSlots(null);
    setErrorMessage(null);
    onSelectSlot(null);

    try {
      const searchParams = new URLSearchParams({
        serviceId,
        date,
      });

      const response = await fetch(
        "/api/booking/availability?" + searchParams.toString(),
        { cache: "no-store" },
      );

      const data: BookingAvailabilityResponse = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.error ?? "Não foi possível consultar os horários.",
        );
        return;
      }

      if (!Array.isArray(data.slots)) {
        throw new Error("Resposta de disponibilidade inválida.");
      }

      setTimeSlots(data.slots);
    } catch {
      setErrorMessage(
        "Não foi possível consultar os horários. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="booking-date"
            className="block text-sm font-semibold text-slate-200"
          >
            Data do atendimento
          </label>

          <input
            id="booking-date"
            type="date"
            value={date}
            disabled={isLoading}
            onChange={(event) => handleDateChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white [color-scheme:dark] disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={!date || isLoading}
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isLoading ? "Buscando..." : "Buscar horários"}
        </button>
      </div>

      {isLoading && (
        <p role="status" className="mt-6 text-slate-300">
          Consultando horários disponíveis...
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200"
        >
          {errorMessage}
        </p>
      )}
      {timeSlots !== null && timeSlots.length === 0 && (
        <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300">
          Nenhum horário está disponível para essa data.
        </p>
      )}
      {timeSlots !== null && timeSlots.length > 0 && (
        <>
          <p className="mt-6 text-sm text-slate-300">
            Horários da unidade. Selecione um para continuar.
          </p>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot?.startsAt === slot.startsAt;

              return (
                <li key={slot.startsAt}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectSlot(slot)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <span className="block text-lg font-bold text-white">
                      {slot.localStartTime}
                    </span>

                    <span className="mt-1 block text-xs text-slate-400">
                      {slot.availableProfessionals}{" "}
                      {slot.availableProfessionals === 1
                        ? "profissional disponível"
                        : "profissionais disponíveis"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
