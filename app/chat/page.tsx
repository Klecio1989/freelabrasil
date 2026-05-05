"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-10 text-white">
          Carregando chat...
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const propostaId = searchParams.get("proposta_id");

  const [usuario, setUsuario] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setLoading(true);

    const user = localStorage.getItem("freelabrasil_usuario");

    if (!user) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(user);
    setUsuario(parsed);

    if (!propostaId) {
      setLoading(false);
      return;
    }

    const { data: proposta, error: propostaError } = await supabase
      .from("propostas")
      .select("id, projeto_id, freelancer_id")
      .eq("id", propostaId)
      .maybeSingle();

    if (propostaError || !proposta) {
      console.error(propostaError);
      setLoading(false);
      return;
    }

    const { data: andamento } = await supabase
      .from("projetos_andamento")
      .select("contratante_id")
      .eq("projeto_id", proposta.projeto_id)
      .maybeSingle();

    const contratanteId = andamento?.contratante_id;

    const { data: chatExistente, error: chatError } = await supabase
      .from("chats")
      .select("id")
      .eq("projeto_id", proposta.projeto_id)
      .eq("freela_id", proposta.freelancer_id)
      .eq("contratante_id", contratanteId)
      .maybeSingle();

    if (chatError) {
      console.error(chatError);
      setLoading(false);
      return;
    }

    if (!chatExistente) {
      setLoading(false);
      return;
    }

    setChatId(chatExistente.id);
    await carregarMensagens(chatExistente.id);

    setLoading(false);
  }

  async function carregarMensagens(idChat: string) {
    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .eq("chat_id", idChat)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setMensagens([]);
      return;
    }

    setMensagens(data || []);
  }

  function mensagemValida(texto: string) {
    const textoLower = texto.toLowerCase();

    const termosBloqueados = [
      "whatsapp",
      "whats",
      "zap",
      "telefone",
      "celular",
      "fone",
      "email",
      "e-mail",
      "gmail",
      "hotmail",
      "outlook",
      "telegram",
      "instagram",
      "insta",
      "linkedin",
      "pix",
      "chave pix",
    ];

    if (textoLower.includes("@")) return false;

    if (termosBloqueados.some((termo) => textoLower.includes(termo))) {
      return false;
    }

    const numeros = texto.replace(/\D/g, "");

    if (numeros.length >= 8) return false;

    const regexEmail = /\S+@\S+\.\S+/;
    if (regexEmail.test(textoLower)) return false;

    return true;
  }

  async function enviarMensagem() {
    if (!usuario) {
      alert("Você precisa estar logado.");
      return;
    }

    if (!chatId) {
      alert("Chat não localizado.");
      return;
    }

    if (!mensagem.trim()) return;

    if (!mensagemValida(mensagem)) {
      alert(
        "Não é permitido compartilhar contato externo, PIX, telefone, e-mail ou WhatsApp. Mantenha a negociação dentro da FreellaBrasil."
      );
      return;
    }

    try {
      setEnviando(true);

      const { error } = await supabase.from("mensagens").insert([
        {
          chat_id: chatId,
          remetente_id: usuario.id,
          mensagem: mensagem.trim(),
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao enviar mensagem.");
        return;
      }

      setMensagem("");
      await carregarMensagens(chatId);
    } finally {
      setEnviando(false);
    }
  }

  function voltarPainel() {
    if (usuario?.tipo_usuario === "freelancer") return "/meus-trabalhos";
    if (usuario?.tipo_usuario === "contratante") return "/meus-projetos";
    return "/";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando chat...
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Você precisa estar logado.
      </main>
    );
  }

  if (!chatId) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-8">
          <h1 className="text-3xl font-black text-yellow-300">
            Chat não localizado
          </h1>
          <p className="mt-3 text-slate-300">
            O chat será criado automaticamente quando a proposta for aceita.
          </p>

          <Link
            href={voltarPainel()}
            className="mt-6 inline-block rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
          >
            Voltar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Chat do Projeto</h1>
            <p className="mt-2 text-slate-400">
              Mantenha toda negociação dentro da FreellaBrasil.
            </p>
          </div>

          <Link
            href={voltarPainel()}
            className="rounded-xl border border-white/20 px-5 py-3 font-bold"
          >
            Voltar
          </Link>
        </div>

        <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          Por segurança, não é permitido compartilhar telefone, WhatsApp, e-mail,
          PIX ou contato externo. Violações podem gerar bloqueio ou banimento.
        </div>

        <div className="mb-4 h-[460px] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5">
          {mensagens.length === 0 && (
            <p className="text-slate-400">Nenhuma mensagem ainda.</p>
          )}

          <div className="space-y-4">
            {mensagens.map((m) => {
              const minhaMensagem =
                m.remetente_id === usuario.id || m.usuario_id === usuario.id;

              return (
                <div
                  key={m.id}
                  className={`flex ${
                    minhaMensagem ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      minhaMensagem
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="leading-7">{m.mensagem}</p>

                    {m.created_at && (
                      <p
                        className={`mt-2 text-xs ${
                          minhaMensagem ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <input
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enviarMensagem();
            }}
            placeholder="Digite sua mensagem..."
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />

          <button
            onClick={enviarMensagem}
            disabled={enviando}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </section>
    </main>
  );
}