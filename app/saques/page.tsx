"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SaquesPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [saques, setSaques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(false);

  const [valorSaque, setValorSaque] = useState("");
  const [chavePix, setChavePix] = useState("");

  const [saldo, setSaldo] = useState({
    liberado: 0,
    solicitado: 0,
    disponivel: 0,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);

    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    const { data: pagamentosData } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("freela_id", parsed.id)
      .eq("status", "liberado")
      .order("created_at", { ascending: false });

    const { data: saquesData } = await supabase
      .from("saques")
      .select("*")
      .eq("freela_id", parsed.id)
      .order("created_at", { ascending: false });

    const listaPagamentos = pagamentosData || [];
    const listaSaques = saquesData || [];

    setPagamentos(listaPagamentos);
    setSaques(listaSaques);

    calcularSaldo(listaPagamentos, listaSaques);

    setLoading(false);
  }

  function calcularSaldo(listaPagamentos: any[], listaSaques: any[]) {
    const totalLiberado = listaPagamentos.reduce(
      (acc, item) => acc + Number(item.valor_freelancer || 0),
      0
    );

    const totalSolicitado = listaSaques
      .filter((s) => s.status === "solicitado" || s.status === "pago")
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    setSaldo({
      liberado: totalLiberado,
      solicitado: totalSolicitado,
      disponivel: totalLiberado - totalSolicitado,
    });
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function valorParaNumero(valor: string) {
    if (!valor) return 0;

    const limpo = valor
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    const numero = Number(limpo);

    return isNaN(numero) ? 0 : numero;
  }

  async function solicitarSaque() {
    if (!usuario) return;

    const valor = valorParaNumero(valorSaque);

    if (valor <= 0) {
      alert("Informe um valor válido para saque.");
      return;
    }

    if (valor > saldo.disponivel) {
      alert("Valor maior que o saldo disponível.");
      return;
    }

    if (!chavePix.trim()) {
      alert("Informe sua chave PIX.");
      return;
    }

    const confirmar = confirm(
      `Confirma a solicitação de saque no valor de ${formatar(valor)}?`
    );

    if (!confirmar) return;

    try {
      setSolicitando(true);

      const { error } = await supabase.from("saques").insert([
        {
          freela_id: usuario.id,
          valor,
          chave_pix: chavePix.trim(),
          status: "solicitado",
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao solicitar saque.");
        return;
      }

      alert("Saque solicitado com sucesso!");

      setValorSaque("");
      setChavePix("");

      await carregar();
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao solicitar saque.");
    } finally {
      setSolicitando(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando...
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Você precisa estar logado.
      </main>
    );
  }

  if (usuario.tipo_usuario !== "freelancer") {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Esta área é exclusiva para freelancers.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Meus Saques</h1>
            <p className="mt-3 text-slate-400">
              Solicite o saque dos valores liberados após conclusão e avaliação dos projetos.
            </p>
          </div>

          <Link
            href="/painel-freelancer"
            className="rounded-xl border border-white/20 px-5 py-3 font-bold"
          >
            Voltar
          </Link>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <Card titulo="Total liberado" valor={formatar(saldo.liberado)} />
          <Card titulo="Saques solicitados/pagos" valor={formatar(saldo.solicitado)} />
          <Card titulo="Saldo disponível" valor={formatar(saldo.disponivel)} destaque />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-2xl font-black">Solicitar saque</h2>

            <p className="mt-2 text-sm text-slate-400">
              O valor solicitado será analisado e pago manualmente via PIX.
            </p>

            <div className="mt-6 space-y-4">
              <input
                value={valorSaque}
                onChange={(e) => setValorSaque(e.target.value)}
                placeholder="Valor do saque. Ex: 100,00"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none placeholder:text-slate-500"
              />

              <input
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="Chave PIX"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none placeholder:text-slate-500"
              />

              <button
                onClick={solicitarSaque}
                disabled={solicitando || saldo.disponivel <= 0}
                className="w-full rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950 disabled:opacity-50"
              >
                {solicitando ? "Solicitando..." : "Solicitar saque"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-2xl font-black">Histórico de saques</h2>

            {saques.length === 0 && (
              <p className="mt-4 text-slate-400">
                Nenhum saque solicitado ainda.
              </p>
            )}

            <div className="mt-6 grid gap-4">
              {saques.map((saque) => (
                <div
                  key={saque.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Valor</p>
                      <p className="text-xl font-black">
                        {formatar(Number(saque.valor || 0))}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">PIX</p>
                      <p className="break-all font-bold">{saque.chave_pix}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <p
                        className={`font-bold ${
                          saque.status === "pago"
                            ? "text-emerald-300"
                            : "text-yellow-300"
                        }`}
                      >
                        {saque.status === "pago" ? "Pago" : "Solicitado"}
                      </p>
                    </div>
                  </div>

                  {saque.created_at && (
                    <p className="mt-4 text-xs text-slate-500">
                      Solicitado em{" "}
                      {new Date(saque.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-black">Pagamentos liberados</h2>

          {pagamentos.length === 0 && (
            <p className="mt-4 text-slate-400">
              Nenhum pagamento liberado ainda.
            </p>
          )}

          <div className="mt-6 grid gap-4">
            {pagamentos.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <Info titulo="Projeto" valor={p.projeto_id || "-"} />
                  <Info
                    titulo="Valor líquido"
                    valor={formatar(Number(p.valor_freelancer || 0))}
                  />
                  <Info
                    titulo="Comissão plataforma"
                    valor={formatar(Number(p.comissao_plataforma || 0))}
                  />
                  <Info titulo="Status" valor="Liberado" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque
          ? "border-emerald-400/30 bg-emerald-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-2xl font-black">{valor}</p>
    </div>
  );
}

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-1 break-all font-bold text-white">{valor}</p>
    </div>
  );
}