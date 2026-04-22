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

    carregarFreelancers();
  }, []);

  async function carregarFreelancers() {
    const { data } = await supabase
      .from("usuarios")
      .select(
        "id,nome,cidade,foto_url,descricao,habilidades,plano,nota_media,projetos_concluidos,tipo_usuario"
      )
      .eq("tipo_usuario", "freelancer");

    if (!data) return;

    const prioridadePlano: Record<string, number> = {
      pro: 0,
      plus: 1,
      gratuito: 2,
    };

    const ordenados = [...data].sort((a: any, b: any) => {
      const prioridadeA = prioridadePlano[a.plano || "gratuito"];
      const prioridadeB = prioridadePlano[b.plano || "gratuito"];

      if (prioridadeA !== prioridadeB) return prioridadeA - prioridadeB;

      const notaA = Number(a.nota_media || 0);
      const notaB = Number(b.nota_media || 0);

      if (notaA !== notaB) return notaB - notaA;

      const concluidosA = Number(a.projetos_concluidos || 0);
      const concluidosB = Number(b.projetos_concluidos || 0);

      return concluidosB - concluidosA;
    });

    setFreelancers(ordenados as Freelancer[]);
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
      alert("Erro ao enviar convite.");
      return;
    }

    alert("Convite enviado com sucesso.");
    setAbrirConvite(false);
  }

  const freelancersFiltrados = useMemo(() => {
    return freelancers.filter((f) => {
      const texto = `${f.nome || ""} ${f.cidade || ""} ${f.habilidades || ""} ${f.descricao || ""}`.toLowerCase();

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
    if (plano === "pro") return "border-purple-500/50 bg-purple-500/5";
    if (plano === "plus") return "border-emerald-400/40 bg-emerald-400/5";
    return "border-white/10 bg-slate-900";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Freelancers</h1>
            <p className="text-slate-400 mt-2">
              Ranking por plano, nota e projetos concluídos
            </p>
          </div>

          <Link
            href="/projetos"
            className="border border-white/20 px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, habilidade ou descrição"
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-3"
          />

          <select
            value={filtroPlano}
            onChange={(e) => setFiltroPlano(e.target.value)}
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-3"
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
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-3"
          />
        </div>

        <div className="mb-6 text-sm text-slate-400">
          {freelancersFiltrados.length} freelancer(s) encontrado(s)
        </div>

        <div className="grid gap-6">
          {freelancersFiltrados.map((f, index) => {
            const favorito = favoritos.includes(f.id);

            return (
              <div
                key={f.id}
                className={`rounded-2xl border p-6 ${cardDestaque(f.plano)}`}
              >
                <div className="grid lg:grid-cols-[100px_1fr_auto] gap-6 items-center">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                      {f.foto_url ? (
                        <img
                          src={f.foto_url}
                          alt={f.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold">
                          {f.nome?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-slate-400">#{index + 1}</span>
                      <h2 className="text-2xl font-bold">{f.nome}</h2>
                      {badgePlano(f.plano)}
                    </div>

                    <p className="text-slate-400 mt-2">{f.cidade || "-"}</p>

                    <p className="text-slate-300 mt-3 line-clamp-2">
                      {f.descricao || "Sem descrição cadastrada."}
                    </p>

                    <div className="flex flex-wrap gap-6 mt-4 text-sm">
                      <span className="text-yellow-400 font-bold">
                        ⭐ {Number(f.nota_media || 0).toFixed(1)}
                      </span>

                      <span className="text-slate-300">
                        {f.projetos_concluidos || 0} projetos concluídos
                      </span>

                      <span className="text-slate-400">
                        {f.habilidades || "Sem habilidades"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/freelancer/${f.id}`}
                      className="inline-block bg-emerald-400 text-black px-5 py-3 rounded-lg font-bold text-center"
                    >
                      Ver perfil
                    </Link>

                    {usuario?.tipo_usuario === "contratante" && (
                      <>
                        <button
                          onClick={() => toggleFavorito(f.id)}
                          className={`px-5 py-3 rounded-lg font-bold ${
                            favorito
                              ? "bg-yellow-400 text-black"
                              : "border border-white/20 text-white"
                          }`}
                        >
                          {favorito ? "★ Favoritado" : "☆ Favoritar"}
                        </button>

                        <button
                          onClick={() => abrirModalConvite(f.id)}
                          className="bg-white text-black px-5 py-3 rounded-lg font-bold"
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-8">
              <h2 className="text-2xl font-bold mb-6">Enviar convite</h2>

              <div className="space-y-4">
                <select
                  value={projetoSelecionado}
                  onChange={(e) => setProjetoSelecionado(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
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
                  className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
                />

                <div className="flex gap-4">
                  <button
                    onClick={enviarConvite}
                    className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg"
                  >
                    Enviar convite
                  </button>

                  <button
                    onClick={() => setAbrirConvite(false)}
                    className="border border-white/20 px-6 py-3 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}