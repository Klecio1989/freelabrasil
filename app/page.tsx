export default function Home() {
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
  ];

  const destaques = [
    {
      titulo: "Freelancers de tecnologia e dados",
      descricao:
        "Encontre profissionais para dashboards, automações, sites, apps, design e muito mais.",
    },
    {
      titulo: "Modelo simples e transparente",
      descricao:
        "Plano gratuito com limite de ofertas e plano Plus com envio ilimitado de propostas.",
    },
    {
      titulo: "Foco em resultado",
      descricao:
        "Empresas publicam projetos e freelancers enviam propostas com prazo, valor e portfólio.",
    },
  ];

  const planos = [
    {
      nome: "Gratuito",
      preco: "R$ 0",
      destaque: false,
      beneficios: [
        "Criar perfil profissional",
        "Mostrar portfólio",
        "Publicar projetos no perfil",
        "Enviar até 2 ofertas de freela",
        "Após isso, receber mensagens de contratantes",
      ],
    },
    {
      nome: "Plus",
      preco: "R$ 19,99/mês",
      destaque: true,
      beneficios: [
        "Criar perfil completo",
        "Mais visibilidade na plataforma",
        "Publicar mais projetos",
        "Enviar ofertas de trabalho à vontade",
        "Receber mensagens de contratantes",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Trabalhe para você mesmo</p>
          </div>

          <div className="flex gap-3">
            <button className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5">
              Entrar
            </button>
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
              Criar conta
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Plataforma brasileira para freelancers
            </span>

            <h2 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              O lugar onde freelancers encontram projetos.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Uma plataforma para conectar empresas e profissionais de{" "}
              <span className="font-semibold text-white">
                Excel, Power BI, HTML, CSS, Java, apps mobile, Web Design,
                Design Gráfico, SQL, Tradução e Dublagem
              </span>
              .
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-2xl bg-emerald-400 px-6 py-3 text-base font-bold text-slate-950 transition hover:scale-[1.02]">
                Quero ser freelancer
              </button>
              <button className="rounded-2xl border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/5">
                Publicar projeto
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Plano gratuito com 2 ofertas
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Plano Plus com ofertas ilimitadas
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                R$ 19,99/mês
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Projeto em destaque</div>
                <div className="text-xl font-bold">
                  Desenvolvimento de Dashboard Power BI
                </div>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                Novo
              </span>
            </div>

            <p className="text-sm leading-7 text-slate-300">
              Empresa procura freelancer para criar dashboard gerencial com KPIs,
              filtros interativos e visão executiva.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <div className="text-slate-400">Categoria</div>
                <div className="mt-1 font-semibold">Power BI</div>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <div className="text-slate-400">Orçamento</div>
                <div className="mt-1 font-semibold">R$ 1.500</div>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <div className="text-slate-400">Plano Plus</div>
                <div className="mt-1 font-semibold">R$ 19,99/mês</div>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <div className="text-slate-400">Modelo</div>
                <div className="mt-1 font-semibold">Remoto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {destaques.map((item) => (
            <div
              key={item.titulo}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-xl font-bold">{item.titulo}</h3>
              <p className="mt-3 leading-7 text-slate-300">{item.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">
                Áreas disponíveis no FreelaBrasil
              </h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                Empresas podem publicar demandas em tecnologia, dados, design,
                idiomas e serviços digitais.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((categoria) => (
              <div
                key={categoria}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-lg font-semibold text-slate-100"
              >
                {categoria}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16" id="planos">
        <div className="text-center">
          <h2 className="text-3xl font-black md:text-4xl">
            Planos da plataforma
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Escolha entre o plano gratuito e o plano Plus para ampliar suas
            oportunidades.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {planos.map((plano) => (
            <div
              key={plano.nome}
              className={`rounded-[2rem] border p-8 ${
                plano.destaque
                  ? "border-emerald-400/40 bg-emerald-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">{plano.nome}</h3>
                  <div className="mt-2 text-4xl font-black">{plano.preco}</div>
                </div>

                {plano.destaque && (
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                    Mais escolhido
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-slate-200">
                {plano.beneficios.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-2xl px-5 py-3 font-bold transition hover:scale-[1.01] ${
                  plano.destaque
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-white text-slate-950"
                }`}
              >
                Escolher plano
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-semibold text-white">FreelaBrasil</span> —
            Trabalhe para você mesmo.
          </div>
          <div>
            Plataforma brasileira para tecnologia, dados, design, idiomas e
            serviços digitais.
          </div>
        </div>
      </footer>
    </main>
  );
}