"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardFinanceiro() {
  const [usuario, setUsuario] = useState<any>(null);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [resumo, setResumo] = useState({
    totalBruto: 0,
    totalFreelancer: 0,
    totalComissao: 0,
    totalRetido: 0,
    totalLiberado: 0,
  });

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    let query = supabase
      .from("pagamentos")
      .select("*")
      .order("created_at", { ascending: false });

    if (parsed.tipo_usuario === "freelancer") {
      query = query.eq("freela_id", parsed.id);
    }

    if (parsed.tipo_usuario === "contratante") {
      query = query.eq("contratante_id", parsed.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      alert("Erro ao carregar dashboard financeiro.");
      setLoading(false);
      return;
    }

    const lista = data || [];
    setPagamentos(lista);
    calcularResumo(lista, parsed.tipo_usuario);

    setLoading(false);
  }

  function calcularResumo(lista: any[], tipoUsuario: string) {
    let totalBruto = 0;
    let totalFreelancer = 0;
    let totalComissao = 0;
    let totalRetido = 0;
    let totalLiberado = 0;

    lista.forEach((p) => {
      const bruto = Number(p.valor_bruto || 0);
      const freelancer = Number(p.valor_freelancer || 0);
      const comissao = Number(p.comissao_plataforma || 0);

      totalBruto += bruto;
      totalFreelancer += freelancer;
      totalComissao += comissao;

      if (p.status === "retido") {
        totalRetido += tipoUsuario === "freelancer" ? freelancer : bruto;
      }

      if (p.status === "liberado") {
        totalLiberado += tipoUsuario === "freelancer" ? freelancer : bruto;
      }
    });

    setResumo({
      totalBruto,
      totalFreelancer,
      totalComissao,
      totalRetido,
      totalLiberado,
    });
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function tituloDashboard() {
    if (usuario?.tipo_usuario === "freelancer") {
      return "Meus Ganhos";
    }

    if (usuario?.tipo_usuario === "contratante") {
      return "Meus Pagamentos";
    }

    return "Dashboard Financeiro";
  }

  function descricaoDashboard() {
    if (usuario?.tipo_usuario === "freelancer") {
      return "Acompanhe valores retidos, liberados e sua receita líquida.";
    }

    if (usuario?.tipo_usuario === "contratante") {
      return "Acompanhe os pagamentos dos seus projetos contratados.";
    }

    return "Visão geral financeira da plataforma.";
  }

  function voltarPainel() {
    if (usuario?.tipo_usuario === "freelancer") {
      return "/painel-freelancer";
    }

    if (usuario?.tipo_usuario === "contratante") {
      return "/painel-contratante";
    }

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
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">{tituloDashboard()}</h1>
            <p className="mt-3 text-slate-400">{descricaoDashboard()}</p>
          </div>

          <Link
            href={voltarPainel()}
            className="rounded-xl border border-white/20 px-5 py-3 font-bold"
          >
            Voltar
          </Link>
        </div>

        {usuario.tipo_usuario === "freelancer" && (
          <div className="mb-10 grid gap-4 md:grid-cols-4">
            <Card titulo="Total líquido" valor={formatar(resumo.totalFreelancer)} />
            <Card titulo="Valor liberado" valor={formatar(resumo.totalLiberado)} />
            <Card titulo="Valor retido" valor={formatar(resumo.totalRetido)} />
            <Card titulo="Projetos pagos" valor={String(pagamentos.length)} />
          </div>
        )}

        {usuario.tipo_usuario === "contratante" && (
          <div className="mb-10 grid gap-4 md:grid-cols-4">
            <Card titulo="Total contratado" valor={formatar(resumo.totalBruto)} />
            <Card titulo="Pagamentos liberados" valor={formatar(resumo.totalLiberado)} />
            <Card titulo="Pagamentos retidos" valor={formatar(resumo.totalRetido)} />
            <Card titulo="Projetos pagos" valor={String(pagamentos.length)} />
          </div>
        )}

        {usuario.tipo_usuario !== "freelancer" &&
          usuario.tipo_usuario !== "contratante" && (
            <div className="mb-10 grid gap-4 md:grid-cols-5">
              <Card titulo="Total movimentado" valor={formatar(resumo.totalBruto)} />
              <Card titulo="Freelancers" valor={formatar(resumo.totalFreelancer)} />
              <Card titulo="Comissão 5%" valor={formatar(resumo.totalComissao)} />
              <Card titulo="Retido" valor={formatar(resumo.totalRetido)} />
              <Card titulo="Liberado" valor={formatar(resumo.totalLiberado)} />
            </div>
          )}

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-black">Histórico financeiro</h2>

          {pagamentos.length === 0 && (
            <p className="mt-4 text-slate-400">
              Nenhuma movimentação financeira encontrada.
            </p>
          )}

          <div className="mt-6 grid gap-4">
            {pagamentos.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="grid gap-4 md:grid-cols-5">
                  <Info titulo="Projeto" valor={p.projeto_id || "-"} />

                  {usuario.tipo_usuario === "freelancer" ? (
                    <>
                      <Info
                        titulo="Valor líquido"
                        valor={formatar(Number(p.valor_freelancer || 0))}
                      />
                      <Info
                        titulo="Comissão plataforma"
                        valor={formatar(Number(p.comissao_plataforma || 0))}
                      />
                    </>
                  ) : (
                    <>
                      <Info
                        titulo="Valor pago"
                        valor={formatar(Number(p.valor_bruto || 0))}
                      />
                      <Info
                        titulo="Comissão inclusa"
                        valor={formatar(Number(p.comissao_plataforma || 0))}
                      />
                    </>
                  )}

                  <Info
                    titulo="Taxa"
                    valor={`${Number(p.taxa_percentual || 5)}%`}
                  />

                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <p
                      className={`mt-1 font-bold ${
                        p.status === "liberado"
                          ? "text-emerald-300"
                          : "text-yellow-300"
                      }`}
                    >
                      {p.status === "liberado" ? "Liberado" : "Retido"}
                    </p>
                  </div>
                </div>

                {p.created_at && (
                  <p className="mt-4 text-xs text-slate-500">
                    Criado em{" "}
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-2xl font-black">{valor}</p>
    </div>
  );
}

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-1 break-all font-bold text-white">{valor}</p>
    </div>
  );
}