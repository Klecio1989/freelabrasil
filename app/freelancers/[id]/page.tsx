"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function FreelancerPublicPage() {
  const params = useParams();
  const id = params?.id as string;

  const [freela, setFreela] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (id) carregar();
  }, [id]);

  async function carregar() {
    setCarregando(true);

    const { data: usuario, error: erroUsuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (erroUsuario || !usuario) {
      console.error(erroUsuario);
      setFreela(null);
      setCarregando(false);
      return;
    }

    setFreela(usuario);

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

    setCarregando(false);
  }

  const media = useMemo(() => {
    if (avaliacoes.length === 0) return 0;

    const total = avaliacoes.reduce(
      (acc: number, item: any) => acc + Number(item.nota || 0),
      0
    );

    return total / avaliacoes.length;
  }, [avaliacoes]);

  function badgePlano(plano?: string) {
    if (plano === "pro") return "👑 PRO";
    if (plano === "plus") return "💎 PLUS";
    return "GRATUITO";
  }

  function corPlano(plano?: string) {
    if (plano === "pro") return "border-purple-500/40 bg-purple-500/10";
    if (plano === "plus") return "border-emerald-400/40 bg-emerald-400/10";
    return "border-white/10 bg-white/5";
  }

  function separarTags(texto?: string) {
    if (!texto) return [];

    return texto
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando perfil do freelancer...
      </main>
    );
  }

  if (!freela) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Freelancer não encontrado.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <Link href="/freelancers" className="text-sm font-bold text-emerald-300">
          ← Voltar para freelancers
        </Link>

        <div className={`mt-6 rounded-[2rem] border p-8 ${corPlano(freela.plano)}`}>
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-slate-900 p-6 text-center">
              <div className="h-36 w-36 overflow-hidden rounded-full border border-white/10 bg-slate-800">
                {freela.foto_url ? (
                  <img
                    src={freela.foto_url}
                    alt={freela.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-black">
                    {freela.nome?.charAt(0)?.toUpperCase() || "F"}
                  </div>
                )}
              </div>

              <h1 className="mt-5 text-2xl font-black">{freela.nome}</h1>

              <span className="mt-3 rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-xs font-black">
                {badgePlano(freela.plano)}
              </span>

              <p className="mt-4 text-yellow-300">
                ⭐ {media.toFixed(1)} ({avaliacoes.length} avaliações)
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {freela.cidade || "Localização não informada"}
              </p>

              <Link
                href={`/projetos/novo?freelancer_id=${freela.id}`}
                className="mt-6 w-full rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
              >
                Convidar para projeto
              </Link>
            </div>

            <div>
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                <h2 className="text-3xl font-black">Sobre o freelancer</h2>

                <p className="mt-4 leading-8 text-slate-300">
                  {freela.descricao || "Este freelancer ainda não adicionou uma descrição profissional."}
                </p>

                <div className="mt-6">
                  <h3 className="mb-3 text-lg font-black">Habilidades</h3>

                  <div className="flex flex-wrap gap-2">
                    {separarTags(freela.habilidades).length > 0 ? (
                      separarTags(freela.habilidades).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400">Nenhuma habilidade cadastrada.</p>
                    )}
                  </div>
                </div>

                {freela.portfolio_url && (
                  <a
                    href={freela.portfolio_url}
                    target="_blank"
                    className="mt-6 inline-block rounded-xl border border-white/20 px-5 py-3 font-bold text-white hover:bg-white/5"
                  >
                    Abrir portfólio externo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-5 text-3xl font-black">Projetos do portfólio</h2>

          {portfolio.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
              Nenhum projeto cadastrado no portfólio.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-slate-900 p-5"
                >
                  {item.imagem_url && (
                    <img
                      src={item.imagem_url}
                      alt={item.titulo}
                      className="h-44 w-full rounded-2xl object-cover"
                    />
                  )}

                  <h3 className="mt-4 text-xl font-black">{item.titulo}</h3>

                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">
                    {item.descricao}
                  </p>

                  {item.link_url && (
                    <a
                      href={item.link_url}
                      target="_blank"
                      className="mt-4 inline-block rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950"
                    >
                      Abrir projeto
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="mb-5 text-3xl font-black">Avaliações</h2>

          {avaliacoes.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
              Este freelancer ainda não recebeu avaliações.
            </div>
          ) : (
            <div className="grid gap-4">
              {avaliacoes.map((avaliacao) => (
                <div
                  key={avaliacao.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <p className="text-yellow-300">
                    {"⭐".repeat(Number(avaliacao.nota || 0))}
                  </p>

                  <p className="mt-3 leading-7 text-slate-300">
                    {avaliacao.comentario || "Sem comentário."}
                  </p>

                  {avaliacao.created_at && (
                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(avaliacao.created_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}