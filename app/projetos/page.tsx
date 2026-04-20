"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Projeto = {
  id: string;
  titulo: string;
  descricao: string;
  area: string;
  orcamento: string;
  prazo: number;
  created_at: string;
};

type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
};

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

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
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar projetos:", error);
      alert("Erro ao carregar projetos.");
    } else {
      setProjetos((data as Projeto[]) || []);
    }

    setCarregando(false);
  }

  function sair() {
    localStorage.removeItem("freelabrasil_usuario");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Projetos disponíveis</p>
          </div>

          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <div className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 md:block">
                  <div className="text-xs text-slate-400">Logado como</div>
                  <div className="text-sm font-semibold text-white">
                    {usuario.nome} ({usuario.tipo_usuario})
                  </div>
                </div>

                <button
                  onClick={sair}
                  className="rounded-xl border border-red-400/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/10"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Home
                </Link>

                <Link
                  href="/login"
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Login
                </Link>
              </>
            )}

            <Link
              href="/projetos/novo"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
            >
              Publicar projeto
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Marketplace de projetos
            </span>

            <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Encontre oportunidades reais para crescer como freelancer.
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-300">
              Explore projetos publicados por contratantes, compare orçamento,
              prazo e área, e envie sua proposta diretamente pela plataforma.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Projetos</div>
              <div className="mt-1 text-2xl font-black">{projetos.length}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Áreas</div>
              <div className="mt-1 text-2xl font-black">Dados & Tech</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-sm text-slate-400">Modelo</div>
              <div className="mt-1 text-2xl font-black">Remoto</div>
            </div>
          </div>
        </div>

        {carregando && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
            Carregando projetos...
          </div>
        )}

        {!carregando && projetos.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
            <h3 className="text-2xl font-black">Nenhum projeto publicado ainda</h3>
            <p className="mt-3 text-slate-300">
              Assim que um contratante publicar um projeto, ele aparecerá aqui.
            </p>

            <Link
              href="/projetos/novo"
              className="mt-6 inline-block rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:scale-[1.01]"
            >
              Publicar primeiro projeto
            </Link>
          </div>
        )}

        <div className="grid gap-6">
          {!carregando &&
            projetos.map((projeto) => (
              <div
                key={projeto.id}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-2xl transition hover:border-emerald-400/30 hover:bg-white/[0.07]"
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
                    </div>

                    <h3 className="text-2xl font-black md:text-3xl">
                      {projeto.titulo}
                    </h3>

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

                  <div className="flex min-w-[220px] flex-col gap-3">
                    <Link
                      href={`/propostas/nova?projeto_id=${projeto.id}`}
                      className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950 transition hover:scale-[1.02]"
                    >
                      Enviar proposta
                    </Link>

                    <button className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5">
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}