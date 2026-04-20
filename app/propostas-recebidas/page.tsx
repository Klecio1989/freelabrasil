"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Proposta = {
  id: string;
  valor: string;
  prazo: number;
  mensagem: string;
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
        projetos(titulo),
        usuarios(nome,email)
      `)
      .eq("contratante_id", contratanteId);

    if (data) setPropostas(data as any);
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
          </div>
        ))}
      </div>
    </main>
  );
}