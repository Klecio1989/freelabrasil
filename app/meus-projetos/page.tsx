"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AvaliacaoModal from "@/components/AvaliacaoModal";

export default function MeusProjetosPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [pagamentosMap, setPagamentosMap] = useState<Record<string, any>>({});
  const [avaliar, setAvaliar] = useState<any>(null);
  const [avaliacoesFeitas, setAvaliacoesFeitas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagandoId, setPagandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    await carregarProjetos(parsed.id);
    await carregarAvaliacoesFeitas(parsed.id);

    setLoading(false);
  }

  async function carregarProjetos(contratanteId: string) {
    const { data, error } = await supabase
      .from("projetos_andamento")
      .select(`
        id,
        status,
        data_inicio,
        data_finalizacao,
        projeto_id,
        freela_id,
        contratante_id,
        projetos (*)
      `)
      .eq("contratante_id", contratanteId)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar seus projetos.");
      return;
    }

    const lista = data || [];
    setProjetos(lista);

    const projetoIds = lista.map((p: any) => p.projeto_id).filter(Boolean);

    if (projetoIds.length > 0) {
      const { data: pagamentos } = await supabase
        .from("pagamentos")
        .select("*")
        .in("projeto_id", projetoIds);

      const mapa = Object.fromEntries(
        (pagamentos || []).map((p: any) => [p.projeto_id, p])
      );

      setPagamentosMap(mapa);
    } else {
      setPagamentosMap({});
    }
  }

  async function carregarAvaliacoesFeitas(userId: string) {
    const { data } = await supabase
      .from("avaliacoes")
      .select("projeto_andamento_id")
      .eq("avaliador_id", userId);

    if (data) {
      setAvaliacoesFeitas(data.map((item: any) => item.projeto_andamento_id));
    }
  }

  function valorProjeto(item: any) {
    const bruto = item.projetos?.orcamento || "0";
    const limpo = String(bruto)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    const numero = Number(limpo);
    return isNaN(numero) ? 0 : numero;
  }

  async function pagarProjeto(item: any) {
    try {
      setPagandoId(item.id);

      const valor = valorProjeto(item);

      if (valor <= 0) {
        alert("O projeto precisa ter um valor válido para pagamento.");
        return;
      }

      let pagamento = pagamentosMap[item.projeto_id];

      if (!pagamento) {
        const { data, error } = await supabase
          .from("pagamentos")
          .insert([
            {
              projeto_id: item.projeto_id,
              contratante_id: usuario.id,
              freela_id: item.freela_id,
              valor_bruto: valor,
              status: "aguardando_pagamento",
            },
          ])
          .select("*")
          .single();

        if (error || !data) {
          console.error(error);
          alert("Erro ao criar pagamento.");
          return;
        }

        pagamento = data;
      }

      const res = await fetch("/api/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pagamento_id: pagamento.id,
          projeto_id: item.projeto_id,
          titulo: item.projetos?.titulo || "Projeto FreellaBrasil",
          valor,
          contratante_id: usuario.id,
          freela_id: item.freela_id,
        }),
      });

      const data = await res.json();

      if (!data.url) {
        console.error(data);
        alert("Erro ao gerar pagamento no Mercado Pago.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar pagamento.");
    } finally {
      setPagandoId(null);
    }
  }

  function pagamentoAprovado(item: any) {
    const pagamento = pagamentosMap[item.projeto_id];

    return (
      pagamento?.status === "retido" ||
      pagamento?.status === "liberado" ||
      pagamento?.status === "pago"
    );
  }

  async function confirmarEntrega(item: any) {
    if (!pagamentoAprovado(item)) {
      alert(
        "Para confirmar a entrega, o pagamento precisa estar aprovado e retido na plataforma."
      );
      return;
    }

    const confirmar = confirm(
      "Confirma que o projeto foi entregue corretamente? Após confirmar, você deverá avaliar o freelancer para liberar o pagamento."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "concluido",
        data_finalizacao: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      alert("Erro ao confirmar entrega.");
      return;
    }

    await carregarProjetos(usuario.id);

    setAvaliar({
      ...item,
      status: "concluido",
    });
  }

  async function liberarPagamento(item: any) {
    const { error } = await supabase
      .from("pagamentos")
      .update({
        status: "liberado",
        liberado_at: new Date().toISOString(),
      })
      .eq("projeto_id", item.projeto_id);

    if (error) {
      console.error("Erro ao liberar pagamento:", error);
      alert("Avaliação salva, porém houve erro ao liberar pagamento.");
      return false;
    }

    await supabase.from("notificacoes").insert([
      {
        usuario_id: item.freela_id,
        titulo: "Pagamento liberado",
        descricao:
          "O contratante confirmou a entrega, avaliou seu trabalho e o pagamento foi liberado para saque.",
        lida: false,
        link: "/saques",
      },
    ]);

    return true;
  }

  function jaAvaliado(item: any) {
    return avaliacoesFeitas.includes(item.id);
  }

  function traduzirStatus(status: string) {
    if (status === "em_andamento") return "Em andamento";
    if (status === "finalizado_freela") return "Aguardando confirmação";
    if (status === "finalizacao_solicitada") return "Aguardando confirmação";
    if (status === "concluido") return "Concluído";
    return status || "-";
  }

  function traduzirPagamento(item: any) {
    const pagamento = pagamentosMap[item.projeto_id];

    if (!pagamento) return "Não iniciado";
    if (pagamento.status === "aguardando_pagamento") return "Aguardando pagamento";
    if (pagamento.status === "retido") return "Pago e retido";
    if (pagamento.status === "liberado") return "Liberado para saque";
    if (pagamento.status === "pago") return "Pago ao freelancer";
    if (pagamento.status === "cancelado") return "Cancelado";

    return pagamento.status;
  }

  function corPagamento(item: any) {
    const pagamento = pagamentosMap[item.projeto_id];

    if (!pagamento || pagamento.status === "aguardando_pagamento") {
      return "text-yellow-300 bg-yellow-400/10 border-yellow-400/20";
    }

    if (
      pagamento.status === "retido" ||
      pagamento.status === "liberado" ||
      pagamento.status === "pago"
    ) {
      return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
    }

    return "text-red-300 bg-red-400/10 border-red-400/20";
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Meus Projetos</h1>
            <p className="mt-3 text-slate-400">
              Pague, acompanhe entregas, avalie freelancers e libere pagamentos.
            </p>
          </div>

          <Link
            href="/painel-contratante"
            className="rounded-xl border border-white/20 px-5 py-3 font-bold"
          >
            Voltar
          </Link>
        </div>

        {projetos.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            Você ainda não possui projetos em execução.
          </div>
        )}

        <div className="grid gap-6">
          {projetos.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    {item.projetos?.titulo || "Projeto sem título"}
                  </h2>

                  <p className="mt-3 max-w-4xl leading-7 text-slate-300">
                    {item.projetos?.descricao || "Sem descrição."}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-300">
                    {traduzirStatus(item.status)}
                  </span>

                  <span
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${corPagamento(
                      item
                    )}`}
                  >
                    {traduzirPagamento(item)}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <Info
                  titulo="Valor"
                  valor={valorProjeto(item).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                />

                <Info titulo="Prazo" valor={String(item.projetos?.prazo || "-")} />

                <Info
                  titulo="Categoria"
                  valor={item.projetos?.categoria || item.projetos?.area || "-"}
                />

                <Info
                  titulo="Início"
                  valor={
                    item.data_inicio
                      ? new Date(item.data_inicio).toLocaleDateString("pt-BR")
                      : "-"
                  }
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {item.status === "em_andamento" && !pagamentoAprovado(item) && (
                  <button
                    onClick={() => pagarProjeto(item)}
                    disabled={pagandoId === item.id}
                    className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black disabled:opacity-60"
                  >
                    {pagandoId === item.id
                      ? "Redirecionando..."
                      : "Pagar projeto"}
                  </button>
                )}

                {item.status === "em_andamento" && pagamentoAprovado(item) && (
                  <p className="font-bold text-emerald-300">
                    Pagamento aprovado e retido. Aguarde a entrega do freelancer.
                  </p>
                )}

                {(item.status === "finalizacao_solicitada" ||
                  item.status === "finalizado_freela") && (
                  <button
                    onClick={() => confirmarEntrega(item)}
                    className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
                  >
                    Confirmar entrega e avaliar
                  </button>
                )}

                {item.status === "concluido" && !jaAvaliado(item) && (
                  <button
                    onClick={() => {
                      if (!pagamentoAprovado(item)) {
                        alert(
                          "O pagamento precisa estar aprovado antes de liberar o freelancer."
                        );
                        return;
                      }

                      setAvaliar(item);
                    }}
                    className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-slate-950"
                  >
                    Avaliar freelancer e liberar pagamento
                  </button>
                )}

                {item.status === "concluido" && jaAvaliado(item) && (
                  <p className="font-bold text-emerald-300">
                    Projeto concluído, avaliado e pagamento liberado.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {avaliar && (
          <AvaliacaoModal
            projeto={avaliar}
            usuario={usuario}
            onClose={() => setAvaliar(null)}
            onSuccess={async () => {
              const liberado = await liberarPagamento(avaliar);

              await carregarProjetos(usuario.id);
              await carregarAvaliacoesFeitas(usuario.id);

              setAvaliar(null);

              if (liberado) {
                alert("Avaliação enviada e pagamento liberado com sucesso!");
              }
            }}
          />
        )}
      </section>
    </main>
  );
}

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-1 font-bold text-white">{valor}</p>
    </div>
  );
}