"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminBoostPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [freelas, setFreelas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
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
      .from("usuarios")
      .select("id,nome,email,plano,boost_ativo,boost_inicio,boost_fim,boost_peso")
      .eq("tipo_usuario", "freelancer")
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      alert("Erro ao carregar freelancers.");
      setLoading(false);
      return;
    }

    setFreelas(data || []);
    setLoading(false);
  }

  async function ativarBoost(freela: any, dias: number, peso: number) {
    const confirmar = confirm(
      `Ativar boost para ${freela.nome} por ${dias} dias?`
    );

    if (!confirmar) return;

    const agora = new Date();
    const fim = new Date();
    fim.setDate(fim.getDate() + dias);

    const { error } = await supabase
      .from("usuarios")
      .update({
        boost_ativo: true,
        boost_inicio: agora.toISOString(),
        boost_fim: fim.toISOString(),
        boost_peso: peso,
      })
      .eq("id", freela.id);

    if (error) {
      console.error(error);
      alert("Erro ao ativar boost.");
      return;
    }

    alert("Boost ativado com sucesso.");
    carregar();
  }

  async function desativarBoost(freela: any) {
    const confirmar = confirm(`Desativar boost de ${freela.nome}?`);

    if (!confirmar) return;

    const { error } = await supabase
      .from("usuarios")
      .update({
        boost_ativo: false,
        boost_peso: 0,
      })
      .eq("id", freela.id);

    if (error) {
      console.error(error);
      alert("Erro ao desativar boost.");
      return;
    }

    alert("Boost desativado.");
    carregar();
  }

  function boostValido(f: any) {
    if (!f.boost_ativo) return false;
    if (!f.boost_fim) return true;
    return new Date(f.boost_fim) >= new Date();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando...
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Admin - Boost</h1>
            <p className="mt-3 text-slate-400">
              Ative destaque patrocinado para freelancers aparecerem no topo.
            </p>
          </div>

          <Link href="/admin" className="rounded-xl border border-white/20 px-5 py-3 font-bold">
            Voltar
          </Link>
        </div>

        <div className="grid gap-5">
          {freelas.map((f) => {
            const ativo = boostValido(f);

            return (
              <div key={f.id} className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{f.nome}</h2>
                    <p className="mt-1 text-sm text-slate-400">{f.email}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Plano: {f.plano || "gratuito"}
                    </p>

                    {ativo ? (
                      <p className="mt-3 font-bold text-yellow-300">
                        🚀 Boost ativo até{" "}
                        {f.boost_fim
                          ? new Date(f.boost_fim).toLocaleDateString("pt-BR")
                          : "sem data final"}
                      </p>
                    ) : (
                      <p className="mt-3 text-slate-400">Sem boost ativo</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => ativarBoost(f, 7, 10)}
                      className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
                    >
                      Boost 7 dias
                    </button>

                    <button
                      onClick={() => ativarBoost(f, 30, 30)}
                      className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
                    >
                      Boost 30 dias
                    </button>

                    {ativo && (
                      <button
                        onClick={() => desativarBoost(f)}
                        className="rounded-xl border border-red-400 px-5 py-3 font-bold text-red-300"
                      >
                        Desativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}