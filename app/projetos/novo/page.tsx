"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function NovoProjetoPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [area, setArea] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [prazo, setPrazo] = useState("");

  async function criarProjeto() {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      alert("Você precisa estar logado.");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    const { error } = await supabase.from("projetos").insert([
      {
        contratante_id: usuario.id,
        titulo,
        descricao,
        area,
        orcamento,
        prazo: Number(prazo),
      },
    ]);

    if (error) {
      alert("Erro ao criar projeto");
      return;
    }

    alert("Projeto criado com sucesso!");
    router.push("/projetos");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        Publicar novo projeto
      </h1>

      <div className="grid gap-4 max-w-xl">

        <input
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="p-3 rounded bg-slate-900"
        />

        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="p-3 rounded bg-slate-900"
        />

        <input
          placeholder="Área"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="p-3 rounded bg-slate-900"
        />

        <input
          placeholder="Orçamento"
          value={orcamento}
          onChange={(e) => setOrcamento(e.target.value)}
          className="p-3 rounded bg-slate-900"
        />

        <input
          placeholder="Prazo em dias"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          className="p-3 rounded bg-slate-900"
        />

        <button
          onClick={criarProjeto}
          className="bg-emerald-400 text-black p-3 rounded font-bold"
        >
          Publicar projeto
        </button>

      </div>

    </main>
  );
}