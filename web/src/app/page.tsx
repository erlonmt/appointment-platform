export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 sm:px-8 lg:px-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Plataforma de agendamentos
        </p>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
          Menos tempo organizando horários. Mais tempo atendendo.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Centralize profissionais, serviços e clientes em uma agenda simples,
          preparada para diferentes tipos de negócio.
        </p>
      </section>
    </main>
  );
}
