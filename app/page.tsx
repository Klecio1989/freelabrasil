"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);

  useEffect(() => {
    carregarFreelancers();
  }, []);

  async function carregarFreelancers() {
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("tipo_usuario", "freelancer")
      .order("media_avaliacoes", { ascending: false })
      .limit(6);

    setFreelancers(data || []);
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") return "👑 PRO";
    if (plano === "plus") return "💎 PLUS";
    return "FREE";
  }

  const categorias = [
    "Power BI",
    "Python",
    "Excel",
    "Automação",
    "IA",
    "Design",
    "Sites",
    "Apps",
    "SQL",
    "Dashboards",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_40%)]" />

        <div className="mx-auto max-w-7xl px-6 py-28">

          <div className="max-w-4xl">

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-sm font-bold text-emerald-300">
              Plataforma brasileira de freelancers
            </span>

            <h1 className="mt-8 text-6xl font-black leading-tight">
              Encontre freelancers especialistas para seu projeto
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-9 text-slate-300">
              Contrate profissionais avaliados em tecnologia, design,
              automação, Power BI, desenvolvimento web, apps e muito mais.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/freelancers"
                className="rounded-2xl bg-emerald-400 px-8 py-5 text-lg font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Contratar freelancer
              </Link>

              <Link
                href="/cadastro"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-lg font-bold transition hover:bg-white/10"
              >
                Sou freelancer
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center justify-between gap-4 flex-wrap">

          <div>
            <h2 className="text-4xl font-black">
              Categorias populares
            </h2>

            <p className="mt-3 text-slate-400">
              Encontre especialistas nas tecnologias mais procuradas.
            </p>
          </div>

        </div>

        <div className="mt-10 flex flex-wrap gap-4">

          {categorias.map((categoria) => (
            <div
              key={categoria}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg font-bold transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              {categoria}
            </div>
          ))}

        </div>

      </section>

      {/* FREELANCERS DESTAQUE */}
      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="flex items-center justify-between gap-4 flex-wrap">

            <div>
              <h2 className="text-4xl font-black">
                Freelancers em destaque
              </h2>

              <p className="mt-3 text-slate-400">
                Profissionais com melhor reputação na plataforma.
              </p>
            </div>

            <Link
              href="/freelancers"
              className="rounded-2xl border border-white/10 px-6 py-4 font-bold transition hover:bg-white/5"
            >
              Ver todos
            </Link>

          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {freelancers.map((freela) => (
              <div
                key={freela.id}
                className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl transition hover:-translate-y-1"
              >

                <div className="flex items-start gap-4">

                  <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
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

                      <h3 className="text-2xl font-black">
                        {freela.nome}
                      </h3>

                      <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-black">
                        {badgePlano(freela.plano)}
                      </span>

                    </div>

                    <div className="mt-3 flex items-center gap-3 flex-wrap">

                      <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 font-black text-yellow-300">
                        ⭐ {Number(freela.media_avaliacoes || 0).toFixed(1)}
                      </div>

                      <div className="text-sm text-slate-400">
                        {freela.total_avaliacoes || 0} avaliações
                      </div>

                    </div>

                  </div>

                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">

                    <p className="text-sm text-slate-400">
                      Projetos concluídos
                    </p>

                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      {freela.projetos_concluidos || 0}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">

                    <p className="text-sm text-slate-400">
                      Cidade
                    </p>

                    <p className="mt-1 font-bold">
                      {freela.cidade || "Brasil"}
                    </p>

                  </div>

                </div>

                <p className="mt-5 line-clamp-4 leading-7 text-slate-300">
                  {freela.descricao ||
                    "Freelancer especialista disponível para novos projetos."}
                </p>

                <Link
                  href={`/freelancer/${freela.id}`}
                  className="mt-6 block rounded-2xl bg-emerald-400 px-5 py-4 text-center font-black text-slate-950 transition hover:bg-emerald-300"
                >
                  Ver perfil completo
                </Link>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="text-center">

          <h2 className="text-5xl font-black">
            Como funciona
          </h2>

          <p className="mt-4 text-lg text-slate-400">
            Simples, rápido e seguro.
          </p>

        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-5xl font-black text-emerald-300">
              1
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Publique seu projeto
            </h3>

            <p className="mt-4 leading-8 text-slate-300">
              Descreva sua necessidade e receba propostas rapidamente.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-5xl font-black text-emerald-300">
              2
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Receba propostas
            </h3>

            <p className="mt-4 leading-8 text-slate-300">
              Freelancers qualificados irão enviar propostas para você.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-5xl font-black text-emerald-300">
              3
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Converse no chat
            </h3>

            <p className="mt-4 leading-8 text-slate-300">
              Negocie, envie arquivos e acompanhe o projeto.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-5xl font-black text-emerald-300">
              4
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Conclua com segurança
            </h3>

            <p className="mt-4 leading-8 text-slate-300">
              Avalie freelancers e construa reputação na plataforma.
            </p>
          </div>

        </div>

      </section>

      {/* ESTATISTICAS */}
      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
            <p className="text-5xl font-black text-emerald-300">
              +100
            </p>

            <p className="mt-3 text-lg text-slate-400">
              Freelancers
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
            <p className="text-5xl font-black text-emerald-300">
              +300
            </p>

            <p className="mt-3 text-lg text-slate-400">
              Projetos
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
            <p className="text-5xl font-black text-emerald-300">
              4.9
            </p>

            <p className="mt-3 text-lg text-slate-400">
              Média avaliações
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
            <p className="text-5xl font-black text-emerald-300">
              24h
            </p>

            <p className="mt-3 text-lg text-slate-400">
              Tempo médio resposta
            </p>
          </div>

        </div>

      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">

        <h2 className="text-5xl font-black">
          Comece agora gratuitamente
        </h2>

        <p className="mt-6 text-xl leading-9 text-slate-300">
          Publique projetos, encontre especialistas e desenvolva seu negócio com o FreelaBrasil.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

          <Link
            href="/cadastro"
            className="rounded-2xl bg-emerald-400 px-8 py-5 text-lg font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Criar conta grátis
          </Link>

          <Link
            href="/freelancers"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-lg font-bold transition hover:bg-white/10"
          >
            Explorar freelancers
          </Link>

        </div>

      </section>

    </main>
  );
}