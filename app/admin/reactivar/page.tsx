"use client";

import Link from "next/link";

export default function ReativarPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-black">Admin - Reativar usuários</h1>

        <p className="mt-4 text-slate-300">
          Esta tela será configurada depois para reativar contas bloqueadas ou desativadas.
        </p>

        <Link
          href="/admin"
          className="mt-6 inline-block rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
        >
          Voltar ao Admin
        </Link>
      </div>
    </main>
  );
}