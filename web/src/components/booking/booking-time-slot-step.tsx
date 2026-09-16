import { BookingTimeSlotSelection } from "./booking-time-slot-selection";
import type { BookingTimeSlot } from "@/contracts/booking";

interface BookingTimeSlotStepProps {
  serviceId: string;
  serviceName: string;
  selectedSlot: BookingTimeSlot | null;
  isLoadingProfessionals: boolean;
  onBackToService: () => void;
  onSelectSlot: (slot: BookingTimeSlot | null) => void;
  onContinue: () => void;
}

export function BookingTimeSlotStep({
  serviceId,
  serviceName,
  selectedSlot,
  isLoadingProfessionals,
  onBackToService,
  onSelectSlot,
  onContinue,
}: BookingTimeSlotStepProps) {
  return (
    <section className="mt-10">
      <button
        type="button"
        onClick={onBackToService}
        className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
      >
        ← Trocar serviço
      </button>

      <div className="mt-6">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
          Etapa 2 de 4
        </p>

        <h2 className="mt-3 text-3xl font-bold">Escolha a data e o horário</h2>

        <p className="mt-3 text-slate-300">
          Serviço escolhido:{" "}
          <strong className="text-white">{serviceName}</strong>
        </p>
      </div>

      <BookingTimeSlotSelection
        key={serviceId}
        serviceId={serviceId}
        selectedSlot={selectedSlot}
        onSelectSlot={onSelectSlot}
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

      <button
        type="button"
        disabled={!selectedSlot || isLoadingProfessionals}
        onClick={onContinue}
        className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        Continuar
      </button>
    </section>
  );
}
