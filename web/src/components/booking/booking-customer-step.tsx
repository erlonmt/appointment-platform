import { BookingCustomerForm } from "./booking-customer-form";
import { BookingSummary } from "./booking-summary";
import { formatCurrency } from "@/lib/format-currency";
import type { BookingCustomerDetails } from "./booking-customer-form";
import type { BookingProfessionalOption } from "@/data-access/booking";
import type { BookingTimeSlot } from "@/data-access/booking-availability";
import type { ServiceSummary } from "@/data-access/services";

interface BookingCustomerStepProps {
  selectedService: ServiceSummary;
  selectedSlot: BookingTimeSlot;
  selectedProfessional: BookingProfessionalOption;
  customerDetails: BookingCustomerDetails | null;
  isReview: boolean;
  onBackToCustomer: () => void;
  onBackToProfessional: () => void;
  onReview: (customer: BookingCustomerDetails) => void;
}

export function BookingCustomerStep({
  selectedService,
  selectedSlot,
  selectedProfessional,
  customerDetails,
  isReview,
  onBackToCustomer,
  onBackToProfessional,
  onReview,
}: BookingCustomerStepProps) {
  return (
    <section className="mt-10">
      <button
        type="button"
        onClick={isReview ? onBackToCustomer : onBackToProfessional}
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
          onReview={onReview}
        />
      )}
    </section>
  );
}
