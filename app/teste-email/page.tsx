"use client";

import { useState } from "react";

export default function TesteEmailPage() {
  const [resultado, setResultado] = useState("");

  async function enviar() {
    try {
      setResultado("Enviando...");

      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          para: "klecior.brito@hotmail.com",
          assunto: "Teste FreellaBrasil",
          titulo: "Email funcionando 🚀",
          mensagem:
            "Seu sistema de emails automáticos do FreellaBrasil está funcionando com sucesso.",
          botaoTexto: "Abrir plataforma",
          botaoLink: "https://www.freellabrasil.com.br",
        }),
      });

      const data = await response.json();

      setResultado(JSON.stringify(data, null, 2));

      if (data.success) {
        alert("Email enviado com sucesso.");
      } else {
        alert(data.error || "Erro ao enviar email.");
      }
    } catch (error: any) {
      setResultado(error?.message || "Erro inesperado.");
      alert("Erro inesperado.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-3xl font-black">Teste de Email</h1>

        <button
          onClick={enviar}
          className="mt-8 rounded-2xl bg-emerald-400 px-8 py-4 font-black text-black"
        >
          Testar email
        </button>

        {resultado && (
          <pre className="mt-8 max-h-[400px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-900 p-5 text-left text-sm text-slate-300">
            {resultado}
          </pre>
        )}
      </div>
    </main>
  );
}