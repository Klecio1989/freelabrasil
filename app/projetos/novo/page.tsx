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
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [sugestaoIA, setSugestaoIA] = useState<any>(null);

  useEffect(() => {
    carregarUsuarioAtual();
  }, []);

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

  async function gerarProjetoIA(tipo: "titulo" | "descricao") {
    try {
      setCarregandoIA(true);

      const texto =
        tipo === "titulo"
          ? `
Descrição:
${descricao}

Área:
${area}
`
          : `
Título:
${titulo}

Área:
${area}

Descrição atual:
${descricao}

Prazo:
${prazo} dias
`;

      const res = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: tipo === "descricao" ? "descricao_projeto" : "titulo_projeto",
          texto,
        }),
      });

      const data = await res.json();

      if (!data.resultado) {
        alert("Não foi possível gerar conteúdo com IA agora.");
        return;
      }

      if (tipo === "descricao") {
        setDescricao(data.resultado);
      }

      if (tipo === "titulo") {
        const primeiraLinha = String(data.resultado)
          .split("\n")
          .map((linha) => linha.trim())
          .filter(Boolean)[0];

        if (primeiraLinha) {
          setTitulo(
            primeiraLinha
              .replace(/^\d+\./, "")
              .replace(/^[-•]/, "")
              .replace(/^["']|["']$/g, "")
              .trim()
          );
        }
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao consultar IA.");
    } finally {
      setCarregandoIA(false);
    }
  }

  async function sugerirPrecoIA() {
    if (!titulo.trim() || !descricao.trim()) {
      alert("Informe pelo menos título e descrição para a IA sugerir o preço.");
      return;
    }

    try {
      setCarregandoIA(true);

      const res = await fetch("/api/ia/sugerir-preco", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          descricao,
          area,
          prazo,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.resultado) {
        alert("Não foi possível sugerir preço agora.");
        return;
      }

      setSugestaoIA(data.resultado);

      if (data.resultado.preco_recomendado) {
        setOrcamento(String(data.resultado.preco_recomendado));
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao consultar IA.");
    } finally {
      setCarregandoIA(false);
    }
  }

  async function publicarProjeto() {
    if (!usuario?.id) {
      alert("Usuário não identificado. Faça login novamente.");
      return;
    }

    if (
      !titulo.trim() ||
      !descricao.trim() ||
      !area.trim() ||
      !orcamento.trim() ||
      !prazo.trim()
    ) {
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

      const { error } = await supabase.from("projetos").insert([
        {
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          area: area.trim(),
          orcamento: orcamento.trim(),
          prazo: prazoNumero,
          contratante_id: usuario.id,
        },
      ]);

      if (error) {
        console.error("ERRO SUPABASE:", error);
        alert(error.message || "Erro ao criar projeto.");
        return;
      }

      const novoTotalProjetos = Number(usuario.projetos_publicados || 0) + 1;

      const { data: usuarioAtualizado } = await supabase
        .from("usuarios")
        .update({
          projetos_publicados: novoTotalProjetos,
        })
        .eq("id", usuario.id)
        .select()
        .single();

      if (usuarioAtualizado) {
        localStorage.setItem(
          "freelabrasil_usuario",
          JSON.stringify(usuarioAtualizado)
        );
      }

      alert("Projeto criado com sucesso!");
      router.push("/projetos");
    } catch (error) {
      console.error("ERRO GERAL:", error);
      alert("Erro ao criar projeto.");
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
                placeholder="Ex: Dashboard Power BI para controle financeiro"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => gerarProjetoIA("titulo")}
                  disabled={carregandoIA}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-60"
                >
                  {carregandoIA ? "Gerando..." : "✨ Sugerir título com IA"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Descrição
              </label>

              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o projeto, entregáveis, objetivo e contexto"
                rows={7}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => gerarProjetoIA("descricao")}
                  disabled={carregandoIA}
                  className="rounded-xl bg-purple-400 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-60"
                >
                  {carregandoIA ? "Melhorando..." : "✨ Melhorar descrição com IA"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Área
              </label>

              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Power BI, Excel, Python, Design, Consultoria"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-yellow-300">
                    Precificação com IA
                  </h3>

                  <p className="mt-1 text-sm text-yellow-100">
                    A IA analisa título, descrição, área e prazo para sugerir uma faixa justa.
                  </p>
                </div>

                <button
                  onClick={sugerirPrecoIA}
                  disabled={carregandoIA}
                  className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:opacity-60"
                >
                  {carregandoIA ? "Analisando..." : "Sugerir preço com IA"}
                </button>
              </div>

              {sugestaoIA && (
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-400">Mínimo</p>
                    <p className="text-xl font-black">
                      R$ {Number(sugestaoIA.preco_minimo || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-400/10 p-4">
                    <p className="text-xs text-emerald-300">Recomendado</p>
                    <p className="text-xl font-black text-emerald-300">
                      R$ {Number(sugestaoIA.preco_recomendado || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-400">Máximo</p>
                    <p className="text-xl font-black">
                      R$ {Number(sugestaoIA.preco_maximo || 0).toFixed(2)}
                    </p>
                  </div>

                  {sugestaoIA.justificativa && (
                    <p className="md:col-span-3 text-sm text-yellow-100">
                      {sugestaoIA.justificativa}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Orçamento
              </label>

              <input
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                placeholder="Ex: 500"
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