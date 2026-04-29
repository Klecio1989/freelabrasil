"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

function PagamentoClient() {
  const params = useSearchParams();

  const plano = params.get("plano");
  const id = params.get("id");

  async function confirmarPagamento() {
    if (!id || !plano) {
      alert("Dados do pagamento inválidos.");
      return;
    }

    const { data: pagamento, error: erroPagamento } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("id", id)
      .single();

    if (erroPagamento || !pagamento) {
      alert("Pagamento não encontrado.");
      return;
    }

    const { error: erroUpdatePagamento } = await supabase
      .from("pagamentos")
      .update({ status: "pago" })
      .eq("id", id);

    if (erroUpdatePagamento) {
      alert(erroUpdatePagamento.message);
      return;
    }

    const { data: usuarioAtualizado, error: erroUsuario } = await supabase
      .from("usuarios")
      .update({ plano })
      .eq("id", pagamento.usuario_id)
      .select()
      .single();

    if (erroUsuario) {
      alert(erroUsuario.message);
      return;
    }

    localStorage.setItem(
      "freelabrasil_usuario",
      JSON.stringify(usuarioAtualizado)
    );

    alert("Pagamento aprovado e plano ativado!");
    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl">
        <h1 className="text-4xl font-black">Pagamento</h1>

        <p className="mt-4 text-slate-300">
          Plano selecionado:
        </p>

        <p className="mt-2 text-3xl font-black uppercase text-emerald-400">
          {plano || "-"}
        </p>

        <p className="mt-6 text-sm text-slate-400">
          Esta é uma etapa temporária de validação. Depois entraremos com Mercado Pago real.
        </p>

        <button
          onClick={confirmarPagamento}
          className="mt-8 w-full rounded-xl bg-emerald-400 px-6 py-4 font-bold text-slate-950"
        >
          Simular pagamento aprovado
        </button>
      </div>
    </main>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          Carregando pagamento...
        </main>
      }
    >
      <PagamentoClient />
    </Suspense>
  );
}