"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AvaliacaoModal from "@/components/AvaliacaoModal";

export default function MeusProjetosPage() {
  const [usuario, setUsuario] = useState<any>(null);

  const [projetosPublicados, setProjetosPublicados] = useState<any[]>([]);
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

    await Promise.all([
      carregarProjetosPublicados(parsed.id),
      carregarProjetos(parsed.id),
      carregarAvaliacoesFeitas(parsed.id),
    ]);

    setLoading(false);
  }

  async function carregarProjetosPublicados(contratanteId: string) {
    const { data, error } = await supabase
      .from("projetos")
      .select("*")
      .eq("contratante_id", contratanteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProjetosPublicados(data || []);
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
        alert("O projeto precisa ter um valor válido.");
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
        alert("Erro ao gerar pagamento.");
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
    const confirmar = confirm(
      "Confirma que o projeto foi entregue corretamente?"
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
    await supabase
      .from("pagamentos")
      .update({
        status: "liberado",
        liberado_at: new Date().toISOString(),
      })
      .eq("projeto_id", item.projeto_id);

    return true;
  }

  function jaAvaliado(item: any) {
    return avaliacoesFeitas.includes(item.id);
  }

  function traduzirStatus(status: string) {
    if (status === "em_andamento") return "Em andamento";
    if (status === "finalizado_freela") return "Aguardando confirmação";
    if (status === "concluido") return "Concluído";

    return status || "-";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando...
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
              Gerencie seus projetos publicados e em andamento.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/projetos/novo"
              className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
            >
              Novo Projeto
            </Link>

            <Link
              href="/painel-contratante"
              className="rounded-xl border border-white/20 px-5 py-3 font-bold"
            >
              Voltar
            </Link>
          </div>
        </div>

        {/* PROJETOS PUBLICADOS */}

        <div className="mb-12">
          <h2 className="mb-5 text-3xl font-black">
            Projetos Publicados
          </h2>

          {projetosPublicados.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              Você ainda não publicou projetos.
            </div>
          )}

          <div className="grid gap-6">
            {projetosPublicados.map((projeto) => (
              <div
                key={projeto.id}
                className="rounded-3xl border border-white/10 bg-slate-900 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <h3 className="text-2xl font-black">
                      {projeto.titulo}
                    </h3>

                    <p className="mt-3 max-w-4xl leading-7 text-slate-300">
                      {projeto.descricao}
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                    Publicado
                  </span>

                </div>

                <div className="mt-6 flex flex-wrap gap-4">

                  <Link
                    href={`/projetos/${projeto.id}`}
                    className="rounded-xl border border-white/20 px-5 py-3"
                  >
                    Abrir projeto
                  </Link>

                  <Link
                    href="/propostas-recebidas"
                    className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950"
                  >
                    Ver propostas
                  </Link>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROJETOS EM EXECUÇÃO */}

        <div>
          <h2 className="mb-5 text-3xl font-black">
            Projetos em Execução
          </h2>

          {projetos.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              Nenhum projeto em execução.
            </div>
          )}

          <div className="grid gap-6">
            {projetos.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-slate-900 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <h2 className="text-2xl font-black">
                      {item.projetos?.titulo}
                    </h2>

                    <p className="mt-3 max-w-4xl leading-7 text-slate-300">
                      {item.projetos?.descricao}
                    </p>
                  </div>

                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-300">
                    {traduzirStatus(item.status)}
                  </span>

                </div>

                <div className="mt-6 flex flex-wrap gap-4">

                  <Link
                    href={`/chat?proposta_id=${item.proposta_id}`}
                    className="rounded-xl border border-white/20 px-5 py-3"
                  >
                    Abrir chat
                  </Link>

                  {item.status === "em_andamento" &&
                    !pagamentoAprovado(item) && (
                      <button
                        onClick={() => pagarProjeto(item)}
                        disabled={pagandoId === item.id}
                        className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
                      >
                        {pagandoId === item.id
                          ? "Redirecionando..."
                          : "Pagar projeto"}
                      </button>
                    )}

                  {(item.status === "finalizado_freela" ||
                    item.status === "finalizacao_solicitada") && (
                      <button
                        onClick={() => confirmarEntrega(item)}
                        className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
                      >
                        Confirmar entrega
                      </button>
                    )}

                  {item.status === "concluido" &&
                    !jaAvaliado(item) && (
                      <button
                        onClick={() => setAvaliar(item)}
                        className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-slate-950"
                      >
                        Avaliar freelancer
                      </button>
                    )}

                </div>
              </div>
            ))}
          </div>
        </div>

        {avaliar && (
          <AvaliacaoModal
            projeto={avaliar}
            usuario={usuario}
            onClose={() => setAvaliar(null)}
            onSuccess={async () => {
              await liberarPagamento(avaliar);

              await carregarProjetos(usuario.id);
              await carregarAvaliacoesFeitas(usuario.id);

              setAvaliar(null);

              alert("Pagamento liberado com sucesso!");
            }}
          />
        )}
      </section>
    </main>
  );
}