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
  const [enviando, setEnviando] = useState(false);
  const mensagensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const usuario = localStorage.getItem("freelabrasil_usuario");

    if (usuario) {
      const parsed = JSON.parse(usuario);
      setUsuarioId(parsed.id);
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
          setMensagens((prev) => [...prev, payload.new as Mensagem]);
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
          console.error("ERRO UPLOAD STORAGE:", uploadError);
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
        console.error("ERRO INSERT MENSAGEM:", error);
        alert(error.message || "Erro ao enviar mensagem");
        return;
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
              className="max-w-[220px] rounded-lg mb-2 border border-white/10"
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
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Chat</h1>

          <Link href="/dashboard" className="border border-white/20 px-3 py-1 rounded">
            Voltar
          </Link>
        </div>

        <div
          ref={mensagensRef}
          className="bg-slate-900 p-4 rounded-xl h-[400px] overflow-y-auto space-y-3 border border-white/10"
        >
          {mensagens.length === 0 && (
            <div className="text-slate-400 text-center mt-20">
              Nenhuma mensagem ainda.
            </div>
          )}

          {mensagens.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl max-w-[70%] ${
                m.remetente_id === usuarioId
                  ? "bg-emerald-400 text-black ml-auto"
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
            className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 outline-none"
            placeholder="Digite uma mensagem"
            rows={4}
          />

          <div className="flex items-center gap-3">
            <label
              htmlFor="arquivo-chat"
              className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 transition"
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
              <span className="text-sm text-slate-400 truncate max-w-[260px]">
                {arquivo.name}
              </span>
            )}
          </div>

          <button
            onClick={enviarMensagem}
            disabled={enviando}
            className="bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </main>
  );
}