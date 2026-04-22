"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Stats = {
  projetos: number;
  propostasRecebidas: number;
  propostasEnviadas: number;
  convitesRecebidos: number;
  favoritos: number;
  notificacoesNaoLidas: number;
};

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    projetos: 0,
    propostasRecebidas: 0,
    propostasEnviadas: 0,
    convitesRecebidos: 0,
    favoritos: 0,
    notificacoesNaoLidas: 0,
  });

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);
      carregarDashboard(parsed);
    }
  }, []);

  async function carregarDashboard(usuarioAtual: any) {
    const { count: notificacoesNaoLidas } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", usuarioAtual.id)
      .eq("lida", false);

    if (usuarioAtual.tipo_usuario === "contratante") {
      const { data: projetos } = await supabase
        .from("projetos")
        .select("id")
        .eq("contratante_id", usuarioAtual.id);

      const projetoIds = projetos?.map((p: any) => p.id) || [];

      let propostasRecebidas = 0;

      if (projetoIds.length > 0) {
        const { count } = await supabase
          .from("propostas")
          .select("*", { count: "exact", head: true })
          .in("projeto_id", projetoIds);

        propostasRecebidas = count || 0;
      }

      const { count: favoritos } = await supabase
        .from("favoritos")
        .select("*", { count: "exact", head: true })
        .eq("contratante_id", usuarioAtual.id);

      setStats({
        projetos: projetos?.length || 0,
        propostasRecebidas,
        propostasEnviadas: 0,
        convitesRecebidos: 0,
        favoritos: favoritos || 0,
        notificacoesNaoLidas: notificacoesNaoLidas || 0,
      });

      return;
    }

    const { count: propostasEnviadas } = await supabase
      .from("propostas")
      .select("*", { count: "exact", head: true })
      .eq("freelancer_id", usuarioAtual.id);

    const { count: convitesRecebidos } = await supabase
      .from("convites")
      .select("*", { count: "exact", head: true })
      .eq("freelancer_id", usuarioAtual.id);

    setStats({
      projetos: 0,
      propostasRecebidas: 0,
      propostasEnviadas: propostasEnviadas || 0,
      convitesRecebidos: convitesRecebidos || 0,
      favoritos: 0,
      notificacoesNaoLidas: notificacoesNaoLidas || 0,
    });
  }

  function card(titulo: string, valor: number, cor = "border-white/10") {
    return (
      <div className={`rounded-2xl border ${cor} bg-slate-900 p-6`}>
        <p className="text-sm text-slate-400">{titulo}</p>
        <p className="text-3xl font-bold mt-2">{valor}</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Carregando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-2">
              Resumo rápido da sua conta
            </p>
          </div>

          <Link
            href={usuario.tipo_usuario === "contratante" ? "/painel-contratante" : "/painel-freelancer"}
            className="border border-white/20 px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        {usuario.tipo_usuario === "contratante" ? (
          <>
            <div className="grid md:grid-cols-4 gap-6">
              {card("Projetos publicados", stats.projetos, "border-emerald-400/20")}
              {card("Propostas recebidas", stats.propostasRecebidas, "border-white/10")}
              {card("Favoritos", stats.favoritos, "border-white/10")}
              {card("Notificações novas", stats.notificacoesNaoLidas, "border-yellow-400/20")}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-10">
              <Link href="/projetos/novo" className="bg-emerald-400 text-black px-6 py-4 rounded-xl font-bold text-center">
                Criar novo projeto
              </Link>

              <Link href="/propostas-recebidas" className="bg-white text-black px-6 py-4 rounded-xl font-bold text-center">
                Ver propostas
              </Link>

              <Link href="/freelancers" className="border border-white/20 px-6 py-4 rounded-xl font-bold text-center">
                Buscar freelancers
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {card("Propostas enviadas", stats.propostasEnviadas, "border-emerald-400/20")}
              {card("Convites recebidos", stats.convitesRecebidos, "border-white/10")}
              {card("Notificações novas", stats.notificacoesNaoLidas, "border-yellow-400/20")}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-10">
              <Link href="/projetos" className="bg-emerald-400 text-black px-6 py-4 rounded-xl font-bold text-center">
                Ver projetos
              </Link>

              <Link href="/minhas-propostas" className="bg-white text-black px-6 py-4 rounded-xl font-bold text-center">
                Minhas propostas
              </Link>

              <Link href="/convites" className="border border-white/20 px-6 py-4 rounded-xl font-bold text-center">
                Meus convites
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}