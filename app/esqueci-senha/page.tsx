"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validarEmail(valor: string) {
    return /\S+@\S+\.\S+/.test(valor);
  }

  async function redefinirSenha() {
    if (!email || !novaSenha || !confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (!validarEmail(email)) {
      alert("Digite um email válido.");
      return;
    }

    if (novaSenha.length < 6) {
      alert("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("A confirmação da senha não confere.");
      return;
    }

    try {
      setCarregando(true);

      const emailNormalizado = email.trim().toLowerCase();

      const { data: usuario, error: buscaError } = await supabase
        .from("usuarios")
        .select("id,nome,email")
        .eq("email", emailNormalizado)
        .maybeSingle();

      if (buscaError || !usuario) {
        alert("Conta não encontrada.");
        return;
      }

      const { error } = await supabase
        .from("usuarios")
        .update({ senha: novaSenha })
        .eq("id", usuario.id);

      if (error) {
        alert("Erro ao redefinir senha.");
        return;
      }

      alert("Senha redefinida com sucesso.");
      setEmail("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error(error);
      alert("Erro ao redefinir senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">Esqueci minha senha</h1>
            <p className="mt-2 text-slate-400">
              Redefina manualmente sua senha pelo email cadastrado
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-2"
          >
            Voltar
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Nova senha
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme a nova senha"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              onClick={redefinirSenha}
              disabled={carregando}
              className="w-full rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-60"
            >
              {carregando ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}