import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* TEXTO */}
            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                🚀 Plataforma brasileira para freelancers
              </div>

              {/* LOGO */}
              <div className="mt-8">
                <img
                  src="/logo-freellabrasil.png"
                  alt="FreellaBrasil"
                  className="h-24 md:h-28"
                />
              </div>

              <p className="mt-5 text-lg text-emerald-300 font-semibold">
                Conecta talentos, realiza projetos.
              </p>

              <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
                Contrate especialistas ou trabalhe como freelancer.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
                O FreellaBrasil conecta empresas e profissionais para projetos
                em Excel, Power BI, Python, automações, dashboards,
                design, desenvolvimento web e tecnologia.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">

                <Link
                  href="/cadastro?tipo=contratante"
                  className="rounded-2xl bg-emerald-400 px-7 py-4 font-black text-slate-950 transition hover:scale-[1.02]"
                >
                  Publicar projeto
                </Link>

                <Link
                  href="/cadastro?tipo=freelancer"
                  className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white/10"
                >
                  Criar perfil freelancer
                </Link>
              </div>

              {/* MÉTRICAS */}
              <div className="mt-14 flex flex-wrap gap-10">

                <div>
                  <p className="text-4xl font-black text-emerald-300">IA</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Match inteligente
                  </p>
                </div>

                <div>
                  <p className="text-4xl font-black text-emerald-300">
                    Seguro
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Pagamento protegido
                  </p>
                </div>

                <div>
                  <p className="text-4xl font-black text-emerald-300">
                    Brasil
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Plataforma nacional
                  </p>
                </div>
              </div>
            </div>

            {/* CARD DIREITA */}
            <div className="relative">

              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Projeto em andamento
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      Dashboard Power BI
                    </h3>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                    IA Match
                  </span>
                </div>

                <div className="mt-8 space-y-4">

                  <FreelaCard
                    nome="Carlos Mendes"
                    skill="Power BI • Excel • Automação"
                    nota="5.0"
                    plano="PRO"
                  />

                  <FreelaCard
                    nome="Ana Souza"
                    skill="Python • Dashboards • Dados"
                    nota="4.9"
                    plano="PLUS"
                  />

                  <FreelaCard
                    nome="Juliana Lima"
                    skill="Design • UI/UX • Web"
                    nota="4.8"
                    plano="PLUS"
                  />

                </div>

                <button className="mt-8 w-full rounded-2xl bg-emerald-400 px-6 py-4 font-black text-slate-950">
                  Encontrar freelancers
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="border-t border-white/10 bg-slate-900/60"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              Como funciona
            </span>

            <h2 className="mt-6 text-5xl font-black">
              Simples, rápido e seguro.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Contratantes encontram especialistas rapidamente e freelancers
              recebem projetos alinhados ao seu perfil através da IA.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-4">

            <Card
              numero="1"
              titulo="Cadastre-se"
              texto="Crie seu perfil como freelancer ou publique seu projeto como contratante."
            />

            <Card
              numero="2"
              titulo="Conecte-se"
              texto="A IA sugere freelancers ideais para cada projeto publicado."
            />

            <Card
              numero="3"
              titulo="Execute"
              texto="Converse, envie propostas e trabalhe com segurança dentro da plataforma."
            />

            <Card
              numero="4"
              titulo="Finalize"
              texto="Avalie, libere pagamento e continue construindo reputação."
            />
          </div>
        </div>
      </section>

      {/* ÁREAS */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">
            <h2 className="text-5xl font-black">
              Áreas mais procuradas
            </h2>

            <p className="mt-6 text-lg text-slate-300">
              Encontre profissionais especializados em diversas áreas.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <AreaCard titulo="Power BI" />
            <AreaCard titulo="Excel" />
            <AreaCard titulo="Python" />
            <AreaCard titulo="Dashboards" />
            <AreaCard titulo="Automação" />
            <AreaCard titulo="Design" />
            <AreaCard titulo="Web & Software" />
            <AreaCard titulo="Consultoria" />

          </div>
        </div>
      </section>

      {/* DIFERENCIAL */}
      <section className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-sm font-semibold text-purple-300">
                IA integrada
              </span>

              <h2 className="mt-6 text-5xl font-black">
                Match inteligente para encontrar profissionais ideais.
              </h2>

              <p className="mt-8 text-lg leading-8 text-slate-300">
                A plataforma utiliza inteligência artificial para conectar
                contratantes aos freelancers mais compatíveis com o projeto,
                aumentando a taxa de sucesso e reduzindo o tempo de contratação.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <span className="rounded-full bg-white/5 px-4 py-3 text-sm">
                  🧠 Match IA
                </span>

                <span className="rounded-full bg-white/5 px-4 py-3 text-sm">
                  💰 Sugestão de preço
                </span>

                <span className="rounded-full bg-white/5 px-4 py-3 text-sm">
                  ✍ IA para propostas
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm text-emerald-300">
                  Projeto analisado pela IA
                </p>

                <h3 className="mt-3 text-2xl font-black">
                  Automação de relatórios Excel
                </h3>

                <p className="mt-4 leading-7 text-slate-300">
                  IA encontrou freelancers especializados em Power Query,
                  VBA e automação de dashboards.
                </p>
              </div>

              <div className="mt-6 space-y-4">

                <MiniCard
                  nome="Marcos Silva"
                  skill="Excel • VBA • Power Query"
                />

                <MiniCard
                  nome="Fernanda Costa"
                  skill="Power BI • Python • Dados"
                />

                <MiniCard
                  nome="Rafael Lima"
                  skill="Automação • Dashboards"
                />

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">

          <h2 className="text-5xl font-black">
            Comece agora no FreellaBrasil
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Crie seu perfil freelancer ou publique seu projeto e encontre
            especialistas com ajuda da inteligência artificial.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Link
              href="/cadastro?tipo=freelancer"
              className="rounded-2xl bg-emerald-400 px-7 py-4 font-black text-slate-950"
            >
              Quero ser freelancer
            </Link>

            <Link
              href="/cadastro?tipo=contratante"
              className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-bold text-white"
            >
              Quero contratar
            </Link>

          </div>
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
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 text-center transition hover:-translate-y-1 hover:bg-white/10">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-2xl font-black text-slate-950">
        {numero}
      </div>

      <h3 className="mt-6 text-2xl font-black">
        {titulo}
      </h3>

      <p className="mt-4 leading-7 text-slate-400">
        {texto}
      </p>
    </div>
  );
}

function FreelaCard({
  nome,
  skill,
  nota,
  plano,
}: {
  nome: string;
  skill: string;
  nota: string;
  plano: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">

      <div className="flex items-center justify-between">

        <div>
          <h4 className="font-black">
            {nome}
          </h4>

          <p className="mt-1 text-sm text-slate-400">
            {skill}
          </p>
        </div>

        <div className="text-right">
          <p className="text-yellow-300">
            ⭐ {nota}
          </p>

          <span className="mt-1 inline-block rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
            {plano}
          </span>
        </div>
      </div>
    </div>
  );
}

function AreaCard({ titulo }: { titulo: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:bg-white/10 hover:-translate-y-1">

      <h3 className="text-xl font-black">
        {titulo}
      </h3>
    </div>
  );
}

function MiniCard({
  nome,
  skill,
}: {
  nome: string;
  skill: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">

      <div className="flex items-center justify-between">

        <div>
          <h4 className="font-black">
            {nome}
          </h4>

          <p className="mt-1 text-sm text-slate-400">
            {skill}
          </p>
        </div>

        <span className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
          Match IA
        </span>
      </div>
    </div>
  );
}