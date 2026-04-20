"use client";

import Link from "next/link";

export default function PainelContratante() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 p-10 rounded-2xl space-y-6 text-center">
        
        <h1 className="text-3xl font-bold">
          Painel do Contratante
        </h1>

        <p className="text-slate-400">
          Gerencie seus projetos e propostas recebidas
        </p>

        <div className="flex flex-col gap-4">

          <Link
            href="/projetos/novo"
            className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg"
          >
            Criar novo projeto
          </Link>

          <Link
            href="/propostas-recebidas"
            className="bg-white text-black font-bold px-6 py-3 rounded-lg"
          >
            Ver propostas recebidas
          </Link>

          <Link
            href="/projetos"
            className="border border-white/20 px-6 py-3 rounded-lg"
          >
            Ver todos projetos
          </Link>

        </div>

      </div>
    </main>
  );
}