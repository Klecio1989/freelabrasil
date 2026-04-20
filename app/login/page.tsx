"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function entrar() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .eq("senha", senha)
      .single();

    if (error || !data) {
      alert("Usuário ou senha inválidos");
      return;
    }

    localStorage.setItem("freelabrasil_usuario", JSON.stringify(data));

    alert("Login realizado com sucesso!");

    if (data.tipo_usuario === "freelancer") {
      router.push("/projetos");
    } else {
      router.push("/painel-contratante");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="bg-slate-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <div className="grid gap-4">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-slate-800"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="p-3 rounded bg-slate-800"
          />

          <button
            onClick={entrar}
            className="bg-emerald-400 text-black p-3 rounded font-bold"
          >
            Entrar
          </button>
        </div>
      </div>
    </main>
  );
}