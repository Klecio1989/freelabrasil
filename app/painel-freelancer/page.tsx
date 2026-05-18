"use client";

import Link from "next/link";

export default function PainelFreelancer() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">Painel do Freelancer</h1>

        <p className="mt-4 text-lg text-slate-300">
          Gerencie seus projetos, propostas e acompanhe seus trabalhos.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/minhas-propostas" className={card}>
            <h2 className="text-xl font-bold text-white">Minhas propostas</h2>
            <p className="mt-3 text-slate-400">
              Visualize todas as propostas enviadas para contratantes.
            </p>
          </Link>

          <Link href="/meus-projetos" className={card}>
            <h2 className="text-xl font-bold text-white">Meus projetos</h2>
            <p className="mt-3 text-slate-400">
              Acompanhe os projetos que você aceitou e está trabalhando.
            </p>
          </Link>

          <Link href="/minhas-avaliacoes" className={card}>
            <h2 className="text-xl font-bold text-white">Minhas avaliações</h2>
            <p className="mt-3 text-slate-400">
              Veja as avaliações recebidas no seu perfil.
            </p>
          </Link>

          <Link href="/perfil" className={card}>
            <h2 className="text-xl font-bold text-white">Meu perfil</h2>
            <p className="mt-3 text-slate-400">
              Atualize seus dados e portfólio.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

const card =
  "rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10";