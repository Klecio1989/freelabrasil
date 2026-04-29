"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PlanosPage() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("freelabrasil_usuario");
    if (user) setUsuario(JSON.parse(user));
  }, []);

  async function contratarPlano(plano: "plus" | "pro") {
    if (!usuario?.id) {
      alert("Faça login.");
      return;
    }

    const valor = plano === "plus" ? 19.99 : 29.99;

    const { data, error } = await supabase
      .from("pagamentos")
      .insert([
        {
          usuario_id: usuario.id,
          plano,
          valor,
          status: "pendente",
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      alert("Erro ao iniciar pagamento");
      return;
    }

    window.location.href = `/pagamento?plano=${plano}&id=${data.id}`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="max-w-4xl w-full p-10 text-center">

        <h1 className="text-5xl font-black mb-10">
          Escolha seu plano
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          {/* PLUS */}
          <div className="bg-white/5 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">Plano Plus</h2>
            <p className="mt-2 text-slate-400">R$ 19,99 / mês</p>

            <button
              onClick={() => contratarPlano("plus")}
              className="mt-6 bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold w-full"
            >
              Contratar Plus
            </button>
          </div>

          {/* PRO */}
          <div className="bg-white/5 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">Plano Pro</h2>
            <p className="mt-2 text-slate-400">R$ 29,99 / mês</p>

            <button
              onClick={() => contratarPlano("pro")}
              className="mt-6 bg-purple-500 text-white px-6 py-3 rounded-xl font-bold w-full"
            >
              Contratar Pro
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}