"use client";

import Link from "next/link";

export default function PainelFreelancer() {
  return (
    <main style={container}>
      <h1 style={titulo}>Painel do Freelancer</h1>

      <p style={subtitulo}>
        Gerencie seus projetos, propostas e acompanhe seus trabalhos.
      </p>

      <div style={grid}>
        <Link href="/minhas-propostas" style={card}>
          <h2>Minhas propostas</h2>

          <p>
            Visualize todas as propostas enviadas para contratantes.
          </p>
        </Link>

        <Link href="/meus-projetos" style={card}>
          <h2>Meus projetos</h2>

          <p>
            Acompanhe os projetos que você aceitou e está trabalhando.
          </p>
        </Link>

        <Link href="/minhas-avaliacoes" style={card}>
          <h2>Minhas avaliações</h2>

          <p>
            Veja as avaliações recebidas no seu perfil.
          </p>
        </Link>

        <Link href="/perfil" style={card}>
          <h2>Meu perfil</h2>

          <p>
            Atualize suas informações e portfólio.
          </p>
        </Link>
      </div>
    </main>
  );
}

const container = {
  padding: 30,
  maxWidth: 1200,
  margin: "0 auto",
};

const titulo = {
  fontSize: 34,
  fontWeight: "bold",
  marginBottom: 10,
};

const subtitulo = {
  color: "#6b7280",
  marginBottom: 30,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
};

const card = {
  display: "block",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 24,
  textDecoration: "none",
  color: "#111827",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  transition: "0.2s",
};