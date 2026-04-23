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
  usuario_id: string;
};

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (!usuarioSalvo) return;

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);
    carregarNotificacoes(parsed.id);

    const channel = supabase
      .channel(`notificacoes-${parsed.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${parsed.id}`,
        },
        (payload) => {
          const nova = payload.new as Notificacao;
          setNotificacoes((prev) => [nova, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${parsed.id}`,
        },
        (payload) => {
          const atualizada = payload.new as Notificacao;
          setNotificacoes((prev) =>
            prev.map((n) => (n.id === atualizada.id ? atualizada : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  async function marcarTodasComoLidas() {
    if (!usuario) return;

    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("usuario_id", usuario.id)
      .eq("lida", false);

    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold">Notificações</h1>
            <p className="text-slate-400 mt-2">
              Acompanhe atualizações da plataforma em tempo real
            </p>
          </div>

          <div className="flex gap-3">
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="bg-white text-black px-4 py-2 rounded-lg font-bold"
              >
                Marcar todas como lidas
              </button>
            )}

            <Link
              href="/dashboard"
              className="border border-white/20 px-4 py-2 rounded-lg"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="mb-6 grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Total</div>
            <div className="mt-2 text-2xl font-black">{notificacoes.length}</div>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
            <div className="text-sm text-slate-400">Não lidas</div>
            <div className="mt-2 text-2xl font-black">{naoLidas}</div>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
            <div className="text-sm text-slate-400">Tempo real</div>
            <div className="mt-2 text-2xl font-black">Ativo</div>
          </div>
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