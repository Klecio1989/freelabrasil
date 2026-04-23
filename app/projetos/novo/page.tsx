"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function NovoProjetoPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [area, setArea] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [prazo, setPrazo] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarUsuarioAtual() {
      const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

      if (!usuarioSalvo) {
        router.push("/login");
        return;
      }

      const parsed = JSON.parse(usuarioSalvo);

      if (parsed.tipo_usuario !== "contratante") {
        alert("Apenas contratantes podem publicar projetos.");
        router.push("/projetos");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", parsed.email)
        .maybeSingle();

      if (error || !data) {
        alert("Usuário não encontrado. Faça login novamente.");
        localStorage.removeItem("freelabrasil_usuario");
        router.push("/login");
        return;
      }

      localStorage.setItem("freelabrasil_usuario", JSON.stringify(data));
      setUsuario(data);
    }

    carregarUsuarioAtual();
  }, [router]);

  async function publicarProjeto() {
    if (!usuario?.id) {
      alert("Usuário não identificado. Faça login novamente.");
      return;
    }

    if (!titulo.trim() || !descricao.trim() || !area.trim() || !orcamento.trim() || !prazo.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    const prazoNumero = Number(String(prazo).replace(/\D/g, ""));

    if (!prazoNumero || prazoNumero <= 0) {
      alert("Informe um prazo válido em dias.");
      return;
    }

    try {
      setCarregando(true);

      const { data, error } = await supabase
        .from("projetos")
        .insert([
          {
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            area: area.trim(),
            orcamento: orcamento.trim(),
            prazo: prazoNumero,
            contratante_id: usuario.id,
          },
        ])
        .select();

      if (error) {
        console.error("ERRO SUPABASE:", error);
        alert(error.message || "Erro ao criar projeto");
        return;
      }

      const novoTotalProjetos = Number(usuario.projetos_publicados || 0) + 1;

      const { data: usuarioAtualizado, error: updateUserError } = await supabase
        .from("usuarios")
        .update({
          projetos_publicados: novoTotalProjetos,
        })
        .eq("id", usuario.id)
        .select()
        .single();

      if (!updateUserError && usuarioAtualizado) {
        localStorage.setItem("freelabrasil_usuario", JSON.stringify(usuarioAtualizado));
      }

      alert("Projeto criado com sucesso!");
      router.push("/projetos");
    } catch (error) {
      console.error("ERRO GERAL:", error);
      alert("Erro ao criar projeto");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Área do contratante
            </span>

            <h1 className="mt-4 text-5xl font-black leading-tight">
              Publicar novo projeto
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-300">
              Descreva sua necessidade com clareza para receber propostas melhores.
            </p>
          </div>

          <Link
            href="/painel-contratante"
            className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5"
          >
            Voltar
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Título do projeto
              </label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Projeto de planejamento"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o projeto, entregáveis e contexto"
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Área
              </label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Planejamento Logístico"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Orçamento
              </label>
              <input
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                placeholder="Ex: R$ 500"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Prazo em dias
              </label>
              <input
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                placeholder="Ex: 20"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={publicarProjeto}
              disabled={carregando}
              className="mt-2 rounded-xl bg-emerald-400 px-6 py-4 font-bold text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {carregando ? "Publicando..." : "Publicar projeto"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}