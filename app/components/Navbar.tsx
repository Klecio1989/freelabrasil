"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [usuario, setUsuario] = useState<any>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);

  useEffect(() => {
    carregarUsuario();

    window.addEventListener("storage", carregarUsuario);
    window.addEventListener("focus", carregarUsuario);

    return () => {
      window.removeEventListener("storage", carregarUsuario);
      window.removeEventListener("focus", carregarUsuario);
    };
  }, []);

  function carregarUsuario() {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (!user) {
      setUsuario(null);
      return;
    }

    const parsed = JSON.parse(user);
    setUsuario(parsed);

    if (parsed.tipo_usuario === "freelancer") {
      carregarSaldo(parsed.id);
    }
  }

  async function carregarSaldo(freelaId: string) {
    const { data: pagamentos } = await supabase
      .from("pagamentos")
      .select("valor_freelancer")
      .eq("freela_id", freelaId)
      .eq("status", "liberado");

    const { data: saques } = await supabase
      .from("saques")
      .select("valor,status")
      .eq("freela_id", freelaId);

    const totalLiberado = (pagamentos || []).reduce(
      (acc: number, item: any) => acc + Number(item.valor_freelancer || 0),
      0
    );

    const totalSacado = (saques || [])
      .filter((s: any) => s.status === "solicitado" || s.status === "pago")
      .reduce((acc: number, item: any) => acc + Number(item.valor || 0), 0);

    setSaldoDisponivel(totalLiberado - totalSacado);
  }

  function sair() {
    localStorage.removeItem("freelabrasil_usuario");
    setUsuario(null);
    window.location.href = "/";
  }

  function painelUsuario() {
    if (usuario?.tipo_usuario === "freelancer") return "/painel-freelancer";
    if (usuario?.tipo_usuario === "contratante") return "/painel-contratante";
    return "/";
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") return "👑 PRO";
    if (plano === "plus") return "💎 PLUS";
    return "GRATUITO";
  }

  function iniciais(nome?: string) {
    if (!nome) return "U";

    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/95 backdrop-blur text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tight">
            Freella<span className="text-emerald-400">Brasil</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/projetos" className="hover:text-emerald-400">
              Buscar projetos
            </Link>

            <Link href="/freelancers" className="hover:text-emerald-400">
              Freelancers
            </Link>

            {usuario?.tipo_usuario === "freelancer" && (
              <>
                <Link href="/meus-trabalhos" className="hover:text-emerald-400">
                  Meus Trabalhos
                </Link>

                <Link href="/saques" className="hover:text-emerald-400">
                  Saques
                </Link>
              </>
            )}

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

            {usuario && (
              <Link
                href="/dashboard-financeiro"
                className="hover:text-yellow-400"
              >
                Financeiro
              </Link>
            )}

            <Link href="/planos" className="hover:text-purple-400">
              Planos
            </Link>
          </nav>
        </div>

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
            {usuario.tipo_usuario === "freelancer" && (
              <Link
                href="/saques"
                className="hidden rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-400/20 md:block"
              >
                Saldo {formatar(saldoDisponivel)}
              </Link>
            )}

            <Link
              href="/notificacoes"
              className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/5 md:block"
            >
              🔔
            </Link>

            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-emerald-400 text-sm font-black text-slate-950">
                {usuario.foto_url ? (
                  <img
                    src={usuario.foto_url}
                    alt={usuario.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  iniciais(usuario.nome)
                )}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-bold leading-4">{usuario.nome}</p>
                <p className="text-xs text-slate-400">
                  {badgePlano(usuario.plano)}
                </p>
              </div>

              <span className="text-slate-400">▾</span>
            </button>

            {menuAberto && (
              <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                <div className="border-b border-white/10 p-4">
                  <p className="font-black">{usuario.nome}</p>
                  <p className="text-sm text-slate-400">{usuario.email}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                      {badgePlano(usuario.plano)}
                    </p>

                    {usuario.tipo_usuario === "freelancer" && (
                      <p className="inline-block rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        Saldo {formatar(saldoDisponivel)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col p-2 text-sm">
                  <Link
                    href={painelUsuario()}
                    onClick={() => setMenuAberto(false)}
                    className="rounded-xl px-4 py-3 hover:bg-white/5"
                  >
                    Painel
                  </Link>

                  {usuario.tipo_usuario === "freelancer" && (
                    <>
                      <Link
                        href="/meus-trabalhos"
                        onClick={() => setMenuAberto(false)}
                        className="rounded-xl px-4 py-3 hover:bg-white/5"
                      >
                        Meus Trabalhos
                      </Link>

                      <Link
                        href="/saques"
                        onClick={() => setMenuAberto(false)}
                        className="rounded-xl px-4 py-3 text-emerald-300 hover:bg-emerald-400/10"
                      >
                        Saques / Saldo
                      </Link>
                    </>
                  )}

                  {usuario.tipo_usuario === "contratante" && (
                    <Link
                      href="/meus-projetos"
                      onClick={() => setMenuAberto(false)}
                      className="rounded-xl px-4 py-3 hover:bg-white/5"
                    >
                      Meus Projetos
                    </Link>
                  )}

                  <Link
                    href="/dashboard-financeiro"
                    onClick={() => setMenuAberto(false)}
                    className="rounded-xl px-4 py-3 hover:bg-white/5"
                  >
                    Financeiro
                  </Link>

                  <Link
                    href="/notificacoes"
                    onClick={() => setMenuAberto(false)}
                    className="rounded-xl px-4 py-3 hover:bg-white/5"
                  >
                    Notificações
                  </Link>

                  <Link
                    href="/perfil"
                    onClick={() => setMenuAberto(false)}
                    className="rounded-xl px-4 py-3 hover:bg-white/5"
                  >
                    Meu Perfil
                  </Link>

                  <Link
                    href="/planos"
                    onClick={() => setMenuAberto(false)}
                    className="rounded-xl px-4 py-3 text-purple-300 hover:bg-purple-500/10"
                  >
                    Alterar Plano
                  </Link>

                  <button
                    onClick={sair}
                    className="mt-2 rounded-xl px-4 py-3 text-left font-bold text-red-300 hover:bg-red-500/10"
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