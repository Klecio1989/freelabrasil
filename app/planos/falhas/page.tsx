import Link from "next/link";

export default function FalhasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-10 text-center max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6">Pagamento não concluído</h1>

        <p className="text-slate-300 mb-8">
          O pagamento falhou ou foi cancelado.
        </p>

        <Link
          href="/planos"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg font-bold"
        >
          Voltar para planos
        </Link>
      </div>
    </main>
  );
}