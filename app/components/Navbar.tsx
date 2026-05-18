"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [usuario, setUsuario] = useState<any>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoesAberto, setNotificacoesAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (user) {
      const parsed = JSON.parse(user);
      setUsuario(parsed);
      carregarNotificacoes(parsed.id);
      iniciarRealtime(parsed.id);
    }
  }, []);

  async function carregarNotificacoes(usuarioId: string) {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Erro ao carregar notificações:", error);
      return;
    }

    setNotificacoes(data || []);
  }

  function iniciarRealtime(usuarioId: string) {
    const channel = supabase
      .channel(`notificacoes-navbar-${usuarioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${usuarioId}`,
        },
        () => {
          carregarNotificacoes(usuarioId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function marcarComoLida(id: string, link?: string) {
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id);

    if (usuario?.id) {
      await carregarNotificacoes(usuario.id);
    }

    setNotificacoesAberto(false);
    setMenuAberto(false);

    if (link) {
      window.location.href = link;
    }
  }

  async function marcarTodasComoLidas() {
    if (!usuario?.id) return;

    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("usuario_id", usuario.id)
      .eq("lida", false);

    await carregarNotificacoes(usuario.id);
  }

  function sair() {
    localStorage.removeItem("freelabrasil_usuario");
    window.location.href = "/";
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/95 backdrop-blur text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo-freellabrasil.png"
            alt="FreellaBrasil"
            className="h-8 md:h-10"
          />
        </Link>

        {/* MENU */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/projetos" className="hover:text-emerald-400">
            Buscar projetos
          </Link>

          <Link href="/freelancers" className="hover:text-emerald-400">
            Freelancers
          </Link>

          <Link href="/planos" className="hover:text-purple-400">
            Planos
          </Link>
        </nav>

        {!usuario ? (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/5"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950"
            >
              Cadastrar
            </Link>
          </div>
        ) : (
          <div className="relative flex items-center gap-4">
            {/* NOTIFICAÇÕES */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificacoesAberto(!notificacoesAberto);
                  setMenuAberto(false);
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl hover:bg-white/10"
              >
                🔔

                {naoLidas > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
                    {naoLidas > 9 ? "9+" : naoLidas}
                  </span>
                )}
              </button>

              {notificacoesAberto && (
                <div className="absolute right-0 top-14 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <div>
                      <h3 className="font-black">Notificações</h3>

                      <p className="text-xs text-slate-400">
                        {naoLidas} não lida{naoLidas !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {naoLidas > 0 && (
                      <button
                        onClick={marcarTodasComoLidas}
                        className="text-xs font-bold text-emerald-300 hover:underline"
                      >
                        Marcar todas
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {notificacoes.length === 0 && (
                      <div className="p-5 text-sm text-slate-400">
                        Nenhuma notificação ainda.
                      </div>
                    )}

                    {notificacoes.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => marcarComoLida(n.id, n.link)}
                        className={`block w-full border-b border-white/5 p-4 text-left hover:bg-white/5 ${
                          !n.lida ? "bg-emerald-400/5" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <span
                            className={`mt-1 h-2 w-2 rounded-full ${
                              !n.lida ? "bg-emerald-400" : "bg-slate-600"
                            }`}
                          />

                          <div>
                            <p className="font-bold text-white">
                              {n.titulo || "Notificação"}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-400">
                              {n.descricao || ""}
                            </p>

                            {n.created_at && (
                              <p className="mt-2 text-xs text-slate-500">
                                {new Date(n.created_at).toLocaleString("pt-BR")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Link
                    href="/notificacoes"
                    onClick={() => setNotificacoesAberto(false)}
                    className="block border-t border-white/10 p-4 text-center text-sm font-bold text-emerald-300 hover:bg-white/5"
                  >
                    Ver todas
                  </Link>
                </div>
              )}
            </div>

            {/* MENU USUÁRIO */}
            <button
              onClick={() => {
                setMenuAberto(!menuAberto);
                setNotificacoesAberto(false);
              }}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">
                {usuario.nome?.charAt(0)?.toUpperCase()}
              </div>

              <span className="hidden md:block text-sm font-bold">
                {usuario.nome}
              </span>
            </button>

            {menuAberto && (
              <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                <div className="flex flex-col p-2 text-sm">
                  <Link
                    href="/perfil"
                    onClick={() => setMenuAberto(false)}
                    className="px-4 py-3 hover:bg-white/5"
                  >
                    Meu Perfil
                  </Link>

                  {usuario.tipo_usuario === "freelancer" && (
                    <>
                      <Link
                        href="/meus-projetos"
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-3 hover:bg-white/5"
                      >
                        Meus projetos
                      </Link>

                      <Link
                        href="/convites"
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-3 hover:bg-white/5"
                      >
                        Meus convites
                      </Link>

                      <Link
                        href="/saques"
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-3 hover:bg-white/5"
                      >
                        Saques
                      </Link>
                    </>
                  )}

                  {usuario.tipo_usuario === "contratante" && (
                    <Link
                      href="/propostas-recebidas"
                      onClick={() => setMenuAberto(false)}
                      className="px-4 py-3 hover:bg-white/5"
                    >
                      Propostas recebidas
                    </Link>
                  )}

                  <Link
                    href="/dashboard-financeiro"
                    onClick={() => setMenuAberto(false)}
                    className="px-4 py-3 hover:bg-white/5"
                  >
                    Financeiro
                  </Link>

                  {usuario.role === "admin" && (
                    <>
                      <div className="my-2 border-t border-white/10" />

                      <Link
                        href="/admin"
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-3 font-bold text-emerald-300 hover:bg-white/5"
                      >
                        Admin
                      </Link>

                      <Link
                        href="/admin/denuncias"
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-3 hover:bg-white/5"
                      >
                        Denúncias
                      </Link>

                      <Link
                        href="/admin/saques"
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-3 hover:bg-white/5"
                      >
                        Saques admin
                      </Link>
                    </>
                  )}

                  <button
                    onClick={sair}
                    className="mt-2 px-4 py-3 text-left text-red-300 hover:bg-red-500/10"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}