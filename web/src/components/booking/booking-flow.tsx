"use client";

import { useState } from "react";

import { BookingTimeSlotStep } from "./booking-time-slot-step";
import { BookingCustomerStep } from "./booking-customer-step";
import { BookingServiceStep } from "./booking-service-step";
import { BookingProfessionalStep } from "./booking-professional-step";
import type { BookingProfessionalOption } from "@/data-access/booking";
import type { ServiceSummary } from "@/data-access/services";
import type { BookingCustomerDetails } from "./booking-customer-form";
import type { BookingTimeSlot } from "@/data-access/booking-availability";

type BookingStep =
  "service" | "time-slot" | "professional" | "customer" | "review";

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
      <BookingProfessionalStep
        serviceName={selectedService.name}
        localStartTime={selectedSlot.localStartTime}
        isLoadingProfessionals={isLoadingProfessionals}
        professionalsError={professionalsError}
        availableProfessionals={availableProfessionals}
        selectedProfessionalId={selectedProfessionalId}
        selectedProfessional={selectedProfessional}
        onSelectProfessional={(professionalId) =>
          setSelectedProfessionalId(professionalId)
        }
        onBackToTimeSlot={handleBackToTimeSlot}
        onContinue={handleContinueToCustomer}
      />
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
      <BookingCustomerStep
        selectedService={selectedService}
        selectedSlot={selectedSlot}
        selectedProfessional={selectedProfessional}
        customerDetails={customerDetails}
        isReview={isReview}
        onBackToCustomer={handleBackToCustomer}
        onBackToProfessional={handleBackToProfessional}
        onReview={handleReview}
      />
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
