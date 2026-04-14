import Link from "next/link";

export default function CadastroPage() {
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

      {/* TIPO DE CADASTRO */}
      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-400/30 bg-emerald-400/10 p-8">
            <h3 className="text-2xl font-black">Sou Freelancer</h3>
            <p className="mt-3 text-slate-200">
              Monte seu perfil, publique portfólio, mostre projetos e envie propostas.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-black">Sou Contratante</h3>
            <p className="mt-3 text-slate-300">
              Cadastre sua empresa ou perfil, publique demandas e encontre
              profissionais qualificados.
            </p>
          </div>
        </div>
      </section>

      {/* FORMULARIO FREELANCER */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black">Cadastro Freelancer</h2>
              <p className="mt-2 text-slate-300">
                Preencha seus dados e monte seu perfil profissional.
              </p>
            </div>

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Perfil profissional
            </span>
          </div>

          {/* DADOS BASICOS FREELANCER */}
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

          {/* RESUMO PROFISSIONAL */}
          <div className="mt-8">
            <label className="mb-3 block text-sm font-semibold text-slate-200">
              Resumo profissional
            </label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
              placeholder="Descreva sua experiência, especialidades, ferramentas e diferenciais."
              rows={5}
            />
          </div>

          {/* HABILIDADES */}
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

          {/* PORTFOLIO */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <h3 className="text-xl font-bold">Portfólio e projetos</h3>
            <p className="mt-2 text-slate-300">
              Adicione seus melhores trabalhos para mostrar autoridade e experiência.
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
            /><label className="mt-4 block text-sm font-semibold text-slate-200">
Anexar arquivos do projeto
</label>

<input
type="file"
multiple
className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
/>

<p className="text-xs text-slate-400 mt-2">
Você pode anexar planilhas, PDFs, imagens ou documentos do projeto.
</p>
          </div>
        </div>
      </section>

      {/* FORMULARIO CONTRATANTE */}
      <section className="mx-auto max-w-7xl px-6 py-8 pb-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black">Cadastro Contratante</h2>
              <p className="mt-2 text-slate-300">
                Cadastre sua empresa ou perfil e publique o projeto que deseja contratar.
              </p>
            </div>

            <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-300">
              Publicação de projetos
            </span>
          </div>

          {/* DADOS BASICOS CONTRATANTE */}
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

          {/* TIPO DE PROFISSIONAL */}
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

          {/* DADOS DO PROJETO */}
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

          {/* BOTOES */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.01]">
              Criar conta
            </button>
            <button className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5">
              Criar conta com Google
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}