"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function ReativarContaPage() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function reativarConta() {
    if (!email) {
      alert("Digite o email da conta.");
      return;
    }

    try {
      setCarregando(true);

      const { data: usuario, error: buscaError } = await supabase
        .from("usuarios")
        .select("id,nome,email,ativo")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (buscaError || !usuario) {
        alert("Conta não encontrada.");
        return;
      }

      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: true })
        .eq("id", usuario.id);

      if (error) {
        alert("Erro ao reativar conta.");
        return;
      }

      alert(`Conta de ${usuario.nome} reativada com sucesso.`);
      setEmail("");
    } catch (error) {
      console.error(error);
      alert("Erro ao reativar conta.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">Reativar conta</h1>
            <p className="mt-2 text-slate-400">
              Área manual para suporte/admin
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-white/20 px-4 py-2"
          >
            Voltar
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Email da conta
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              onClick={reativarConta}
              disabled={carregando}
              className="w-full rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-60"
            >
              {carregando ? "Reativando..." : "Reativar conta"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}