import Link from "next/link";
import Image from "next/image";

export default function PainelFreelancerPage() {
  const meusProjetos = [
    {
      nome: "Dashboard Logístico Power BI",
      categoria: "Power BI",
      status: "Publicado",
    },
    {
      nome: "Automação de Relatórios em Python",
      categoria: "Python",
      status: "Publicado",
    },
    {
      nome: "Painel de Vendas em Excel",
      categoria: "Excel",
      status: "Rascunho",
    },
  ];

  const propostas = [
    {
      projeto: "Dashboard financeiro empresa varejo",
      valor: "R$ 1.200",
      prazo: "7 dias",
      status: "Em análise",
    },
    {
      projeto: "Automação relatórios Excel",
      valor: "R$ 900",
      prazo: "5 dias",
      status: "Enviado",
    },
    {
      projeto: "Site institucional responsivo",
      valor: "R$ 2.500",
      prazo: "15 dias",
      status: "Respondido",
    },
  ];

  const mensagens = [
    {
      remetente: "Empresa Alpha",
      assunto: "Interesse no seu perfil",
      data: "Hoje",
    },
    {
      remetente: "Loja Prisma",
      assunto: "Projeto Power BI",
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
              <p className="text-sm text-slate-400">Painel do Freelancer</p>
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-2xl font-black text-slate-950">
                  KB
                </div>

                <div>
                  <h2 className="text-3xl font-black">Klecio Brito</h2>
                  <p className="mt-1 text-slate-300">
                    Especialista em Excel, Power BI, Automação e Dados
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Cidade: Cotia - SP
                  </p>
                </div>
              </div>

              <button className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:scale-[1.02]">
                Editar perfil
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-400/30 bg-emerald-400/10 p-8">
            <div className="text-sm text-emerald-300">Plano atual</div>
            <div className="mt-2 text-3xl font-black">Gratuito</div>
            <p className="mt-3 text-slate-100">
              Você ainda pode enviar <span className="font-bold">2 ofertas</span>.
            </p>

            <div className="mt-6 grid gap-3">
              <button className="rounded-xl bg-yellow-400 px-4 py-3 font-bold text-slate-950 transition hover:scale-[1.01]">
                Upgrade Plus — R$ 19,99
              </button>

              <button className="rounded-xl bg-purple-500 px-4 py-3 font-bold text-white transition hover:scale-[1.01]">
                Upgrade Pro — R$ 29,99
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS DE RESUMO */}
      <section className="mx-auto max-w-7xl px-6 py-2">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Projetos cadastrados</div>
            <div className="mt-2 text-3xl font-black">3</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Propostas enviadas</div>
            <div className="mt-2 text-3xl font-black">12</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Mensagens recebidas</div>
            <div className="mt-2 text-3xl font-black">2</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Ofertas restantes</div>
            <div className="mt-2 text-3xl font-black">2</div>
          </div>
        </div>
      </section>

      {/* MEUS PROJETOS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black">Meus projetos</h2>
            <p className="mt-2 text-slate-300">
              Gerencie seus cases e portfólio profissional.
            </p>
          </div>

          <button className="rounded-2xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:scale-[1.02]">
            Adicionar projeto
          </button>
        </div>

        <div className="grid gap-6">
          {meusProjetos.map((projeto) => (
            <div
              key={projeto.nome}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-xl font-bold">{projeto.nome}</h3>
                <p className="mt-2 text-slate-400">Categoria: {projeto.categoria}</p>
                <p className="mt-1 text-emerald-400">Status: {projeto.status}</p>
              </div>

              <div className="flex gap-3">
                <button className="rounded-xl bg-blue-500 px-4 py-2 font-medium text-white">
                  Editar
                </button>
                <button className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROPOSTAS ENVIADAS */}
      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="mb-6">
          <h2 className="text-3xl font-black">Propostas enviadas</h2>
          <p className="mt-2 text-slate-300">
            Acompanhe o andamento das oportunidades que você aplicou.
          </p>
        </div>

        <div className="grid gap-6">
          {propostas.map((proposta) => (
            <div
              key={proposta.projeto}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-xl font-bold">{proposta.projeto}</h3>
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

              <button className="rounded-xl border border-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/5">
                Ver detalhes
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MENSAGENS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <h2 className="text-3xl font-black">Mensagens recentes</h2>
          <p className="mt-2 text-slate-300">
            Empresas interessadas no seu perfil e nas suas propostas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mensagens.map((mensagem) => (
            <div
              key={mensagem.assunto}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="text-sm text-slate-400">{mensagem.data}</div>
              <h3 className="mt-2 text-xl font-bold">{mensagem.remetente}</h3>
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
            <span className="font-semibold text-white">FreelaBrasil</span> — Painel do freelancer
          </div>
          <div>Gerencie perfil, projetos, propostas e mensagens em um só lugar.</div>
        </div>
      </footer>
    </main>
  );
}