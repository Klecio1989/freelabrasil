"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PlanosPage() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return (
        <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">
          PRO
        </span>
      );
    }

    if (plano === "plus") {
      return (
        <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">
          PLUS
        </span>
      );
    }

    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">
        GRATUITO
      </span>
    );
  }

  function Card({
    titulo,
    preco,
    destaque,
    cor,
    beneficios,
    botao,
    href,
  }: {
    titulo: string;
    preco: string;
    destaque?: string;
    cor: string;
    beneficios: string[];
    botao: string;
    href: string;
  }) {
    return (
      <div className={`rounded-[2rem] border p-8 ${cor}`}>
        {destaque && (
          <div className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950">
            {destaque}
          </div>
        )}

        <h2 className="mt-4 text-3xl font-black">{titulo}</h2>
        <p className="mt-3 text-5xl font-black">{preco}</p>
        <p className="mt-2 text-sm text-slate-400">por mês</p>

        <div className="mt-8 space-y-3">
          {beneficios.map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>

        <Link
          href={href}
          className="mt-8 block rounded-xl bg-white px-6 py-3 text-center font-bold text-slate-950"
        >
          {botao}
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              Planos FreelaBrasil
            </span>

            <h1 className="mt-5 text-5xl font-black leading-tight">
              Escolha o plano ideal para crescer na plataforma
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Mais visibilidade, mais convites, mais oportunidades e mais resultado para freelancers e contratantes.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <div className="text-sm text-slate-400">Seu plano atual</div>
            <div className="mt-2 flex items-center gap-3 text-xl font-black">
              <span>{usuario?.plano || "gratuito"}</span>
              {badgePlano(usuario?.plano)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            titulo="Gratuito"
            preco="R$ 0"
            cor="border-white/10 bg-white/5"
            beneficios={[
              "Criar perfil profissional",
              "Publicar portfólio",
              "Mostrar até 5 projetos",
              "Enviar até 2 ofertas de freela",
              "Receber mensagens de contratantes",
            ]}
            botao="Continuar no gratuito"
            href="/perfil"
          />

          <Card
            titulo="Plus"
            preco="R$ 19,99"
            destaque="MAIS POPULAR"
            cor="border-emerald-400/40 bg-emerald-400/5"
            beneficios={[
              "Criar perfil completo",
              "Publicar até 10 projetos",
              "Mais destaque na plataforma",
              "Enviar até 10 ofertas por dia",
              "Receber mensagens e convites",
            ]}
            botao="Escolher Plus"
            href="/perfil"
          />

          <Card
            titulo="Pro"
            preco="R$ 29,99"
            destaque="MÁXIMO DESTAQUE"
            cor="border-purple-500/40 bg-purple-500/5"
            beneficios={[
              "Criar perfil completo",
              "Publicar até 30 projetos",
              "Prioridade máxima na vitrine",
              "Ofertas ilimitadas",
              "Mais visibilidade e reputação",
            ]}
            botao="Escolher Pro"
            href="/perfil"
          />
        </div>

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h3 className="text-3xl font-black">O que já está ativo no MVP</h3>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="text-sm text-slate-400">Freelancers</div>
              <div className="mt-2 text-xl font-black">Perfil público, ranking e avaliações</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="text-sm text-slate-400">Contratantes</div>
              <div className="mt-2 text-xl font-black">Projetos, favoritos, convites e propostas</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="text-sm text-slate-400">Plataforma</div>
              <div className="mt-2 text-xl font-black">Dashboard, notificações e chat</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}