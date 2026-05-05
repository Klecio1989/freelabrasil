"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [dados, setDados] = useState({
    usuarios: 0,
    freelancers: 0,
    contratantes: 0,
    projetos: 0,
    projetosAndamento: 0,
    pagamentos: 0,
    totalBruto: 0,
    totalComissao: 0,
    totalFreelancers: 0,
    totalRetido: 0,
    totalLiberado: 0,
    saquesPendentes: 0,
    saquesPagos: 0,
    valorSaquesPendentes: 0,
    valorSaquesPagos: 0,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);

    const user = localStorage.getItem("freelabrasil_usuario");

    if (!user) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(user);
    setUsuario(parsed);

    if (parsed.role !== "admin") {
      setLoading(false);
      return;
    }

    const [
      usuariosRes,
      projetosRes,
      andamentoRes,
      pagamentosRes,
      saquesRes,
    ] = await Promise.all([
      supabase.from("usuarios").select("*"),
      supabase.from("projetos").select("*"),
      supabase.from("projetos_andamento").select("*"),
      supabase.from("pagamentos").select("*"),
      supabase.from("saques").select("*"),
    ]);

    const usuarios = usuariosRes.data || [];
    const projetos = projetosRes.data || [];
    const andamento = andamentoRes.data || [];
    const pagamentos = pagamentosRes.data || [];
    const saques = saquesRes.data || [];

    const totalBruto = pagamentos.reduce(
      (acc: number, p: any) => acc + Number(p.valor_bruto || 0),
      0
    );

    const totalComissao = pagamentos.reduce(
      (acc: number, p: any) => acc + Number(p.comissao_plataforma || 0),
      0
    );

    const totalFreelancers = pagamentos.reduce(
      (acc: number, p: any) => acc + Number(p.valor_freelancer || 0),
      0
    );

    const totalRetido = pagamentos
      .filter((p: any) => p.status === "retido")
      .reduce((acc: number, p: any) => acc + Number(p.valor_bruto || 0), 0);

    const totalLiberado = pagamentos
      .filter((p: any) => p.status === "liberado" || p.status === "pago")
      .reduce((acc: number, p: any) => acc + Number(p.valor_bruto || 0), 0);

    const saquesPendentes = saques.filter((s: any) => s.status === "pendente");
    const saquesPagos = saques.filter((s: any) => s.status === "pago");

    setDados({
      usuarios: usuarios.length,
      freelancers: usuarios.filter((u: any) => u.tipo_usuario === "freelancer").length,
      contratantes: usuarios.filter((u: any) => u.tipo_usuario === "contratante").length,
      projetos: projetos.length,
      projetosAndamento: andamento.length,
      pagamentos: pagamentos.length,
      totalBruto,
      totalComissao,
      totalFreelancers,
      totalRetido,
      totalLiberado,
      saquesPendentes: saquesPendentes.length,
      saquesPagos: saquesPagos.length,
      valorSaquesPendentes: saquesPendentes.reduce(
        (acc: number, s: any) => acc + Number(s.valor || 0),
        0
      ),
      valorSaquesPagos: saquesPagos.reduce(
        (acc: number, s: any) => acc + Number(s.valor || 0),
        0
      ),
    });

    setLoading(false);
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
        Carregando dashboard admin...
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

  if (usuario.role !== "admin") {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8">
          <h1 className="text-3xl font-black text-red-300">Acesso negado</h1>
          <p className="mt-3 text-slate-300">
            Esta área é exclusiva para administradores.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Dashboard Admin</h1>
            <p className="mt-3 text-slate-400">
              Visão geral financeira, usuários, projetos e saques da FreellaBrasil.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/saques"
              className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
            >
              Gerenciar saques
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-white/20 px-5 py-3 font-bold"
            >
              Início
            </Link>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-black">Usuários</h2>
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <Card titulo="Usuários totais" valor={String(dados.usuarios)} />
          <Card titulo="Freelancers" valor={String(dados.freelancers)} verde />
          <Card titulo="Contratantes" valor={String(dados.contratantes)} amarelo />
        </div>

        <h2 className="mb-4 text-2xl font-black">Projetos</h2>
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <Card titulo="Projetos publicados" valor={String(dados.projetos)} />
          <Card titulo="Projetos em andamento" valor={String(dados.projetosAndamento)} />
          <Card titulo="Pagamentos criados" valor={String(dados.pagamentos)} />
        </div>

        <h2 className="mb-4 text-2xl font-black">Financeiro</h2>
        <div className="mb-10 grid gap-4 md:grid-cols-5">
          <Card titulo="Total movimentado" valor={formatar(dados.totalBruto)} />
          <Card titulo="Comissão plataforma" valor={formatar(dados.totalComissao)} verde />
          <Card titulo="Freelancers líquido" valor={formatar(dados.totalFreelancers)} />
          <Card titulo="Retido" valor={formatar(dados.totalRetido)} amarelo />
          <Card titulo="Liberado" valor={formatar(dados.totalLiberado)} verde />
        </div>

        <h2 className="mb-4 text-2xl font-black">Saques</h2>
        <div className="mb-10 grid gap-4 md:grid-cols-4">
          <Card titulo="Saques pendentes" valor={String(dados.saquesPendentes)} amarelo />
          <Card titulo="Valor pendente" valor={formatar(dados.valorSaquesPendentes)} amarelo />
          <Card titulo="Saques pagos" valor={String(dados.saquesPagos)} verde />
          <Card titulo="Valor pago" valor={formatar(dados.valorSaquesPagos)} verde />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-black">Ações rápidas</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link
              href="/admin/saques"
              className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 font-black text-emerald-300"
            >
              Aprovar saques
            </Link>

            <Link
              href="/freelancers"
              className="rounded-2xl border border-white/10 bg-slate-900 p-5 font-black"
            >
              Ver freelancers
            </Link>

            <Link
              href="/dashboard-financeiro"
              className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 font-black text-yellow-300"
            >
              Dashboard financeiro
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({
  titulo,
  valor,
  verde,
  amarelo,
}: {
  titulo: string;
  valor: string;
  verde?: boolean;
  amarelo?: boolean;
}) {
  let classe = "border-white/10 bg-white/5";

  if (verde) classe = "border-emerald-400/30 bg-emerald-400/10";
  if (amarelo) classe = "border-yellow-400/30 bg-yellow-400/10";

  return (
    <div className={`rounded-2xl border p-5 ${classe}`}>
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-2xl font-black">{valor}</p>
    </div>
  );
}