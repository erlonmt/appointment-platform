import type { BookingProfessionalOption } from "@/data-access/booking";
import { formatCurrency } from "@/lib/format-currency";

interface BookingProfessionalSelectionProps {
  isLoadingProfessionals: boolean;
  professionalsError: string | null;
  availableProfessionals: BookingProfessionalOption[];
  selectedProfessionalId: string | null;
  onSelectProfessional: (professionalId: string) => void;
}

export function BookingProfessionalSelection({
  isLoadingProfessionals,
  professionalsError,
  availableProfessionals,
  selectedProfessionalId,
  onSelectProfessional,
}: BookingProfessionalSelectionProps) {
  if (isLoadingProfessionals) {
    return (
      <p role="status" className="mt-8 text-slate-300">
        Consultando profissionais disponíveis...
      </p>
    );
  }

  if (professionalsError) {
    return (
      <p
        role="alert"
        className="mt-8 rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200"
      >
        {professionalsError}
      </p>
    );
  }

  if (availableProfessionals.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
        Nenhum profissional está disponível nesse horário. Escolha outra data e
        horário.
      </p>
    );
  }

  return (
    <ul className="mt-8 grid gap-4 md:grid-cols-2">
      {availableProfessionals.map((professional) => {
        const isSelected =
          professional.professionalId === selectedProfessionalId;

        return (
          <li key={professional.professionalId}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectProfessional(professional.professionalId)}
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
  );
}
