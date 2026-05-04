"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PerfilPublicoFreelancer() {
  const params = useParams();
  const id = params?.id as string;

  const [freelancer, setFreelancer] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) carregarPerfil();
  }, [id]);

  async function carregarPerfil() {
    setLoading(true);

    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (userError) {
      console.error(userError);
      setLoading(false);
      return;
    }

    setFreelancer(user);

    const { data: portfolioData } = await supabase
      .from("portfolio")
      .select("*")
      .eq("usuario_id", id)
      .order("created_at", { ascending: false });

    setPortfolio(portfolioData || []);

    const { data: avaliacoesData } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("avaliado_id", id)
      .order("created_at", { ascending: false });

    setAvaliacoes(avaliacoesData || []);
    setLoading(false);
  }

  function calcularMedia() {
    if (avaliacoes.length === 0) return 0;

    const total = avaliacoes.reduce(
      (acc, item) => acc + Number(item.nota || 0),
      0
    );

    return total / avaliacoes.length;
  }

  function estrelas(nota: number) {
    const valor = Math.round(Number(nota || 0));
    return "★".repeat(valor) + "☆".repeat(5 - valor);
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return (
        <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
          👑 PRO
        </span>
      );
    }

    if (plano === "plus") {
      return (
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando perfil...
      </main>
    );
  }

  if (!freelancer) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Freelancer não encontrado.
      </main>
    );
  }

  const media = calcularMedia();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/freelancers"
          className="mb-8 inline-block rounded-xl border border-white/20 px-5 py-3 font-bold"
        >
          Voltar
        </Link>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
          <div className="grid gap-8 md:grid-cols-[180px_1fr]">
            <div className="flex flex-col items-center">
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-emerald-400 text-5xl font-black text-slate-950">
                {freelancer.foto_url ? (
                  <img
                    src={freelancer.foto_url}
                    alt={freelancer.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  freelancer.nome?.charAt(0)?.toUpperCase() || "F"
                )}
              </div>

              <div className="mt-4">{badgePlano(freelancer.plano)}</div>
            </div>

            <div>
              <h1 className="text-4xl font-black">
                {freelancer.nome}{" "}
                {freelancer.plano === "pro"
                  ? "👑"
                  : freelancer.plano === "plus"
                  ? "💎"
                  : ""}
              </h1>

              <p className="mt-2 text-slate-400">
                {freelancer.cidade || "Cidade não informada"}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-3xl text-yellow-400">
                    {estrelas(media)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {media.toFixed(1)} de 5 • {avaliacoes.length} avaliação
                    {avaliacoes.length !== 1 ? "ões" : ""}
                  </p>
                </div>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                  {freelancer.projetos_concluidos || 0} projetos concluídos
                </span>

                <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-300">
                  Score {Number(freelancer.score_reputacao || 0).toFixed(0)}
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-xl font-black">Sobre</h2>
                <p className="mt-3 leading-8 text-slate-300">
                  {freelancer.descricao ||
                    "Este freelancer ainda não adicionou uma descrição."}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-xl font-black">Habilidades</h2>
                <p className="mt-3 leading-8 text-slate-300">
                  {freelancer.habilidades || "Nenhuma habilidade cadastrada."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-8">
          <h2 className="text-3xl font-black">Avaliações recebidas</h2>

          {avaliacoes.length === 0 && (
            <p className="mt-4 text-slate-400">
              Este freelancer ainda não recebeu avaliações.
            </p>
          )}

          <div className="mt-6 grid gap-5">
            {avaliacoes.map((avaliacao) => (
              <div
                key={avaliacao.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-2xl text-yellow-400">
                    {estrelas(avaliacao.nota)}
                  </p>

                  {avaliacao.created_at && (
                    <span className="text-sm text-slate-500">
                      {new Date(avaliacao.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  )}
                </div>

                <p className="mt-4 leading-8 text-slate-200">
                  “{avaliacao.comentario || "Sem comentário."}”
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  Nota: {avaliacao.nota}/5
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-8">
          <h2 className="text-3xl font-black">Portfólio</h2>

          {portfolio.length === 0 && (
            <p className="mt-4 text-slate-400">
              Nenhum projeto de portfólio cadastrado.
            </p>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {portfolio.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                {item.imagem_url && (
                  <img
                    src={item.imagem_url}
                    alt={item.titulo}
                    className="h-48 w-full rounded-xl object-cover"
                  />
                )}

                <h3 className="mt-4 text-xl font-black">{item.titulo}</h3>

                <p className="mt-2 text-slate-300">{item.descricao}</p>

                {item.link_url && (
                  <a
                    href={item.link_url}
                    target="_blank"
                    className="mt-4 inline-block rounded-xl bg-emerald-400 px-4 py-2 font-bold text-slate-950"
                  >
                    Abrir projeto
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}