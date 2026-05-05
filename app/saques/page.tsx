"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SaquesPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [saldo, setSaldo] = useState(0);
  const [valor, setValor] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [saques, setSaques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  function valorParaNumero(valor: string) {
    return Number(valor.replace(",", "."));
  }

  async function carregarDados() {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (!user) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(user);
    setUsuario(parsed);

    const { data: pagamentos } = await supabase
      .from("pagamentos")
      .select("valor_freelancer")
      .eq("freela_id", parsed.id)
      .eq("status", "liberado");

    const totalRecebido =
      pagamentos?.reduce(
        (acc: number, p: any) => acc + Number(p.valor_freelancer || 0),
        0
      ) || 0;

    const { data: saquesData } = await supabase
      .from("saques")
      .select("valor,status")
      .eq("freela_id", parsed.id);

    const totalSacado =
      saquesData?.reduce((acc: number, s: any) => {
        if (s.status === "pendente" || s.status === "pago") {
          return acc + Number(s.valor || 0);
        }
        return acc;
      }, 0) || 0;

    setSaldo(Math.max(totalRecebido - totalSacado, 0));

    const { data: historico } = await supabase
      .from("saques")
      .select("*")
      .eq("freela_id", parsed.id)
      .order("created_at", { ascending: false });

    setSaques(historico || []);
    setLoading(false);
  }

  async function solicitarSaque() {
    const valorNumero = valorParaNumero(valor);

    if (!valorNumero || valorNumero <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    if (valorNumero > saldo) {
      alert("Saldo insuficiente.");
      return;
    }

    if (!chavePix.trim()) {
      alert("Informe sua chave PIX.");
      return;
    }

    const confirmar = confirm(
      `Confirma saque de R$ ${valorNumero.toFixed(2)} para a chave PIX ${chavePix}?`
    );

    if (!confirmar) return;

    const { error } = await supabase.from("saques").insert([
      {
        freela_id: usuario.id,
        valor: valorNumero,
        chave_pix: chavePix.trim(),
        status: "pendente",
      },
    ]);

    if (error) {
      console.error(error);
      alert("Erro ao solicitar saque.");
      return;
    }

    alert("Saque solicitado com sucesso!");
    setValor("");
    setChavePix("");
    carregarDados();
  }

  function statusCor(status: string) {
    if (status === "pendente")
      return "text-yellow-300 bg-yellow-400/10 border-yellow-400/20";
    if (status === "pago")
      return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
    return "text-red-300 bg-red-400/10 border-red-400/20";
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-10 text-white">Carregando...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black">Saques</h1>
            <p className="text-slate-400 mt-2">
              Solicite saque dos valores liberados.
            </p>
          </div>

          <Link href="/painel-freelancer" className="border px-4 py-2 rounded-xl">
            Voltar
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6">
          <p className="text-slate-400">Saldo disponível</p>
          <h2 className="text-3xl font-black text-emerald-300">
            R$ {saldo.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-10">
          <h3 className="text-xl font-bold mb-4">Solicitar saque</h3>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <input
              placeholder="Digite o valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="bg-slate-900 border border-white/10 px-4 py-3 rounded-xl"
            />

            <input
              placeholder="Chave PIX"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              className="bg-slate-900 border border-white/10 px-4 py-3 rounded-xl"
            />

            <button
              onClick={solicitarSaque}
              className="bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold"
            >
              Solicitar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {saques.length === 0 && (
            <p className="text-slate-400">Nenhum saque solicitado.</p>
          )}

          {saques.map((s) => (
            <div
              key={s.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between gap-4"
            >
              <div>
                <p className="font-bold">R$ {Number(s.valor).toFixed(2)}</p>
                <p className="text-sm text-slate-400">PIX: {s.chave_pix || "-"}</p>
                <p className="text-sm text-slate-500">
                  {new Date(s.created_at).toLocaleString("pt-BR")}
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-sm border h-fit ${statusCor(s.status)}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}