"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

function AvaliarClient() {
  const params = useSearchParams();

  const propostaId = params.get("proposta_id") || "";
  const avaliadoId = params.get("avaliado_id") || "";
  const tipoAvaliado = params.get("tipo_avaliado") || "";

  const [usuario, setUsuario] = useState<any>(null);
  const [avaliado, setAvaliado] = useState<any>(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuario(parsed);
    }

    carregarAvaliado();
  }, []);

  async function carregarAvaliado() {
    if (!avaliadoId) return;

    const { data } = await supabase
      .from("usuarios")
      .select("id,nome,email,tipo_usuario,foto_url")
      .eq("id", avaliadoId)
      .single();

    if (data) setAvaliado(data);
  }

  async function recalcularNotaUsuario(usuarioAvaliadoId: string) {
    const { data } = await supabase
      .from("avaliacoes")
      .select("nota")
      .eq("avaliado_id", usuarioAvaliadoId);

    const notas = data || [];
    const total = notas.length;
    const media =
      total > 0
        ? notas.reduce((soma: number, item: any) => soma + Number(item.nota || 0), 0) / total
        : 0;

    await supabase
      .from("usuarios")
      .update({
        nota_media: Number(media.toFixed(2)),
        total_avaliacoes: total,
      })
      .eq("id", usuarioAvaliadoId);
  }

  async function recalcularProjetosConcluidosFreelancer(freelancerId: string) {
    const { data } = await supabase
      .from("avaliacoes")
      .select("proposta_id")
      .eq("avaliado_id", freelancerId)
      .eq("tipo_avaliado", "freelancer");

    const projetosUnicos = new Set((data || []).map((item: any) => item.proposta_id));

    await supabase
      .from("usuarios")
      .update({
        projetos_concluidos: projetosUnicos.size,
      })
      .eq("id", freelancerId);
  }

  async function enviarAvaliacao() {
    if (!usuario?.id) {
      alert("Faça login para avaliar.");
      return;
    }

    if (!propostaId || !avaliadoId || !tipoAvaliado) {
      alert("Dados da avaliação inválidos.");
      return;
    }

    if (nota < 1) {
      alert("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    if (!comentario.trim()) {
      alert("O comentário é obrigatório.");
      return;
    }

    try {
      setEnviando(true);

      const { error } = await supabase
        .from("avaliacoes")
        .upsert(
          [
            {
              proposta_id: propostaId,
              avaliador_id: usuario.id,
              avaliado_id: avaliadoId,
              tipo_avaliado: tipoAvaliado,
              nota,
              comentario: comentario.trim(),
            },
          ],
          {
            onConflict: "proposta_id,avaliador_id,avaliado_id",
          }
        );

      if (error) {
        alert(error.message);
        return;
      }

      await recalcularNotaUsuario(avaliadoId);

      if (tipoAvaliado === "freelancer") {
        await recalcularProjetosConcluidosFreelancer(avaliadoId);
      }

      await supabase.from("notificacoes").insert([
        {
          usuario_id: avaliadoId,
          titulo: "Nova avaliação recebida",
          descricao: `${usuario.nome || "Usuário"} avaliou você com ${nota} estrela(s).`,
          lida: false,
          link: `/perfil`,
        },
      ]);

      alert("Avaliação enviada com sucesso.");
      window.location.href = "/dashboard";
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-5xl font-black">Avaliar usuário</h1>
          <p className="mt-4 text-slate-400">
            Sua avaliação ajuda a manter a qualidade da FreelaBrasil.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-700">
              {avaliado?.foto_url ? (
                <img
                  src={avaliado.foto_url}
                  alt={avaliado.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold">
                  {avaliado?.nome?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {avaliado?.nome || "Usuário"}
              </h2>
              <p className="text-sm text-slate-400">
                Avaliando: {tipoAvaliado || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Nota obrigatória
            </p>

            <div className="flex gap-2 text-5xl">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  onClick={() => setNota(estrela)}
                  className={`transition ${
                    estrela <= nota ? "text-yellow-400" : "text-slate-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Comentário obrigatório
            </p>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={6}
              placeholder="Descreva como foi sua experiência..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={enviarAvaliacao}
            disabled={enviando}
            className="mt-8 w-full rounded-xl bg-emerald-400 px-6 py-4 font-bold text-slate-950 disabled:opacity-60"
          >
            {enviando ? "Enviando avaliação..." : "Enviar avaliação"}
          </button>

          <Link
            href="/dashboard"
            className="mt-4 block text-center text-sm text-slate-400"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AvaliarPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          Carregando avaliação...
        </main>
      }
    >
      <AvaliarClient />
    </Suspense>
  );
}