"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Bell } from "lucide-react";

export default function Header() {
  const [usuario, setUsuario] = useState<any>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) return;

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);
    carregarNaoLidas(parsed.id);

    const channel = supabase
      .channel(`notificacoes-header-${parsed.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${parsed.id}`,
        },
        () => {
          carregarNaoLidas(parsed.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function carregarNaoLidas(usuarioId: string) {
    const { count, error } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", usuarioId)
      .eq("lida", false);

    if (!error) {
      setNaoLidas(count || 0);
    }
  }

  function sair() {
    localStorage.removeItem("freelabrasil_usuario");
    window.location.href = "/login";
  }

  function LinkItem({
    href,
    label,
    onClick,
  }: {
    href: string;
    label: string;
    onClick?: () => void;
  }) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
      >
        {label}
      </Link>
    );
  }

  function SinoNotificacao({ onClick }: { onClick?: () => void }) {
    return (
      <Link
        href="/notificacoes"
        onClick={onClick}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        title="Notificações"
      >
        <Bell size={22} />

        {naoLidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight text-white">
          FreelaBrasil
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <LinkItem href="/projetos" label="Projetos" />
          <LinkItem href="/freelancers" label="Freelancers" />

          {usuario?.tipo_usuario === "freelancer" && (
            <>
              <LinkItem href="/dashboard" label="Dashboard" />
              <LinkItem href="/minhas-propostas" label="Propostas" />
              <LinkItem href="/convites" label="Convites" />
            </>
          )}

          {usuario?.tipo_usuario === "contratante" && (
            <>
              <LinkItem href="/dashboard" label="Dashboard" />
              <LinkItem href="/projetos/novo" label="Novo projeto" />
              <LinkItem href="/propostas-recebidas" label="Propostas" />
              <LinkItem href="/favoritos" label="Favoritos" />
            </>
          )}

          {usuario && (
            <>
              <SinoNotificacao />
              <LinkItem href="/perfil" label="Perfil" />
              <LinkItem href="/planos" label="Planos" />
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {usuario ? (
            <>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                <div className="text-xs text-slate-400">Logado como</div>
                <div className="text-sm font-semibold text-white">
                  {usuario.nome}
                </div>
              </div>

              <button
                onClick={sair}
                className="rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-400/10"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                Login
              </Link>

              <Link
                href="/cadastro"
                className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white lg:hidden"
        >
          Menu
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-white/10 bg-slate-950 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4">
            <LinkItem href="/projetos" label="Projetos" onClick={() => setMenuAberto(false)} />
            <LinkItem href="/freelancers" label="Freelancers" onClick={() => setMenuAberto(false)} />

            {usuario?.tipo_usuario === "freelancer" && (
              <>
                <LinkItem href="/dashboard" label="Dashboard" onClick={() => setMenuAberto(false)} />
                <LinkItem href="/minhas-propostas" label="Propostas" onClick={() => setMenuAberto(false)} />
                <LinkItem href="/convites" label="Convites" onClick={() => setMenuAberto(false)} />
              </>
            )}

            {usuario?.tipo_usuario === "contratante" && (
              <>
                <LinkItem href="/dashboard" label="Dashboard" onClick={() => setMenuAberto(false)} />
                <LinkItem href="/projetos/novo" label="Novo projeto" onClick={() => setMenuAberto(false)} />
                <LinkItem href="/propostas-recebidas" label="Propostas" onClick={() => setMenuAberto(false)} />
                <LinkItem href="/favoritos" label="Favoritos" onClick={() => setMenuAberto(false)} />
              </>
            )}

            {usuario && (
              <>
                <div className="px-4 py-2">
                  <SinoNotificacao onClick={() => setMenuAberto(false)} />
                </div>

                <LinkItem href="/perfil" label="Perfil" onClick={() => setMenuAberto(false)} />
                <LinkItem href="/planos" label="Planos" onClick={() => setMenuAberto(false)} />

                <button
                  onClick={sair}
                  className="rounded-lg border border-red-400/30 px-4 py-2 text-left text-sm font-medium text-red-300 hover:bg-red-400/10"
                >
                  Sair
                </button>
              </>
            )}

            {!usuario && (
              <>
                <LinkItem href="/login" label="Login" onClick={() => setMenuAberto(false)} />
                <LinkItem href="/cadastro" label="Criar conta" onClick={() => setMenuAberto(false)} />
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}