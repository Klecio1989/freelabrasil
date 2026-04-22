"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  function sair() {
    localStorage.removeItem("freelabrasil_usuario");
    window.location.href = "/login";
  }

  return (
    <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight text-white">
            FreelaBrasil
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-3">
          <Link
            href="/projetos"
            className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            Projetos
          </Link>

          <Link
            href="/freelancers"
            className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            Freelancers
          </Link>

          {usuario?.tipo_usuario === "freelancer" && (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Dashboard
              </Link>

              <Link
                href="/minhas-propostas"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Propostas
              </Link>

              <Link
                href="/convites"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Convites
              </Link>
            </>
          )}

          {usuario?.tipo_usuario === "contratante" && (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Dashboard
              </Link>

              <Link
                href="/projetos/novo"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Novo projeto
              </Link>

              <Link
                href="/propostas-recebidas"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Propostas
              </Link>

              <Link
                href="/favoritos"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Favoritos
              </Link>
            </>
          )}

          {usuario && (
            <>
              <Link
                href="/notificacoes"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Notificações
              </Link>

              <Link
                href="/perfil"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Perfil
              </Link>

              <Link
                href="/planos"
                className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Planos
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 px-4 py-2">
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
      </div>
    </header>
  );
}