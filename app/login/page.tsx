"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validarEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function entrar() {
    if (!email || !senha) {
      alert("Preencha email e senha.");
      return;
    }

    if (!validarEmail(email)) {
      alert("Digite um email válido.");
      return;
    }

    try {
      setCarregando(true);

      const emailNormalizado = email.trim().toLowerCase();

      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", emailNormalizado)
        .eq("senha", senha)
        .maybeSingle();

      if (error || !usuario) {
        alert("Usuário ou senha inválidos");
        return;
      }

      if (!usuario.ativo) {
        alert("Sua conta está desativada. Solicite reativação ao suporte.");
        return;
      }

      localStorage.setItem("freelabrasil_usuario", JSON.stringify(usuario));

      if (usuario.tipo_usuario === "freelancer") {
        router.push("/painel-freelancer");
      } else {
        router.push("/painel-contratante");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao fazer login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_480px] lg:items-center">
        <div>
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Acesse sua conta
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight">
            Entre na FreelaBrasil e continue seus negócios.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Acompanhe projetos, propostas, convites, favoritos, notificações e desempenho da sua conta em um só lugar.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Freelancers</div>
              <div className="mt-2 text-xl font-black">Propostas e convites</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Contratantes</div>
              <div className="mt-2 text-xl font-black">Projetos e favoritos</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Conta</div>
              <div className="mt-2 text-xl font-black">Perfil e planos</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <h2 className="text-3xl font-black">Login</h2>
          <p className="mt-2 text-slate-400">
            Entre com seu email e senha.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Email
              </label>
              <input
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={entrar}
              disabled={carregando}
              className="w-full rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02] disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>

            <div className="space-y-2 text-center text-sm text-slate-400">
              <p>
                Ainda não tem conta?{" "}
                <Link href="/cadastro" className="font-semibold text-emerald-300">
                  Criar conta
                </Link>
              </p>

              <p>
                Esqueceu sua senha?{" "}
                <Link
                  href="/esqueci-senha"
                  className="font-semibold text-yellow-300"
                >
                  Redefinir senha
                </Link>
              </p>

              <p>
                Conta desativada?{" "}
                <Link
                  href="/admin/reactivar"
                  className="font-semibold text-yellow-300"
                >
                  Reativar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}