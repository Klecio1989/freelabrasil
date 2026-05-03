"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProjetosConfirmar() {
  const [usuario, setUsuario] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      setLoading(false);
      return;
    }

    setUsuario(data.user);
    carregarProjetos(data.user.id);
  }

  async function carregarProjetos(userId) {
    setLoading(true);

    const { data, error } = await supabase
      .from("projetos_andamento")
      .select(`
        id,
        status,
        data_inicio,
        data_finalizacao,
        projeto_id,
        projetos (
          titulo,
          descricao,
          orcamento,
          prazo
        )
      `)
      .eq("contratante_id", userId)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar projetos");
    } else {
      setProjetos(data || []);
    }

    setLoading(false);
  }

  async function confirmarConclusao(id) {
    const confirmar = confirm("Confirma que o projeto foi concluído?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("projetos_andamento")
      .update({
        status: "concluido",
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao confirmar conclusão");
      return;
    }

    alert("Projeto concluído com sucesso!");
    carregarProjetos(usuario.id);
  }

  function traduzirStatus(status) {
    if (status === "em_andamento") return "Em andamento";
    if (status === "finalizado_freela") return "Aguardando sua confirmação";
    if (status === "concluido") return "Concluído";
    return status;
  }

  if (loading) {
    return <p style={{ padding: 30 }}>Carregando projetos...</p>;
  }

  if (!usuario) {
    return <p style={{ padding: 30 }}>Você precisa estar logado.</p>;
  }

  return (
    <main style={{ padding: 30, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Projetos para confirmar</h1>
      <p>Confirme os projetos finalizados pelos freelancers.</p>

      {projetos.length === 0 && (
        <div style={card}>
          <p>Você ainda não possui projetos para acompanhar.</p>
        </div>
      )}

      {projetos.map((item) => (
        <div key={item.id} style={card}>
          <h2>{item.projetos?.titulo || "Projeto sem título"}</h2>

          <p>{item.projetos?.descricao}</p>

          <p>
            <strong>Status:</strong> {traduzirStatus(item.status)}
          </p>

          {item.projetos?.orcamento && (
            <p>
              <strong>Orçamento:</strong> R$ {item.projetos.orcamento}
            </p>
          )}

          {item.projetos?.prazo && (
            <p>
              <strong>Prazo:</strong> {item.projetos.prazo}
            </p>
          )}

          {item.status === "finalizado_freela" && (
            <button style={button} onClick={() => confirmarConclusao(item.id)}>
              Confirmar conclusão
            </button>
          )}

          {item.status === "em_andamento" && (
            <p style={{ color: "#2563eb", fontWeight: "bold" }}>
              Projeto ainda em andamento com o freelancer.
            </p>
          )}

          {item.status === "concluido" && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              Projeto concluído.
            </p>
          )}
        </div>
      ))}
    </main>
  );
}

const card = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 20,
  marginTop: 20,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const button = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  marginTop: 10,
};