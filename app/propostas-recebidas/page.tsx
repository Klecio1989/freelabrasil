"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Proposta = {
  id: string;
  freelancer_id: string;
  projeto_id: string;
  valor: string;
  prazo: number;
  mensagem: string;
  status: string;
  created_at?: string;
  freelancer_nome?: string;
  projeto_titulo?: string;
};

export default function PropostasRecebidasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPropostas();
  }, []);

  async function carregarPropostas() {
    setCarregando(true);

    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (!usuarioSalvo) return;

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    const { data: projetos } = await supabase
      .from("projetos")
      .select("id,titulo")
      .eq("contratante_id", parsed.id);

    if (!projetos || projetos.length === 0) {
      setPropostas([]);
      setCarregando(false);
      return;
    }

    const projetoIds = projetos.map((p: any) => p.id);

    const { data: propostasData } = await supabase
      .from("propostas")
      .select("*")
      .in("projeto_id", projetoIds)
      .order("created_at", { ascending: false });

    if (!propostasData) {
      setPropostas([]);
      setCarregando(false);
      return;
    }

    const freelancerIds = [
      ...new Set(propostasData.map((p: any) => p.freelancer_id)),
    ];

    const { data: freelancers } = await supabase
      .from("usuarios")
      .select("id,nome")
      .in("id", freelancerIds);

    const mapFreela = Object.fromEntries(
      freelancers?.map((f: any) => [f.id, f.nome]) || []
    );

    const mapProjeto = Object.fromEntries(
      projetos.map((p: any) => [p.id, p.titulo])
    );

    const formatadas = propostasData.map((p: any) => ({
      ...p,
      freelancer_nome: mapFreela[p.freelancer_id] || "Freelancer",
      projeto_titulo: mapProjeto[p.projeto_id] || "Projeto",
    }));

    setPropostas(formatadas);
    setCarregando(false);
  }

  async function atualizarStatus(proposta: Proposta, status: "aceita" | "recusada") {
    const { error } = await supabase
      .from("propostas")
      .update({ status })
      .eq("id", proposta.id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("notificacoes").insert([
      {
        usuario_id: proposta.freelancer_id,
        titulo: status === "aceita" ? "Proposta aceita" : "Proposta recusada",
        descricao: `Sua proposta para "${proposta.projeto_titulo}" foi ${status}.`,
        lida: false,
        link: `/chat?proposta_id=${proposta.id}`,
      },
    ]);

    setPropostas((prev) =>
      prev.map((p) =>
        p.id === proposta.id ? { ...p, status } : p
      )
    );

    alert(status === "aceita" ? "Proposta aceita!" : "Proposta recusada.");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-10">
          Propostas recebidas
        </h1>

        {carregando && (
          <p className="text-slate-400">Carregando...</p>
        )}

        {!carregando && propostas.length === 0 && (
          <p className="text-slate-400">Nenhuma proposta recebida.</p>
        )}

        <div className="grid gap-6">
          {propostas.map((p) => (
            <div
              key={p.id}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl"
            >
              <h2 className="text-2xl font-bold">
                {p.projeto_titulo}
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Freelancer: {p.freelancer_nome}
              </p>

              <p className="mt-4">{p.mensagem}</p>

              <div className="mt-4 text-sm">
                💰 Valor: {p.valor} <br />
                ⏱ Prazo: {p.prazo} dias
              </div>

              <div className="mt-6 flex gap-3 flex-wrap">
                {(!p.status || p.status === "pendente") && (
                  <>
                    <button
                      onClick={() => atualizarStatus(p, "aceita")}
                      className="bg-emerald-400 text-black px-4 py-2 rounded font-bold"
                    >
                      Aceitar
                    </button>

                    <button
                      onClick={() => atualizarStatus(p, "recusada")}
                      className="border border-red-400 text-red-300 px-4 py-2 rounded"
                    >
                      Recusar
                    </button>
                  </>
                )}

                {p.status === "aceita" && (
                  <Link
                    href={`/chat?proposta_id=${p.id}`}
                    className="bg-emerald-400 text-black px-4 py-2 rounded font-bold"
                  >
                    Abrir chat
                  </Link>
                )}

                {p.status === "recusada" && (
                  <span className="text-red-400 font-bold">
                    Proposta recusada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}