"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Convite = {
  id: string;
  mensagem: string;
  status: string;
  projeto_id: string;
  contratante_id: string;
  projeto_titulo?: string;
  contratante_nome?: string;
};

export default function ConvitesPage() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);
      carregarConvites(parsed.id);
    }
  }, []);

  async function carregarConvites(freelancerId: string) {
    const { data } = await supabase
      .from("convites")
      .select("*")
      .eq("freelancer_id", freelancerId)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      setConvites([]);
      return;
    }

    const projetoIds = [...new Set(data.map((item: any) => item.projeto_id))];
    const contratanteIds = [...new Set(data.map((item: any) => item.contratante_id))];

    const { data: projetos } = await supabase
      .from("projetos")
      .select("id,titulo")
      .in("id", projetoIds);

    const { data: contratantes } = await supabase
      .from("usuarios")
      .select("id,nome")
      .in("id", contratanteIds);

    const projetosMap = Object.fromEntries(
      projetos?.map((p: any) => [p.id, p]) || []
    );

    const contratantesMap = Object.fromEntries(
      contratantes?.map((c: any) => [c.id, c]) || []
    );

    const formatados = data.map((item: any) => ({
      ...item,
      projeto_titulo: projetosMap[item.projeto_id]?.titulo || "Projeto",
      contratante_nome: contratantesMap[item.contratante_id]?.nome || "Contratante",
    }));

    setConvites(formatados);
  }

  async function atualizarStatus(id: string, status: string) {
    await supabase.from("convites").update({ status }).eq("id", id);

    setConvites((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Meus convites</h1>
            <p className="text-slate-400 mt-2">
              Convites recebidos de contratantes
            </p>
          </div>

          <Link
            href="/painel-freelancer"
            className="border border-white/20 px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        <div className="grid gap-6">
          {convites.map((convite) => (
            <div
              key={convite.id}
              className="rounded-2xl border border-white/10 bg-slate-900 p-6"
            >
              <h2 className="text-2xl font-bold">{convite.projeto_titulo}</h2>

              <p className="text-slate-400 mt-2">
                Contratante: {convite.contratante_nome}
              </p>

              <p className="text-slate-300 mt-4">
                {convite.mensagem || "Sem mensagem."}
              </p>

              <p className="mt-4 text-sm">
                Status: <b>{convite.status || "pendente"}</b>
              </p>

              {(!convite.status || convite.status === "pendente") && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => atualizarStatus(convite.id, "aceito")}
                    className="bg-emerald-400 text-black px-5 py-3 rounded-lg font-bold"
                  >
                    Aceitar
                  </button>

                  <button
                    onClick={() => atualizarStatus(convite.id, "recusado")}
                    className="bg-red-500 text-white px-5 py-3 rounded-lg font-bold"
                  >
                    Recusar
                  </button>
                </div>
              )}
            </div>
          ))}

          {convites.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center text-slate-400">
              Nenhum convite recebido ainda.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}