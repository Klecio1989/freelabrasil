"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MeusConvitesPage() {
  const [usuario, setUsuario] = useState(null);
  const [convites, setConvites] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);

  useEffect(() => {
    carregarConvites();
  }, []);

  async function carregarConvites() {
    setCarregando(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setUsuario(null);
      setCarregando(false);
      return;
    }

    setUsuario(user);

    const { data, error } = await supabase
      .from("convites")
      .select(`
        *,
        projetos (
          id,
          titulo,
          descricao,
          categoria,
          orcamento,
          contratante_id
        )
      `)
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar convites:", error);
      setConvites([]);
    } else {
      setConvites(data || []);
    }

    setCarregando(false);
  }

  async function aceitarConvite(convite) {
    setProcessando(convite.id);

    const projeto = convite.projetos;

    if (!projeto) {
      alert("Projeto não encontrado.");
      setProcessando(null);
      return;
    }

    const { data: jaExiste } = await supabase
      .from("projetos_andamento")
      .select("id")
      .eq("projeto_id", projeto.id)
      .eq("freelancer_id", convite.freelancer_id)
      .maybeSingle();

    if (!jaExiste) {
      const { error: erroAndamento } = await supabase
        .from("projetos_andamento")
        .insert({
          projeto_id: projeto.id,
          titulo: projeto.titulo,
          descricao: projeto.descricao,
          categoria: projeto.categoria,
          orcamento: projeto.orcamento,
          contratante_id: projeto.contratante_id,
          freelancer_id: convite.freelancer_id,
          status: "em_andamento",
        });

      if (erroAndamento) {
        console.error("Erro ao criar projeto em andamento:", erroAndamento);
        alert("Erro ao aceitar convite.");
        setProcessando(null);
        return;
      }
    }

    await supabase
      .from("convites")
      .update({ status: "aceito" })
      .eq("id", convite.id);

    await supabase.from("notificacoes").insert({
      usuario_id: projeto.contratante_id,
      titulo: "Convite aceito",
      mensagem: `O freelancer aceitou o convite para o projeto: ${projeto.titulo}`,
      link: `/projetos-andamento`,
      lida: false,
    });

    alert("Convite aceito! O projeto foi movido para Projetos em Andamento.");
    carregarConvites();
    setProcessando(null);
  }

  async function recusarConvite(convite) {
    setProcessando(convite.id);

    const { error } = await supabase
      .from("convites")
      .update({ status: "recusado" })
      .eq("id", convite.id);

    if (error) {
      console.error("Erro ao recusar convite:", error);
      alert("Erro ao recusar convite.");
      setProcessando(null);
      return;
    }

    if (convite.projetos?.contratante_id) {
      await supabase.from("notificacoes").insert({
        usuario_id: convite.projetos.contratante_id,
        titulo: "Convite recusado",
        mensagem: `O freelancer recusou o convite para o projeto: ${convite.projetos.titulo}`,
        link: `/projetos/${convite.projetos.id}`,
        lida: false,
      });
    }

    alert("Convite recusado.");
    carregarConvites();
    setProcessando(null);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando convites...
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Você precisa estar logado para ver seus convites.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black">Meus Convites</h1>

        <p className="text-slate-400 mt-2">
          Aqui aparecem os projetos em que contratantes convidaram você para participar.
        </p>

        <div className="mt-10 grid gap-5">
          {convites.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-slate-300">
              Você ainda não recebeu convites.
            </div>
          ) : (
            convites.map((convite) => {
              const projeto = convite.projetos;

              return (
                <div
                  key={convite.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {projeto?.titulo || "Projeto"}
                      </h2>

                      <p className="text-slate-300 mt-3">
                        {projeto?.descricao || "Sem descrição"}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-4 text-sm">
                        {projeto?.categoria && (
                          <span className="bg-white/10 px-3 py-1 rounded-full text-slate-300">
                            {projeto.categoria}
                          </span>
                        )}

                        {projeto?.orcamento && (
                          <span className="bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-300">
                            {projeto.orcamento}
                          </span>
                        )}

                        <span
                          className={`px-3 py-1 rounded-full ${
                            convite.status === "aceito"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : convite.status === "recusado"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {convite.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {projeto?.id && (
                      <Link
                        href={`/projetos/${projeto.id}`}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                      >
                        Ver projeto
                      </Link>
                    )}

                    {convite.status === "pendente" && (
                      <>
                        <button
                          onClick={() => aceitarConvite(convite)}
                          disabled={processando === convite.id}
                          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-bold text-slate-950 disabled:opacity-50"
                        >
                          {processando === convite.id
                            ? "Processando..."
                            : "Aceitar convite"}
                        </button>

                        <button
                          onClick={() => recusarConvite(convite)}
                          disabled={processando === convite.id}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-bold text-white disabled:opacity-50"
                        >
                          Recusar
                        </button>
                      </>
                    )}

                    {convite.status === "aceito" && (
                      <Link
                        href="/projetos-andamento"
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-bold text-slate-950"
                      >
                        Ver em andamento
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}