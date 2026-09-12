"use client";

import { useState } from "react";

import { BookingTimeSlotSelection } from "./booking-time-slot-selection";
import type { BookingTimeSlot } from "@/data-access/booking-availability";

type ConfirmationMode = "automatic" | "manual";
type BookingStep = "service" | "time-slot" | "professional";

interface BookingServiceOption {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
  bufferMinutes: number;
}

interface BookingProfessionalOption {
  serviceId: string;
  professionalId: string;
  professionalName: string;
  confirmationMode: ConfirmationMode;
  priceCents: number;
  durationMinutes: number;
  bufferMinutes: number;
}

interface BookingFlowProps {
  services: BookingServiceOption[];
  professionalOptions: BookingProfessionalOption[];
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(valueInCents: number) {
  return currencyFormatter.format(valueInCents / 100);
}

export function BookingFlow({
  services,
  professionalOptions,
}: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);

  const [selectedSlot, setSelectedSlot] = useState<BookingTimeSlot | null>(
    null,
  );

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  const professionalsForSelectedService = professionalOptions.filter(
    (professional) => professional.serviceId === selectedServiceId,
  );

  const selectedProfessional = professionalsForSelectedService.find(
    (professional) => professional.professionalId === selectedProfessionalId,
  );

  function handleSelectService(serviceId: string) {
    setSelectedServiceId(serviceId);
    setSelectedSlot(null);
    setSelectedProfessionalId(null);
  }

  function handleContinueToTimeSlot() {
    if (!selectedService) {
      return;
    }

    setCurrentStep("time-slot");
  }

  function handleSelectSlot(slot: BookingTimeSlot | null) {
    setSelectedSlot(slot);
    setSelectedProfessionalId(null);
  }

  function handleBackToService() {
    setCurrentStep("service");
    setSelectedSlot(null);
    setSelectedProfessionalId(null);
  }

  if (services.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
        Nenhum serviço está disponível para agendamento.
      </p>
    );
  }

  if (currentStep === "time-slot" && selectedService) {
    return (
      <section className="mt-10">
        <button
          type="button"
          onClick={handleBackToService}
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          ← Trocar serviço
        </button>

        <div className="mt-6">
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
            Etapa 2 de 4
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Escolha a data e o horário
          </h2>

          <p className="mt-3 text-slate-300">
            Serviço escolhido:{" "}
            <strong className="text-white">{selectedService.name}</strong>
          </p>
        </div>

        <BookingTimeSlotSelection
          key={selectedService.id}
          serviceId={selectedService.id}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
        />

        <div
          aria-live="polite"
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          {selectedSlot ? (
            <>
              <p className="text-slate-200">
                Horário selecionado:{" "}
                <strong className="text-white">
                  {selectedSlot.localStartTime}
                </strong>
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Na próxima etapa você escolherá um profissional disponível nesse
                horário.
              </p>
            </>
          ) : (
            <p className="text-slate-400">
              Escolha uma data, busque os horários e selecione um deles.
            </p>
          )}
        </div>
      </section>
    );
  }

  if (currentStep === "professional" && selectedService) {
    return (
      <section className="mt-10">
        <button
          type="button"
          onClick={handleBackToService}
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          ← Trocar serviço
        </button>

        <div className="mt-6">
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
            Etapa 2 de 4
          </p>

          <h2 className="mt-3 text-3xl font-bold">Escolha um profissional</h2>

          <p className="mt-3 text-slate-300">
            Serviço escolhido:{" "}
            <strong className="text-white">{selectedService.name}</strong>
          </p>
        </div>

        {professionalsForSelectedService.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Nenhum profissional está disponível para este serviço.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {professionalsForSelectedService.map((professional) => {
              const isSelected =
                professional.professionalId === selectedProfessionalId;

              return (
                <li key={professional.professionalId}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelectedProfessionalId(professional.professionalId)
                    }
                    className={`h-full w-full rounded-2xl border p-6 text-left transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <span className="block text-xl font-semibold">
                      {professional.professionalName}
                    </span>

                    <span className="mt-2 block text-sm text-cyan-300">
                      {professional.confirmationMode === "automatic"
                        ? "Confirmação automática"
                        : "Necessita aprovação"}
                    </span>

                    <span className="mt-4 block text-sm text-slate-300">
                      {formatCurrency(professional.priceCents)} ·{" "}
                      {professional.durationMinutes} minutos
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div
          aria-live="polite"
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          {selectedProfessional ? (
            <>
              <p className="text-slate-200">
                Profissional selecionado:{" "}
                <strong className="text-white">
                  {selectedProfessional.professionalName}
                </strong>
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Na próxima etapa você escolherá a data e o horário.
              </p>
            </>
          ) : (
            <p className="text-slate-400">
              Selecione um profissional para continuar.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
        Etapa 1 de 4
      </p>

      <ul className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const isSelected = service.id === selectedServiceId;

          return (
            <li key={service.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectService(service.id)}
                className={`h-full w-full rounded-2xl border p-6 text-left transition ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/40"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="text-xl font-semibold">{service.name}</span>

                  <span className="font-bold text-cyan-300">
                    {formatCurrency(service.priceCents)}
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

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">
          {selectedService ? (
            <p className="text-slate-200">
              Serviço selecionado:{" "}
              <strong className="text-white">{selectedService.name}</strong>
            </p>
          ) : (
            <p className="text-slate-400">
              Selecione um serviço para continuar.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedService}
          onClick={handleContinueToTimeSlot}
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Continuar
        </button>
      </div>
    </section>
  );
}
