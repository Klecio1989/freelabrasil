"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Proposta = {
  id: string;
  valor: string;
  prazo: number;
  mensagem: string;
  status: string;
  freelancer_id: string;
  projeto_id: string;
  freelancer_nome?: string;
  freelancer_email?: string;
  freelancer_plano?: string;
  projeto_titulo?: string;
};

export default function PropostasRecebidas() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);

  useEffect(() => {
    const usuario = localStorage.getItem("freelabrasil_usuario");

    if (usuario) {
      const parsed = JSON.parse(usuario);
      carregarPropostas(parsed.id);
    }
  }, []);

  async function carregarPropostas(contratanteId: string) {
    const { data: projetosData } = await supabase
      .from("projetos")
      .select("id,titulo")
      .eq("contratante_id", contratanteId);

    if (!projetosData || projetosData.length === 0) {
      setPropostas([]);
      return;
    }

    const projetoIds = projetosData.map((p: any) => p.id);

    const { data: propostasData } = await supabase
      .from("propostas")
      .select("id,valor,prazo,mensagem,status,freelancer_id,projeto_id")
      .in("projeto_id", projetoIds);

    if (!propostasData || propostasData.length === 0) {
      setPropostas([]);
      return;
    }

    const freelancerIds = [
      ...new Set(propostasData.map((p: any) => p.freelancer_id).filter(Boolean)),
    ];

    let usuariosMap: Record<string, any> = {};

    if (freelancerIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id,nome,email,plano")
        .in("id", freelancerIds);

      if (usuariosData) {
        usuariosMap = Object.fromEntries(
          usuariosData.map((u: any) => [u.id, u])
        );
      }
    }

    const projetosMap = Object.fromEntries(
      projetosData.map((p: any) => [p.id, p])
    );

    const formatadas = propostasData.map((p: any) => ({
      ...p,
      freelancer_nome: usuariosMap[p.freelancer_id]?.nome || "Freelancer",
      freelancer_email: usuariosMap[p.freelancer_id]?.email || "",
      freelancer_plano: usuariosMap[p.freelancer_id]?.plano || "gratuito",
      projeto_titulo: projetosMap[p.projeto_id]?.titulo || "Projeto",
    }));

    const prioridadePlano: Record<string, number> = {
      pro: 0,
      plus: 1,
      gratuito: 2,
    };

    formatadas.sort((a: any, b: any) => {
      const prioridadeA = prioridadePlano[a.freelancer_plano || "gratuito"];
      const prioridadeB = prioridadePlano[b.freelancer_plano || "gratuito"];

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }

      return 0;
    });

    setPropostas(formatadas);
  }

  async function atualizarStatus(id: string, status: string) {
    await supabase.from("propostas").update({ status }).eq("id", id);

    setPropostas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return (
        <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">
          PRO
        </span>
      );
    }

    if (plano === "plus") {
      return (
        <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">
          PLUS
        </span>
      );
    }

    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">
        GRATUITO
      </span>
    );
  }

  function cardDestaque(plano?: string) {
    if (plano === "pro") {
      return "border-purple-500/50 bg-purple-500/5";
    }

    if (plano === "plus") {
      return "border-emerald-400/40 bg-emerald-400/5";
    }

    return "border-white/10 bg-slate-900";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Propostas recebidas</h1>

      <div className="grid gap-6">
        {propostas.map((p) => (
          <div
            key={p.id}
            className={`border rounded-xl p-6 ${cardDestaque(p.freelancer_plano)}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">{p.projeto_titulo}</h2>
              {badgePlano(p.freelancer_plano)}
            </div>

            <p className="text-sm text-slate-400 mt-2">
              Freelancer: {p.freelancer_nome}
            </p>

            <p className="text-sm text-slate-500">
              {p.freelancer_email}
            </p>

            <p className="mt-4">Valor: {p.valor}</p>
            <p>Prazo: {p.prazo} dias</p>

            <p className="mt-4 text-slate-300">{p.mensagem}</p>

            <p className="mt-4 text-sm">
              Status: <b>{p.status || "pendente"}</b>
            </p>

            {(!p.status || p.status === "pendente") && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => atualizarStatus(p.id, "aceita")}
                  className="bg-emerald-400 text-black px-4 py-2 rounded"
                >
                  Aceitar
                </button>

                <button
                  onClick={() => atualizarStatus(p.id, "recusada")}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Recusar
                </button>
              </div>
            )}

            {p.status === "aceita" && (
              <Link
                href="/chat"
                className="inline-block mt-6 bg-emerald-400 text-black px-4 py-2 rounded"
              >
                Abrir chat
              </Link>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}