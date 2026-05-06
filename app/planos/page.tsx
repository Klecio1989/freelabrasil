"use client";

import { useEffect, useState } from "react";

type Duracao = "mensal" | "trimestral" | "anual";
type PlanoPago = "plus" | "pro";

export default function PlanosPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [duracao, setDuracao] = useState<Duracao>("mensal");
  const [carregando, setCarregando] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (user) {
      setUsuario(JSON.parse(user));
    }
  }, []);

  const precos = {
    plus: {
      mensal: 19.99,
      trimestral: 54.9,
      anual: 199,
    },

    pro: {
      mensal: 29.99,
      trimestral: 84.9,
      anual: 299,
    },
  };

  function formatarPreco(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function textoDuracao() {
    if (duracao === "mensal") return "1 mês de acesso";
    if (duracao === "trimestral") return "3 meses de acesso";

    return "12 meses de acesso";
  }

  async function contratarPlano(plano: PlanoPago) {
    if (!usuario?.id) {
      alert("Faça login.");
      return;
    }

    try {
      setCarregando(plano);

      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          plano,
          duracao,
          usuario_id: usuario.id,
        }),
      });

      const data = await res.json();

      if (!data.init_point && !data.sandbox_init_point) {
        console.log("ERRO MP:", data);
        alert(data.error || "Erro ao gerar pagamento");
        return;
      }

      window.location.href =
        data.sandbox_init_point || data.init_point;
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com pagamento.");
    } finally {
      setCarregando("");
    }
  }

  function PlanoCard({
    titulo,
    plano,
    preco,
    beneficios,
    destaque,
    cor,
    recomendado,
  }: {
    titulo: string;
    plano: "gratuito" | PlanoPago;
    preco: string;
    beneficios: string[];
    destaque?: string;
    cor: string;
    recomendado?: boolean;
  }) {
    const ativo = (usuario?.plano || "gratuito") === plano;

    return (
      <div
        className={`relative rounded-[2rem] border p-8 transition hover:scale-[1.02] ${cor}`}
      >
        {recomendado && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-5 py-2 text-xs font-black text-slate-950 shadow-lg">
            MAIS ESCOLHIDO
          </div>
        )}

        {destaque && (
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">
            {destaque}
          </span>
        )}

        <h2 className="mt-5 text-3xl font-black">
          {titulo}
        </h2>

        <p className="mt-5 text-5xl font-black">
          {preco}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          {plano === "gratuito"
            ? "Plano inicial"
            : textoDuracao()}
        </p>

        {duracao === "anual" && plano !== "gratuito" && (
          <p className="mt-4 rounded-full bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
            🔥 Melhor custo-benefício
          </p>
        )}

        <div className="mt-8 space-y-3">
          {beneficios.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            >
              ✔ {item}
            </div>
          ))}
        </div>

        {plano === "gratuito" ? (
          <button
            disabled
            className="mt-8 w-full rounded-xl bg-slate-700 px-6 py-3 font-bold text-white"
          >
            {ativo ? "Plano atual" : "Plano gratuito"}
          </button>
        ) : (
          <button
            onClick={() => contratarPlano(plano)}
            disabled={carregando === plano}
            className="mt-8 w-full rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {carregando === plano
              ? "Gerando pagamento..."
              : `Contratar ${titulo}`}
          </button>
        )}

        {ativo && plano !== "gratuito" && (
          <p className="mt-4 text-center text-sm font-bold text-emerald-300">
            Plano atual
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="text-center">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Planos FreelaBrasil
          </span>

          <h1 className="mt-5 text-5xl font-black">
            Escolha seu plano
          </h1>

          <p className="mt-5 text-lg text-slate-300">
            Tenha mais visibilidade, envie mais propostas
            e aumente suas chances de fechar projetos.
          </p>
        </div>

        {/* duração */}
        <div className="mx-auto mt-10 flex max-w-xl justify-center rounded-2xl border border-white/10 bg-white/5 p-2">

          <button
            onClick={() => setDuracao("mensal")}
            className={`flex-1 rounded-xl px-4 py-3 font-bold transition ${
              duracao === "mensal"
                ? "bg-emerald-400 text-slate-950"
                : "text-white"
            }`}
          >
            1 mês
          </button>

          <button
            onClick={() => setDuracao("trimestral")}
            className={`flex-1 rounded-xl px-4 py-3 font-bold transition ${
              duracao === "trimestral"
                ? "bg-emerald-400 text-slate-950"
                : "text-white"
            }`}
          >
            3 meses
          </button>

          <button
            onClick={() => setDuracao("anual")}
            className={`flex-1 rounded-xl px-4 py-3 font-bold transition ${
              duracao === "anual"
                ? "bg-emerald-400 text-slate-950"
                : "text-white"
            }`}
          >
            1 ano
          </button>
        </div>

        {/* cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">

          {/* gratuito */}
          <PlanoCard
            titulo="Gratuito"
            plano="gratuito"
            preco="R$ 0"
            cor="border-white/10 bg-white/5"
            beneficios={[
              "Criar perfil profissional",
              "Até 2 projetos no portfólio",
              "Enviar até 2 propostas",
              "Receber mensagens",
              "Acesso básico à plataforma",
            ]}
          />

          {/* plus */}
          <PlanoCard
            titulo="Plus"
            plano="plus"
            preco={formatarPreco(precos.plus[duracao])}
            destaque="PROFISSIONAL"
            recomendado
            cor="border-emerald-400/40 bg-emerald-400/5"
            beneficios={[
              "Até 5 projetos no portfólio",
              "Até 10 propostas por dia",
              "Mais destaque nas buscas",
              "Receber convites de clientes",
              "Melhor posição no ranking",
              "Maior taxa de conversão",
            ]}
          />

          {/* pro */}
          <PlanoCard
            titulo="Pro"
            plano="pro"
            preco={formatarPreco(precos.pro[duracao])}
            destaque="MÁXIMO DESTAQUE"
            cor="border-purple-500/40 bg-purple-500/5"
            beneficios={[
              "Até 10 projetos no portfólio",
              "Propostas ilimitadas",
              "Prioridade máxima no ranking",
              "Prioridade no match com IA",
              "Perfil premium",
              "Muito mais visibilidade",
              "Maior chance de fechamento",
            ]}
          />
        </div>

        {/* bloco final */}
        <div className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-3xl font-black">
            Quanto mais visibilidade, mais projetos.
          </h2>

          <p className="mt-4 text-slate-300 max-w-3xl mx-auto leading-8">
            Freelancers com planos Plus e Pro possuem mais destaque
            na plataforma, aparecem melhor posicionados nas buscas,
            recebem mais convites e aumentam significativamente suas
            chances de fechamento.
          </p>
        </div>

      </div>
    </main>
  );
}