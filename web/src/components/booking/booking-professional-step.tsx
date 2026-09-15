import { BookingProfessionalSelection } from "./booking-professional-selection";
import type { BookingProfessionalOption } from "@/data-access/booking";

interface BookingProfessionalStepProps {
  serviceName: string;
  localStartTime: string;
  isLoadingProfessionals: boolean;
  professionalsError: string | null;
  availableProfessionals: BookingProfessionalOption[];
  selectedProfessionalId: string | null;
  selectedProfessional: BookingProfessionalOption | undefined;
  onSelectProfessional: (professionalId: string) => void;
  onBackToTimeSlot: () => void;
  onContinue: () => void;
}

export function BookingProfessionalStep({
  serviceName,
  localStartTime,
  isLoadingProfessionals,
  professionalsError,
  availableProfessionals,
  selectedProfessionalId,
  selectedProfessional,
  onSelectProfessional,
  onBackToTimeSlot,
  onContinue,
}: BookingProfessionalStepProps) {
  return (
    <section className="mt-10">
      <button
        type="button"
        onClick={onBackToTimeSlot}
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
          <strong className="text-white">{serviceName}</strong>
        </p>

        <p className="mt-2 text-slate-300">
          Horário escolhido:{" "}
          <strong className="text-white">{localStartTime}</strong>
        </p>
      </div>

      <BookingProfessionalSelection
        isLoadingProfessionals={isLoadingProfessionals}
        professionalsError={professionalsError}
        availableProfessionals={availableProfessionals}
        selectedProfessionalId={selectedProfessionalId}
        onSelectProfessional={onSelectProfessional}
      />

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
        onClick={onContinue}
        className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        Continuar
      </button>
    </section>
  );
}
