"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MinhasAvaliacoesPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  async function carregarAvaliacoes() {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    const { data, error } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("avaliado_id", parsed.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar avaliações:", error);
      setAvaliacoes([]);
    } else {
      setAvaliacoes(data || []);
    }

    setLoading(false);
  }

  function estrelas(nota: number) {
    const valor = Number(nota || 0);
    return "★".repeat(valor) + "☆".repeat(5 - valor);
  }

  function voltarPainel() {
    if (usuario?.tipo_usuario === "freelancer") return "/painel-freelancer";
    if (usuario?.tipo_usuario === "contratante") return "/painel-contratante";
    return "/";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando...
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Você precisa estar logado.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Minhas Avaliações</h1>
            <p className="mt-3 text-slate-400">
              Veja as notas e comentários recebidos nos projetos concluídos.
            </p>
          </div>

          <Link
            href={voltarPainel()}
            className="rounded-xl border border-white/20 px-5 py-3 font-bold"
          >
            Voltar
          </Link>
        </div>

        {avaliacoes.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            Nenhuma avaliação recebida ainda.
          </div>
        )}

        <div className="grid gap-5">
          {avaliacoes.map((a) => (
            <div
              key={a.id}
              className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="text-3xl text-yellow-400">
                {estrelas(a.nota)}
              </div>

              <p className="mt-4 text-lg leading-8 text-slate-200">
                “{a.comentario || "Sem comentário."}”
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
                <span>Nota: {a.nota}/5</span>

                {a.created_at && (
                  <span>
                    Data: {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}