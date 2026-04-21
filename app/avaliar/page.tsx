"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AvaliarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const propostaId = searchParams.get("proposta_id") || "";
  const freelancerId = searchParams.get("freelancer_id") || "";

  const [nota, setNota] = useState("");
  const [comentario, setComentario] = useState("");
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  async function enviarAvaliacao() {
    if (!usuario || !propostaId || !freelancerId || !nota) {
      alert("Dados inválidos.");
      return;
    }

    const notaNumero = Number(nota);

    if (notaNumero < 1 || notaNumero > 5) {
      alert("A nota deve ser de 1 a 5.");
      return;
    }

    const { error } = await supabase.from("avaliacoes").insert([
      {
        proposta_id: propostaId,
        freelancer_id: freelancerId,
        contratante_id: usuario.id,
        nota: notaNumero,
        comentario,
      },
    ]);

    if (error) {
      alert("Erro ao enviar avaliação.");
      return;
    }

    const { data: avaliacoes } = await supabase
      .from("avaliacoes")
      .select("nota")
      .eq("freelancer_id", freelancerId);

    const totalNotas =
      avaliacoes?.reduce((acc: number, item: any) => acc + item.nota, 0) || 0;
    const quantidade = avaliacoes?.length || 0;
    const media = quantidade > 0 ? totalNotas / quantidade : 0;

    const { data: freelancerAtual } = await supabase
      .from("usuarios")
      .select("projetos_concluidos")
      .eq("id", freelancerId)
      .single();

    await supabase
      .from("usuarios")
      .update({
        nota_media: media,
        projetos_concluidos: (freelancerAtual?.projetos_concluidos || 0) + 1,
      })
      .eq("id", freelancerId);

    alert("Avaliação enviada com sucesso.");
    router.push("/propostas-recebidas");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold mb-6">Avaliar freelancer</h1>

        <div className="space-y-4">
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota de 1 a 5"
            className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
          />

          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={5}
            placeholder="Comentário"
            className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3"
          />

          <button
            onClick={enviarAvaliacao}
            className="bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg"
          >
            Enviar avaliação
          </button>
        </div>
      </div>
    </main>
  );
}