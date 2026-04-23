"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

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
      .channel(`chat-mensagens-${propostaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `proposta_id=eq.${propostaId}`,
        },
        (payload) => {
          setMensagens((prev) => {
            const existe = prev.some((m) => m.id === (payload.new as Mensagem).id);
            if (existe) return prev;
            return [...prev, payload.new as Mensagem];
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

  async function carregarMensagens() {
    const { data } = await supabase
      .from("mensagens")
      .select("*")
      .eq("proposta_id", propostaId)
      .order("created_at", { ascending: true });

    if (data) setMensagens(data as Mensagem[]);
  }

  function limparFormulario() {
    setNovaMensagem("");
    setArquivo(null);
    const input = document.getElementById("arquivo-chat") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  async function enviarMensagem() {
    if ((!novaMensagem.trim() && !arquivo) || !usuarioId || !propostaId) return;

    try {
      setEnviando(true);

      let arquivoUrl: string | null = null;
      let arquivoNome: string | null = null;

      if (arquivo) {
        const extensao = arquivo.name.split(".").pop();
        const nomeArquivo = `${propostaId}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extensao}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-arquivos")
          .upload(nomeArquivo, arquivo, { upsert: false });

        if (uploadError) {
          alert("Erro ao enviar arquivo.");
          return;
        }

        const { data } = supabase.storage
          .from("chat-arquivos")
          .getPublicUrl(nomeArquivo);

        arquivoUrl = data.publicUrl;
        arquivoNome = arquivo.name;
      }

      const payload = {
        mensagem: novaMensagem.trim(),
        remetente_id: usuarioId,
        proposta_id: propostaId,
        arquivo_url: arquivoUrl,
        arquivo_nome: arquivoNome,
      };

      const { error } = await supabase.from("mensagens").insert([payload]);

      if (error) {
        alert("Erro ao enviar mensagem.");
        return;
      }

      limparFormulario();
    } finally {
      setEnviando(false);
    }
  }

  function renderArquivo(m: Mensagem) {
    if (!m.arquivo_url) return null;

    const nome = m.arquivo_nome || "Arquivo anexado";
    const ext = nome.split(".").pop()?.toLowerCase();

    const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");

    return (
      <div className="mt-3">
        {isImage && (
          <a href={m.arquivo_url} target="_blank">
            <img
              src={m.arquivo_url}
              alt={nome}
              className="max-w-[220px] rounded-lg border border-black/10"
            />
          </a>
        )}

        <a
          href={m.arquivo_url}
          target="_blank"
          className={`mt-2 inline-block text-sm underline ${
            m.remetente_id === usuarioId ? "text-black" : "text-emerald-300"
          }`}
        >
          📎 {nome}
        </a>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat da proposta</h1>

        <Link
          href="/minhas-propostas"
          className="rounded-lg border border-white/20 px-4 py-2"
        >
          Voltar
        </Link>
      </div>

      <div
        ref={mensagensRef}
        className="bg-slate-900 border border-white/10 rounded-xl p-6 h-[450px] overflow-y-auto space-y-4"
      >
        {mensagens.length === 0 && (
          <div className="text-slate-400 text-center mt-20">
            Nenhuma mensagem ainda.
          </div>
        )}

        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-xl max-w-[75%] ${
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

      <div className="mt-6 rounded-xl border border-white/10 bg-slate-900 p-4">
        <div className="flex flex-col gap-4">
          <textarea
            className="w-full rounded-lg bg-slate-800 p-3 outline-none"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem"
            rows={4}
          />

          <input
            id="arquivo-chat"
            type="file"
            onChange={(e) => setArquivo(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-300"
          />

          {arquivo && (
            <div className="text-sm text-slate-400">
              Arquivo selecionado: {arquivo.name}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={enviarMensagem}
              disabled={enviando}
              className="bg-emerald-400 text-black px-6 py-3 rounded font-bold disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}