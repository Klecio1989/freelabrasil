"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Proposta = {
  id: string;
  valor: string;
  prazo: number;
  mensagem: string;
  status: string;
  freelancer_id: string;
  projeto_id: string;
  freelancer_nome?: string;
  freelancer_email?: string;
  freelancer_plano?: string;
  projeto_titulo?: string;
};

export default function PropostasRecebidas() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [usuarioId, setUsuarioId] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("freelabrasil_usuario");
    if (!usuario) return;

    const parsed = JSON.parse(usuario);
    setUsuarioId(parsed.id);
    carregarPropostas(parsed.id);

    const channel = supabase
      .channel(`propostas-recebidas-${parsed.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "propostas",
        },
        async () => {
          await carregarPropostas(parsed.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function carregarPropostas(contratanteId: string) {
    setCarregando(true);

    const { data: projetosData } = await supabase
      .from("projetos")
      .select("id,titulo")
      .eq("contratante_id", contratanteId);

    if (!projetosData || projetosData.length === 0) {
      setPropostas([]);
      setCarregando(false);
      return;
    }

    const projetoIds = projetosData.map((p: any) => p.id);

    const { data: propostasData } = await supabase
      .from("propostas")
      .select("id,valor,prazo,mensagem,status,freelancer_id,projeto_id")
      .in("projeto_id", projetoIds);

    if (!propostasData || propostasData.length === 0) {
      setPropostas([]);
      setCarregando(false);
      return;
    }

    const freelancerIds = [
      ...new Set(propostasData.map((p: any) => p.freelancer_id).filter(Boolean)),
    ];

    let usuariosMap: Record<string, any> = {};

    if (freelancerIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id,nome,email,plano")
        .in("id", freelancerIds);

      if (usuariosData) {
        usuariosMap = Object.fromEntries(
          usuariosData.map((u: any) => [u.id, u])
        );
      }
    }

    const projetosMap = Object.fromEntries(
      projetosData.map((p: any) => [p.id, p])
    );

    const formatadas = propostasData.map((p: any) => ({
      ...p,
      freelancer_nome: usuariosMap[p.freelancer_id]?.nome || "Freelancer",
      freelancer_email: usuariosMap[p.freelancer_id]?.email || "",
      freelancer_plano: usuariosMap[p.freelancer_id]?.plano || "gratuito",
      projeto_titulo: projetosMap[p.projeto_id]?.titulo || "Projeto",
    }));

    const prioridadePlano: Record<string, number> = {
      pro: 0,
      plus: 1,
      gratuito: 2,
    };

    formatadas.sort((a: any, b: any) => {
      const prioridadeA = prioridadePlano[a.freelancer_plano || "gratuito"];
      const prioridadeB = prioridadePlano[b.freelancer_plano || "gratuito"];

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }

      return 0;
    });

    setPropostas(formatadas);
    setCarregando(false);
  }

  async function criarNotificacao(destinoId: string, titulo: string, descricao: string, link: string) {
    await supabase.from("notificacoes").insert([
      {
        usuario_id: destinoId,
        titulo,
        descricao,
        lida: false,
        link,
      },
    ]);
  }

  async function atualizarStatus(id: string, status: string, freelancerId: string, projetoTitulo?: string) {
    await supabase.from("propostas").update({ status }).eq("id", id);

    await criarNotificacao(
      freelancerId,
      status === "aceita" ? "Proposta aceita" : "Proposta recusada",
      `Sua proposta para o projeto "${projetoTitulo || "Projeto"}" foi ${status}.`,
      "/minhas-propostas"
    );

    setPropostas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  const propostasFiltradas = useMemo(() => {
    return propostas.filter((p) => {
      const texto =
        `${p.projeto_titulo || ""} ${p.freelancer_nome || ""} ${p.freelancer_email || ""} ${p.mensagem || ""}`.toLowerCase();

      const bateBusca = busca ? texto.includes(busca.toLowerCase()) : true;

      const statusAtual = p.status || "pendente";
      const bateStatus =
        filtroStatus === "todos" ? true : statusAtual === filtroStatus;

      return bateBusca && bateStatus;
    });
  }, [propostas, busca, filtroStatus]);

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">PRO</span>;
    }

    if (plano === "plus") {
      return <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">PLUS</span>;
    }

    return <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">GRATUITO</span>;
  }

  function badgeStatus(status?: string) {
    if (status === "aceita") {
      return <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">ACEITA</span>;
    }

    if (status === "recusada") {
      return <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">RECUSADA</span>;
    }

    return <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">PENDENTE</span>;
  }

  function cardDestaque(plano?: string) {
    if (plano === "pro") return "border-purple-500/40 bg-purple-500/5";
    if (plano === "plus") return "border-emerald-400/40 bg-emerald-400/5";
    return "border-white/10 bg-white/5";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Gestão de propostas
            </span>

            <h1 className="mt-5 text-5xl font-black leading-tight">
              Propostas recebidas
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Avalie freelancers, aceite propostas, recuse candidatos e avance nas contratações.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Total</div>
              <div className="mt-1 text-2xl font-black">{propostasFiltradas.length}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Pendentes</div>
              <div className="mt-1 text-2xl font-black">
                {propostasFiltradas.filter((p) => !p.status || p.status === "pendente").length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Aceitas</div>
              <div className="mt-1 text-2xl font-black">
                {propostasFiltradas.filter((p) => p.status === "aceita").length}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por projeto, freelancer, email ou mensagem"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aceita">Aceita</option>
            <option value="recusada">Recusada</option>
          </select>
        </div>

        {carregando && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
            Carregando propostas...
          </div>
        )}

        {!carregando && propostasFiltradas.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-black">Nenhuma proposta encontrada</h2>
            <p className="mt-3 text-slate-400">
              Ajuste os filtros ou aguarde novos envios.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {!carregando &&
            propostasFiltradas.map((p) => (
              <div
                key={p.id}
                className={`rounded-[2rem] border p-7 shadow-2xl transition hover:scale-[1.005] ${cardDestaque(
                  p.freelancer_plano
                )}`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-4xl">
                    <div className="mb-4 flex flex-wrap gap-3">
                      {badgePlano(p.freelancer_plano)}
                      {badgeStatus(p.status)}
                    </div>

                    <h2 className="text-2xl font-black md:text-3xl">
                      {p.projeto_titulo}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Freelancer: {p.freelancer_nome}
                    </p>

                    <p className="text-sm text-slate-500">{p.freelancer_email}</p>

                    <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                      {p.mensagem}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                        <div className="text-sm text-slate-400">Valor</div>
                        <div className="mt-1 text-lg font-bold">{p.valor}</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                        <div className="text-sm text-slate-400">Prazo</div>
                        <div className="mt-1 text-lg font-bold">{p.prazo} dias</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[250px] flex-col gap-3">
                    <Link
                      href={`/freelancer/${p.freelancer_id}`}
                      className="rounded-xl border border-white/15 px-5 py-3 text-center font-medium text-white transition hover:bg-white/5"
                    >
                      Ver perfil público
                    </Link>

                    {p.status === "aceita" && (
                      <>
                        <Link
                          href={`/chat?proposta_id=${p.id}`}
                          className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950"
                        >
                          Abrir chat
                        </Link>

                        <Link
                          href={`/avaliar?proposta_id=${p.id}&freelancer_id=${p.freelancer_id}`}
                          className="rounded-xl border border-yellow-400/30 px-5 py-3 text-center font-bold text-yellow-300 transition hover:bg-yellow-400/10"
                        >
                          Avaliar freelancer
                        </Link>
                      </>
                    )}

                    {(!p.status || p.status === "pendente") && (
                      <>
                        <button
                          onClick={() =>
                            atualizarStatus(p.id, "aceita", p.freelancer_id, p.projeto_titulo)
                          }
                          className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950"
                        >
                          Aceitar proposta
                        </button>

                        <button
                          onClick={() =>
                            atualizarStatus(p.id, "recusada", p.freelancer_id, p.projeto_titulo)
                          }
                          className="rounded-xl border border-red-400/30 px-5 py-3 font-bold text-red-300 transition hover:bg-red-400/10"
                        >
                          Recusar proposta
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}