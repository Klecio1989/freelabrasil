"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState(0);
  const [freelancers, setFreelancers] = useState(0);
  const [contratantes, setContratantes] = useState(0);
  const [projetos, setProjetos] = useState(0);
  const [saquesPendentes, setSaquesPendentes] = useState(0);
  const [pagamentos, setPagamentos] = useState(0);

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
    ]);

    setUsuarios(usuariosData.count || 0);
    setFreelancers(freelancersData.count || 0);
    setContratantes(contratantesData.count || 0);
    setProjetos(projetosData.count || 0);
    setSaquesPendentes(saquesData.count || 0);
    setPagamentos(pagamentosData.count || 0);

    setLoading(false);
  }

  const card =
    "rounded-3xl border border-white/10 bg-white/5 p-7 shadow-xl";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando painel admin...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-7xl">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-5xl font-black">
              Painel Administrativo
            </h1>

            <p className="mt-4 text-slate-300">
              Gerencie toda a plataforma FreelaBrasil.
            </p>
          </div>

        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          <div className={card}>
            <p className="text-slate-400">
              Usuários
            </p>

            <h2 className="mt-3 text-5xl font-black">
              {usuarios}
            </h2>
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
              Projetos
            </p>

            <h2 className="mt-3 text-5xl font-black text-yellow-300">
              {projetos}
            </h2>
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

            <h2 className="mt-3 text-5xl font-black text-purple-300">
              {pagamentos}
            </h2>
          </div>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Link href="/admin/saques" className={menu}>
            💸 Gerenciar saques
          </Link>

          <Link href="/admin/usuarios" className={menu}>
            👥 Gerenciar usuários
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
  "rounded-2xl border border-white/10 bg-white/5 p-6 text-xl font-bold transition hover:border-emerald-400/40 hover:bg-white/10";