import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Acesse sua conta</p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            Voltar para home
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-20">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="text-3xl font-black">Entrar</h2>
          <p className="mt-3 text-slate-300">
            Acesse sua conta para acompanhar projetos, propostas e mensagens.
          </p>

          <div className="mt-8 grid gap-4">
            <input
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="Seu e-mail"
              type="email"
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="Sua senha"
              type="password"
            />

            <button className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:scale-[1.01]">
              Entrar
            </button>

            <button className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5">
              Entrar com Google
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/cadastro" className="hover:text-white">
              Ainda não tenho conta
            </Link>
            <Link href="#" className="hover:text-white">
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}