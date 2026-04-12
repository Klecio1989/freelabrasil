export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-white/10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-2xl font-black">FreelaBrasil</div>
            <div className="text-xs text-slate-400">Trabalhe para você mesmo</div>
          </div>

          <div className="flex gap-3">
            <button className="border border-white/20 px-4 py-2 rounded-lg">
              Entrar
            </button>

            <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold">
              Começar agora
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-6 py-20">

        <h1 className="text-5xl font-black leading-tight max-w-3xl">
          O lugar onde freelancers encontram projetos.
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-xl">
          Plataforma brasileira para profissionais de 
          <b> Excel, Power BI, automação, dados e tecnologia</b>.
          Conectamos empresas a especialistas capazes de resolver
          problemas reais com dashboards, BI e automações.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl">
            Quero ser freelancer
          </button>

          <button className="border border-white/20 px-6 py-3 rounded-xl">
            Publicar projeto
          </button>
        </div>


        <section className="mt-24 grid md:grid-cols-3 gap-6">

          <div className="border border-white/10 p-6 rounded-2xl bg-white/5">
            <h3 className="text-xl font-bold">Projetos qualificados</h3>
            <p className="mt-3 text-slate-300">
              Empresas publicam demandas reais de dashboards, BI,
              automação e análise de dados.
            </p>
          </div>

          <div className="border border-white/10 p-6 rounded-2xl bg-white/5">
            <h3 className="text-xl font-bold">Baixo custo</h3>
            <p className="mt-3 text-slate-300">
              Plano acessível para freelancers divulgarem projetos
              e receberem oportunidades.
            </p>
          </div>

          <div className="border border-white/10 p-6 rounded-2xl bg-white/5">
            <h3 className="text-xl font-bold">Portfólio profissional</h3>
            <p className="mt-3 text-slate-300">
              Mostre dashboards, automações e cases para atrair
              novos clientes.
            </p>
          </div>

        </section>

      </main>


      <footer className="border-t border-white/10 px-6 py-6 text-center text-slate-400">
        FreelaBrasil • Plataforma brasileira para Excel, Power BI e automação
      </footer>

    </div>
  );
}