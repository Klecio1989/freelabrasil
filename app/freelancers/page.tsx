"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Freelancer = {
  id: string;
  nome: string;
  cidade?: string;
  foto_url?: string;
  descricao?: string;
  habilidades?: string;
  plano?: string;
  nota_media?: number;
  projetos_concluidos?: number;
  score_reputacao?: number;
};

type Projeto = {
  id: string;
  titulo: string;
};

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("todos");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [freelancerSelecionado, setFreelancerSelecionado] = useState<string>("");
  const [projetoSelecionado, setProjetoSelecionado] = useState("");
  const [mensagemConvite, setMensagemConvite] = useState("");
  const [abrirConvite, setAbrirConvite] = useState(false);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);

      if (parsed.tipo_usuario === "contratante") {
        carregarFavoritos(parsed.id);
        carregarProjetos(parsed.id);
      }
    }

    inicializar();
  }, []);

  async function inicializar() {
    await fetch("/api/recalcular-ranking", { method: "POST" });
    await carregarFreelancers();
  }

  async function carregarFreelancers() {
    const { data } = await supabase
      .from("usuarios")
      .select(
        "id,nome,cidade,foto_url,descricao,habilidades,plano,nota_media,projetos_concluidos,score_reputacao,tipo_usuario"
      )
      .eq("tipo_usuario", "freelancer")
      .order("score_reputacao", { ascending: false });

    if (!data) return;

    setFreelancers(data as Freelancer[]);
  }

  async function carregarFavoritos(contratanteId: string) {
    const { data } = await supabase
      .from("favoritos")
      .select("freelancer_id")
      .eq("contratante_id", contratanteId);

    if (!data) return;
    setFavoritos(data.map((item: any) => item.freelancer_id));
  }

  async function carregarProjetos(contratanteId: string) {
    const { data } = await supabase
      .from("projetos")
      .select("id,titulo")
      .eq("contratante_id", contratanteId)
      .order("created_at", { ascending: false });

    if (data) setProjetos(data as Projeto[]);
  }

  async function toggleFavorito(freelancerId: string) {
    if (!usuario || usuario.tipo_usuario !== "contratante") {
      alert("Apenas contratantes podem favoritar freelancers.");
      return;
    }

    const jaFavorito = favoritos.includes(freelancerId);

    if (jaFavorito) {
      await supabase
        .from("favoritos")
        .delete()
        .eq("contratante_id", usuario.id)
        .eq("freelancer_id", freelancerId);

      setFavoritos((prev) => prev.filter((id) => id !== freelancerId));
      return;
    }

    await supabase.from("favoritos").insert([
      {
        contratante_id: usuario.id,
        freelancer_id: freelancerId,
      },
    ]);

    setFavoritos((prev) => [...prev, freelancerId]);
  }

  function abrirModalConvite(freelancerId: string) {
    setFreelancerSelecionado(freelancerId);
    setProjetoSelecionado("");
    setMensagemConvite("");
    setAbrirConvite(true);
  }

  async function enviarConvite() {
    if (!usuario || !freelancerSelecionado || !projetoSelecionado) {
      alert("Selecione um projeto.");
      return;
    }

    const { error } = await supabase.from("convites").insert([
      {
        contratante_id: usuario.id,
        freelancer_id: freelancerSelecionado,
        projeto_id: projetoSelecionado,
        mensagem: mensagemConvite,
        status: "pendente",
      },
    ]);

    if (error) {
      console.error("ERRO AO ENVIAR CONVITE:", error);
      alert(error.message);
      return;
    }

    await supabase.from("notificacoes").insert([
      {
        usuario_id: freelancerSelecionado,
        titulo: "Novo convite recebido",
        descricao: "Você recebeu um novo convite para projeto.",
        lida: false,
        link: "/convites",
      },
    ]);

    alert("Convite enviado com sucesso.");
    setAbrirConvite(false);
  }

  const freelancersFiltrados = useMemo(() => {
    return freelancers.filter((f) => {
      const texto =
        `${f.nome || ""} ${f.cidade || ""} ${f.habilidades || ""} ${f.descricao || ""}`.toLowerCase();

      const bateBusca = busca ? texto.includes(busca.toLowerCase()) : true;
      const batePlano =
        filtroPlano === "todos" ? true : (f.plano || "gratuito") === filtroPlano;
      const bateCidade = filtroCidade
        ? (f.cidade || "").toLowerCase().includes(filtroCidade.toLowerCase())
        : true;

      return bateBusca && batePlano && bateCidade;
    });
  }, [freelancers, busca, filtroPlano, filtroCidade]);

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">PRO</span>;
    }

    if (plano === "plus") {
      return <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">PLUS</span>;
    }

    return <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">GRATUITO</span>;
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
            <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              Talentos em destaque
            </span>

            <h1 className="mt-5 text-5xl font-black leading-tight">
              Encontre freelancers qualificados
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Ranking com reputação automática, avaliações, projetos concluídos e destaque por plano.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Freelancers</div>
              <div className="mt-1 text-2xl font-black">{freelancersFiltrados.length}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Ranking</div>
              <div className="mt-1 text-2xl font-black">Automático</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Prioridade</div>
              <div className="mt-1 text-2xl font-black">Pro / Plus</div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, habilidade ou descrição"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />

          <select
            value={filtroPlano}
            onChange={(e) => setFiltroPlano(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          >
            <option value="todos">Todos os planos</option>
            <option value="pro">Pro</option>
            <option value="plus">Plus</option>
            <option value="gratuito">Gratuito</option>
          </select>

          <input
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            placeholder="Filtrar por cidade"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {!freelancersFiltrados.length && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-black">Nenhum freelancer encontrado</h2>
            <p className="mt-3 text-slate-400">
              Ajuste os filtros para visualizar outros profissionais.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {freelancersFiltrados.map((f, index) => {
            const favorito = favoritos.includes(f.id);

            return (
              <div
                key={f.id}
                className={`rounded-[2rem] border p-6 shadow-2xl transition hover:scale-[1.005] ${cardDestaque(
                  f.plano
                )}`}
              >
                <div className="grid gap-6 lg:grid-cols-[100px_1fr_auto] lg:items-center">
                  <div className="flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                      {f.foto_url ? (
                        <img
                          src={f.foto_url}
                          alt={f.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold">
                          {f.nome?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-slate-400">#{index + 1}</span>
                      <h2 className="text-2xl font-black">{f.nome}</h2>
                      {badgePlano(f.plano)}
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                        SCORE {Number(f.score_reputacao || 0).toFixed(0)}
                      </span>
                    </div>

                    <p className="mt-2 text-slate-400">{f.cidade || "-"}</p>

                    <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                      {f.descricao || "Sem descrição cadastrada."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm">
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 font-bold text-yellow-300">
                        ⭐ {Number(f.nota_media || 0).toFixed(1)}
                      </span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                        {f.projetos_concluidos || 0} projetos concluídos
                      </span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                        {f.habilidades || "Sem habilidades"}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-[230px] flex-col gap-3">
                    <Link
                      href={`/freelancer/${f.id}`}
                      className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950 transition hover:scale-[1.02]"
                    >
                      Ver perfil
                    </Link>

                    {usuario?.tipo_usuario === "contratante" && (
                      <>
                        <button
                          onClick={() => toggleFavorito(f.id)}
                          className={`rounded-xl px-5 py-3 font-bold ${
                            favorito
                              ? "bg-yellow-400 text-black"
                              : "border border-white/20 text-white hover:bg-white/5"
                          }`}
                        >
                          {favorito ? "★ Favoritado" : "☆ Favoritar"}
                        </button>

                        <button
                          onClick={() => abrirModalConvite(f.id)}
                          className="rounded-xl border border-white/20 px-5 py-3 font-bold text-white hover:bg-white/5"
                        >
                          Convidar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {abrirConvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900 p-8">
              <h2 className="text-3xl font-black">Enviar convite</h2>
              <p className="mt-2 text-slate-400">
                Escolha um projeto e envie uma mensagem ao freelancer.
              </p>

              <div className="mt-6 space-y-4">
                <select
                  value={projetoSelecionado}
                  onChange={(e) => setProjetoSelecionado(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none"
                >
                  <option value="">Selecione um projeto</option>
                  {projetos.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.titulo}
                    </option>
                  ))}
                </select>

                <textarea
                  value={mensagemConvite}
                  onChange={(e) => setMensagemConvite(e.target.value)}
                  rows={5}
                  placeholder="Mensagem do convite"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />

                <div className="flex gap-4">
                  <button
                    onClick={enviarConvite}
                    className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
                  >
                    Enviar convite
                  </button>

                  <button
                    onClick={() => setAbrirConvite(false)}
                    className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}