"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null);

  const [projetos, setProjetos] = useState(0);
  const [propostas, setPropostas] = useState(0);
  const [convites, setConvites] = useState(0);
  const [favoritos, setFavoritos] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (user) {
      const parsed = JSON.parse(user);
      setUsuario(parsed);
      carregarDados(parsed);
    }
  }, []);

  async function carregarDados(user: any) {
    if (user.tipo_usuario === "contratante") {
      const { data: projetosData } = await supabase
        .from("projetos")
        .select("id")
        .eq("contratante_id", user.id);

      const projetoIds = projetosData?.map((p: any) => p.id) || [];

      const { data: propostasData } = await supabase
        .from("propostas")
        .select("id")
        .in("projeto_id", projetoIds);

      const { data: favoritosData } = await supabase
        .from("favoritos")
        .select("id")
        .eq("contratante_id", user.id);

      const { data: convitesData } = await supabase
        .from("convites")
        .select("id")
        .eq("contratante_id", user.id);

      setProjetos(projetosData?.length || 0);
      setPropostas(propostasData?.length || 0);
      setFavoritos(favoritosData?.length || 0);
      setConvites(convitesData?.length || 0);
    }

    if (user.tipo_usuario === "freelancer") {
      const { data: propostasData } = await supabase
        .from("propostas")
        .select("id,status")
        .eq("freelancer_id", user.id);

      const { data: convitesData } = await supabase
        .from("convites")
        .select("id,status")
        .eq("freelancer_id", user.id);

      setPropostas(propostasData?.length || 0);
      setConvites(convitesData?.length || 0);
    }
  }

  function card(titulo: string, valor: number) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-slate-400">{titulo}</div>
        <div className="mt-2 text-3xl font-black">{valor}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-black">Dashboard</h1>
          <p className="text-slate-400 mt-3">
            Visão geral da sua conta e performance na plataforma
          </p>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {card("Projetos", projetos)}
          {card("Propostas", propostas)}
          {card("Convites", convites)}
          {card("Favoritos", favoritos)}
        </div>

        {/* Ações rápidas */}
        <div className="grid md:grid-cols-2 gap-6">
          {usuario?.tipo_usuario === "contratante" && (
            <>
              <Link href="/projetos/novo" className="btn">
                Criar projeto
              </Link>

              <Link href="/propostas-recebidas" className="btn">
                Ver propostas recebidas
              </Link>

              <Link href="/freelancers" className="btn">
                Buscar freelancers
              </Link>

              <Link href="/favoritos" className="btn">
                Meus favoritos
              </Link>
            </>
          )}

          {usuario?.tipo_usuario === "freelancer" && (
            <>
              <Link href="/projetos" className="btn">
                Buscar projetos
              </Link>

              <Link href="/minhas-propostas" className="btn">
                Minhas propostas
              </Link>

              <Link href="/convites" className="btn">
                Convites recebidos
              </Link>

              <Link href="/perfil" className="btn">
                Editar perfil
              </Link>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .btn {
          display: block;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          font-weight: bold;
          transition: 0.2s;
        }

        .btn:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </main>
  );
}