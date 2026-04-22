"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Notificacao = {
  id: string;
  titulo: string;
  descricao: string;
  lida: boolean;
  link?: string;
  created_at: string;
};

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);
      carregarNotificacoes(parsed.id);
    }
  }, []);

  async function carregarNotificacoes(usuarioId: string) {
    const { data } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false });

    if (data) setNotificacoes(data as Notificacao[]);
  }

  async function marcarComoLida(id: string) {
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id);

    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Notificações</h1>
            <p className="text-slate-400 mt-2">Acompanhe atualizações da plataforma</p>
          </div>

          <Link
            href="/projetos"
            className="border border-white/20 px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        <div className="grid gap-6">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-6 ${
                n.lida
                  ? "border-white/10 bg-slate-900"
                  : "border-emerald-400/40 bg-emerald-400/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{n.titulo}</h2>
                  <p className="text-slate-300 mt-3">{n.descricao}</p>
                  <p className="text-xs text-slate-500 mt-4">
                    {new Date(n.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>

                {!n.lida && (
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">
                    Nova
                  </span>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {!n.lida && (
                  <button
                    onClick={() => marcarComoLida(n.id)}
                    className="bg-white text-black px-4 py-2 rounded-lg font-bold"
                  >
                    Marcar como lida
                  </button>
                )}

                {n.link && (
                  <Link
                    href={n.link}
                    className="border border-white/20 px-4 py-2 rounded-lg"
                  >
                    Abrir
                  </Link>
                )}
              </div>
            </div>
          ))}

          {notificacoes.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center text-slate-400">
              Nenhuma notificação ainda.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}