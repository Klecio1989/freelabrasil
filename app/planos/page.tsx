"use client";

import { useEffect, useState } from "react";

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

    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plano,
          usuario_id: usuario.id,
        }),
      });

      const data = await res.json();

      if (!data.init_point && !data.sandbox_init_point) {
        console.log("ERRO MP:", data);
        alert(data.error || "Erro ao gerar pagamento");
        return;
      }

      window.location.href = data.sandbox_init_point || data.init_point;
    } catch (err) {
      console.log(err);
      alert("Erro ao conectar pagamento");
    }
  }

  function Card({
    titulo,
    preco,
    plano,
    beneficios,
  }: any) {
    const ativo = (usuario?.plano || "gratuito") === plano;

    return (
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h2 className="text-2xl font-bold">{titulo}</h2>
        <p className="text-3xl font-black mt-2">{preco}</p>

        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {beneficios.map((b: string) => (
            <li key={b}>✔ {b}</li>
          ))}
        </ul>

        {plano === "gratuito" ? (
          <button
            disabled
            className="mt-6 w-full bg-slate-700 py-3 rounded-xl font-bold"
          >
            Plano atual
          </button>
        ) : (
          <button
            onClick={() => contratarPlano(plano)}
            disabled={ativo}
            className={`mt-6 w-full py-3 rounded-xl font-bold ${
              ativo
                ? "bg-slate-700"
                : "bg-emerald-400 text-black"
            }`}
          >
            {ativo ? "Plano atual" : "Contratar"}
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-6xl w-full text-center">

        <h1 className="text-5xl font-black mb-10">
          Escolha seu plano
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          <Card
            titulo="Gratuito"
            preco="R$ 0"
            plano="gratuito"
            beneficios={[
              "Perfil profissional",
              "Até 2 propostas",
              "Portfólio básico",
              "Receber mensagens",
            ]}
          />

          <Card
            titulo="Plus"
            preco="R$ 19,99"
            plano="plus"
            beneficios={[
              "Até 10 propostas/dia",
              "Mais visibilidade",
              "Receber convites",
              "Ranking melhor",
            ]}
          />

          <Card
            titulo="Pro"
            preco="R$ 29,99"
            plano="pro"
            beneficios={[
              "Propostas ilimitadas",
              "Prioridade no ranking",
              "Máxima visibilidade",
              "Mais fechamento",
            ]}
          />

        </div>
      </div>
    </main>
  );
}