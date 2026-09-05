import Link from "next/link";
import { connection } from "next/server";

import { listActiveServicesByOrganization } from "@/data-access/services";

const DEMO_ORGANIZATION_ID = "10000000-0000-4000-8000-000000000001";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(valueInCents: number) {
  return currencyFormatter.format(valueInCents / 100);
}

export default async function ServicesPage() {
  await connection();

  const services = await listActiveServicesByOrganization(DEMO_ORGANIZATION_ID);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          ← Voltar para o início
        </Link>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
              Painel de demonstração
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Serviços disponíveis
            </h1>
          </div>

          <p className="text-sm text-slate-400">
            {services.length} serviços ativos
          </p>
        </div>

        {services.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Nenhum serviço ativo foi encontrado
          </p>
        ) : (
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <li
                key={service.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">{service.name}</h2>

                  <p className="font-bold text-cyan-300">
                    {formatCurrency(service.priceCents)}
                  </p>
                </div>

                <p className="mt-4 text-sm text-slate-300">
                  Duração: {service.durationMinutes} minutos
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {service.bufferMinutes > 0
                    ? `${service.bufferMinutes} minutos de intervalo após o serviço`
                    : "Sem intervalo adicional"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
