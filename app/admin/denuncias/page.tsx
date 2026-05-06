"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDenunciasPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [usuariosMap, setUsuariosMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);

    const user = localStorage.getItem("freelabrasil_usuario");

    if (!user) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(user);
    setUsuario(parsed);

    if (parsed.role !== "admin") {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("denuncias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar denúncias.");
      setLoading(false);
      return;
    }

    const lista = data || [];
    setDenuncias(lista);

    const ids = [
      ...new Set(
        lista
          .flatMap((d: any) => [d.denunciante_id, d.denunciado_id])
          .filter(Boolean)
      ),
    ];

    if (ids.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id,nome,email,status_conta,tipo_usuario")
        .in("id", ids);

      const mapa = Object.fromEntries(
        (usuariosData || []).map((u: any) => [u.id, u])
      );

      setUsuariosMap(mapa);
    } else {
      setUsuariosMap({});
    }

    setLoading(false);
  }

  async function atualizarStatus(id: string, status: "em_analise" | "resolvida" | "cancelada") {
    const confirmar = confirm(`Alterar denúncia para "${status}"?`);

    if (!confirmar) return;

    const { error } = await supabase
      .from("denuncias")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar denúncia.");
      return;
    }

    carregar();
  }

  async function banirUsuario(usuarioId: string) {
    const motivo = prompt("Informe o motivo do banimento:");

    if (!motivo) return;

    const confirmar = confirm("Tem certeza que deseja banir este usuário?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("usuarios")
      .update({
        status_conta: "banido",
        motivo_banimento: motivo,
        banido_em: new Date().toISOString(),
      })
      .eq("id", usuarioId);

    if (error) {
      alert("Erro ao banir usuário.");
      return;
    }

    alert("Usuário banido com sucesso.");
    carregar();
  }

  function corStatus(status: string) {
    if (status === "resolvida")
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    if (status === "cancelada")
      return "border-red-400/20 bg-red-400/10 text-red-300";

    if (status === "em_analise")
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

    return "border-blue-400/20 bg-blue-400/10 text-blue-300";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando denúncias...
      </main>
    );
  }

  if (!usuario || usuario.role !== "admin") {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <h1 className="text-3xl font-black text-red-300">Acesso negado</h1>
      </main>
    );
  }

  const abertas = denuncias.filter((d) => d.status === "aberta").length;
  const analise = denuncias.filter((d) => d.status === "em_analise").length;
  const resolvidas = denuncias.filter((d) => d.status === "resolvida").length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Admin - Denúncias</h1>
            <p className="mt-3 text-slate-400">
              Analise denúncias, acompanhe usuários reportados e aplique ações de segurança.
            </p>
          </div>

          <Link href="/admin" className="rounded-xl border border-white/20 px-5 py-3 font-bold">
            Voltar
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card titulo="Total" valor={String(denuncias.length)} />
          <Card titulo="Abertas" valor={String(abertas)} azul />
          <Card titulo="Em análise" valor={String(analise)} amarelo />
          <Card titulo="Resolvidas" valor={String(resolvidas)} verde />
        </div>

        {denuncias.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            Nenhuma denúncia registrada.
          </div>
        )}

        <div className="grid gap-5">
          {denuncias.map((d) => {
            const denunciante = usuariosMap[d.denunciante_id];
            const denunciado = usuariosMap[d.denunciado_id];

            return (
              <div key={d.id} className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${corStatus(d.status)}`}>
                        {d.status || "aberta"}
                      </span>

                      <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-black text-red-300">
                        {d.motivo || "Sem motivo"}
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-black">
                      Usuário denunciado: {denunciado?.nome || "Não localizado"}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Email denunciado: {denunciado?.email || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      Denunciante: {denunciante?.nome || "Não localizado"} — {denunciante?.email || "-"}
                    </p>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Descrição</p>
                      <p className="mt-2 leading-7 text-slate-200">
                        {d.descricao || "Sem descrição."}
                      </p>
                    </div>

                    {d.created_at && (
                      <p className="mt-4 text-xs text-slate-500">
                        Criada em {new Date(d.created_at).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => atualizarStatus(d.id, "em_analise")}
                    className="rounded-xl border border-yellow-400/30 px-5 py-3 font-bold text-yellow-300"
                  >
                    Marcar em análise
                  </button>

                  <button
                    onClick={() => atualizarStatus(d.id, "resolvida")}
                    className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
                  >
                    Resolver
                  </button>

                  <button
                    onClick={() => atualizarStatus(d.id, "cancelada")}
                    className="rounded-xl border border-white/20 px-5 py-3 font-bold"
                  >
                    Cancelar
                  </button>

                  {denunciado?.status_conta !== "banido" && (
                    <button
                      onClick={() => banirUsuario(d.denunciado_id)}
                      className="rounded-xl bg-red-500 px-5 py-3 font-black text-white"
                    >
                      Banir denunciado
                    </button>
                  )}

                  {denunciado?.status_conta === "banido" && (
                    <span className="rounded-xl border border-red-400/30 px-5 py-3 font-bold text-red-300">
                      Usuário já banido
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Card({
  titulo,
  valor,
  verde,
  amarelo,
  azul,
}: {
  titulo: string;
  valor: string;
  verde?: boolean;
  amarelo?: boolean;
  azul?: boolean;
}) {
  let classe = "border-white/10 bg-white/5";

  if (verde) classe = "border-emerald-400/30 bg-emerald-400/10";
  if (amarelo) classe = "border-yellow-400/30 bg-yellow-400/10";
  if (azul) classe = "border-blue-400/30 bg-blue-400/10";

  return (
    <div className={`rounded-2xl border p-5 ${classe}`}>
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-2xl font-black">{valor}</p>
    </div>
  );
}