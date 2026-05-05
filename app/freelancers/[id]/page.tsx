"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjetoPage() {
  const { id } = useParams();

  const [projeto, setProjeto] = useState<any>(null);
  const [freelas, setFreelas] = useState<any[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data: proj } = await supabase
      .from("projetos")
      .select("*")
      .eq("id", id)
      .single();

    setProjeto(proj);

    const { data: lista } = await supabase
      .from("ranking_freelancers")
      .select("*");

    if (proj && lista) {
      const sugeridos = calcularMatch(proj, lista);
      setFreelas(sugeridos);
    }
  }

  function calcularMatch(projeto: any, lista: any[]) {
    const textoProjeto = `
      ${projeto.titulo || ""}
      ${projeto.descricao || ""}
      ${projeto.categoria || ""}
    `.toLowerCase();

    return lista
      .map((f) => {
        const habilidades = (f.habilidades || "").toLowerCase();

        let score = 0;

        const palavrasProjeto = textoProjeto.split(" ");

        palavrasProjeto.forEach((p) => {
          if (habilidades.includes(p)) {
            score += 2;
          }
        });

        score += Number(f.media || 0);

        if (f.boost_ativo) score += 5;

        return {
          ...f,
          score,
        };
      })
      .filter((f) => f.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  if (!projeto) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando projeto...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-black">{projeto.titulo}</h1>

        <p className="mt-4 text-slate-300">{projeto.descricao}</p>

        {/* MATCH */}
        <h2 className="text-2xl font-bold mt-10 mb-4">
          Freelancers recomendados 🧠
        </h2>

        <div className="grid gap-4">
          {freelas.map((f) => (
            <Link key={f.id} href={`/freelancer/${f.id}`}>
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 cursor-pointer">
                <h3 className="font-bold">{f.nome}</h3>

                <p className="text-yellow-300">
                  ⭐ {Number(f.media).toFixed(1)}
                </p>

                <p className="text-sm text-slate-400">
                  {f.habilidades}
                </p>

                <p className="text-xs text-emerald-300 mt-2">
                  Match score: {f.score}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}