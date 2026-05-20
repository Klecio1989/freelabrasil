"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Projeto = {
  id: string;
  titulo: string;
  descricao: string;
  area: string;
  orcamento: string;
  prazo: number;
  contratante_id: string;
  contratante_nome?: string;
  contratante_plano?: string;
};

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
  plano?: string;
};

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroArea, setFiltroArea] = useState("todas");
  const [validando, setValidando] = useState<string | null>(null);

  useEffect(() => {
    carregarProjetos();

    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  async function carregarProjetos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("projetos")
      .select("id,titulo,descricao,area,orcamento,prazo,contratante_id,created_at")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error(error);
      setCarregando(false);
      return;
    }

    const ids = [
      ...new Set(data.map((p: any) => p.contratante_id).filter(Boolean)),
    ];

    let usuariosMap: Record<string, any> = {};

    if (ids.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id,nome,plano")
        .in("id", ids);

      if (usuariosData) {
        usuariosMap = Object.fromEntries(
          usuariosData.map((u: any) => [u.id, u])
        );
      }
    }

    const projetosFormatados = data.map((p: any) => ({
      ...p,
      contratante_nome: usuariosMap[p.contratante_id]?.nome || "Contratante",
      contratante_plano: usuariosMap[p.contratante_id]?.plano || "gratuito",
    }));

    const prioridadePlano: Record<string, number> = {
      pro: 0,
      plus: 1,
      gratuito: 2,
    };

    projetosFormatados.sort((a: any, b: any) => {
      const prioridadeA = prioridadePlano[a.contratante_plano || "gratuito"];
      const prioridadeB = prioridadePlano[b.contratante_plano || "gratuito"];

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }

      return 0;
    });

    setProjetos(projetosFormatados);
    setCarregando(false);
  }

  async function validarEnvioProposta(projetoId: string) {
    if (!usuario) {
      alert("Faça login para enviar proposta.");
      window.location.href = "/login";
      return;
    }

    if (usuario.tipo_usuario !== "freelancer") {
      alert("Apenas freelancers podem enviar propostas.");
      return;
    }

    const plano = usuario.plano || "gratuito";

    if (plano === "pro") {
      window.location.href = `/propostas/nova?projeto_id=${projetoId}`;
      return;
    }

    setValidando(projetoId);

    let query = supabase
      .from("propostas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("freelancer_id", usuario.id);

    if (plano === "plus") {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      query = query.gte("created_at", hoje.toISOString());
    }

    const { count, error } = await query;

    setValidando(null);

    if (error) {
      console.error("Erro ao validar limite de propostas:", error);
      alert("Erro ao validar limite do plano.");
      return;
    }

    const total = count || 0;

    if (plano === "gratuito" && total >= 2) {
      alert("Plano gratuito permite apenas 2 propostas. Faça upgrade para PLUS ou PRO.");
      window.location.href = "/planos";
      return;
    }

    if (plano === "plus" && total >= 10) {
      alert("Plano PLUS permite até 10 propostas por dia.");
      return;
    }

    window.location.href = `/propostas/nova?projeto_id=${projetoId}`;
  }

  const areas = useMemo(() => {
    const lista = projetos
      .map((p) => p.area)
      .filter(Boolean)
      .map((a) => a.trim());

    return ["todas", ...Array.from(new Set(lista))];
  }, [projetos]);

  const projetosFiltrados = useMemo(() => {
    return projetos.filter((projeto) => {
      const texto = `
        ${projeto.titulo || ""}
        ${projeto.descricao || ""}
        ${projeto.area || ""}
        ${projeto.contratante_nome || ""}
      `.toLowerCase();

      const palavras = busca
        .toLowerCase()
        .split(" ")
        .map((p) => p.trim())
        .filter(Boolean);

      const bateBusca = palavras.length
        ? palavras.every((palavra) => texto.includes(palavra))
        : true;

      const bateArea =
        filtroArea === "todas"
          ? true
          : projeto.area?.toLowerCase().includes(filtroArea.toLowerCase());

      return bateBusca && bateArea;
    });
  }, [projetos, busca, filtroArea]);

  function limparFiltros() {
    setBusca("");
    setFiltroArea("todas");
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return (
        <span className="rounded-full border border-yellow-400/40 bg-yellow-400/15 px-3 py-1 text-xs font-black text-yellow-300">
          👑 PRO
        </span>
      );
    }

    if (plano === "plus") {
      return (
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-300">
          💎 PLUS
        </span>
      );
    }

    return (
      <span className="rounded-full border border-white/10 bg-slate-700 px-3 py-1 text-xs font-bold text-white">
        GRATUITO
      </span>
    );
  }

  function cardDestaque(plano?: string) {
    if (plano === "pro") {
      return "border-yellow-400/50 bg-yellow-400/10 shadow-yellow-500/20";
    }

    if (plano === "plus") {
      return "border-cyan-400/40 bg-cyan-400/10 shadow-cyan-500/10";
    }

    return "border-white/10 bg-white/5";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Marketplace de projetos
            </span>

            <h1 className="mt-5 text-5xl font-black leading-tight">
              Encontre projetos para trabalhar
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Busque por palavras-chave como Power BI, Excel, Automação, Python,
              Dashboard ou qualquer área que combine com sua experiência.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Projetos encontrados</div>
              <div className="mt-1 text-2xl font-black">
                {projetosFiltrados.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Áreas</div>
              <div className="mt-1 text-2xl font-black">{areas.length - 1}</div>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-4">
              <div className="text-sm text-yellow-200">Prioridade</div>
              <div className="mt-1 text-2xl font-black">PRO / PLUS</div>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_240px_auto]">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex: Power BI, Excel, Automação, Python, Dashboard"
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            >
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area === "todas" ? "Todas as áreas" : area}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={limparFiltros}
                className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5"
              >
                Limpar
              </button>

              {usuario?.tipo_usuario === "contratante" && (
                <Link
                  href="/projetos/novo"
                  className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950 transition hover:scale-[1.02]"
                >
                  Novo projeto
                </Link>
              )}

              {!usuario && (
                <Link
                  href="/login"
                  className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Power BI", "Excel", "Automação", "Python", "Dashboard", "SQL"].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setBusca(tag)}
                  className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>

        {carregando && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
            Carregando projetos...
          </div>
        )}

        {!carregando && projetosFiltrados.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-black">Nenhum projeto encontrado</h2>
            <p className="mt-3 text-slate-400">
              Ajuste a busca, tente outra palavra-chave ou limpe os filtros.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {!carregando &&
            projetosFiltrados.map((projeto) => (
              <div
                key={projeto.id}
                className={`rounded-[2rem] border p-7 shadow-2xl transition hover:scale-[1.005] ${cardDestaque(
                  projeto.contratante_plano
                )}`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-4xl">
                    <div className="mb-4 flex flex-wrap gap-3">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {projeto.area || "Sem área informada"}
                      </span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        Prazo: {projeto.prazo} dias
                      </span>

                      {badgePlano(projeto.contratante_plano)}
                    </div>

                    <h2 className="text-2xl font-black md:text-3xl">
                      {projeto.titulo}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Contratante: {projeto.contratante_nome}
                    </p>

                    <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                      {projeto.descricao}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                        <div className="text-sm text-slate-400">Orçamento</div>
                        <div className="mt-1 text-lg font-bold">
                          {projeto.orcamento || "Não informado"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                        <div className="text-sm text-slate-400">Área</div>
                        <div className="mt-1 text-lg font-bold">
                          {projeto.area || "Não informado"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                        <div className="text-sm text-slate-400">Prazo</div>
                        <div className="mt-1 text-lg font-bold">
                          {projeto.prazo} dias
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[230px] flex-col gap-3">
                    {usuario?.tipo_usuario === "freelancer" ? (
                      <button
                        onClick={() => validarEnvioProposta(projeto.id)}
                        disabled={validando === projeto.id}
                        className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950 transition hover:scale-[1.02] disabled:opacity-60"
                      >
                        {validando === projeto.id
                          ? "Validando..."
                          : "Enviar proposta"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-xl bg-slate-700 px-5 py-3 text-center font-bold text-slate-300"
                      >
                        Faça login como freelancer
                      </button>
                    )}

                    <Link
                      href={`/freelancer/${projeto.contratante_id}`}
                      className="rounded-xl border border-white/15 px-5 py-3 text-center font-medium text-white transition hover:bg-white/5"
                    >
                      Ver contratante
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}