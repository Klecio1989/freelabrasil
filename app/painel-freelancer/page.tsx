"use client";

import Link from "next/link";

export default function PainelFreelancer() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 p-10 rounded-2xl space-y-6 text-center">
        
        <h1 className="text-3xl font-bold">
          Painel do Freelancer
        </h1>

        <p className="text-slate-400">
          Gerencie suas propostas
        </p>

        <div className="flex flex-col gap-4">

          <Link
            href="/projetos"
            className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg"
          >
            Ver projetos disponíveis
          </Link>

          <Link
            href="/minhas-propostas"
            className="bg-white text-black font-bold px-6 py-3 rounded-lg"
          >
            Minhas propostas
          </Link>

        </div>

      </div>
    </main>
  );
}