import Link from "next/link";
import { connection } from "next/server";

import { ProfessionalCard } from "@/components/dashboard/professional-card";
import { DEMO_ORGANIZATION_ID } from "@/config/demo";
import { listActiveProfessionalsByOrganization } from "@/data-access/professionals";

export default async function ProfessionalsPage() {
  await connection();

  const professionals =
    await listActiveProfessionalsByOrganization(DEMO_ORGANIZATION_ID);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
          >
            ← Início
          </Link>

          <Link
            href="/dashboard/services"
            className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
          >
            Ver serviços →
          </Link>
        </nav>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
              Painel de demonstração
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Profissionais
            </h1>
          </div>

          <p className="text-sm text-slate-400">
            {professionals.length}{" "}
            {professionals.length === 1
              ? "profissional ativo"
              : "profissionais ativos"}
          </p>
        </div>

        {professionals.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Nenhum profissional ativo foi encontrado.
          </p>
        ) : (
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {professionals.map((professional) => (
              <li key={professional.id}>
                <ProfessionalCard professional={professional} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
