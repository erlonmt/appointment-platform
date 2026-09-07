import type { ProfessionalSummary } from "@/data-access/professionals";

interface ProfessionalCardProps {
  professional: ProfessionalSummary;
}

const confirmationModeLabels: Record<
  ProfessionalSummary["confirmationMode"],
  string
> = {
  automatic: "Confirmação automática",
  manual: "Aprovação manual",
};

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  return (
    <article className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">{professional.name}</h2>

      <p className="mt-2 text-sm font-medium text-cyan-300">
        {confirmationModeLabels[professional.confirmationMode]}
      </p>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-300">
          Serviços oferecidos
        </h3>

        {professional.services.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Nenhum serviço cadastrado
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {professional.services.map((service) => (
              <li
                key={service}
                className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
              >
                {service}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
