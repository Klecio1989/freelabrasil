"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Usuario = {
  id: string;
  nome: string;
  tipo_usuario: string;
  plano?: string;
};

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [totalPropostas, setTotalPropostas] = useState(0);
  const [propostasAceitas, setPropostasAceitas] = useState(0);
  const [propostasRecusadas, setPropostasRecusadas] = useState(0);
  const [propostasPendentes, setPropostasPendentes] = useState(0);
  const [totalConvites, setTotalConvites] = useState(0);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      setCarregando(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);
    carregarMetricas(parsed);
  }, []);

  async function carregarMetricas(user: Usuario) {
    setCarregando(true);

    await carregarNotificacoes(user.id);

    if (user.tipo_usuario === "freelancer") {
      const { data: propostas } = await supabase
        .from("propostas")
        .select("id,status")
        .eq("freelancer_id", user.id);

      calcularPropostas(propostas || []);

      const { count: convites } = await supabase
        .from("convites")
        .select("*", { count: "exact", head: true })
        .eq("freelancer_id", user.id);

      setTotalConvites(convites || 0);
      setCarregando(false);
      return;
    }

    if (user.tipo_usuario === "contratante") {
      const { data: projetos } = await supabase
        .from("projetos")
        .select("id")
        .eq("contratante_id", user.id);

      const projetoIds = projetos?.map((p: any) => p.id) || [];

      if (projetoIds.length > 0) {
        const { data: propostas } = await supabase
          .from("propostas")
          .select("id,status,projeto_id")
          .in("projeto_id", projetoIds);

        calcularPropostas(propostas || []);
      } else {
        calcularPropostas([]);
      }

      const { count: convites } = await supabase
        .from("convites")
        .select("*", { count: "exact", head: true })
        .eq("contratante_id", user.id);

      setTotalConvites(convites || 0);
      setCarregando(false);
      return;
    }

    setCarregando(false);
  }

  async function carregarNotificacoes(usuarioId: string) {
    const { count } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", usuarioId)
      .eq("lida", false);

    setNotificacoesNaoLidas(count || 0);
  }

  function calcularPropostas(lista: any[]) {
    setTotalPropostas(lista.length);
    setPropostasAceitas(lista.filter((p) => p.status === "aceita").length);
    setPropostasRecusadas(lista.filter((p) => p.status === "recusada").length);
    setPropostasPendentes(
      lista.filter((p) => !p.status || p.status === "pendente").length
    );
  }

  const taxaAceite =
    totalPropostas > 0 ? Math.round((propostasAceitas / totalPropostas) * 100) : 0;

  function card(titulo: string, valor: string | number, detalhe: string, destaque: string) {
    return (
      <div className={`rounded-2xl border p-6 ${destaque}`}>
        <p className="text-sm text-slate-400">{titulo}</p>
        <p className="mt-2 text-4xl font-black">{valor}</p>
        <p className="mt-2 text-sm text-slate-500">{detalhe}</p>
      </div>
    );
  }

  if (!usuario && !carregando) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-black">Dashboard</h1>
          <p className="mt-4 text-slate-400">
            Faça login para visualizar suas métricas.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
          >
            Fazer login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Visão executiva
            </span>

            <h1 className="mt-4 text-5xl font-black leading-tight">
              Dashboard
            </h1>

            <p className="mt-4 text-lg text-slate-300">
              Acompanhe propostas, convites, notificações e taxa de aceite.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-sm text-slate-400">Plano atual</p>
            <p className="mt-1 text-2xl font-black uppercase">
              {usuario?.plano || "gratuito"}
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            Carregando métricas...
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-4">
              {card("Total de propostas", totalPropostas, "Propostas vinculadas à sua conta", "border-white/10 bg-white/5")}
              {card("Aceitas", propostasAceitas, "Avançaram para chat", "border-emerald-400/40 bg-emerald-400/5")}
              {card("Recusadas", propostasRecusadas, "Não avançaram", "border-red-400/40 bg-red-400/5")}
              {card("Pendentes", propostasPendentes, "Aguardando decisão", "border-yellow-400/40 bg-yellow-400/5")}
              {card("Convites", totalConvites, "Convites enviados/recebidos", "border-purple-400/40 bg-purple-400/5")}
              {card("Notificações", notificacoesNaoLidas, "Não lidas", "border-red-400/40 bg-red-400/5")}
              {card("Taxa de aceite", `${taxaAceite}%`, "Aceitas sobre total", "border-emerald-400/40 bg-emerald-400/5")}
              {card("Conta", usuario?.tipo_usuario || "-", "Tipo de usuário", "border-white/10 bg-white/5")}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {usuario?.tipo_usuario === "freelancer" && (
                <>
                  <Link href="/projetos" className="rounded-xl bg-emerald-400 px-6 py-4 text-center font-bold text-slate-950">
                    Buscar projetos
                  </Link>

                  <Link href="/minhas-propostas" className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white">
                    Minhas propostas
                  </Link>

                  <Link href="/convites" className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white">
                    Meus convites
                  </Link>

                  <Link href="/notificacoes" className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white">
                    Notificações
                  </Link>
                </>
              )}

              {usuario?.tipo_usuario === "contratante" && (
                <>
                  <Link href="/projetos/novo" className="rounded-xl bg-emerald-400 px-6 py-4 text-center font-bold text-slate-950">
                    Criar projeto
                  </Link>

                  <Link href="/propostas-recebidas" className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white">
                    Propostas recebidas
                  </Link>

                  <Link href="/freelancers" className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white">
                    Buscar freelancers
                  </Link>

                  <Link href="/notificacoes" className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white">
                    Notificações
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}