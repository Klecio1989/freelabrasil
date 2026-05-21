"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState(0);
  const [freelancers, setFreelancers] = useState(0);
  const [contratantes, setContratantes] = useState(0);
  const [projetos, setProjetos] = useState(0);
  const [saquesPendentes, setSaquesPendentes] = useState(0);
  const [pagamentos, setPagamentos] = useState(0);

  const [usuariosPremium, setUsuariosPremium] = useState(0);
  const [faturamento, setFaturamento] = useState(0);

  const [crescimentoUsuarios, setCrescimentoUsuarios] = useState<any[]>([]);
  const [crescimentoProjetos, setCrescimentoProjetos] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);

    const [
      usuariosData,
      freelancersData,
      contratantesData,
      projetosData,
      saquesData,
      pagamentosData,
      premiumData,
      pagamentosValores,
      usuariosGrafico,
      projetosGrafico,
    ] = await Promise.all([
      supabase.from("usuarios").select("*", {
        count: "exact",
        head: true,
      }),

      supabase
        .from("usuarios")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("tipo_usuario", "freelancer"),

      supabase
        .from("usuarios")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("tipo_usuario", "contratante"),

      supabase.from("projetos").select("*", {
        count: "exact",
        head: true,
      }),

      supabase
        .from("saques")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", "pendente"),

      supabase.from("pagamentos").select("*", {
        count: "exact",
        head: true,
      }),

      supabase
        .from("usuarios")
        .select("*", {
          count: "exact",
          head: true,
        })
        .in("plano", ["plus", "pro"]),

      supabase
        .from("pagamentos")
        .select("valor,status"),

      supabase
        .from("usuarios")
        .select("created_at")
        .order("created_at", { ascending: true }),

      supabase
        .from("projetos")
        .select("created_at")
        .order("created_at", { ascending: true }),
    ]);

    setUsuarios(usuariosData.count || 0);
    setFreelancers(freelancersData.count || 0);
    setContratantes(contratantesData.count || 0);
    setProjetos(projetosData.count || 0);
    setSaquesPendentes(saquesData.count || 0);
    setPagamentos(pagamentosData.count || 0);
    setUsuariosPremium(premiumData.count || 0);

    let totalFaturamento = 0;

    (pagamentosValores.data || []).forEach((p: any) => {
      if (p.status === "approved" || p.status === "aprovado") {
        totalFaturamento += Number(p.valor || 0);
      }
    });

    setFaturamento(totalFaturamento);

    setCrescimentoUsuarios(usuariosGrafico.data || []);
    setCrescimentoProjetos(projetosGrafico.data || []);

    setLoading(false);
  }

  const card =
    "rounded-3xl border border-white/10 bg-white/5 p-7 shadow-xl";

  const crescimentoUsuariosMes = useMemo(() => {
    return crescimentoUsuarios.length;
  }, [crescimentoUsuarios]);

  const crescimentoProjetosMes = useMemo(() => {
    return crescimentoProjetos.length;
  }, [crescimentoProjetos]);

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando dashboard executivo...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-7xl">

        <div className="flex flex-wrap items-center justify-between gap-6">

          <div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              Dashboard Executivo
            </span>

            <h1 className="mt-5 text-5xl font-black">
              Painel Administrativo
            </h1>

            <p className="mt-4 text-lg text-slate-300">
              Gestão completa da plataforma FreellaBrasil.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-7 py-6">
            <p className="text-sm text-emerald-200">
              Faturamento estimado
            </p>

            <h2 className="mt-2 text-4xl font-black">
              {formatar(faturamento)}
            </h2>
          </div>

        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className={card}>
            <p className="text-slate-400">
              Usuários
            </p>

            <h2 className="mt-3 text-5xl font-black">
              {usuarios}
            </h2>

            <p className="mt-3 text-sm text-emerald-300">
              +{crescimentoUsuariosMes} cadastros
            </p>
          </div>

          <div className={card}>
            <p className="text-slate-400">
              Freelancers
            </p>

            <h2 className="mt-3 text-5xl font-black text-emerald-300">
              {freelancers}
            </h2>
          </div>

          <div className={card}>
            <p className="text-slate-400">
              Contratantes
            </p>

            <h2 className="mt-3 text-5xl font-black text-cyan-300">
              {contratantes}
            </h2>
          </div>

          <div className={card}>
            <p className="text-slate-400">
              Usuários premium
            </p>

            <h2 className="mt-3 text-5xl font-black text-yellow-300">
              {usuariosPremium}
            </h2>
          </div>

          <div className={card}>
            <p className="text-slate-400">
              Projetos
            </p>

            <h2 className="mt-3 text-5xl font-black text-purple-300">
              {projetos}
            </h2>

            <p className="mt-3 text-sm text-emerald-300">
              +{crescimentoProjetosMes} publicados
            </p>
          </div>

          <div className={card}>
            <p className="text-slate-400">
              Saques pendentes
            </p>

            <h2 className="mt-3 text-5xl font-black text-red-300">
              {saquesPendentes}
            </h2>
          </div>

          <div className={card}>
            <p className="text-slate-400">
              Pagamentos
            </p>

            <h2 className="mt-3 text-5xl font-black text-pink-300">
              {pagamentos}
            </h2>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 p-7 shadow-xl">
            <p className="text-slate-200">
              Marketplace Status
            </p>

            <h2 className="mt-3 text-4xl font-black text-emerald-300">
              ONLINE
            </h2>

            <p className="mt-4 text-sm text-slate-300">
              Plataforma operacional e monetizada.
            </p>
          </div>

        </div>

        <div className="mt-12 grid gap-6 xl:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">
                Crescimento usuários
              </h2>

              <span className="text-sm text-emerald-300">
                Em expansão
              </span>
            </div>

            <div className="mt-8 flex h-[260px] items-end gap-3 overflow-hidden">

              {crescimentoUsuarios.slice(-20).map((_: any, index: number) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-xl bg-emerald-400/80 transition hover:bg-emerald-300"
                  style={{
                    height: `${40 + (index % 10) * 18}px`,
                  }}
                />
              ))}

            </div>

            <p className="mt-6 text-sm text-slate-400">
              Evolução visual de novos usuários cadastrados.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">
                Crescimento projetos
              </h2>

              <span className="text-sm text-cyan-300">
                Marketplace ativo
              </span>
            </div>

            <div className="mt-8 flex h-[260px] items-end gap-3 overflow-hidden">

              {crescimentoProjetos.slice(-20).map((_: any, index: number) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-xl bg-cyan-400/80 transition hover:bg-cyan-300"
                  style={{
                    height: `${50 + (index % 8) * 20}px`,
                  }}
                />
              ))}

            </div>

            <p className="mt-6 text-sm text-slate-400">
              Evolução visual dos projetos publicados.
            </p>
          </div>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Link href="/admin/usuarios" className={menu}>
            👥 Gerenciar usuários
          </Link>

          <Link href="/admin/saques" className={menu}>
            💸 Gerenciar saques
          </Link>

          <Link href="/admin/pagamentos" className={menu}>
            💳 Pagamentos
          </Link>

          <Link href="/admin/projetos" className={menu}>
            📁 Projetos
          </Link>

        </div>

      </section>
    </main>
  );
}

const menu =
  "rounded-2xl border border-white/10 bg-white/5 p-6 text-xl font-bold transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10";