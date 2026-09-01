import { ResourceCard } from "@/components/landing/resource-card";
import { StepCard } from "@/components/landing/step-card";
import { resources, steps } from "@/data/landing-page";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8 lg:px-12">
          <a href="#inicio" className="text-lg font-bold tracking-tight">
            Appointment<span className="text-cyan-400">.</span>
          </a>

          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-5"
          >
            <a
              href="#recursos"
              className="hidden text-sm text-slate-300 transition hover:text-white sm:inline"
            >
              Recursos
            </a>

            <a
              href="#como-funciona"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Como funciona
            </a>
          </nav>
        </div>
      </header>

      <section
        id="inicio"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-8 lg:px-12"
      >
        <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
          Plataforma de agendamentos
        </p>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
          Menos tempo organizando horários. Mais tempo atendendo.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Centralize profissionais, serviços e clientes em uma agenda simples,
          preparada para diferentes tipos de negócio.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#recursos"
            className="rounded-full bg-cyan-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Explorar recursos
          </a>

          <a
            href="#como-funciona"
            className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Como funciona
          </a>
        </div>
      </section>
      <section
        id="recursos"
        className="border-t border-white/10 bg-slate-900/40 py-24"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
              Recursos essenciais
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo para organizar uma rotina de atendimentos
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
              Como funciona
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Da configuração ao atendimento em três passos.
            </h2>
          </div>

          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
