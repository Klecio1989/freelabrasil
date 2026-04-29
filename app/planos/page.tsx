"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function PlanosPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState("");

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  async function alterarPlano(plano: "gratuito" | "plus" | "pro") {
    if (!usuario?.id) {
      alert("Faça login para alterar o plano.");
      return;
    }

    try {
      setCarregando(plano);

      const { data, error } = await supabase
        .from("usuarios")
        .update({ plano })
        .eq("id", usuario.id)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      localStorage.setItem("freelabrasil_usuario", JSON.stringify(data));
      setUsuario(data);

      alert(`Plano alterado para ${plano.toUpperCase()} com sucesso!`);
    } finally {
      setCarregando("");
    }
  }

  function Card({
    titulo,
    preco,
    plano,
    destaque,
    beneficios,
    cor,
  }: {
    titulo: string;
    preco: string;
    plano: "gratuito" | "plus" | "pro";
    destaque?: string;
    beneficios: string[];
    cor: string;
  }) {
    const ativo = (usuario?.plano || "gratuito") === plano;

    return (
      <div className={`rounded-[2rem] border p-8 ${cor}`}>
        {destaque && (
          <div className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950">
            {destaque}
          </div>
        )}

        <h2 className="mt-4 text-3xl font-black">{titulo}</h2>
        <p className="mt-3 text-5xl font-black">{preco}</p>
        <p className="mt-2 text-sm text-slate-400">por mês</p>

        <div className="mt-8 space-y-3">
          {beneficios.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={() => alterarPlano(plano)}
          disabled={ativo || carregando === plano}
          className={`mt-8 w-full rounded-xl px-6 py-3 font-bold ${
            ativo
              ? "bg-slate-700 text-white"
              : "bg-emerald-400 text-slate-950"
          } disabled:opacity-60`}
        >
          {carregando === plano
            ? "Alterando..."
            : ativo
            ? "Plano atual"
            : `Escolher ${titulo}`}
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-black">Planos FreelaBrasil</h1>
            <p className="mt-4 text-slate-300">
              Escolha o plano ideal para ganhar mais destaque.
            </p>
          </div>

          <Link
            href="/perfil"
            className="rounded-xl border border-white/20 px-5 py-3"
          >
            Voltar ao perfil
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            titulo="Gratuito"
            preco="R$ 0"
            plano="gratuito"
            cor="border-white/10 bg-white/5"
            beneficios={[
              "Perfil profissional",
              "Portfólio básico",
              "Até 2 propostas",
              "Receber mensagens",
            ]}
          />

          <Card
            titulo="Plus"
            preco="R$ 19,99"
            plano="plus"
            destaque="MAIS POPULAR"
            cor="border-emerald-400/40 bg-emerald-400/5"
            beneficios={[
              "Mais destaque",
              "Até 10 propostas por dia",
              "Receber convites",
              "Melhor posição no ranking",
            ]}
          />

          <Card
            titulo="Pro"
            preco="R$ 29,99"
            plano="pro"
            destaque="MÁXIMO DESTAQUE"
            cor="border-purple-500/40 bg-purple-500/5"
            beneficios={[
              "Prioridade máxima",
              "Propostas ilimitadas",
              "Mais visibilidade",
              "Ranking premium",
            ]}
          />
        </div>
      </div>
    </main>
  );
}