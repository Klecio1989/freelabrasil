import Link from "next/link";

export default function ProjetosPage() {
  const projetos = [
    {
      titulo: "Dashboard Power BI para Logística",
      categoria: "Power BI",
      orcamento: "R$ 1.500 – R$ 5.000",
      prazo: "15 dias",
      descricao:
        "Empresa busca especialista para desenvolver dashboard gerencial com indicadores de transporte, SLA e performance operacional.",
    },
    {
      titulo: "Automação de relatórios em Python",
      categoria: "Python",
      orcamento: "R$ 500 – R$ 1.500",
      prazo: "7 dias",
      descricao:
        "Automatizar extração de dados, geração de relatórios e envio automático por e-mail utilizando Python.",
    },
    {
      titulo: "Criação de site institucional",
      categoria: "HTML / CSS",
      orcamento: "R$ 1.500 – R$ 5.000",
      prazo: "10 dias",
      descricao:
        "Desenvolver site institucional responsivo com páginas de apresentação da empresa e formulário de contato.",
    },
    {
      titulo: "Aplicativo simples para celular",
      categoria: "App Mobile",
      orcamento: "Acima de R$ 5.000",
      prazo: "30 dias",
      descricao:
        "Desenvolver aplicativo para cadastro de clientes e controle de serviços com integração básica com banco de dados.",
    },
  ];

  const categorias = [
    "Excel",
    "Power BI",
    "Python",
    "Automação com Python",
    "Dashboards",
    "HTML",
    "CSS",
    "Java",
    "App Mobile",
    "Web Design",
    "Design Gráfico",
    "SQL",
    "Tradutora / Dublagem",
    "Análise de Dados",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      
      {/* CABEÇALHO */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Projetos disponíveis</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm"
            >
              Home
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-4xl font-black">
          Encontre projetos para trabalhar
        </h2>

        <p className="mt-4 max-w-2xl text-slate-300">
          Empresas estão publicando demandas todos os dias. 
          Encontre projetos nas áreas de tecnologia, dados, design e muito mais.
        </p>
      </section>

      {/* FILTROS */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-bold mb-4">
            Filtrar por categoria
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm hover:bg-slate-800"
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LISTA DE PROJETOS */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6">

          {projetos.map((projeto, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">

                <div>
                  <h3 className="text-2xl font-bold">
                    {projeto.titulo}
                  </h3>

                  <p className="mt-2 text-slate-300">
                    {projeto.descricao}
                  </p>

                  <div className="mt-4 flex gap-4 text-sm text-slate-400">
                    <span>Categoria: {projeto.categoria}</span>
                    <span>Orçamento: {projeto.orcamento}</span>
                    <span>Prazo: {projeto.prazo}</span>
                  </div>
                </div>

                <div className="mt-6 md:mt-0">
                  <button className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 hover:scale-[1.02] transition">
                    Enviar proposta
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