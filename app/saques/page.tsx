"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SaquesPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [saques, setSaques] = useState<any[]>([]);
  const [valor, setValor] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [tipoPix, setTipoPix] = useState("cpf");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const userLocal = localStorage.getItem("freelabrasil_usuario");

    if (!userLocal) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(userLocal);
    setUsuario(user);

    const { data } = await supabase
      .from("saques")
      .select("*")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });

    setSaques(data || []);
    setLoading(false);
  }

  async function solicitarSaque() {
    if (!usuario?.id) {
      alert("Você precisa estar logado.");
      return;
    }

    const valorNumerico = Number(valor.replace(",", "."));

    if (!valorNumerico || valorNumerico <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (!chavePix.trim()) {
      alert("Informe sua chave PIX.");
      return;
    }

    setEnviando(true);

    const { error } = await supabase.from("saques").insert({
      usuario_id: usuario.id,
      valor: valorNumerico,
      chave_pix: chavePix.trim(),
      tipo_pix: tipoPix,
      status: "pendente",
    });

    setEnviando(false);

    if (error) {
      console.error(error);
      alert("Erro ao solicitar saque.");
      return;
    }

    alert("Solicitação de saque enviada.");
    setValor("");
    setChavePix("");
    setTipoPix("cpf");
    carregar();
  }

  function statusCor(status: string) {
    if (status === "aprovado") return "text-emerald-300";
    if (status === "reprovado") return "text-red-300";
    return "text-yellow-300";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando saques...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-black">Saques</h1>

        <p className="mt-4 text-slate-300">
          Solicite o recebimento dos seus ganhos via PIX.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-3xl font-black">Solicitar saque</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Valor do saque"
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
            />

            <select
              value={tipoPix}
              onChange={(e) => setTipoPix(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
            >
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Chave aleatória</option>
            </select>

            <input
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              placeholder="Chave PIX"
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={solicitarSaque}
            disabled={enviando}
            className="mt-6 rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Solicitar saque"}
          </button>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-3xl font-black">Histórico de saques</h2>

          {saques.length === 0 && (
            <p className="mt-5 text-slate-400">
              Nenhuma solicitação de saque encontrada.
            </p>
          )}

          <div className="mt-6 grid gap-4">
            {saques.map((saque) => (
              <div
                key={saque.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black">
                      {Number(saque.valor || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      PIX: {saque.tipo_pix} — {saque.chave_pix}
                    </p>

                    {saque.observacao && (
                      <p className="mt-2 text-sm text-slate-400">
                        Obs: {saque.observacao}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className={`font-black ${statusCor(saque.status)}`}>
                      {saque.status?.toUpperCase()}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {saque.created_at
                        ? new Date(saque.created_at).toLocaleString("pt-BR")
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}