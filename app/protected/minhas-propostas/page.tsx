"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

type Proposta = {
  id: string;
  valor: string;
  prazo: number;
  mensagem: string;
  status: string;
  projeto_id: string;
  projeto_titulo?: string;
  contratante_id?: string;
};

export default function MinhasPropostas() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);

  useEffect(() => {
    const usuario = localStorage.getItem("freelabrasil_usuario");

    if (usuario) {
      const parsed = JSON.parse(usuario);
      carregarPropostas(parsed.id);
    }
  }, []);

  async function carregarPropostas(freelancerId: string) {
    const { data } = await supabase
      .from("propostas")
      .select("*")
      .eq("freelancer_id", freelancerId);

    if (!data) return;

    const projetoIds = data.map((p: any) => p.projeto_id);

    const { data: projetos } = await supabase
      .from("projetos")
      .select("id,titulo,contratante_id")
      .in("id", projetoIds);

    const projetosMap = Object.fromEntries(
      projetos?.map((p: any) => [p.id, p]) || []
    );

    const formatadas = data.map((p: any) => ({
      ...p,
      projeto_titulo: projetosMap[p.projeto_id]?.titulo,
      contratante_id: projetosMap[p.projeto_id]?.contratante_id,
    }));

    setPropostas(formatadas);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Minhas propostas</h1>

      <div className="grid gap-6">
        {propostas.map((p) => (
          <div
            key={p.id}
            className="border border-white/10 bg-slate-900 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold">{p.projeto_titulo}</h2>

            <p className="mt-2">Valor: {p.valor}</p>
            <p>Prazo: {p.prazo} dias</p>

            <p className="mt-4 text-slate-300">{p.mensagem}</p>

            <p className="mt-4 text-sm">
              Status: <b>{p.status || "pendente"}</b>
            </p>

            <div className="flex gap-3 mt-6">
              {p.status === "aceita" && (
                <Link
                  href={`/chat?proposta_id=${p.id}`}
                  className="bg-emerald-400 text-black px-4 py-2 rounded font-bold"
                >
                  Abrir chat
                </Link>
              )}

              <Link
                href={`/freelancer/${p.contratante_id}`}
                className="border border-white/20 px-4 py-2 rounded"
              >
                Ver contratante
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}