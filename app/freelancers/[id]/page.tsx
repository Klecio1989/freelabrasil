"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function PerfilFreelancer() {
  const { id } = useParams();

  const [freelancer, setFreelancer] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [media, setMedia] = useState(0);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  async function carregarDados() {
    // freelancer
    const { data: user } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    setFreelancer(user);

    // avaliações
    const { data: avals } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("avaliado_id", id)
      .order("created_at", { ascending: false });

    if (avals) {
      setAvaliacoes(avals);

      const mediaCalc =
        avals.reduce((acc, item) => acc + item.nota, 0) /
        (avals.length || 1);

      setMedia(mediaCalc);
    }
  }

  function renderStars(nota: number) {
    return (
      <div style={{ fontSize: 22, color: "#facc15" }}>
        {"★".repeat(Math.round(nota))}
        {"☆".repeat(5 - Math.round(nota))}
      </div>
    );
  }

  if (!freelancer) {
    return <p style={{ padding: 30 }}>Carregando...</p>;
  }

  return (
    <main style={container}>
      <div style={card}>
        <div style={top}>
          <div style={avatar}>
            {freelancer.foto_url ? (
              <img src={freelancer.foto_url} style={{ width: "100%" }} />
            ) : (
              <span>{freelancer.nome?.[0]}</span>
            )}
          </div>

          <div>
            <h1>{freelancer.nome}</h1>
            <p>{freelancer.cidade}</p>

            <div style={{ marginTop: 10 }}>
              {renderStars(media)}
              <span>
                {media.toFixed(1)} ({avaliacoes.length} avaliações)
              </span>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 20 }}>
          {freelancer.descricao || "Sem descrição"}
        </p>

        <div style={badges}>
          <span>{freelancer.habilidades}</span>
          <span>{freelancer.projetos_concluidos || 0} projetos</span>
        </div>
      </div>

      <div style={card}>
        <h2>Avaliações</h2>

        {avaliacoes.length === 0 && (
          <p>Nenhuma avaliação ainda.</p>
        )}

        {avaliacoes.map((a) => (
          <div key={a.id} style={avaliacaoCard}>
            {renderStars(a.nota)}
            <p>{a.comentario}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

const container = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 30,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
};

const top = {
  display: "flex",
  gap: 20,
  alignItems: "center",
};

const avatar = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  overflow: "hidden",
  background: "#ddd",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
};

const badges = {
  marginTop: 20,
  display: "flex",
  gap: 10,
};

const avaliacaoCard = {
  borderTop: "1px solid #eee",
  marginTop: 10,
  paddingTop: 10,
};