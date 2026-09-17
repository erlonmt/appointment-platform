import type { ServiceSummary } from "@/contracts/services";
import { formatCurrency } from "@/lib/format-currency";

interface BookingServiceStepProps {
  services: ServiceSummary[];
  selectedService: ServiceSummary | undefined;
  onSelectService: (serviceId: string) => void;
  onContinue: () => void;
}

export function BookingServiceStep({
  services,
  selectedService,
  onSelectService,
  onContinue,
}: BookingServiceStepProps) {
  return (
    <section className="mt-10">
      <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
        Etapa 1 de 4
      </p>

      <ul className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const isSelected = service.id === selectedService?.id;

          return (
            <li key={service.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectService(service.id)}
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
          onClick={onContinue}
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Continuar
        </button>
      </div>
    </section>
  );
}
