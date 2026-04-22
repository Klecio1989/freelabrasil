import Link from "next/link";

export default function FreelancerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Perfil de freelancer</h1>
        <p className="text-slate-400 mb-6">
          Selecione um freelancer a partir da listagem pública.
        </p>

        <Link
          href="/freelancers"
          className="inline-block bg-emerald-400 text-black px-6 py-3 rounded-lg font-bold"
        >
          Ver freelancers
        </Link>
      </div>
    </main>
  );
}