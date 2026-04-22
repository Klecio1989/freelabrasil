import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center">
        <div className="inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-4 py-1 text-sm font-semibold text-red-300">
          Erro 404
        </div>

        <h1 className="mt-6 text-6xl font-black leading-tight">
          Página não encontrada
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-300">
          A página que você tentou acessar não existe ou foi removida.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
          >
            Ir para início
          </Link>

          <Link
            href="/projetos"
            className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white"
          >
            Ver projetos
          </Link>

          <Link
            href="/freelancers"
            className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white"
          >
            Ver freelancers
          </Link>
        </div>
      </div>
    </main>
  );
}