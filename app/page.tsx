"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}
      <section className="px-6 py-24 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black leading-tight">
          Conecte-se com freelancers de alto nível
        </h1>

        <p className="mt-6 text-lg text-slate-300">
          Encontre talentos, publique projetos e feche negócios com segurança.
          Ou seja encontrado pelos melhores clientes do Brasil.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/cadastro"
            className="bg-emerald-400 text-black px-8 py-4 rounded-xl font-bold text-lg"
          >
            Começar agora
          </Link>

          <Link
            href="/freelancers"
            className="border border-white/20 px-8 py-4 rounded-xl font-bold text-lg"
          >
            Ver freelancers
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          🚀 Sem taxas ocultas • 💬 Chat direto • ⭐ Ranking por reputação
        </p>
      </section>

      {/* PROVA SOCIAL */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold">
            Empresas e profissionais já estão usando
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 border border-white/10 rounded-xl">
              <p className="text-slate-300">
                “Encontrei um dev em 24h e já estamos no terceiro projeto juntos.”
              </p>
              <p className="mt-4 font-bold">— Lucas, Startup SaaS</p>
            </div>

            <div className="p-6 border border-white/10 rounded-xl">
              <p className="text-slate-300">
                “Recebi 5 propostas no primeiro dia. Plataforma absurda.”
              </p>
              <p className="mt-4 font-bold">— Mariana, E-commerce</p>
            </div>

            <div className="p-6 border border-white/10 rounded-xl">
              <p className="text-slate-300">
                “Hoje vivo 100% de freelas aqui dentro.”
              </p>
              <p className="mt-4 font-bold">— Rafael, Freelancer</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center">
            Por que usar a FreelaBrasil?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-white/10 rounded-xl">
              <h3 className="text-xl font-bold">Ranking inteligente</h3>
              <p className="text-slate-400 mt-3">
                Freelancers são ranqueados por reputação, entrega e desempenho.
              </p>
            </div>

            <div className="p-6 border border-white/10 rounded-xl">
              <h3 className="text-xl font-bold">Convites diretos</h3>
              <p className="text-slate-400 mt-3">
                Contratantes podem chamar freelancers sem esperar proposta.
              </p>
            </div>

            <div className="p-6 border border-white/10 rounded-xl">
              <h3 className="text-xl font-bold">Chat integrado</h3>
              <p className="text-slate-400 mt-3">
                Negocie tudo dentro da plataforma, sem sair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-black">
            Planos para crescer mais rápido
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-white/10 rounded-xl">
              <h3 className="text-xl font-bold">Gratuito</h3>
              <p className="mt-2 text-slate-400">Comece sem pagar nada</p>
              <p className="text-3xl font-black mt-4">R$ 0</p>
            </div>

            <div className="p-6 border border-emerald-400 rounded-xl">
              <h3 className="text-xl font-bold">Plus</h3>
              <p className="mt-2 text-slate-400">Mais visibilidade</p>
              <p className="text-3xl font-black mt-4">R$ 19,99</p>
            </div>

            <div className="p-6 border border-purple-500 rounded-xl">
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="mt-2 text-slate-400">Máximo destaque</p>
              <p className="text-3xl font-black mt-4">R$ 29,99</p>
            </div>
          </div>

          <Link
            href="/planos"
            className="inline-block mt-10 bg-white text-black px-8 py-4 rounded-xl font-bold"
          >
            Ver todos os planos
          </Link>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-4xl font-black">
          Pronto para começar?
        </h2>

        <p className="text-slate-400 mt-4">
          Crie sua conta e comece a gerar renda ou contratar hoje.
        </p>

        <Link
          href="/cadastro"
          className="mt-8 inline-block bg-emerald-400 text-black px-10 py-5 rounded-xl font-bold text-lg"
        >
          Criar conta grátis
        </Link>
      </section>
    </main>
  );
}