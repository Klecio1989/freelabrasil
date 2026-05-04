import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      
      {/* HERO COM LOGO */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">

        {/* LOGO */}
        <div className="flex justify-center">
          <img
            src="/logo-freellabrasil.png"
            alt="FreellaBrasil"
            className="h-24 md:h-28"
          />
        </div>

        <p className="mt-4 text-lg text-slate-400">
          Conecta talentos, realiza projetos.
        </p>

        <h1 className="mt-8 text-5xl font-black leading-tight md:text-6xl">
          Contrate ou trabalhe como freelancer de forma simples e segura.
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
          O FreellaBrasil conecta empresas e profissionais para projetos em
          Excel, Power BI, automação, dados e tecnologia.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
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
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-t border-white/10 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-center text-4xl font-black">Como funciona</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <Card numero="1" titulo="Cadastre-se" texto="Escolha ser freelancer ou contratante." />
            <Card numero="2" titulo="Conecte-se" texto="Envie propostas ou publique projetos." />
            <Card numero="3" titulo="Execute" texto="Trabalhe com segurança dentro da plataforma." />
            <Card numero="4" titulo="Finalize" texto="Avalie e libere o pagamento." />
          </div>
        </div>
      </section>

    </main>
  );
}

function Card({ numero, titulo, texto }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-xl font-black text-slate-950">
        {numero}
      </div>

      <h3 className="mt-5 text-xl font-black">{titulo}</h3>
      <p className="mt-3 text-slate-400">{texto}</p>
    </div>
  );
}