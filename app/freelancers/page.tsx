"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const tagsPadrao = [
  "Power BI",
  "Excel",
  "Python",
  "Administração & Contabilidade",
  "Dashboard",
  "Adobe",
  "Photoshop",
  "Consultoria",
  "Aulas práticas",
  "Web",
  "Mobile & Software",
  "Fotografia & Audiovisual",
];

export default function FreelancersPage() {
  const [freelas, setFreelas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    carregar();
    carregarUsuario();
  }, []);

  function carregarUsuario() {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (user) {
      setUsuario(JSON.parse(user));
    }
  }

  async function carregar() {
    const { data, error } = await supabase
      .from("ranking_freelancers")
      .select("*");

    if (error) {
      console.error(error);
      alert("Erro ao carregar freelancers.");
      return;
    }

    const ordenados = (data || []).sort((a: any, b: any) => {
      const boostA = boostValido(a) ? 1 : 0;
      const boostB = boostValido(b) ? 1 : 0;

      if (boostA !== boostB) return boostB - boostA;

      const pesoA = Number(a.boost_peso || 0);
      const pesoB = Number(b.boost_peso || 0);

      if (pesoA !== pesoB) return pesoB - pesoA;

      return Number(b.media || 0) - Number(a.media || 0);
    });

    setFreelas(ordenados);
  }

  function boostValido(f: any) {
    if (!f.boost_ativo) return false;
    if (!f.boost_fim) return true;

    return new Date(f.boost_fim) >= new Date();
  }

  const filtrados = useMemo(() => {
    const palavras = busca
      .toLowerCase()
      .split(" ")
      .map((p) => p.trim())
      .filter(Boolean);

    return freelas.filter((f) => {
      const texto = `
        ${f.nome || ""}
        ${f.email || ""}
        ${f.habilidades || ""}
        ${f.descricao || ""}
        ${f.cidade || ""}
      `.toLowerCase();

      return palavras.length
        ? palavras.every((palavra) => texto.includes(palavra))
        : true;
    });
  }, [freelas, busca]);

  function badgePlano(plano?: string) {
    if (plano === "pro") return "👑 PRO";
    if (plano === "plus") return "💎 PLUS";
    return "GRATUITO";
  }

  function corPlano(plano?: string, boost?: boolean) {
    if (boost) return "border-yellow-400/50 bg-yellow-400/10";
    if (plano === "pro") return "border-purple-400/40 bg-purple-400/10";
    if (plano === "plus") return "border-cyan-400/40 bg-cyan-400/10";
    return "border-white/10 bg-white/5";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-4xl font-black">
            Encontre freelancers ⭐
          </h1>

          <p className="mt-3 text-slate-400">
            Busque profissionais por habilidade, ferramenta, área ou palavra-chave.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-3 md:flex-row">

            <input
              placeholder="Ex: Power BI, Excel, Python, Photoshop..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <button
              onClick={() => setBusca("")}
              className="rounded-xl border border-white/20 px-5 py-3 font-bold hover:bg-white/5"
            >
              Limpar
            </button>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tagsPadrao.map((tag) => (
              <button
                key={tag}
                onClick={() => setBusca(tag)}
                className="rounded-full border border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 text-sm text-slate-400">
          {filtrados.length} freelancer
          {filtrados.length !== 1 ? "s" : ""} encontrado
          {filtrados.length !== 1 ? "s" : ""}
        </div>

        <div className="grid gap-4">

          {filtrados.map((f) => {
            const destacado = boostValido(f);

            return (
              <div
                key={f.id}
                className={`rounded-2xl border p-5 transition hover:scale-[1.01] hover:bg-white/10 ${corPlano(
                  f.plano,
                  destacado
                )}`}
              >

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="flex items-start gap-4">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-2xl font-black text-slate-950">
                      {f.nome?.charAt(0)?.toUpperCase() || "F"}
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold">
                          {f.nome}
                        </h2>

                        {destacado && (
                          <span className="rounded-full border border-yellow-400/40 bg-yellow-400/20 px-3 py-1 text-xs font-black text-yellow-300">
                            🚀 Patrocinado
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-yellow-300">
                        ⭐ {Number(f.media || 0).toFixed(1)} (
                        {f.total_avaliacoes || 0} avaliações)
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        {f.cidade || "Localização não informada"}
                      </p>

                    </div>
                  </div>

                  <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-black">
                    {badgePlano(f.plano)}
                  </span>

                </div>

                <p className="mt-4 line-clamp-2 text-slate-300">
                  {f.descricao ||
                    "Freelancer ainda sem descrição cadastrada."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {(f.habilidades || "")
                    .split(",")
                    .slice(0, 6)
                    .map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300"
                      >
                        {skill.trim()}
                      </span>
                    ))}

                </div>

                <div className="mt-6 flex flex-wrap gap-3">

                  <Link
                    href={`/freelancer/${f.id}`}
                    className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
                  >
                    Ver perfil
                  </Link>

                  {usuario?.tipo_usuario === "contratante" && (
                    <Link
                      href={`/convites/novo?freela_id=${f.id}`}
                      className="rounded-xl border border-white/20 px-5 py-3 font-bold text-white hover:bg-white/5"
                    >
                      Convidar para projeto
                    </Link>
                  )}

                </div>

              </div>
            );
          })}

          {filtrados.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">

              <h2 className="text-2xl font-black">
                Nenhum freelancer encontrado
              </h2>

              <p className="mt-3 text-slate-400">
                Tente buscar por outra palavra-chave ou clique em uma das tags.
              </p>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}