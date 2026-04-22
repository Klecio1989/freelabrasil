"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Marketplace de freelancers e projetos</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Login
            </Link>

            <Link
              href="/cadastro"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Plataforma para contratar e ser contratado
          </span>

          <h2 className="mt-6 text-5xl font-black leading-tight md:text-6xl">
            Conecte projetos reais a freelancers de alto nível.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Publique projetos, receba propostas, convide freelancers, avalie resultados e acompanhe tudo em um painel simples e profissional.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/cadastro"
              className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02]"
            >
              Começar agora
            </Link>

            <Link
              href="/freelancers"
              className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5"
            >
              Explorar freelancers
            </Link>

            <Link
              href="/projetos"
              className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5"
            >
              Ver projetos
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Convites diretos</div>
              <div className="mt-2 text-2xl font-black">Freelancers</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Propostas</div>
              <div className="mt-2 text-2xl font-black">Em minutos</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Planos</div>
              <div className="mt-2 text-2xl font-black">Free / Plus / Pro</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div className="text-sm text-emerald-300">Para contratantes</div>
            <div className="mt-2 text-2xl font-black">Publique projetos e receba talentos qualificados</div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Busque freelancers, favorite perfis, envie convites e acompanhe métricas no dashboard.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
            <div className="text-sm text-purple-300">Para freelancers</div>
            <div className="mt-2 text-2xl font-black">Construa reputação e feche mais trabalhos</div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Tenha perfil público, portfólio, avaliações, ranking, notificações e convites diretos.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <div className="text-sm text-slate-400">Recursos ativos</div>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              <li>• Login e cadastro</li>
              <li>• Publicação de projetos</li>
              <li>• Envio e aceite de propostas</li>
              <li>• Chat por proposta</li>
              <li>• Perfil público com avaliações</li>
              <li>• Favoritos, convites e notificações</li>
              <li>• Planos e dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h3 className="text-4xl font-black">Como funciona</h3>
            <p className="mt-3 text-slate-400">
              Fluxo simples para gerar negócios reais
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-semibold text-emerald-300">01</div>
              <h4 className="mt-3 text-2xl font-black">Crie sua conta</h4>
              <p className="mt-3 text-slate-300">
                Cadastre-se como freelancer ou contratante e personalize seu perfil.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-semibold text-emerald-300">02</div>
              <h4 className="mt-3 text-2xl font-black">Conecte-se</h4>
              <p className="mt-3 text-slate-300">
                Publique projetos, envie propostas, favorite perfis e faça convites diretos.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-semibold text-emerald-300">03</div>
              <h4 className="mt-3 text-2xl font-black">Feche negócios</h4>
              <p className="mt-3 text-slate-300">
                Converse no chat, aceite propostas, entregue valor e construa reputação.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-emerald-400/15 to-purple-500/15 p-10 text-center">
            <h3 className="text-4xl font-black">Pronto para crescer com a FreelaBrasil?</h3>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Comece no plano gratuito ou evolua para Plus e Pro para ganhar mais destaque e oportunidades.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/cadastro"
                className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
              >
                Criar conta grátis
              </Link>

              <Link
                href="/planos"
                className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}