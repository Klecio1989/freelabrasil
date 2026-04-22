"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Freelancer = {
  id: string;
  nome: string;
  cidade?: string;
  foto_url?: string;
  descricao?: string;
  habilidades?: string;
  plano?: string;
  nota_media?: number;
  projetos_concluidos?: number;
};

export default function FavoritosPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);
      carregarFavoritos(parsed.id);
    }
  }, []);

  async function carregarFavoritos(contratanteId: string) {
    const { data: favoritos } = await supabase
      .from("favoritos")
      .select("freelancer_id")
      .eq("contratante_id", contratanteId);

    if (!favoritos || favoritos.length === 0) {
      setFreelancers([]);
      return;
    }

    const ids = favoritos.map((f: any) => f.freelancer_id);

    const { data: usuarios } = await supabase
      .from("usuarios")
      .select("id,nome,cidade,foto_url,descricao,habilidades,plano,nota_media,projetos_concluidos")
      .in("id", ids);

    if (usuarios) setFreelancers(usuarios as Freelancer[]);
  }

  async function removerFavorito(freelancerId: string) {
    if (!usuario) return;

    await supabase
      .from("favoritos")
      .delete()
      .eq("contratante_id", usuario.id)
      .eq("freelancer_id", freelancerId);

    setFreelancers((prev) => prev.filter((f) => f.id !== freelancerId));
  }

  function badgePlano(plano?: string) {
    if (plano === "pro") {
      return <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">PRO</span>;
    }

    if (plano === "plus") {
      return <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">PLUS</span>;
    }

    return <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">GRATUITO</span>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Freelancers Favoritos</h1>
            <p className="text-slate-400 mt-2">
              Seus profissionais salvos
            </p>
          </div>

          <Link
            href="/freelancers"
            className="border border-white/20 px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        <div className="grid gap-6">
          {freelancers.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border border-white/10 bg-slate-900 p-6"
            >
              <div className="grid lg:grid-cols-[100px_1fr_auto] gap-6 items-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                    {f.foto_url ? (
                      <img
                        src={f.foto_url}
                        alt={f.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold">
                        {f.nome?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{f.nome}</h2>
                    {badgePlano(f.plano)}
                  </div>

                  <p className="text-slate-400 mt-2">{f.cidade || "-"}</p>

                  <div className="flex flex-wrap gap-6 mt-4 text-sm">
                    <span className="text-yellow-400 font-bold">
                      ⭐ {Number(f.nota_media || 0).toFixed(1)}
                    </span>

                    <span className="text-slate-300">
                      {f.projetos_concluidos || 0} projetos concluídos
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href={`/freelancer/${f.id}`}
                    className="inline-block bg-emerald-400 text-black px-5 py-3 rounded-lg font-bold text-center"
                  >
                    Ver perfil
                  </Link>

                  <button
                    onClick={() => removerFavorito(f.id)}
                    className="bg-red-500 text-white px-5 py-3 rounded-lg font-bold"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}

          {freelancers.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center text-slate-400">
              Nenhum freelancer favoritado ainda.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}