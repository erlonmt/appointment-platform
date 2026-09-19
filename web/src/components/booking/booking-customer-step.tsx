import { BookingCustomerForm } from "./booking-customer-form";
import { BookingSummary } from "./booking-summary";
import { formatCurrency } from "@/lib/format-currency";
import type {
  BookingCustomerDetails,
  BookingProfessionalOption,
  BookingTimeSlot,
} from "@/contracts/booking";
import type { ServiceSummary } from "@/contracts/services";

interface BookingCustomerStepProps {
  selectedService: ServiceSummary;
  selectedSlot: BookingTimeSlot;
  selectedProfessional: BookingProfessionalOption;
  customerDetails: BookingCustomerDetails | null;
  isReview: boolean;
  isSubmittingBooking: boolean;
  bookingSubmissionError: string | null;
  confirmedAppointmentId: string | null;
  onConfirmBooking: () => void;
  onBackToCustomer: () => void;
  onBackToProfessional: () => void;
  onReview: (customer: BookingCustomerDetails) => void;
}

export function BookingCustomerStep({
  selectedService,
  selectedSlot,
  selectedProfessional,
  customerDetails,
  confirmedAppointmentId,
  bookingSubmissionError,
  isReview,
  isSubmittingBooking,
  onBackToCustomer,
  onBackToProfessional,
  onReview,
  onConfirmBooking,
}: BookingCustomerStepProps) {
  return (
    <section className="mt-10">
      {!confirmedAppointmentId && (
        <button
          type="button"
          onClick={isReview ? onBackToCustomer : onBackToProfessional}
          disabled={isSubmittingBooking}
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300 disabled:cursor-not-allowed disabled:text-slate-600"
        >
          {isReview ? "← Editar dados" : "← Trocar profissional"}
        </button>
      )}

      <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
        Etapa 4 de 4
      </p>

      <h2 className="mt-3 text-3xl font-bold">
        {confirmedAppointmentId
          ? "Agendamento confirmado"
          : isReview
            ? "Revise seu agendamento"
            : "Informe seus dados"}
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

      {confirmedAppointmentId ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-700 bg-emerald-950/40 p-5 text-emerald-100"
        >
          <p className="font-semibold">
            Seu agendamento foi confirmado com sucesso.
          </p>

          <p className="mt-2 text-sm break-all text-emerald-200">
            Código do agendamento: {confirmedAppointmentId}
          </p>
        </div>
      ) : isReview ? (
        <div className="mt-6" aria-busy={isSubmittingBooking}>
          <p role="status" className="text-slate-300">
            Confira os dados acima antes de confirmar.
          </p>

          {bookingSubmissionError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200"
            >
              {bookingSubmissionError}
            </p>
          )}

          <button
            type="button"
            onClick={onConfirmBooking}
            disabled={isSubmittingBooking}
            className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSubmittingBooking ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </div>
      ) : (
        <BookingCustomerForm
          initialValues={customerDetails}
          onReview={onReview}
        />
      )}
    </section>
  );
}
