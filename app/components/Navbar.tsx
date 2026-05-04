"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("freelabrasil_usuario");
    if (user) {
      setUsuario(JSON.parse(user));
    }
  }, []);

  function sair() {
    localStorage.removeItem("freelabrasil_usuario");
    window.location.href = "/";
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") return "👑";
    if (plano === "plus") return "💎";
    return "";
  }

  return (
    <header className="w-full border-b border-white/10 bg-slate-950 text-white px-6 py-4 flex justify-between items-center">
      
      {/* LOGO */}
      <Link href="/" className="font-black text-xl">
        FreelaBrasil
      </Link>

      {/* MENU */}
      <div className="flex items-center gap-6 text-sm">

        {/* FREELA */}
        {usuario?.tipo_usuario === "freelancer" && (
          <>
            <Link href="/meus-trabalhos" className="hover:text-emerald-400">
              Meus Trabalhos
            </Link>

            <Link href="/projetos" className="hover:text-emerald-400">
              Buscar Projetos
            </Link>
          </>
        )}

        {/* CONTRATANTE */}
        {usuario?.tipo_usuario === "contratante" && (
          <>
            <Link href="/meus-projetos" className="hover:text-emerald-400">
              Meus Projetos
            </Link>

            <Link href="/projetos/novo" className="hover:text-emerald-400">
              Criar Projeto
            </Link>
          </>
        )}

        {/* GERAL */}
        <Link href="/freelancers" className="hover:text-emerald-400">
          Freelancers
        </Link>

        <Link href="/planos" className="hover:text-emerald-400">
          Planos
        </Link>

        <Link href="/perfil" className="hover:text-emerald-400">
          Perfil
        </Link>

        {/* USUÁRIO */}
        {usuario && (
          <div className="flex items-center gap-3 ml-4">

            <span className="text-xs text-slate-400">
              {usuario.nome} {badgePlano(usuario.plano)}
            </span>

            <button
              onClick={sair}
              className="bg-red-500 px-4 py-2 rounded-lg font-bold"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}