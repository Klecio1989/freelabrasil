"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MeusProjetos() {
  const [usuario, setUsuario] = useState<any>(null);
  const [projetosPublicados, setProjetosPublicados] = useState<any[]>([]);
  const [projetosAndamento, setProjetosAndamento] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    setLoading(true);

    const userLocal = localStorage.getItem("freelabrasil_usuario");

    if (!userLocal) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    const user = JSON.parse(userLocal);
    setUsuario(user);

    await carregarDados(user);
  }

  async function carregarDados(user: any) {
    setLoading(true);

    if (user.tipo_usuario === "contratante") {
      await carregarProjetosPublicados(user.id);
      await carregarProjetosAndamentoContratante(user.id);
    }

    if (user.tipo_usuario === "freelancer") {
      await carregarProjetosAndamentoFreela(user.id);
    }

    setLoading(false);
  }

  async function carregarProjetosPublicados(contratanteId: string) {
    const { data, error } = await supabase
      .from("projetos")
      .select("*")
      .eq("contratante_id", contratanteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar projetos publicados:", error);
      setProjetosPublicados([]);
      return;
    }

    setProjetosPublicados(data || []);
  }

  async function carregarProjetosAndamentoContratante(contratanteId: string) {
    const { data, error } = await supabase
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
      .eq("contratante_id", contratanteId)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error("Erro ao carregar projetos em andamento:", error);
      setProjetosAndamento([]);
      return;
    }

    setProjetosAndamento(data || []);
  }

  async function carregarProjetosAndamentoFreela(freelaId: string) {
    const { data, error } = await supabase
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
      .eq("freela_id", freelaId)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error("Erro ao carregar projetos do freelancer:", error);
      setProjetosAndamento([]);
      return;
    }

    setProjetosAndamento(data || []);
  }

  async function finalizarProjeto(item: any) {
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
      console.error("Erro ao finalizar projeto:", error);
      alert("Erro ao finalizar projeto.");
      setProcessando(null);
      return;
    }

    if (item.contratante_id) {
      await supabase.from("notificacoes").insert({
        usuario_id: item.contratante_id,
        titulo: "Projeto finalizado",
        descricao: `O freelancer informou que finalizou o projeto: ${
          item.projetos?.titulo || "Projeto"
        }.`,
        link: "/meus-projetos",
        lida: false,
      });
    }

    alert("Projeto enviado para confirmação do contratante.");

    setProcessando(null);
    await carregarDados(usuario);
  }

  async function confirmarConclusao(item: any) {
    const confirmar = confirm("Deseja confirmar a conclusão deste projeto?");

    if (!confirmar) return;

    const notaTexto = prompt("Digite uma nota de 1 a 5 para o freelancer:");

    if (!notaTexto) return;

    const nota = Number(notaTexto);

    if (!nota || nota < 1 || nota > 5) {
      alert("A nota precisa ser entre 1 e 5.");
      return;
    }

    const comentario = prompt("Descreva sua experiência com o freelancer:");

    if (!comentario || comentario.trim().length < 5) {
      alert("Comentário obrigatório. Escreva pelo menos 5 caracteres.");
      return;
    }

    setProcessando(item.id);

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "concluido",
        data_confirmacao: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      console.error("Erro ao confirmar conclusão:", error);
      alert("Erro ao confirmar conclusão.");
      setProcessando(null);
      return;
    }

    const { error: avaliacaoError } = await supabase.from("avaliacoes").insert({
      projeto_id: item.projeto_id,
      projeto_andamento_id: item.id,
      avaliador_id: usuario.id,
      avaliado_id: item.freela_id,
      nota,
      comentario: comentario.trim(),
      tipo: "freelancer",
    });

    if (avaliacaoError) {
      console.error("Erro ao salvar avaliação:", avaliacaoError);
      alert("Projeto concluído, mas houve erro ao salvar a avaliação.");
    }

    if (item.freela_id) {
      await supabase.from("notificacoes").insert({
        usuario_id: item.freela_id,
        titulo: "Projeto concluído",
        descricao: `O contratante confirmou a conclusão do projeto: ${
          item.projetos?.titulo || "Projeto"
        }.`,
        link: "/meus-projetos",
        lida: false,
      });
    }

    alert("Projeto concluído e avaliação enviada.");

    setProcessando(null);
    await carregarDados(usuario);
  }

  function textoStatus(status: string) {
    if (status === "em_andamento") return "Em andamento";
    if (status === "finalizado_freela") return "Aguardando confirmação";
    if (status === "concluido") return "Concluído";
    if (status === "aberto") return "Publicado";
    if (status === "publicado") return "Publicado";
    return status || "Publicado";
  }

  function corStatus(status: string) {
    if (status === "em_andamento") return "bg-blue-500";
    if (status === "finalizado_freela") return "bg-yellow-500";
    if (status === "concluido") return "bg-emerald-500";
    return "bg-purple-500";
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
        <section className="mx-auto max-w-6xl">
          <h1 className="text-5xl font-black">Meus projetos</h1>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            Você precisa estar logado.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-black">Meus projetos</h1>

        <p className="mt-4 text-lg text-slate-300">
          {usuario.tipo_usuario === "contratante"
            ? "Acompanhe seus projetos publicados e os projetos em andamento."
            : "Acompanhe os projetos que você aceitou e está trabalhando."}
        </p>

        {usuario.tipo_usuario === "contratante" && (
          <>
            <h2 className="mt-10 text-3xl font-black">Projetos publicados</h2>

            {projetosPublicados.length === 0 && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6">
                Nenhum projeto publicado encontrado.
              </div>
            )}

            <div className="mt-5 grid gap-6">
              {projetosPublicados.map((projeto) => (
                <div
                  key={projeto.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black">
                        {projeto.titulo || "Projeto sem título"}
                      </h3>

                      <p className="mt-3 max-w-3xl text-slate-400">
                        {projeto.descricao || "Sem descrição informada."}
                      </p>
                    </div>

                    <span className="rounded-full bg-purple-500 px-4 py-2 text-sm font-black text-white">
                      {textoStatus(projeto.status)}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Orçamento</p>
                      <p className="mt-1 font-bold">
                        {projeto.orcamento
                          ? `R$ ${projeto.orcamento}`
                          : "Não informado"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Prazo</p>
                      <p className="mt-1 font-bold">
                        {projeto.prazo || "Não informado"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Criado em</p>
                      <p className="mt-1 font-bold">
                        {projeto.created_at
                          ? new Date(projeto.created_at).toLocaleDateString(
                              "pt-BR"
                            )
                          : "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/projetos/${projeto.id}`}
                      className="rounded-xl border border-white/10 px-5 py-3 font-bold text-white hover:bg-white/10"
                    >
                      Ver projeto
                    </Link>

                    <Link
                      href="/propostas-recebidas"
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
                    >
                      Ver propostas
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-12 text-3xl font-black">
          {usuario.tipo_usuario === "contratante"
            ? "Projetos em andamento"
            : "Trabalhos em andamento"}
        </h2>

        {projetosAndamento.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6">
            Nenhum projeto em andamento encontrado.
          </div>
        )}

        <div className="mt-5 grid gap-6">
          {projetosAndamento.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">
                    {item.projetos?.titulo || "Projeto sem título"}
                  </h3>

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
                <Link
                  href={`/chat?proposta_id=${item.projeto_id}`}
                  className="rounded-xl border border-white/10 px-5 py-3 font-bold text-white hover:bg-white/10"
                >
                  Abrir chat
                </Link>

                {usuario.tipo_usuario === "freelancer" &&
                  item.status === "em_andamento" && (
                    <button
                      onClick={() => finalizarProjeto(item)}
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
                      onClick={() => confirmarConclusao(item)}
                      disabled={processando === item.id}
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                    >
                      {processando === item.id
                        ? "Confirmando..."
                        : "Confirmar conclusão e avaliar"}
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