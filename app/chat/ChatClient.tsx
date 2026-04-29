"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { Paperclip } from "lucide-react";

type Mensagem = {
  id: string;
  mensagem: string;
  remetente_id: string;
  proposta_id: string;
  created_at: string;
  arquivo_url?: string | null;
  arquivo_nome?: string | null;
};

type Props = {
  propostaId: string;
};

export default function ChatClient({ propostaId }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [destinatarioId, setDestinatarioId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const mensagensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      setUsuarioId(parsed.id);

      if (propostaId) {
        carregarDestinatario(parsed.id);
      }
    }

    if (!propostaId) return;

    carregarMensagens();

    const channel = supabase
      .channel(`chat-${propostaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `proposta_id=eq.${propostaId}`,
        },
        (payload) => {
          const nova = payload.new as Mensagem;

          setMensagens((prev) => {
            const jaExiste = prev.some((m) => m.id === nova.id);
            if (jaExiste) return prev;
            return [...prev, nova];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propostaId]);

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  async function carregarDestinatario(remetenteAtualId: string) {
    const { data: proposta, error: propostaError } = await supabase
      .from("propostas")
      .select("id,freelancer_id,projeto_id")
      .eq("id", propostaId)
      .single();

    if (propostaError || !proposta) return;

    const { data: projeto, error: projetoError } = await supabase
      .from("projetos")
      .select("id,contratante_id")
      .eq("id", proposta.projeto_id)
      .single();

    if (projetoError || !projeto) return;

    if (remetenteAtualId === proposta.freelancer_id) {
      setDestinatarioId(projeto.contratante_id);
    } else {
      setDestinatarioId(proposta.freelancer_id);
    }
  }

  async function carregarMensagens() {
    const { data } = await supabase
      .from("mensagens")
      .select("*")
      .eq("proposta_id", propostaId)
      .order("created_at", { ascending: true });

    if (data) setMensagens(data as Mensagem[]);
  }

  function limparNomeArquivo(nome: string) {
    return nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.\-_]/g, "-")
      .toLowerCase();
  }

  async function enviarMensagem() {
    if ((!novaMensagem.trim() && !arquivo) || !usuarioId || !propostaId) return;

    try {
      setEnviando(true);

      let arquivoUrl: string | null = null;
      let arquivoNome: string | null = null;

      if (arquivo) {
        const nomeLimpo = limparNomeArquivo(arquivo.name);
        const nomeArquivo = `${propostaId}/${Date.now()}-${nomeLimpo}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-arquivos")
          .upload(nomeArquivo, arquivo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          alert(uploadError.message || "Erro ao enviar arquivo");
          return;
        }

        const { data } = supabase.storage
          .from("chat-arquivos")
          .getPublicUrl(nomeArquivo);

        arquivoUrl = data.publicUrl;
        arquivoNome = arquivo.name;
      }

      const { error } = await supabase.from("mensagens").insert([
        {
          mensagem: novaMensagem.trim(),
          remetente_id: usuarioId,
          proposta_id: propostaId,
          arquivo_url: arquivoUrl,
          arquivo_nome: arquivoNome,
        },
      ]);

      if (error) {
        alert(error.message || "Erro ao enviar mensagem");
        return;
      }

      if (destinatarioId) {
        const { error: notifError } = await supabase.from("notificacoes").insert([
          {
            usuario_id: destinatarioId,
            titulo: "Nova mensagem",
            descricao: arquivoNome
              ? `Você recebeu uma nova mensagem com anexo: ${arquivoNome}`
              : novaMensagem.trim() || "Você recebeu uma nova mensagem.",
            lida: false,
            link: `/chat?proposta_id=${propostaId}`,
          },
        ]);

        if (notifError) {
          console.error("ERRO NOTIFICAÇÃO CHAT:", notifError);
        }
      }

      setNovaMensagem("");
      setArquivo(null);

      const input = document.getElementById("arquivo-chat") as HTMLInputElement;
      if (input) input.value = "";
    } finally {
      setEnviando(false);
    }
  }

  function renderArquivo(m: Mensagem) {
    if (!m.arquivo_url) return null;

    const nome = m.arquivo_nome || "Arquivo";
    const ext = nome.split(".").pop()?.toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");

    return (
      <div className="mt-2">
        {isImage && (
          <a href={m.arquivo_url} target="_blank">
            <img
              src={m.arquivo_url}
              alt={nome}
              className="mb-2 max-w-[220px] rounded-lg border border-white/10"
            />
          </a>
        )}

        <a href={m.arquivo_url} target="_blank" className="text-sm underline">
          📎 {nome}
        </a>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-between">
          <h1 className="text-2xl font-bold">Chat</h1>

          <Link href="/dashboard" className="rounded border border-white/20 px-3 py-1">
            Voltar
          </Link>
        </div>

        <div
          ref={mensagensRef}
          className="h-[400px] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-4"
        >
          {mensagens.length === 0 && (
            <div className="mt-20 text-center text-slate-400">
              Nenhuma mensagem ainda.
            </div>
          )}

          {mensagens.map((m) => (
            <div
              key={m.id}
              className={`max-w-[70%] rounded-xl p-3 ${
                m.remetente_id === usuarioId
                  ? "ml-auto bg-emerald-400 text-black"
                  : "bg-slate-700 text-white"
              }`}
            >
              {m.mensagem && <div>{m.mensagem}</div>}
              {renderArquivo(m)}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <textarea
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-800 p-3 outline-none"
            placeholder="Digite uma mensagem"
            rows={4}
          />

          <div className="flex items-center gap-3">
            <label
              htmlFor="arquivo-chat"
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-slate-800 transition hover:bg-slate-700"
              title="Anexar arquivo"
            >
              <Paperclip size={22} />
            </label>

            <input
              id="arquivo-chat"
              type="file"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              className="hidden"
            />

            {arquivo && (
              <span className="max-w-[260px] truncate text-sm text-slate-400">
                {arquivo.name}
              </span>
            )}
          </div>

          <button
            onClick={enviarMensagem}
            disabled={enviando}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-black disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </main>
  );
}