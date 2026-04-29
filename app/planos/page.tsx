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

  function PlanoCard({
    titulo,
    preco,
    beneficios,
    cor,
    plano,
    destaque,
  }: any) {
    const ativo = (usuario?.plano || "gratuito") === plano;

    return (
      <div className={`rounded-2xl border p-6 ${cor}`}>
        {destaque && (
          <span className="text-xs bg-white text-black px-2 py-1 rounded-full font-bold">
            {destaque}
          </span>
        )}

        <h2 className="text-2xl font-bold mt-3">{titulo}</h2>

        <p className="text-4xl font-black mt-2">{preco}</p>

        <ul className="mt-6 space-y-2 text-sm text-slate-300">
          {beneficios.map((item: string) => (
            <li key={item}>✔ {item}</li>
          ))}
        </ul>

        {/* BOTÃO */}
        {plano === "gratuito" ? (
          <button
            disabled
            className="mt-6 w-full bg-slate-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            Plano atual
          </button>
        ) : (
          <button
            onClick={() => contratarPlano(plano)}
            disabled={ativo}
            className={`mt-6 w-full px-6 py-3 rounded-xl font-bold ${
              ativo
                ? "bg-slate-700 text-white"
                : "bg-emerald-400 text-black"
            }`}
          >
            {ativo ? "Plano atual" : `Contratar ${titulo}`}
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-black text-center">
          Escolha seu plano
        </h1>

        <p className="text-center mt-4 text-slate-400">
          Evolua seu perfil e ganhe mais oportunidades
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">

          {/* GRATUITO */}
          <PlanoCard
            titulo="Gratuito"
            preco="R$ 0"
            plano="gratuito"
            cor="border-white/10 bg-white/5"
            beneficios={[
              "Perfil profissional",
              "Até 2 propostas",
              "Portfólio básico",
              "Receber mensagens",
            ]}
          />

          {/* PLUS */}
          <PlanoCard
            titulo="Plus"
            preco="R$ 19,99"
            plano="plus"
            destaque="MAIS POPULAR"
            cor="border-emerald-400/40 bg-emerald-400/5"
            beneficios={[
              "Até 10 propostas por dia",
              "Mais visibilidade",
              "Receber convites",
              "Melhor ranking",
            ]}
          />

          {/* PRO */}
          <PlanoCard
            titulo="Pro"
            preco="R$ 29,99"
            plano="pro"
            destaque="DESTAQUE MÁXIMO"
            cor="border-purple-500/40 bg-purple-500/5"
            beneficios={[
              "Propostas ilimitadas",
              "Máxima visibilidade",
              "Prioridade no ranking",
              "Mais chances de fechamento",
            ]}
          />

        </div>
      </div>
    </main>
  );
}