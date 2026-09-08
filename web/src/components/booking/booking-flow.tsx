"use client";

import { useState } from "react";

interface BookingServiceOption {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
  bufferMinutes: number;
}

interface BookingFlowProps {
  services: BookingServiceOption[];
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BookingFlow({ services }: BookingFlowProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  if (services.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
        Nenhum serviço está disponível para agendamento.
      </p>
    );
  }

  return (
    <section className="mt-10">
      <ul className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const isSelected = service.id === selectedServiceId;

          return (
            <li key={service.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedServiceId(service.id)}
                className={`h-full w-full rounded-2xl border p-6 text-left transition ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/40"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="text-xl font-semibold">{service.name}</span>

                  <span className="font-bold text-cyan-300">
                    {currencyFormatter.format(service.priceCents / 100)}
                  </span>
                </span>

                <span className="mt-4 block text-sm text-slate-300">
                  Duração: {service.durationMinutes} minutos
                </span>

                <span className="mt-1 block text-sm text-slate-400">
                  {service.bufferMinutes > 0
                    ? `${service.bufferMinutes} minutos de intervalo adicional`
                    : "Sem intervalo adicional"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        aria-live="polite"
        className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5"
      >
        {selectedService ? (
          <p className="text-slate-200">
            Serviço selecionado:{" "}
            <strong className="text-white">{selectedService.name}</strong>
          </p>
        ) : (
          <p className="text-slate-400">Selecione um serviço para continuar.</p>
        )}
      </div>
    </section>
  );
}
