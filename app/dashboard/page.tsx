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

    if (user.tipo_usuario === "freelancer") {
      const { data, error } = await supabase
        .from("propostas")
        .select("id,status")
        .eq("freelancer_id", user.id);

      if (!error && data) {
        calcularPropostas(data);
      }

      setCarregando(false);
      return;
    }

    if (user.tipo_usuario === "contratante") {
      const { data: projetos } = await supabase
        .from("projetos")
        .select("id")
        .eq("contratante_id", user.id);

      const projetoIds = projetos?.map((p: any) => p.id) || [];

      if (projetoIds.length === 0) {
        calcularPropostas([]);
        setCarregando(false);
        return;
      }

      const { data, error } = await supabase
        .from("propostas")
        .select("id,status,projeto_id")
        .in("projeto_id", projetoIds);

      if (!error && data) {
        calcularPropostas(data);
      }

      setCarregando(false);
      return;
    }

    setCarregando(false);
  }

  function calcularPropostas(lista: any[]) {
    const total = lista.length;
    const aceitas = lista.filter((p) => p.status === "aceita").length;
    const recusadas = lista.filter((p) => p.status === "recusada").length;
    const pendentes = lista.filter(
      (p) => !p.status || p.status === "pendente"
    ).length;

    setTotalPropostas(total);
    setPropostasAceitas(aceitas);
    setPropostasRecusadas(recusadas);
    setPropostasPendentes(pendentes);
  }

  function card(titulo: string, valor: number, detalhe: string, destaque?: string) {
    return (
      <div className={`rounded-2xl border p-6 ${destaque || "border-white/10 bg-white/5"}`}>
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
              Acompanhe suas propostas, aceite, recusa e oportunidades em andamento.
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
              {card(
                "Total de propostas",
                totalPropostas,
                "Todas as propostas vinculadas à sua conta",
                "border-white/10 bg-white/5"
              )}

              {card(
                "Propostas aceitas",
                propostasAceitas,
                "Propostas que avançaram para negociação/chat",
                "border-emerald-400/40 bg-emerald-400/5"
              )}

              {card(
                "Propostas recusadas",
                propostasRecusadas,
                "Propostas recusadas no processo",
                "border-red-400/40 bg-red-400/5"
              )}

              {card(
                "Propostas pendentes",
                propostasPendentes,
                "Aguardando decisão",
                "border-yellow-400/40 bg-yellow-400/5"
              )}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {usuario?.tipo_usuario === "freelancer" && (
                <>
                  <Link
                    href="/projetos"
                    className="rounded-xl bg-emerald-400 px-6 py-4 text-center font-bold text-slate-950"
                  >
                    Buscar projetos
                  </Link>

                  <Link
                    href="/minhas-propostas"
                    className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white"
                  >
                    Minhas propostas
                  </Link>

                  <Link
                    href="/convites"
                    className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white"
                  >
                    Meus convites
                  </Link>
                </>
              )}

              {usuario?.tipo_usuario === "contratante" && (
                <>
                  <Link
                    href="/projetos/novo"
                    className="rounded-xl bg-emerald-400 px-6 py-4 text-center font-bold text-slate-950"
                  >
                    Criar projeto
                  </Link>

                  <Link
                    href="/propostas-recebidas"
                    className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white"
                  >
                    Propostas recebidas
                  </Link>

                  <Link
                    href="/freelancers"
                    className="rounded-xl border border-white/20 px-6 py-4 text-center font-bold text-white"
                  >
                    Buscar freelancers
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