"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AvaliacaoModal from "@/components/AvaliacaoModal";

export default function MeusProjetosPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [avaliar, setAvaliar] = useState<any>(null);
  const [avaliacoesFeitas, setAvaliacoesFeitas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

    setProjetos(data || []);
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

  async function confirmarEntrega(item: any) {
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
    if (status === "aceito") return "Aceito";
    if (status === "finalizado_freela") return "Aguardando sua confirmação";
    if (status === "finalizacao_solicitada") return "Aguardando sua confirmação";
    if (status === "concluido") return "Concluído";
    return status || "-";
  }

  function corStatus(status: string) {
    if (status === "concluido") {
      return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
    }

    if (status === "finalizacao_solicitada" || status === "finalizado_freela") {
      return "text-yellow-300 bg-yellow-400/10 border-yellow-400/20";
    }

    return "text-blue-300 bg-blue-400/10 border-blue-400/20";
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
              Confirme entregas, avalie freelancers e libere pagamentos.
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
            <p>Você ainda não possui projetos em execução.</p>
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

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-bold ${corStatus(
                    item.status
                  )}`}
                >
                  {traduzirStatus(item.status)}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <Info
                  titulo="Orçamento"
                  valor={
                    item.projetos?.orcamento
                      ? `R$ ${item.projetos.orcamento}`
                      : "-"
                  }
                />

                <Info titulo="Prazo" valor={item.projetos?.prazo || "-"} />

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
                {(item.status === "finalizacao_solicitada" ||
                  item.status === "finalizado_freela") && (
                  <button
                    onClick={() => confirmarEntrega(item)}
                    className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
                  >
                    Confirmar entrega e avaliar
                  </button>
                )}

                {item.status === "em_andamento" && (
                  <p className="font-bold text-blue-300">
                    Projeto ainda em andamento com o freelancer.
                  </p>
                )}

                {item.status === "concluido" && !jaAvaliado(item) && (
                  <button
                    onClick={() => setAvaliar(item)}
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