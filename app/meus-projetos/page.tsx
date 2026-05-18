"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MeusProjetos() {
  const [usuario, setUsuario] = useState<any>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      setLoading(false);
      return;
    }

    const authUser = data.user;

    const localUser = localStorage.getItem("freelabrasil_usuario");

    let usuarioFinal: any = {
      id: authUser.id,
    };

    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);

        usuarioFinal = {
          ...parsed,
          id: authUser.id,
        };
      } catch {
        usuarioFinal.id = authUser.id;
      }
    }

    setUsuario(usuarioFinal);

    await carregarProjetos(usuarioFinal);
  }

  async function carregarProjetos(user: any) {
    setLoading(true);

    let query = supabase
      .from("projetos_andamento")
      .select(`
        *,
        projetos (
          id,
          titulo,
          descricao,
          orcamento,
          prazo
        )
      `)
      .order("data_inicio", { ascending: false });

    if (user.tipo_usuario === "contratante") {
      query = query.eq("contratante_id", user.id);
    } else {
      query = query.eq("freela_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      alert("Erro ao carregar projetos");
      setProjetos([]);
    } else {
      setProjetos(data || []);
    }

    setLoading(false);
  }

  async function finalizarProjeto(id: string) {
    const confirmar = confirm(
      "Deseja informar que finalizou este projeto?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "finalizado_freela",
        data_finalizacao: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao finalizar projeto");
      return;
    }

    alert("Projeto enviado para confirmação.");

    carregarProjetos(usuario);
  }

  async function confirmarConclusao(id: string) {
    const confirmar = confirm(
      "Deseja confirmar a conclusão deste projeto?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "concluido",
        data_confirmacao: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao confirmar projeto");
      return;
    }

    alert("Projeto concluído com sucesso.");

    carregarProjetos(usuario);
  }

  function badge(status: string) {
    if (status === "em_andamento") {
      return "bg-blue-500";
    }

    if (status === "finalizado_freela") {
      return "bg-yellow-500";
    }

    if (status === "concluido") {
      return "bg-emerald-500";
    }

    return "bg-slate-500";
  }

  function textoStatus(status: string) {
    if (status === "em_andamento") {
      return "Em andamento";
    }

    if (status === "finalizado_freela") {
      return "Aguardando confirmação";
    }

    if (status === "concluido") {
      return "Concluído";
    }

    return status;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
        Carregando projetos...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-black">
          Meus projetos
        </h1>

        <p className="mt-4 text-lg text-slate-300">
          Acompanhe seus projetos em andamento.
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
                    {item.projetos?.titulo}
                  </h2>

                  <p className="mt-3 text-slate-400">
                    {item.projetos?.descricao}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-black text-white ${badge(
                    item.status
                  )}`}
                >
                  {textoStatus(item.status)}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">
                    Orçamento
                  </p>

                  <p className="mt-1 font-bold">
                    R$ {item.projetos?.orcamento || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">
                    Prazo
                  </p>

                  <p className="mt-1 font-bold">
                    {item.projetos?.prazo || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">
                    Início
                  </p>

                  <p className="mt-1 font-bold">
                    {item.data_inicio
                      ? new Date(
                          item.data_inicio
                        ).toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {usuario?.tipo_usuario === "freelancer" &&
                  item.status === "em_andamento" && (
                    <button
                      onClick={() => finalizarProjeto(item.id)}
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
                    >
                      Finalizei o projeto
                    </button>
                  )}

                {usuario?.tipo_usuario === "contratante" &&
                  item.status === "finalizado_freela" && (
                    <button
                      onClick={() => confirmarConclusao(item.id)}
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
                    >
                      Confirmar conclusão
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}