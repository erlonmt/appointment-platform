"use client";

import { useState } from "react";

import { BookingTimeSlotStep } from "./booking-time-slot-step";
import { BookingCustomerForm } from "./booking-customer-form";
import { BookingSummary } from "./booking-summary";
import { BookingServiceStep } from "./booking-service-step";
import { formatCurrency } from "@/lib/format-currency";
import type { ServiceSummary } from "@/data-access/services";
import type { BookingCustomerDetails } from "./booking-customer-form";
import type { BookingTimeSlot } from "@/data-access/booking-availability";

type ConfirmationMode = "automatic" | "manual";
type BookingStep =
  "service" | "time-slot" | "professional" | "customer" | "review";

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
  services: ServiceSummary[];
}

interface BookingProfessionalsResponse {
  professionals?: BookingProfessionalOption[];
  error?: string;
}

export function BookingFlow({ services }: BookingFlowProps) {
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

  const [availableProfessionals, setAvailableProfessionals] = useState<
    BookingProfessionalOption[]
  >([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [professionalsError, setProfessionalsError] = useState<string | null>(
    null,
  );

  const [customerDetails, setCustomerDetails] =
    useState<BookingCustomerDetails | null>(null);

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  const selectedProfessional = availableProfessionals.find(
    (professional) => professional.professionalId === selectedProfessionalId,
  );

  function handleSelectService(serviceId: string) {
    setSelectedServiceId(serviceId);
    setSelectedSlot(null);
    resetProfessionalStep();
  }

  function handleContinueToTimeSlot() {
    if (!selectedService) {
      return;
    }

    setCurrentStep("time-slot");
  }

  function handleSelectSlot(slot: BookingTimeSlot | null) {
    setSelectedSlot(slot);
    resetProfessionalStep();
  }

  function handleBackToService() {
    setCurrentStep("service");
    setSelectedSlot(null);
    resetProfessionalStep();
  }

  function resetProfessionalStep() {
    setSelectedProfessionalId(null);
    setAvailableProfessionals([]);
    setProfessionalsError(null);
  }

  async function handleContinueToProfessional() {
    if (!selectedService || !selectedSlot || isLoadingProfessionals) {
      return;
    }

    resetProfessionalStep();
    setIsLoadingProfessionals(true);
    setCurrentStep("professional");

    try {
      const searchParams = new URLSearchParams({
        serviceId: selectedService.id,
        startsAt: selectedSlot.startsAt,
      });

      const response = await fetch(
        "/api/booking/professionals?" + searchParams.toString(),
        { cache: "no-store" },
      );

      const data: BookingProfessionalsResponse = await response.json();

      if (!response.ok) {
        setProfessionalsError(
          data.error ?? "Não foi possível consultar os profissionais.",
        );
        return;
      }

      if (!Array.isArray(data.professionals)) {
        throw new Error("Resposta de profissionais inválida.");
      }

      setAvailableProfessionals(data.professionals);
    } catch {
      setProfessionalsError(
        "Não foi possível consultar os profissionais. Tente novamente",
      );
    } finally {
      setIsLoadingProfessionals(false);
    }
  }

  function handleBackToTimeSlot() {
    if (isLoadingProfessionals) {
      return;
    }

    setCurrentStep("time-slot");
    setSelectedSlot(null);
    resetProfessionalStep();
  }

  function handleContinueToCustomer() {
    if (
      !selectedService ||
      !selectedSlot ||
      !selectedProfessional ||
      isLoadingProfessionals
    ) {
      return;
    }

    setCurrentStep("customer");
  }

  function handleReview(customer: BookingCustomerDetails) {
    if (!selectedService || !selectedSlot || !selectedProfessional) {
      return;
    }

    setCustomerDetails(customer);
    setCurrentStep("review");
  }

  function handleBackToProfessional() {
    setCurrentStep("professional");
  }

  function handleBackToCustomer() {
    setCurrentStep("customer");
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
      <BookingTimeSlotStep
        serviceId={selectedService.id}
        serviceName={selectedService.name}
        selectedSlot={selectedSlot}
        isLoadingProfessionals={isLoadingProfessionals}
        onBackToService={handleBackToService}
        onSelectSlot={handleSelectSlot}
        onContinue={handleContinueToProfessional}
      />
    );
  }

  if (currentStep === "professional" && selectedService && selectedSlot) {
    return (
      <section className="mt-10">
        <button
          type="button"
          onClick={handleBackToTimeSlot}
          disabled={isLoadingProfessionals}
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          ← Trocar data e horário
        </button>

        <div className="mt-6">
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
            Etapa 3 de 4
          </p>

          <h2 className="mt-3 text-3xl font-bold">Escolha um profissional</h2>

          <p className="mt-3 text-slate-300">
            Serviço escolhido:{" "}
            <strong className="text-white">{selectedService.name}</strong>
          </p>

          <p className="mt-2 text-slate-300">
            Horário escolhido:{" "}
            <strong className="text-white">
              {selectedSlot.localStartTime}
            </strong>
          </p>
        </div>

        {isLoadingProfessionals ? (
          <p role="status" className="mt-8 text-slate-300">
            Consultando profissionais disponíveis...
          </p>
        ) : professionalsError ? (
          <p
            role="alert"
            className="mt-8 rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200"
          >
            {professionalsError}
          </p>
        ) : availableProfessionals.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Nenhum profissional está disponível nesse horário. Escolha outra
            data e horário.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {availableProfessionals.map((professional) => {
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
          hidden={availableProfessionals.length === 0}
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
                Na próxima etapa você informará seus dados para confirmar o
                agendamento.
              </p>
            </>
          ) : (
            <p className="text-slate-400">
              Selecione um profissional para continuar.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedProfessional || isLoadingProfessionals}
          onClick={handleContinueToCustomer}
          className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Continuar
        </button>
      </section>
    );
  }

  if (
    (currentStep === "customer" || currentStep === "review") &&
    selectedService &&
    selectedSlot &&
    selectedProfessional
  ) {
    const isReview = currentStep === "review" && customerDetails !== null;

    return (
      <section className="mt-10">
        <button
          type="button"
          onClick={isReview ? handleBackToCustomer : handleBackToProfessional}
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          {isReview ? "← Editar dados" : "← Trocar profissional"}
        </button>

        <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
          Etapa 4 de 4
        </p>

        <h2 className="mt-3 text-3xl font-bold">
          {isReview ? "Revise seu agendamento" : "Informe seus dados"}
        </h2>

        <BookingSummary
          serviceName={selectedService.name}
          professionalName={selectedProfessional.professionalName}
          localDate={selectedSlot.localDate}
          localStartTime={selectedSlot.localStartTime}
          priceLabel={formatCurrency(selectedProfessional.priceCents)}
          durationMinutes={selectedProfessional.durationMinutes}
          confirmationMode={selectedProfessional.confirmationMode}
          customerDetails={isReview ? customerDetails : null}
        />

        {isReview ? (
          <p role="status" className="mt-6 text-slate-300">
            Confira os dados acima. O agendamento ainda não foi enviado.
          </p>
        ) : (
          <BookingCustomerForm
            initialValues={customerDetails}
            onReview={handleReview}
          />
        )}
      </section>
    );
  }
  return (
    <BookingServiceStep
      services={services}
      selectedService={selectedService}
      onSelectService={handleSelectService}
      onContinue={handleContinueToTimeSlot}
    />
  );
}
