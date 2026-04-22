import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-black text-white">FreelaBrasil</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Marketplace para conectar freelancers e contratantes com projetos reais.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-300">
            Navegação
          </h4>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/projetos" className="text-slate-400 hover:text-white">
              Projetos
            </Link>
            <Link href="/freelancers" className="text-slate-400 hover:text-white">
              Freelancers
            </Link>
            <Link href="/planos" className="text-slate-400 hover:text-white">
              Planos
            </Link>
            <Link href="/cadastro" className="text-slate-400 hover:text-white">
              Criar conta
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-300">
            Plataforma
          </h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
            <span>Propostas e convites</span>
            <span>Perfis públicos</span>
            <span>Avaliações e ranking</span>
            <span>Dashboard e notificações</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 text-center text-xs text-slate-500">
          © 2026 FreelaBrasil. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}