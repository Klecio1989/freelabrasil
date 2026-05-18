"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MeusProjetos() {
  const [usuario, setUsuario] = useState<any>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (!user) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(user);
    setUsuario(parsed);

    await carregarProjetos(parsed);
  }

  async function carregarProjetos(user: any) {
    setLoading(true);

    let query = supabase
      .from("projetos_andamento")
      .select(`
        id,
        status,
        data_inicio,
        data_finalizacao,
        data_confirmacao,
        projeto_id,
        freela_id,
        contratante_id,
        projetos (
          id,
          titulo,
          descricao,
          orcamento,
          prazo
        )
      `)
      .order("data_inicio", { ascending: false });

    if (user.tipo_usuario === "freelancer") {
      query = query.eq("freela_id", user.id);
    }

    if (user.tipo_usuario === "contratante") {
      query = query.eq("contratante_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      alert("Erro ao carregar projetos.");
      setProjetos([]);
    } else {
      setProjetos(data || []);
    }

    setLoading(false);
  }

  async function freelancerFinalizarProjeto(item: any) {
    const confirmar = confirm("Deseja informar que finalizou este projeto?");

    if (!confirmar) return;

    setProcessando(item.id);

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "finalizado_freela",
        data_finalizacao: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      alert("Erro ao finalizar projeto.");
      setProcessando(null);
      return;
    }

    await supabase.from("notificacoes").insert({
      usuario_id: item.contratante_id,
      titulo: "Projeto finalizado pelo freelancer",
      descricao: `O freelancer informou que finalizou o projeto: ${
        item.projetos?.titulo || "Projeto"
      }.`,
      link: "/meus-projetos",
      lida: false,
    });

    alert("Projeto enviado para confirmação do contratante.");
    setProcessando(null);
    carregarProjetos(usuario);
  }

  async function contratanteConfirmarConclusao(item: any) {
    const confirmar = confirm(
      "Deseja confirmar que este projeto foi concluído com sucesso?"
    );

    if (!confirmar) return;

    setProcessando(item.id);

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "concluido",
        data_confirmacao: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      alert("Erro ao confirmar conclusão.");
      setProcessando(null);
      return;
    }

    await supabase.from("notificacoes").insert({
      usuario_id: item.freela_id,
      titulo: "Projeto concluído",
      descricao: `O contratante confirmou a conclusão do projeto: ${
        item.projetos?.titulo || "Projeto"
      }.`,
      link: "/meus-projetos",
      lida: false,
    });

    alert("Projeto confirmado como concluído.");
    setProcessando(null);
    carregarProjetos(usuario);
  }

  function textoStatus(status: string) {
    if (status === "em_andamento") return "Em andamento";
    if (status === "finalizado_freela") return "Aguardando confirmação";
    if (status === "concluido") return "Concluído";
    return status || "Sem status";
  }

  function corStatus(status: string) {
    if (status === "em_andamento") return "bg-blue-500";
    if (status === "finalizado_freela") return "bg-yellow-500";
    if (status === "concluido") return "bg-emerald-500";
    return "bg-slate-500";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
        Carregando projetos...
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
        <h1 className="text-4xl font-black">Meus projetos</h1>
        <p className="mt-4 text-slate-400">Você precisa estar logado.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-black">Meus projetos</h1>

        <p className="mt-4 text-slate-300">
          {usuario.tipo_usuario === "freelancer"
            ? "Acompanhe os projetos que você aceitou e está trabalhando."
            : "Acompanhe os projetos dos seus freelancers e confirme as conclusões."}
        </p>

        {projetos.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            Nenhum projeto encontrado.
          </div>
        )}

        <div className="mt-8 grid gap-6">
          {projetos.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    {item.projetos?.titulo || "Projeto sem título"}
                  </h2>

                  <p className="mt-3 max-w-3xl text-slate-400">
                    {item.projetos?.descricao || "Sem descrição informada."}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-black text-white ${corStatus(
                    item.status
                  )}`}
                >
                  {textoStatus(item.status)}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">Orçamento</p>
                  <p className="mt-1 font-bold">
                    {item.projetos?.orcamento
                      ? `R$ ${item.projetos.orcamento}`
                      : "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">Prazo</p>
                  <p className="mt-1 font-bold">
                    {item.projetos?.prazo || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">Início</p>
                  <p className="mt-1 font-bold">
                    {item.data_inicio
                      ? new Date(item.data_inicio).toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {usuario.tipo_usuario === "freelancer" &&
                  item.status === "em_andamento" && (
                    <button
                      onClick={() => freelancerFinalizarProjeto(item)}
                      disabled={processando === item.id}
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                    >
                      {processando === item.id
                        ? "Enviando..."
                        : "Finalizei o projeto"}
                    </button>
                  )}

                {usuario.tipo_usuario === "contratante" &&
                  item.status === "finalizado_freela" && (
                    <button
                      onClick={() => contratanteConfirmarConclusao(item)}
                      disabled={processando === item.id}
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                    >
                      {processando === item.id
                        ? "Confirmando..."
                        : "Confirmar conclusão"}
                    </button>
                  )}

                {item.status === "finalizado_freela" && (
                  <p className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3 font-bold text-yellow-300">
                    Aguardando confirmação do contratante.
                  </p>
                )}

                {item.status === "concluido" && (
                  <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 font-bold text-emerald-300">
                    Projeto concluído com sucesso.
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