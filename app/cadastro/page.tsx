"use client";

import { useState } from "react";
import Link from "next/link";

export default function CadastroPage() {
  const [tipoCadastro, setTipoCadastro] = useState<
    "freelancer" | "contratante" | null
  >(null);

  const categorias = [
    "Excel",
    "Power BI",
    "Python",
    "Automação com Python",
    "Dashboards",
    "HTML",
    "CSS",
    "Java",
    "Desenvolvimento de App para Celular",
    "Web Design",
    "Design Gráfico",
    "SQL",
    "Tradutora / Dublagem",
    "Análise de Dados",
  ];

  const orcamentos = [
    "Até R$ 500",
    "R$ 500 – R$ 1.500",
    "R$ 1.500 – R$ 5.000",
    "Acima de R$ 5.000",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* CABECALHO CADASTRO */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Crie sua conta</p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            Voltar para home
          </Link>
        </div>
      </header>

      {/* HERO CADASTRO */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Cadastro de usuários
          </span>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
            Escolha seu perfil e comece a usar o FreelaBrasil.
          </h2>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Cadastre-se como freelancer para oferecer seus serviços ou como
            contratante para publicar projetos e encontrar o profissional ideal.
          </p>
        </div>
      </section>

      {/* ESCOLHA DO PERFIL */}
      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setTipoCadastro("freelancer")}
            className={`rounded-[2rem] border p-8 text-left transition ${
              tipoCadastro === "freelancer"
                ? "border-emerald-400/40 bg-emerald-400/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-black">Sou Freelancer</h3>
              {tipoCadastro === "freelancer" && (
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                  Selecionado
                </span>
              )}
            </div>

            <p className="mt-3 text-slate-200">
              Monte seu perfil, publique portfólio, mostre projetos e envie
              propostas.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTipoCadastro("contratante")}
            className={`rounded-[2rem] border p-8 text-left transition ${
              tipoCadastro === "contratante"
                ? "border-emerald-400/40 bg-emerald-400/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-black">Sou Contratante</h3>
              {tipoCadastro === "contratante" && (
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                  Selecionado
                </span>
              )}
            </div>

            <p className="mt-3 text-slate-300">
              Cadastre sua empresa ou perfil, publique demandas e encontre
              profissionais qualificados.
            </p>
          </button>
        </div>
      </section>

      {/* FORMULARIO FREELANCER */}
      {tipoCadastro === "freelancer" && (
        <section className="mx-auto max-w-7xl px-6 py-8 pb-16">
          <div className="rounded-[2rem] border border-emerald-400/30 bg-emerald-400/10 p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black">Cadastro Freelancer</h2>
                <p className="mt-2 text-slate-100">
                  Preencha seus dados e monte seu perfil profissional.
                </p>
              </div>

              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                Perfil freelancer
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Nome completo"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Data de nascimento"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="CPF ou CNPJ"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Cidade / UF"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Seu e-mail"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Criar senha"
                type="password"
              />
            </div>

            <div className="mt-8">
              <label className="mb-3 block text-sm font-semibold text-slate-100">
                Resumo profissional
              </label>
              <textarea
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Descreva sua experiência, especialidades, ferramentas e diferenciais."
                rows={5}
              />
            </div>

            <div className="mt-8">
              <div className="mb-3 font-semibold">Nível de conhecimentos</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorias.map((categoria) => (
                  <label
                    key={categoria}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm"
                  >
                    <input type="checkbox" className="mr-2" />
                    {categoria}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="text-xl font-bold">Portfólio e projetos</h3>
              <p className="mt-2 text-slate-300">
                Adicione seus melhores trabalhos para mostrar experiência e autoridade.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                  placeholder="Nome do projeto"
                />
                <input
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                  placeholder="Categoria do projeto"
                />
              </div>

              <textarea
                className="mt-4 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Descrição do projeto"
                rows={4}
              />
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.01]">
                Criar conta freelancer
              </button>
              <button className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5">
                Criar conta com Google
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FORMULARIO CONTRATANTE */}
      {tipoCadastro === "contratante" && (
        <section className="mx-auto max-w-7xl px-6 py-8 pb-16">
          <div className="rounded-[2rem] border border-emerald-400/30 bg-emerald-400/10 p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black">Cadastro Contratante</h2>
                <p className="mt-2 text-slate-100">
                  Cadastre sua empresa ou perfil e publique o projeto que deseja contratar.
                </p>
              </div>

              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                Perfil contratante
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Nome da empresa ou responsável"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="CPF ou CNPJ"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Cidade / UF"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Seu e-mail"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Criar senha"
                type="password"
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Prazo em dias"
              />
            </div>

            <div className="mt-8">
              <div className="mb-3 font-semibold">Qual tipo de profissional busca?</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorias.map((categoria) => (
                  <label
                    key={categoria}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm"
                  >
                    <input type="checkbox" className="mr-2" />
                    {categoria}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="text-xl font-bold">Projeto que deseja contratar</h3>
              <p className="mt-2 text-slate-300">
                Informe os detalhes para atrair os freelancers mais aderentes.
              </p>

              <input
                className="mt-4 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Nome do projeto"
              />

              <textarea
                className="mt-4 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                placeholder="Descrição do projeto"
                rows={5}
              />

              <label className="mt-4 block text-sm font-semibold text-slate-200">
                Anexar arquivos do projeto
              </label>

              <input
                type="file"
                multiple
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />

              <p className="mt-2 text-xs text-slate-400">
                Você pode anexar planilhas, PDFs, imagens ou documentos com requisitos do projeto.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <input
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                  placeholder="Área do projeto"
                />

                <select className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white">
                  <option>Selecione a faixa de orçamento</option>
                  {orcamentos.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <input
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                  placeholder="Prazo em dias"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.01]">
                Criar conta contratante
              </button>
              <button className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5">
                Criar conta com Google
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}