"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Convite = {
  id: string;
  contratante_id: string;
  freelancer_id: string;
  projeto_id: string;
  mensagem: string;
  status?: string;
  created_at?: string;
  projeto_titulo?: string;
  contratante_nome?: string;
};

export default function ConvitesPage() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarConvites();
  }, []);

  async function carregarConvites() {
    setCarregando(true);

    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      console.log("SEM USUARIO NO LOCALSTORAGE");
      setUsuario(null);
      setCarregando(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    console.log("USUARIO LOGADO:", parsed);

    const { data, error } = await supabase
      .from("convites")
      .select("*")
      .eq("freelancer_id", parsed.id)
      .order("created_at", { ascending: false });

    console.log("CONVITES RETORNADOS:", data);
    console.log("ERRO CONVITES:", error);

    if (error) {
      alert(error.message);
      setCarregando(false);
      return;
    }

    if (!data || data.length === 0) {
      setConvites([]);
      setCarregando(false);
      return;
    }

    const projetoIds = [...new Set(data.map((c: any) => c.projeto_id).filter(Boolean))];
    const contratanteIds = [...new Set(data.map((c: any) => c.contratante_id).filter(Boolean))];

    let projetosMap: Record<string, any> = {};
    let contratantesMap: Record<string, any> = {};

    if (projetoIds.length > 0) {
      const { data: projetosData } = await supabase
        .from("projetos")
        .select("id,titulo")
        .in("id", projetoIds);

      projetosMap = Object.fromEntries(
        projetosData?.map((p: any) => [p.id, p]) || []
      );
    }

    if (contratanteIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id,nome")
        .in("id", contratanteIds);

      contratantesMap = Object.fromEntries(
        usuariosData?.map((u: any) => [u.id, u]) || []
      );
    }

    const convitesFormatados = data.map((c: any) => ({
      ...c,
      projeto_titulo: projetosMap[c.projeto_id]?.titulo || "Projeto",
      contratante_nome: contratantesMap[c.contratante_id]?.nome || "Contratante",
    }));

    setConvites(convitesFormatados);
    setCarregando(false);
  }

  async function atualizarStatus(convite: Convite, status: "aceito" | "recusado") {
    const { error } = await supabase
      .from("convites")
      .update({ status })
      .eq("id", convite.id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("notificacoes").insert([
      {
        usuario_id: convite.contratante_id,
        titulo: status === "aceito" ? "Convite aceito" : "Convite recusado",
        descricao: `${usuario?.nome || "Freelancer"} ${
          status === "aceito" ? "aceitou" : "recusou"
        } o convite do projeto "${convite.projeto_titulo}".`,
        lida: false,
        link: "/propostas-recebidas",
      },
    ]);

    setConvites((prev) =>
      prev.map((c) => (c.id === convite.id ? { ...c, status } : c))
    );

    alert(status === "aceito" ? "Convite aceito." : "Convite recusado.");
  }

  if (!usuario && !carregando) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-black">Meus convites</h1>
          <p className="mt-4 text-slate-400">
            Faça login como freelancer para visualizar seus convites.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
          >
            Fazer login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Área do freelancer
            </span>

            <h1 className="mt-4 text-5xl font-black leading-tight">
              Meus convites
            </h1>

            <p className="mt-4 text-lg text-slate-300">
              Convites recebidos de contratantes
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={carregarConvites}
              className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white"
            >
              Atualizar
            </button>

            <Link
              href="/painel-freelancer"
              className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white"
            >
              Voltar
            </Link>
          </div>
        </div>

        {carregando && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            Carregando convites...
          </div>
        )}

        {!carregando && convites.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            Nenhum convite recebido ainda.
          </div>
        )}

        <div className="grid gap-6">
          {!carregando &&
            convites.map((convite) => (
              <div
                key={convite.id}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-2xl"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                        {(convite.status || "pendente").toUpperCase()}
                      </span>
                    </div>

                    <h2 className="text-3xl font-black">
                      {convite.projeto_titulo}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Contratante: {convite.contratante_nome}
                    </p>

                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                      {convite.mensagem || "Sem mensagem."}
                    </p>
                  </div>

                  <div className="flex min-w-[230px] flex-col gap-3">
                    {(!convite.status || convite.status === "pendente") && (
                      <>
                        <button
                          onClick={() => atualizarStatus(convite, "aceito")}
                          className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950"
                        >
                          Aceitar convite
                        </button>

                        <button
                          onClick={() => atualizarStatus(convite, "recusado")}
                          className="rounded-xl border border-red-400/30 px-5 py-3 font-bold text-red-300"
                        >
                          Recusar convite
                        </button>
                      </>
                    )}

                    {convite.status === "aceito" && (
                      <Link
                        href={`/propostas/nova?projeto_id=${convite.projeto_id}`}
                        className="rounded-xl bg-white px-5 py-3 text-center font-bold text-slate-950"
                      >
                        Enviar proposta
                      </Link>
                    )}

                    <Link
                      href="/projetos"
                      className="rounded-xl border border-white/20 px-5 py-3 text-center font-medium text-white"
                    >
                      Ver projetos
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}