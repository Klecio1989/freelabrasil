"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PainelContratante() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">PRO</span>;
    }

    if (plano === "plus") {
      return <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">PLUS</span>;
    }

    return <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">GRATUITO</span>;
  }

  function cardDestaque(plano?: string) {
    if (plano === "pro") return "border-purple-500/50 bg-purple-500/5";
    if (plano === "plus") return "border-emerald-400/40 bg-emerald-400/5";
    return "border-white/10 bg-slate-900";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div
        className={`p-10 rounded-2xl space-y-6 text-center min-w-[420px] border ${cardDestaque(
          usuario?.plano
        )}`}
      >
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold">Painel do Contratante</h1>
          {badgePlano(usuario?.plano)}
        </div>

        <p className="text-slate-400">Gerencie seus projetos e propostas</p>

        {usuario && (
          <div className="bg-slate-800 rounded-xl p-4 text-left space-y-2">
            <p>Usuário: <b>{usuario.nome}</b></p>
            <p>Plano: <b>{usuario.plano || "gratuito"}</b></p>
            <p>Projetos publicados: <b>{usuario.projetos_publicados || 0}</b></p>
          </div>
        )}

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
            href="/freelancers"
            className="border border-white/20 px-6 py-3 rounded-lg"
          >
            Buscar freelancers
          </Link>

          <Link
            href="/favoritos"
            className="border border-white/20 px-6 py-3 rounded-lg"
          >
            Meus favoritos
          </Link>

          <Link
            href="/notificacoes"
            className="border border-white/20 px-6 py-3 rounded-lg"
          >
            Notificações
          </Link>

          <Link
            href="/perfil"
            className="border border-white/20 px-6 py-3 rounded-lg"
          >
            Meu perfil
          </Link>

          <Link
            href="/projetos"
            className="border border-white/20 px-6 py-3 rounded-lg"
          >
            Ver todos projetos
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