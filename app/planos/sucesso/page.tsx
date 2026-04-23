"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [mensagem, setMensagem] = useState("Confirmando pagamento...");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    async function ativar() {
      const params = new URLSearchParams(window.location.search);
      const paymentId = params.get("payment_id");

      if (!paymentId) {
        setMensagem("Pagamento não encontrado.");
        return;
      }

      try {
        const response = await fetch("/api/ativar-plano", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentId }),
        });

        const data = await response.json();

        if (!response.ok) {
          setMensagem(data.error || "Erro ao ativar plano.");
          return;
        }

        const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
        if (usuarioSalvo) {
          const usuario = JSON.parse(usuarioSalvo);
          usuario.plano = data.plano;
          localStorage.setItem("freelabrasil_usuario", JSON.stringify(usuario));
        }

        setOk(true);
        setMensagem(`Pagamento aprovado. Plano ${data.plano.toUpperCase()} ativado com sucesso.`);
      } catch (error) {
        console.error(error);
        setMensagem("Erro ao ativar plano.");
      }
    }

    ativar();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-10 text-center max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6">Pagamento aprovado</h1>

        <p className="text-slate-300 mb-8">{mensagem}</p>

        <div className="flex justify-center gap-4">
          <Link
            href="/painel-freelancer"
            className="inline-block bg-emerald-400 text-black px-6 py-3 rounded-lg font-bold"
          >
            Ir para meu painel
          </Link>

          {ok && (
            <Link
              href="/planos"
              className="inline-block border border-white/20 px-6 py-3 rounded-lg font-bold"
            >
              Ver planos
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}