"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      alert("Preencha email e senha.");
      return;
    }

    try {
      setCarregando(true);

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .eq("senha", senha)
        .single();

      if (error || !data) {
        alert("Usuário ou senha inválidos.");
        return;
      }

      if (data.tipo_usuario === "freelancer") {
        router.push("/painel-freelancer");
      } else if (data.tipo_usuario === "contratante") {
        router.push("/painel-contratante");
      } else {
        alert("Tipo de usuário não identificado.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Erro ao fazer login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Acesse sua conta</p>
          </div>

          <a
            href="/"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            Voltar para home
          </a>
        </div>
      </header>

      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-20">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="text-3xl font-black">Entrar</h2>
          <p className="mt-3 text-slate-300">
            Entre com seu email e senha para acessar sua área.
          </p>

          <div className="mt-8 grid gap-4">
            <input
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="Seu e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="Sua senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <button
              onClick={entrar}
              disabled={carregando}
              className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-2 text-sm text-slate-400">
            <a href="/cadastro" className="hover:text-white">
              Ainda não tenho conta
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}