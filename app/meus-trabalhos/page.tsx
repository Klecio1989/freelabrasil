"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MeusTrabalhosPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [trabalhos, setTrabalhos] = useState<any[]>([]);
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

    await carregarTrabalhos(parsed.id);
    setLoading(false);
  }

  async function carregarTrabalhos(freelaId: string) {
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
      .eq("freela_id", freelaId)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar seus trabalhos.");
      return;
    }

    setTrabalhos(data || []);
  }

  async function solicitarFinalizacao(item: any) {
    const confirmar = confirm("Deseja informar que este trabalho foi finalizado?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "finalizacao_solicitada",
        data_finalizacao: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      alert("Erro ao solicitar finalização.");
      return;
    }

    alert("Finalização enviada para confirmação do contratante.");
    carregarTrabalhos(usuario.id);
  }

  function traduzirStatus(status: string) {
    if (status === "em_andamento") return "Em andamento";
    if (status === "aceito") return "Aceito";
    if (status === "finalizado_freela") return "Aguardando confirmação";
    if (status === "finalizacao_solicitada") return "Aguardando confirmação";
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
            <h1 className="text-4xl font-black">Meus Trabalhos</h1>
            <p className="mt-3 text-slate-400">
              Projetos que você aceitou e está executando como freelancer.
            </p>
          </div>

          <Link
            href="/painel-freelancer"
            className="rounded-xl border border-white/20 px-5 py-3 font-bold"
          >
            Voltar
          </Link>
        </div>

        {trabalhos.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p>Você ainda não possui trabalhos em andamento.</p>
          </div>
        )}

        <div className="grid gap-6">
          {trabalhos.map((item) => (
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
                    item.projetos?.orcamento ? `R$ ${item.projetos.orcamento}` : "-"
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
                {(item.status === "em_andamento" || item.status === "aceito") && (
                  <button
                    onClick={() => solicitarFinalizacao(item)}
                    className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
                  >
                    Finalizei este trabalho
                  </button>
                )}

                {(item.status === "finalizacao_solicitada" ||
                  item.status === "finalizado_freela") && (
                  <p className="font-bold text-yellow-300">
                    Aguardando o contratante confirmar e avaliar.
                  </p>
                )}

                {item.status === "concluido" && (
                  <p className="font-bold text-emerald-300">
                    Trabalho concluído.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
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