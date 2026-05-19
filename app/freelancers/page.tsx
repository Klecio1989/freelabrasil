"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarFreelancers();
  }, []);

  async function carregarFreelancers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("tipo_usuario", "freelancer")
      .order("media_avaliacoes", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar freelancers.");
      setFreelancers([]);
    } else {
      setFreelancers(data || []);
    }

    setLoading(false);
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") return "👑 PRO";
    if (plano === "plus") return "💎 PLUS";
    return "GRATUITO";
  }

  function corPlano(plano?: string) {
    if (plano === "pro") {
      return "border-purple-500/40 bg-purple-500/10";
    }

    if (plano === "plus") {
      return "border-emerald-400/40 bg-emerald-400/10";
    }

    return "border-white/10 bg-white/5";
  }

  const freelancersFiltrados = freelancers.filter((item) => {
    const texto = `
      ${item.nome || ""}
      ${item.descricao || ""}
      ${item.habilidades || ""}
    `.toLowerCase();

    return texto.includes(busca.toLowerCase());
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
        Carregando freelancers...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-7xl">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-5xl font-black">
              Freelancers
            </h1>

            <p className="mt-4 text-lg text-slate-300">
              Encontre profissionais avaliados para seu projeto.
            </p>
          </div>

          <div className="w-full max-w-md">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por habilidade, nome ou tecnologia..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-emerald-400"
            />
          </div>

        </div>

        {freelancersFiltrados.length === 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
            Nenhum freelancer encontrado.
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {freelancersFiltrados.map((freela) => (
            <div
              key={freela.id}
              className={`rounded-3xl border p-6 shadow-2xl transition hover:-translate-y-1 ${corPlano(
                freela.plano
              )}`}
            >

              <div className="flex items-start gap-4">

                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                  {freela.foto_url ? (
                    <img
                      src={freela.foto_url}
                      alt={freela.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black">
                      {freela.nome?.charAt(0)?.toUpperCase() || "F"}
                    </div>
                  )}
                </div>

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-2xl font-black">
                      {freela.nome}
                    </h2>

                    <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-black">
                      {badgePlano(freela.plano)}
                    </span>

                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">

                    <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 font-black text-yellow-300">
                      ⭐ {Number(freela.media_avaliacoes || 0).toFixed(1)}
                    </div>

                    <div className="text-slate-400">
                      {freela.total_avaliacoes || 0} avaliações
                    </div>

                  </div>

                </div>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">

                  <p className="text-sm text-slate-400">
                    Projetos concluídos
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-300">
                    {freela.projetos_concluidos || 0}
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">

                  <p className="text-sm text-slate-400">
                    Cidade
                  </p>

                  <p className="mt-1 font-bold">
                    {freela.cidade || "Não informada"}
                  </p>

                </div>

              </div>

              <p className="mt-5 line-clamp-4 leading-7 text-slate-300">
                {freela.descricao ||
                  "Este freelancer ainda não adicionou uma descrição profissional."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                {(freela.habilidades || "")
                  .split(",")
                  .map((tag: string) => tag.trim())
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300"
                    >
                      {tag}
                    </span>
                  ))}

              </div>

              <Link
                href={`/freelancer/${freela.id}`}
                className="mt-6 block rounded-2xl bg-emerald-400 px-5 py-4 text-center font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Ver perfil completo
              </Link>

            </div>
          ))}

        </div>
      </section>
    </main>
  );
}