"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PainelFreelancer() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 p-10 rounded-2xl space-y-6 text-center min-w-[380px]">
        <h1 className="text-3xl font-bold">Painel do Freelancer</h1>

        <p className="text-slate-400">Gerencie propostas e plano</p>

        {usuario && (
          <div className="bg-slate-800 rounded-xl p-4 text-left">
            <p>
              Usuário: <b>{usuario.nome}</b>
            </p>
            <p>
              Plano: <b>{usuario.plano || "gratuito"}</b>
            </p>
          </div>
        )}

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

          <Link
            href="/planos"
            className="bg-purple-500 text-white font-bold px-6 py-3 rounded-lg"
          >
            Alterar plano
          </Link>
        </div>
      </div>
    </main>
  );
}