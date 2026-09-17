import type { BookingCustomerDetails } from "@/contracts/booking";

interface BookingSummaryProps {
  serviceName: string;
  professionalName: string;
  localDate: string;
  localStartTime: string;
  priceLabel: string;
  durationMinutes: number;
  confirmationMode: "automatic" | "manual";
  customerDetails: BookingCustomerDetails | null;
}

export function BookingSummary({
  serviceName,
  professionalName,
  localDate,
  localStartTime,
  priceLabel,
  durationMinutes,
  confirmationMode,
  customerDetails,
}: BookingSummaryProps) {
  return (
    <dl className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <dt className="text-sm text-slate-400">Serviço</dt>
        <dd className="mt-1 font-semibold">{serviceName}</dd>
      </div>

      <div>
        <dt className="text-sm text-slate-400">Profissional</dt>
        <dd className="mt-1 font-semibold">{professionalName}</dd>
      </div>

      <div>
        <dt className="text-sm text-slate-400">Data e horário</dt>
        <dd className="mt-1 font-semibold">
          {localDate.split("-").reverse().join("/")} às {localStartTime}
        </dd>
      </div>

      <div>
        <dt className="text-sm text-slate-400">Valor</dt>
        <dd className="mt-1 font-semibold">{priceLabel}</dd>
      </div>

      <div>
        <dt className="text-sm text-slate-400">Duração</dt>
        <dd className="mt-1 font-semibold">{durationMinutes} minutos</dd>
      </div>

      <div>
        <dt className="text-sm text-slate-400">Confirmação</dt>
        <dd className="mt-1 font-semibold">
          {confirmationMode === "automatic"
            ? "Automática"
            : "Depende da aprovação do profissional"}
        </dd>
      </div>

      {customerDetails && (
        <>
          <div>
            <dt className="text-sm text-slate-400">Nome</dt>
            <dd className="mt-1 font-semibold">{customerDetails.name}</dd>
          </div>

          <div>
            <dt className="text-sm text-slate-400">Telefone</dt>
            <dd className="mt-1 font-semibold">{customerDetails.phone}</dd>
          </div>

          <div>
            <dt className="text-sm text-slate-400">E-mail</dt>
            <dd className="mt-1 font-semibold">
              {customerDetails.email ?? "Não informado"}
            </dd>
          </div>
        </>
      )}
    </dl>
  );
}
