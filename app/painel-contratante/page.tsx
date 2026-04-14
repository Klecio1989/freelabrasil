import Link from "next/link";
import Image from "next/image";

export default function PainelContratantePage() {
  const projetos = [
    {
      nome: "Dashboard Power BI para Logística",
      area: "Logística",
      orcamento: "R$ 1.500 – R$ 5.000",
      prazo: "15 dias",
      status: "Publicado",
      propostas: 8,
    },
    {
      nome: "Automação de relatórios em Python",
      area: "Financeiro",
      orcamento: "R$ 500 – R$ 1.500",
      prazo: "7 dias",
      status: "Em análise",
      propostas: 5,
    },
    {
      nome: "Site institucional da empresa",
      area: "Marketing",
      orcamento: "Acima de R$ 5.000",
      prazo: "30 dias",
      status: "Fechado",
      propostas: 12,
    },
  ];

  const propostasRecebidas = [
    {
      freelancer: "Klecio Brito",
      projeto: "Dashboard Power BI para Logística",
      valor: "R$ 1.200",
      prazo: "7 dias",
      status: "Nova proposta",
    },
    {
      freelancer: "Ana Souza",
      projeto: "Automação de relatórios em Python",
      valor: "R$ 950",
      prazo: "5 dias",
      status: "Em avaliação",
    },
    {
      freelancer: "Carlos Mendes",
      projeto: "Site institucional da empresa",
      valor: "R$ 4.800",
      prazo: "20 dias",
      status: "Respondida",
    },
  ];

  const mensagens = [
    {
      nome: "Klecio Brito",
      assunto: "Dúvidas sobre o escopo do projeto",
      data: "Hoje",
    },
    {
      nome: "Ana Souza",
      assunto: "Enviei minha proposta para análise",
      data: "Ontem",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* CABECALHO */}
      <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo FreelaBrasil"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
              <p className="text-sm text-slate-400">Painel do Contratante</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Home
            </Link>

            <Link
              href="/projetos"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Projetos
            </Link>

            <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* HERO DO PAINEL */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:col-span-2">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-950">
                  EA
                </div>

                <div>
                  <h2 className="text-3xl font-black">Empresa Alpha</h2>
                  <p className="mt-1 text-slate-300">
                    Contratante ativo em tecnologia, dados e automação
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Cidade: São Paulo - SP
                  </p>
                </div>
              </div>

              <button className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:scale-[1.02]">
                Editar perfil
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-400/30 bg-emerald-400/10 p-8">
            <div className="text-sm text-emerald-300">Resumo rápido</div>
            <div className="mt-2 text-3xl font-black">Ativo</div>
            <p className="mt-3 text-slate-100">
              Você possui <span className="font-bold">3 projetos</span> publicados e{" "}
              <span className="font-bold">25 propostas</span> recebidas.
            </p>

            <div className="mt-6 grid gap-3">
              <button className="rounded-xl bg-white px-4 py-3 font-bold text-slate-950 transition hover:scale-[1.01]">
                Publicar novo projeto
              </button>

              <button className="rounded-xl border border-white/20 px-4 py-3 font-bold text-white transition hover:bg-white/5">
                Ver freelancers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS DE RESUMO */}
      <section className="mx-auto max-w-7xl px-6 py-2">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Projetos publicados</div>
            <div className="mt-2 text-3xl font-black">3</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Propostas recebidas</div>
            <div className="mt-2 text-3xl font-black">25</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Mensagens</div>
            <div className="mt-2 text-3xl font-black">2</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Projetos fechados</div>
            <div className="mt-2 text-3xl font-black">1</div>
          </div>
        </div>
      </section>

      {/* MEUS PROJETOS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black">Meus projetos</h2>
            <p className="mt-2 text-slate-300">
              Gerencie os projetos publicados e acompanhe as propostas recebidas.
            </p>
          </div>

          <button className="rounded-2xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:scale-[1.02]">
            Publicar projeto
          </button>
        </div>

        <div className="grid gap-6">
          {projetos.map((projeto) => (
            <div
              key={projeto.nome}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">{projeto.nome}</h3>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Área: {projeto.area}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Orçamento: {projeto.orcamento}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Prazo: {projeto.prazo}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Status: {projeto.status}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Propostas: {projeto.propostas}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="rounded-xl bg-blue-500 px-4 py-2 font-medium text-white">
                    Editar
                  </button>
                  <button className="rounded-xl border border-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/5">
                    Ver propostas
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROPOSTAS RECEBIDAS */}
      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="mb-6">
          <h2 className="text-3xl font-black">Propostas recebidas</h2>
          <p className="mt-2 text-slate-300">
            Analise freelancers, compare valores e escolha o melhor profissional.
          </p>
        </div>

        <div className="grid gap-6">
          {propostasRecebidas.map((proposta) => (
            <div
              key={proposta.freelancer + proposta.projeto}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">{proposta.freelancer}</h3>
                  <p className="mt-2 text-slate-300">{proposta.projeto}</p>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Valor: {proposta.valor}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Prazo: {proposta.prazo}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Status: {proposta.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="rounded-xl bg-emerald-400 px-4 py-2 font-bold text-slate-950">
                    Analisar
                  </button>
                  <button className="rounded-xl border border-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/5">
                    Mensagem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MENSAGENS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <h2 className="text-3xl font-black">Mensagens recentes</h2>
          <p className="mt-2 text-slate-300">
            Converse com freelancers e acompanhe o andamento das negociações.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mensagens.map((mensagem) => (
            <div
              key={mensagem.nome + mensagem.assunto}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="text-sm text-slate-400">{mensagem.data}</div>
              <h3 className="mt-2 text-xl font-bold">{mensagem.nome}</h3>
              <p className="mt-2 text-slate-300">{mensagem.assunto}</p>

              <button className="mt-5 rounded-xl bg-white px-4 py-2 font-semibold text-slate-950 transition hover:scale-[1.01]">
                Abrir conversa
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* RODAPE */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-semibold text-white">FreelaBrasil</span> — Painel do contratante
          </div>
          <div>Gerencie projetos, propostas, mensagens e contratações em um só lugar.</div>
        </div>
      </footer>
    </main>
  );
}