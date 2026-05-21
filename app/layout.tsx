"use client";

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.freellabrasil.com.br"),

  title: {
    default: "FreellaBrasil | Marketplace de Freelancers",
    template: "%s | FreellaBrasil",
  },

  description:
    "Marketplace profissional de freelancers do Brasil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, setUsuario] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem(
      "freelabrasil_usuario"
    );

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  function sair() {
    localStorage.removeItem("freelabrasil_usuario");

    setUsuario(null);

    router.push("/");
  }

  const nomePrimeiro =
    usuario?.nome?.split(" ")[0] || "";

  const inicial =
    usuario?.nome?.charAt(0)?.toUpperCase() || "";

  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white">

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <Link
              href="/"
              className="flex items-center gap-4"
            >
              <div className="flex h-14 w-44 items-center justify-center rounded-md bg-white p-2">
                <img
                  src="/logo-freellabrasil.png"
                  alt="FreellaBrasil"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">

              <Link
                href="/projetos"
                className="font-bold text-slate-200 hover:text-white"
              >
                Projetos
              </Link>

              <Link
                href="/freelancers"
                className="font-bold text-slate-200 hover:text-white"
              >
                Freelancers
              </Link>

              <Link
                href="/planos"
                className="font-bold text-slate-200 hover:text-white"
              >
                Planos
              </Link>

            </nav>

            {!usuario ? (

              <div className="flex items-center gap-3">

                <Link
                  href="/login"
                  className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300"
                >
                  Entrar
                </Link>

                <Link
                  href="/cadastro"
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm font-black text-white hover:bg-white/10"
                >
                  Criar conta
                </Link>

              </div>

            ) : (

              <div className="flex items-center gap-3">

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">
                    {inicial}
                  </div>

                  <div className="hidden md:block">

                    <p className="text-xs text-slate-400">
                      Bem-vindo
                    </p>

                    <p className="font-bold text-white">
                      {nomePrimeiro}
                    </p>

                  </div>

                </div>

                <Link
                  href={
                    usuario.tipo_usuario === "freelancer"
                      ? "/protected/painel-freelancer"
                      : "/painel-contratante"
                  }
                  className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950"
                >
                  Painel
                </Link>

                <button
                  onClick={sair}
                  className="rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-black text-red-300"
                >
                  Sair
                </button>

              </div>

            )}

          </div>

        </header>

        {children}

        <footer className="border-t border-white/10 bg-slate-950">

          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-2xl font-black">
                <span className="text-white">
                  Freella
                </span>

                <span className="text-emerald-400">
                  Brasil
                </span>
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Marketplace profissional de freelancers do Brasil.
              </p>

            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">

              <Link href="/planos">
                Planos
              </Link>

              <Link href="/projetos">
                Projetos
              </Link>

              <Link href="/freelancers">
                Freelancers
              </Link>

            </div>

          </div>

        </footer>

      </body>
    </html>
  );
}