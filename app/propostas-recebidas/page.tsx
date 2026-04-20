"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Proposta = {
  id: string;
  valor: string;
  prazo: number;
  mensagem: string;
  status: string;
  projetos: { titulo: string };
  usuarios: { nome: string; email: string };
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
    const { data } = await supabase
      .from("propostas")
      .select(`
        id,
        valor,
        prazo,
        mensagem,
        status,
        projetos(titulo),
        usuarios(nome,email)
      `)
      .eq("contratante_id", contratanteId);

    if (data) setPropostas(data as any);
  }

  async function atualizarStatus(id: string, status: string) {
    await supabase
      .from("propostas")
      .update({ status })
      .eq("id", id);

    setPropostas((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status } : p
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Propostas recebidas</h1>

      <div className="grid gap-6">
        {propostas.map((p) => (
          <div
            key={p.id}
            className="border border-white/10 rounded-xl p-6 bg-slate-900"
          >
            <h2 className="text-xl font-bold">{p.projetos?.titulo}</h2>

            <p className="text-sm text-slate-400 mt-2">
              Freelancer: {p.usuarios?.nome}
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
          </div>
        ))}
      </div>
    </main>
  );
}