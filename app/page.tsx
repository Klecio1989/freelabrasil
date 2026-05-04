import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Plataforma brasileira de freelancers
            </span>

            <h1 className="mt-6 text-5xl font-black leading-tight md:text-6xl">
              Contrate especialistas em Excel, Power BI, automação e tecnologia.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              O FreelaBrasil conecta empresas e profissionais freelancers para
              projetos rápidos, seguros e com avaliação após a entrega.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/cadastro?tipo=freelancer"
                className="rounded-xl bg-emerald-400 px-6 py-4 font-black text-slate-950"
              >
                Quero ser freela
              </Link>

              <Link
                href="/cadastro?tipo=contratante"
                className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
              >
                Quero contratar
              </Link>

              <Link
                href="#como-funciona"
                className="rounded-xl border border-white/20 px-6 py-4 font-bold text-white hover:bg-white/5"
              >
                Como funciona
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
            <h2 className="text-2xl font-black">Encontre talentos para:</h2>

            <div className="mt-6 grid gap-4">
              {[
                "Dashboards em Power BI",
                "Planilhas automatizadas em Excel",
                "Automações com Python",
                "Relatórios gerenciais",
                "Análise de dados",
                "Projetos de tecnologia",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-4 font-bold text-slate-200"
                >
                  ✅ {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-white/10 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-center text-4xl font-black">Como funciona</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <Card
              numero="1"
              titulo="Cadastre-se"
              texto="Escolha se você quer contratar ou trabalhar como freelancer."
            />

            <Card
              numero="2"
              titulo="Publique ou encontre projetos"
              texto="Contratantes publicam demandas e freelancers enviam propostas."
            />

            <Card
              numero="3"
              titulo="Aceite a proposta"
              texto="Quando a proposta é aceita, o projeto entra em andamento automaticamente."
            />

            <Card
              numero="4"
              titulo="Finalize e avalie"
              texto="Após a entrega, o contratante confirma, avalia e libera o pagamento."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Info
            titulo="Para freelancers"
            texto="Receba convites, envie propostas, acompanhe seus trabalhos, avaliações, saldo e saques."
            botao="Começar como freela"
            link="/cadastro?tipo=freelancer"
          />

          <Info
            titulo="Para contratantes"
            texto="Publique projetos, receba propostas, escolha profissionais e acompanhe tudo em Meus Projetos."
            botao="Contratar agora"
            link="/cadastro?tipo=contratante"
          />

          <Info
            titulo="Planos de destaque"
            texto="Freelancers Plus e Pro ganham mais visibilidade, badges e melhor posicionamento no ranking."
            botao="Ver planos"
            link="/planos"
          />
        </div>
      </section>
    </main>
  );
}

function Card({
  numero,
  titulo,
  texto,
}: {
  numero: string;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-xl font-black text-slate-950">
        {numero}
      </div>

      <h3 className="mt-5 text-xl font-black">{titulo}</h3>
      <p className="mt-3 leading-7 text-slate-400">{texto}</p>
    </div>
  );
}

function Info({
  titulo,
  texto,
  botao,
  link,
}: {
  titulo: string;
  texto: string;
  botao: string;
  link: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
      <h3 className="text-2xl font-black">{titulo}</h3>
      <p className="mt-4 leading-8 text-slate-300">{texto}</p>

      <Link
        href={link}
        className="mt-6 inline-block rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
      >
        {botao}
      </Link>
    </div>
  );
}