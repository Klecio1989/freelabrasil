"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PlanosPage() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);
    }
  }, []);

  async function alterarPlano(plano: string) {
    if (!usuario) {
      alert("Você precisa estar logado.");
      return;
    }

    const { error } = await supabase
      .from("usuarios")
      .update({ plano })
      .eq("id", usuario.id);

    if (error) {
      alert("Erro ao alterar plano.");
      return;
    }

    const usuarioAtualizado = { ...usuario, plano };
    localStorage.setItem(
      "freelabrasil_usuario",
      JSON.stringify(usuarioAtualizado)
    );
    setUsuario(usuarioAtualizado);

    alert(`Plano alterado para ${plano}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Planos FreelaBrasil</h1>
            <p className="text-slate-400 mt-2">
              Escolha o plano ideal para crescer na plataforma
            </p>
          </div>

          <Link
            href="/projetos"
            className="border border-white/20 px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        {usuario && (
          <div className="mb-8 bg-slate-900 border border-white/10 rounded-xl p-5">
            <p>
              Usuário: <b>{usuario.nome}</b>
            </p>
            <p>
              Plano atual: <b>{usuario.plano || "gratuito"}</b>
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold">Gratuito</h2>
            <p className="text-4xl font-bold mt-4">R$ 0</p>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>• Criar perfil</li>
              <li>• Publicar portfólio</li>
              <li>• Mostrar 5 projetos</li>
              <li>• Enviar até 2 ofertas de freela</li>
              <li>• Depois disso, só recebe mensagens</li>
            </ul>

            <button
              onClick={() => alterarPlano("gratuito")}
              className="mt-8 w-full bg-white text-black py-3 rounded-lg font-bold"
            >
              Escolher Gratuito
            </button>
          </div>

          <div className="bg-slate-900 border border-emerald-400 rounded-2xl p-8">
            <div className="inline-block bg-emerald-400 text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
              MAIS POPULAR
            </div>

            <h2 className="text-2xl font-bold">Plus</h2>
            <p className="text-4xl font-bold mt-4">R$ 19,99</p>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>• Criar perfil completo</li>
              <li>• Publicar 10 projetos</li>
              <li>• Aparecer com mais destaque</li>
              <li>• Enviar 10 ofertas por dia</li>
              <li>• Receber mensagens de contratantes</li>
            </ul>

            <button
              onClick={() => alterarPlano("plus")}
              className="mt-8 w-full bg-emerald-400 text-black py-3 rounded-lg font-bold"
            >
              Escolher Plus
            </button>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold">Pro</h2>
            <p className="text-4xl font-bold mt-4">R$ 29,99</p>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>• Criar perfil completo</li>
              <li>• Publicar 30 projetos</li>
              <li>• Aparecer com mais destaque</li>
              <li>• Enviar ofertas ilimitadas</li>
              <li>• Receber mensagens de contratantes</li>
            </ul>

            <button
              onClick={() => alterarPlano("pro")}
              className="mt-8 w-full bg-purple-500 text-white py-3 rounded-lg font-bold"
            >
              Escolher Pro
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}