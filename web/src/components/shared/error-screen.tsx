import Link from "next/link";

interface ErrorScreenProps {
  title: string;
  onRetry: () => void;
}

export function ErrorScreen({ title, onRetry }: ErrorScreenProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section
        role="alert"
        className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="mt-3 text-slate-300">Tente novamente em instantes.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800"
          >
            Voltar ao início
          </Link>
        </div>
      </section>
    </main>
  );
}
