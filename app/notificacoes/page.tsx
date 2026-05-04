"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NotificacoesPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", parsed.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setNotificacoes([]);
    } else {
      setNotificacoes(data || []);
    }

    setLoading(false);
  }

  async function marcarComoLida(id: string) {
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);

    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  async function marcarTodasComoLidas() {
    if (!usuario) return;

    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("usuario_id", usuario.id);

    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  function linkNotificacao(n: any) {
    if (
      String(n.titulo || "").toLowerCase().includes("avaliação") ||
      String(n.descricao || "").toLowerCase().includes("avaliou")
    ) {
      return "/minhas-avaliacoes";
    }

    return n.link || "/notificacoes";
  }

  function voltarPainel() {
    if (usuario?.tipo_usuario === "freelancer") return "/painel-freelancer";
    if (usuario?.tipo_usuario === "contratante") return "/painel-contratante";
    return "/";
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando...
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Você precisa estar logado.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Notificações</h1>
            <p className="mt-3 text-slate-400">
              Acompanhe atualizações da plataforma em tempo real
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={marcarTodasComoLidas}
              className="rounded-xl bg-white px-5 py-3 font-bold text-black"
            >
              Marcar todas como lidas
            </button>

            <Link
              href={voltarPainel()}
              className="rounded-xl border border-white/20 px-5 py-3 font-bold"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card titulo="Total" valor={String(notificacoes.length)} />
          <Card titulo="Não lidas" valor={String(naoLidas)} />
          <Card titulo="Tempo real" valor="Ativo" destaque />
        </div>

        {notificacoes.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            Nenhuma notificação encontrada.
          </div>
        )}

        <div className="grid gap-5">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className={`rounded-3xl border p-6 ${
                n.lida
                  ? "border-white/10 bg-slate-900"
                  : "border-emerald-400/30 bg-emerald-400/10"
              }`}
            >
              <h2 className="text-2xl font-black">
                {n.titulo || "Notificação"}
              </h2>

              <p className="mt-4 text-slate-200">{n.descricao}</p>

              {n.created_at && (
                <p className="mt-4 text-sm text-slate-500">
                  {new Date(n.created_at).toLocaleString("pt-BR")}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Link
                  href={linkNotificacao(n)}
                  onClick={() => marcarComoLida(n.id)}
                  className="rounded-xl border border-white/20 px-5 py-3 font-bold"
                >
                  Abrir
                </Link>

                {!n.lida && (
                  <button
                    onClick={() => marcarComoLida(n.id)}
                    className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-black"
                  >
                    Marcar como lida
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

function Card({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque
          ? "border-emerald-400/30 bg-emerald-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-2xl font-black">{valor}</p>
    </div>
  );
}