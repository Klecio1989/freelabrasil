import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-24 text-center text-white">
      <span className="inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-300">
        Erro 404
      </span>

      <h1 className="mt-8 text-6xl font-black">
        Página não encontrada
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
        A página que você tentou acessar não existe ou foi removida.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950"
        >
          Ir para início
        </Link>

        <Link
          href="/projetos"
          className="rounded-xl border border-white/20 px-6 py-3 font-bold text-white"
        >
          Ver projetos
        </Link>

        <Link
          href="/freelancers"
          className="rounded-xl border border-white/20 px-6 py-3 font-bold text-white"
        >
          Ver freelancers
        </Link>
      </div>
    </main>
  );
}