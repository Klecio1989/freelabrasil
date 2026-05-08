"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Stars from "./Stars";
import { enviarEmail } from "@/lib/enviarEmail";

export default function AvaliacaoModal({ projeto, usuario, onClose, onSuccess }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function enviarAvaliacao() {
    if (!nota) {
      alert("Selecione uma nota.");
      return;
    }

    if (!comentario.trim()) {
      alert("O comentário é obrigatório.");
      return;
    }

    if (!projeto?.freela_id) {
      alert("Freelancer não identificado para avaliação.");
      return;
    }

    try {
      setSalvando(true);

      const { data: avaliacaoExistente } = await supabase
        .from("avaliacoes")
        .select("id")
        .eq("projeto_andamento_id", projeto.id)
        .eq("avaliador_id", usuario.id)
        .eq("avaliado_id", projeto.freela_id)
        .maybeSingle();

      if (avaliacaoExistente) {
        alert("Você já avaliou este projeto.");
        onClose();
        return;
      }

      const { error } = await supabase.from("avaliacoes").insert([
        {
          projeto_id: projeto.projeto_id,
          projeto_andamento_id: projeto.id,
          avaliador_id: usuario.id,
          avaliado_id: projeto.freela_id,
          tipo_avaliacao: "freelancer",
          nota,
          comentario: comentario.trim(),
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao salvar avaliação: " + error.message);
        return;
      }

      const { data: freela } = await supabase
        .from("usuarios")
        .select("id,nome,email")
        .eq("id", projeto.freela_id)
        .maybeSingle();

      await supabase.from("notificacoes").insert([
        {
          usuario_id: projeto.freela_id,
          titulo: "Avaliação recebida ⭐",
          descricao: `Você recebeu uma avaliação de ${nota} estrela(s) no projeto "${projeto.projetos?.titulo || "Projeto"}".`,
          link: "/perfil",
          lida: false,
        },
      ]);

      if (freela?.email) {
        await enviarEmail({
          para: freela.email,
          assunto: "Você recebeu uma avaliação ⭐",
          titulo: `Você recebeu uma avaliação de ${nota} estrela(s).`,
          mensagem: `
            O contratante avaliou seu trabalho no projeto "${projeto.projetos?.titulo || "Projeto"}".

            Comentário:
            ${comentario.trim()}

            Essa avaliação ajuda a fortalecer sua reputação dentro da FreellaBrasil.
          `,
          botaoTexto: "Ver meu perfil",
          botaoLink: "https://www.freellabrasil.com.br/perfil",
        });
      }

      await fetch("/api/recalcular-ranking", {
        method: "POST",
      });

      alert("Avaliação enviada com sucesso!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao enviar avaliação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 text-white shadow-2xl">
        <h2 className="text-3xl font-black">Avaliar freelancer</h2>

        <p className="mt-2 text-slate-400">
          Sua avaliação ajuda outros contratantes e melhora o ranking da plataforma.
        </p>

        <div className="mt-6">
          <p className="mb-2 text-sm font-bold text-slate-300">Nota</p>
          <Stars nota={nota} setNota={setNota} />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-slate-300">
            Comentário obrigatório
          </p>

          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={5}
            placeholder="Conte como foi sua experiência com este freelancer..."
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={enviarAvaliacao}
            disabled={salvando}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-60"
          >
            {salvando ? "Enviando..." : "Enviar avaliação"}
          </button>

          <button
            onClick={onClose}
            disabled={salvando}
            className="rounded-xl border border-white/20 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}