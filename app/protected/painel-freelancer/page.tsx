"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PainelFreelancer() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [projetosConcluidos, setProjetosConcluidos] = useState(0);
  const [propostas, setPropostas] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState(0);
  const [ganhos, setGanhos] = useState(0);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const userLocal = localStorage.getItem("freelabrasil_usuario");

      if (!userLocal) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userLocal);

      setUsuario(user);

      await Promise.all([
        carregarProjetos(user.id),
        carregarPropostas(user.id),
        carregarAvaliacoes(user.id),
        carregarGanhos(user.id),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarProjetos(userId: string) {
    const { count } = await supabase
      .from("projetos_andamento")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("freela_id", userId)
      .eq("status", "concluido");

    setProjetosConcluidos(count || 0);
  }

  async function carregarPropostas(userId: string) {
    const { count } = await supabase
      .from("propostas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("freelancer_id", userId);

    setPropostas(count || 0);
  }

  async function carregarAvaliacoes(userId: string) {
    const { count } = await supabase
      .from("avaliacoes")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("avaliado_id", userId);

    setAvaliacoes(count || 0);
  }

  async function carregarGanhos(userId: string) {
    const { data } = await supabase
      .from("projetos_andamento")
      .select(`
        projetos (
          orcamento
        )
      `)
      .eq("freela_id", userId)
      .eq("status", "concluido");

    let total = 0;

    (data || []).forEach((item: any) => {
      const valor = Number(
        item?.projetos?.orcamento
          ?.replace?.(/[^\d,]/g, "")
          ?.replace(",", ".") || 0
      );

      total += valor;
    });

    setGanhos(total);
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return (
        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-300">
          👑 PRO
        </span>
      );
    }

    if (plano === "plus") {
      return (
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-300">
          💎 PLUS
        </span>
      );
    }

    return (
      <span className="rounded-full border border-white/10 bg-slate-700 px-4 py-2 text-sm font-bold text-white">
        GRATUITO
      </span>
    );
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando painel...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-7xl">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black">
                Painel Freelancer
              </h1>

              {badgePlano(usuario?.plano)}
            </div>

            <p className="mt-4 text-lg text-slate-300">
              Gerencie seus projetos, reputação e ganhos.
            </p>
          </div>

          <Link
            href="/planos"
            className="rounded-2xl bg-emerald-400 px-6 py-4 font-black text-slate-950 transition hover:scale-[1.02]"
          >
            Upgrade plano
          </Link>

        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-7">
            <p className="text-sm text-emerald-200">
              Ganhos estimados
            </p>

            <h2 className="mt-3 text-4xl font-black">
              {formatar(ganhos)}
            </h2>

            <p className="mt-3 text-sm text-emerald-100">
              Baseado em projetos concluídos.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-sm text-slate-400">
              Projetos concluídos
            </p>

            <h2 className="mt-3 text-4xl font-black text-emerald-300">
              {projetosConcluidos}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-sm text-slate-400">
              Propostas enviadas
            </p>

            <h2 className="mt-3 text-4xl font-black">
              {propostas}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-sm text-slate-400">
              Avaliações recebidas
            </p>

            <h2 className="mt-3 text-4xl font-black text-yellow-300">
              {avaliacoes}
            </h2>
          </div>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <Link href="/minhas-propostas" className={card}>
            <h2 className="text-xl font-bold text-white">
              Minhas propostas
            </h2>

            <p className="mt-3 text-slate-400">
              Visualize todas as propostas enviadas.
            </p>
          </Link>

          <Link href="/meus-projetos" className={card}>
            <h2 className="text-xl font-bold text-white">
              Meus projetos
            </h2>

            <p className="mt-3 text-slate-400">
              Acompanhe projetos em andamento.
            </p>
          </Link>

          <Link href="/minhas-avaliacoes" className={card}>
            <h2 className="text-xl font-bold text-white">
              Minhas avaliações
            </h2>

            <p className="mt-3 text-slate-400">
              Veja reputação e comentários recebidos.
            </p>
          </Link>

          <Link href="/perfil" className={card}>
            <h2 className="text-xl font-bold text-white">
              Meu perfil
            </h2>

            <p className="mt-3 text-slate-400">
              Atualize seus dados e portfólio.
            </p>
          </Link>

        </div>

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-8">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-3xl font-black">
                Plano atual
              </h2>

              <p className="mt-3 text-slate-400">
                Veja detalhes da sua assinatura.
              </p>
            </div>

            {badgePlano(usuario?.plano)}

          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Plano
              </p>

              <p className="mt-2 text-2xl font-black">
                {(usuario?.plano || "gratuito").toUpperCase()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Status
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-300">
                {usuario?.plano_status || "ativo"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Expira em
              </p>

              <p className="mt-2 text-2xl font-black">
                {usuario?.plano_expira_em
                  ? new Date(usuario.plano_expira_em).toLocaleDateString("pt-BR")
                  : "--"}
              </p>
            </div>

          </div>

          <Link
            href="/planos"
            className="mt-8 inline-block rounded-2xl bg-emerald-400 px-6 py-4 font-black text-slate-950"
          >
            Gerenciar assinatura
          </Link>

        </div>

      </section>
    </main>
  );
}

const card =
  "rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10";