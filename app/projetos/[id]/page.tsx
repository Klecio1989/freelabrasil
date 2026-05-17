"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjetoPage() {
  const params = useParams();
  const id = params?.id as string;

  const [projeto, setProjeto] = useState<any>(null);
  const [freelas, setFreelas] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);

  useEffect(() => {
    if (id) carregar();
  }, [id]);

  async function carregar() {
    setCarregando(true);

    const userLocal = localStorage.getItem("freelabrasil_usuario");

    if (userLocal) {
      setUsuario(JSON.parse(userLocal));
    }

    const { data: proj, error: erroProjeto } = await supabase
      .from("projetos")
      .select("*")
      .eq("id", id)
      .single();

    if (erroProjeto || !proj) {
      console.error("Erro ao carregar projeto:", erroProjeto);
      setProjeto(null);
      setCarregando(false);
      return;
    }

    setProjeto(proj);

    const { data: lista, error: erroFreelas } = await supabase
      .from("ranking_freelancers")
      .select("*");

    if (erroFreelas) {
      console.error("Erro ao carregar freelancers:", erroFreelas);
      setCarregando(false);
      return;
    }

    setFreelas(calcularMatch(proj, lista || []));
    setCarregando(false);
  }

  function calcularMatch(projeto: any, lista: any[]) {
    const textoProjeto = `
      ${projeto.titulo || ""}
      ${projeto.descricao || ""}
      ${projeto.categoria || ""}
    `.toLowerCase();

    const palavrasIgnoradas = [
      "de",
      "da",
      "do",
      "das",
      "dos",
      "em",
      "para",
      "por",
      "com",
      "um",
      "uma",
      "o",
      "a",
      "e",
      "ou",
      "que",
      "no",
      "na",
      "nos",
      "nas",
      "site",
      "sistema",
      "projeto",
      "preciso",
      "quero",
    ];

    const palavrasProjeto = textoProjeto
      .replace(/[^\wÀ-ÿ\s]/g, " ")
      .split(/\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 3 && !palavrasIgnoradas.includes(p));

    return lista
      .map((f) => {
        const habilidades = `${f.habilidades || ""}`.toLowerCase();
        const nome = `${f.nome || ""}`.toLowerCase();
        const categoria = `${f.categoria || ""}`.toLowerCase();

        let score = 0;

        palavrasProjeto.forEach((palavra) => {
          if (habilidades.includes(palavra)) score += 3;
          if (categoria.includes(palavra)) score += 2;
          if (nome.includes(palavra)) score += 1;
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

  async function convidarFreelancer(freela: any) {
    if (!usuario) {
      alert("Você precisa estar logado.");
      return;
    }

    setEnviando(freela.id);

    const { data: conviteExistente } = await supabase
      .from("convites")
      .select("id")
      .eq("projeto_id", projeto.id)
      .eq("freelancer_id", freela.id)
      .maybeSingle();

    if (conviteExistente) {
      alert("Este freelancer já foi convidado.");
      setEnviando(null);
      return;
    }

    const { error: erroConvite } = await supabase
      .from("convites")
      .insert({
        projeto_id: projeto.id,
        contratante_id: usuario.id,
        freelancer_id: freela.id,
        status: "pendente",
        mensagem: `Você recebeu um convite para o projeto: ${projeto.titulo}`,
      });

    if (erroConvite) {
      console.error(erroConvite);
      alert("Erro ao enviar convite.");
      setEnviando(null);
      return;
    }

    await supabase.from("notificacoes").insert({
      usuario_id: freela.id,
      titulo: "Novo convite recebido 🚀",
      descricao: `Você recebeu um convite para o projeto ${projeto.titulo}`,
      link: `/convites`,
      lida: false,
    });

    alert("Convite enviado com sucesso!");
    setEnviando(null);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando projeto...
      </main>
    );
  }

  if (!projeto) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Projeto não encontrado.
      </main>
    );
  }

  const ehContratante = usuario?.tipo_usuario === "contratante";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/projetos"
          className="text-sm text-emerald-400 hover:underline"
        >
          ← Voltar para projetos
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-4xl font-black">
            {projeto.titulo}
          </h1>

          <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-300">
            {projeto.descricao}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">

            {projeto.categoria && (
              <div className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
                <span className="text-slate-400">Categoria:</span>{" "}
                <span className="font-bold text-emerald-300">
                  {projeto.categoria}
                </span>
              </div>
            )}

            {projeto.orcamento && (
              <div className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
                <span className="text-slate-400">Orçamento:</span>{" "}
                <span className="font-bold text-emerald-300">
                  {projeto.orcamento}
                </span>
              </div>
            )}

          </div>
        </div>

        {ehContratante && (
          <>
            <h2 className="mt-12 mb-5 text-3xl font-black">
              Freelancers recomendados 🧠
            </h2>

            {freelas.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                Nenhum freelancer recomendado encontrado.
              </div>
            ) : (
              <div className="grid gap-5">
                {freelas.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div>
                        <Link href={`/freelancer/${f.id}`}>
                          <h3 className="text-2xl font-black hover:text-emerald-300">
                            {f.nome}
                          </h3>
                        </Link>

                        <p className="mt-2 text-yellow-300">
                          ⭐ {Number(f.media || 0).toFixed(1)}
                        </p>

                        <p className="mt-4 text-slate-400">
                          {f.habilidades || "Sem habilidades cadastradas"}
                        </p>

                        <p className="mt-4 text-sm text-emerald-300">
                          Match score: {f.score}
                        </p>
                      </div>

                      {f.boost_ativo && (
                        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                          🚀 Destaque
                        </span>
                      )}

                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">

                      <Link
                        href={`/freelancer/${f.id}`}
                        className="rounded-xl border border-white/20 px-5 py-3"
                      >
                        Ver perfil
                      </Link>

                      <button
                        onClick={() => convidarFreelancer(f)}
                        disabled={enviando === f.id}
                        className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 disabled:opacity-50"
                      >
                        {enviando === f.id
                          ? "Enviando..."
                          : "Convidar Freelancer"}
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}