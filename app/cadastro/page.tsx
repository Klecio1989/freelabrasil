"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("freelancer");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    if (!nome || !email || !senha || !tipoUsuario) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.from("usuarios").insert([
        {
          nome,
          email,
          senha,
          tipo_usuario: tipoUsuario,
          plano: "gratuito",
        },
      ]);

      if (error) {
        alert("Erro ao cadastrar usuário.");
        return;
      }

      alert("Cadastro realizado com sucesso.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
        <div>
          <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            Crie sua conta
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight">
            Entre para a FreelaBrasil e comece a gerar oportunidades.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Cadastre-se como freelancer ou contratante, personalize seu perfil e acesse todos os recursos da plataforma.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Conta freelancer</div>
              <div className="mt-2 text-xl font-black">Envie propostas</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Conta contratante</div>
              <div className="mt-2 text-xl font-black">Publique projetos</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-slate-400">Plataforma</div>
              <div className="mt-2 text-xl font-black">Planos e crescimento</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <h2 className="text-3xl font-black">Cadastro</h2>
          <p className="mt-2 text-slate-400">
            Preencha seus dados para criar sua conta.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Nome
              </label>
              <input
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

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
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Tipo de conta
              </label>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value="freelancer">Freelancer</option>
                <option value="contratante">Contratante</option>
              </select>
            </div>

            <button
              onClick={cadastrar}
              disabled={carregando}
              className="w-full rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02] disabled:opacity-60"
            >
              {carregando ? "Cadastrando..." : "Criar conta"}
            </button>

            <p className="text-center text-sm text-slate-400">
              Já tem conta?{" "}
              <Link href="/login" className="font-semibold text-emerald-300">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}