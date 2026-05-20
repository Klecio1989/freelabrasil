"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState("");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setLoading(true);

    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .order("created_at", { ascending: false });

    setUsuarios(data || []);
    setLoading(false);
  }

  async function alterarBanimento(
    usuarioId: string,
    banido: boolean
  ) {
    setProcessando(usuarioId);

    const motivo = banido
      ? prompt("Motivo do banimento:")
      : null;

    const { error } = await supabase
      .from("usuarios")
      .update({
        banido,
        motivo_banimento: motivo,
      })
      .eq("id", usuarioId);

    setProcessando("");

    if (error) {
      console.error(error);
      alert("Erro ao atualizar usuário.");
      return;
    }

    carregarUsuarios();
  }

  async function alterarAdmin(
    usuarioId: string,
    admin: boolean
  ) {
    setProcessando(usuarioId);

    const { error } = await supabase
      .from("usuarios")
      .update({
        admin,
      })
      .eq("id", usuarioId);

    setProcessando("");

    if (error) {
      console.error(error);
      alert("Erro ao atualizar admin.");
      return;
    }

    carregarUsuarios();
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = `
      ${u.nome || ""}
      ${u.email || ""}
      ${u.tipo_usuario || ""}
    `.toLowerCase();

    return texto.includes(busca.toLowerCase());
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando usuários...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-7xl">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-5xl font-black">
              Usuários
            </h1>

            <p className="mt-4 text-slate-300">
              Gerencie freelancers e contratantes.
            </p>
          </div>

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar usuário..."
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 outline-none"
          />

        </div>

        <div className="mt-10 grid gap-5">

          {usuariosFiltrados.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-7"
            >

              <div className="flex flex-wrap items-center justify-between gap-6">

                <div>
                  <h2 className="text-2xl font-black">
                    {user.nome}
                  </h2>

                  <p className="mt-2 text-slate-300">
                    {user.email}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">

                    <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-bold">
                      {user.tipo_usuario}
                    </span>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      {(user.plano || "gratuito").toUpperCase()}
                    </span>

                    {user.admin && (
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                        ADMIN
                      </span>
                    )}

                    {user.banido && (
                      <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300">
                        BANIDO
                      </span>
                    )}

                  </div>

                  {user.motivo_banimento && (
                    <p className="mt-4 text-sm text-red-300">
                      Motivo: {user.motivo_banimento}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">

                  {!user.banido ? (
                    <button
                      onClick={() =>
                        alterarBanimento(user.id, true)
                      }
                      disabled={processando === user.id}
                      className="rounded-xl bg-red-500 px-5 py-3 font-black text-white"
                    >
                      Banir
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        alterarBanimento(user.id, false)
                      }
                      disabled={processando === user.id}
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
                    >
                      Desbanir
                    </button>
                  )}

                  {!user.admin ? (
                    <button
                      onClick={() =>
                        alterarAdmin(user.id, true)
                      }
                      disabled={processando === user.id}
                      className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3 font-black text-yellow-300"
                    >
                      Tornar admin
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        alterarAdmin(user.id, false)
                      }
                      disabled={processando === user.id}
                      className="rounded-xl border border-white/10 px-5 py-3 font-black"
                    >
                      Remover admin
                    </button>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>

      </section>
    </main>
  );
}