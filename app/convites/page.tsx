"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChatContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Carregando chat...
    </main>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const propostaId = searchParams.get("proposta_id");

  const [usuario, setUsuario] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const mensagensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    mensagensRef.current?.scrollTo({
      top: mensagensRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mensagens]);

  async function carregar() {
    setLoading(true);

    const userLocal = localStorage.getItem("freelabrasil_usuario");

    if (!userLocal) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(userLocal);
    setUsuario(parsed);

    if (!propostaId) {
      setLoading(false);
      return;
    }

    const { data: proposta, error: erroProposta } = await supabase
      .from("propostas")
      .select("id, projeto_id, freelancer_id")
      .eq("id", propostaId)
      .maybeSingle();

    if (erroProposta || !proposta) {
      console.error(erroProposta);
      setLoading(false);
      return;
    }

    const { data: projeto } = await supabase
      .from("projetos")
      .select("id, contratante_id")
      .eq("id", proposta.projeto_id)
      .maybeSingle();

    let contratanteId = projeto?.contratante_id;

    if (!contratanteId) {
      const { data: andamento } = await supabase
        .from("projetos_andamento")
        .select("contratante_id")
        .eq("projeto_id", proposta.projeto_id)
        .maybeSingle();

      contratanteId = andamento?.contratante_id;
    }

    if (!contratanteId) {
      alert("Contratante não localizado para este projeto.");
      setLoading(false);
      return;
    }

    const { data: chatExistente } = await supabase
      .from("chats")
      .select("id")
      .eq("projeto_id", proposta.projeto_id)
      .eq("freela_id", proposta.freelancer_id)
      .eq("contratante_id", contratanteId)
      .maybeSingle();

    let novoChatId = chatExistente?.id;

    if (!novoChatId) {
      const { data: novoChat, error: erroChat } = await supabase
        .from("chats")
        .insert([
          {
            projeto_id: proposta.projeto_id,
            freela_id: proposta.freelancer_id,
            contratante_id: contratanteId,
          },
        ])
        .select("id")
        .single();

      if (erroChat) {
        console.error(erroChat);
        alert("Erro ao criar chat: " + erroChat.message);
        setLoading(false);
        return;
      }

      novoChatId = novoChat.id;
    }

    setChatId(novoChatId);

    await carregarMensagens(novoChatId);
    iniciarRealtime(novoChatId);

    setLoading(false);
  }

  async function carregarMensagens(idChat: string) {
    const { data } = await supabase
      .from("mensagens")
      .select("*")
      .eq("chat_id", idChat)
      .order("created_at", { ascending: true });

    setMensagens(data || []);
  }

  function iniciarRealtime(idChat: string) {
    supabase
      .channel(`chat-${idChat}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mensagens",
          filter: `chat_id=eq.${idChat}`,
        },
        async () => {
          await carregarMensagens(idChat);
        }
      )
      .subscribe();
  }

  function mensagemValida(texto: string) {
    const textoLower = texto.toLowerCase();

    const bloqueados = [
      "whatsapp",
      "whats",
      "zap",
      "telefone",
      "celular",
      "email",
      "e-mail",
      "gmail",
      "hotmail",
      "outlook",
      "telegram",
      "instagram",
      "pix",
      "chave pix",
    ];

    if (textoLower.includes("@")) return false;
    if (bloqueados.some((t) => textoLower.includes(t))) return false;

    const numeros = texto.replace(/\D/g, "");

    if (numeros.length >= 8) return false;

    return true;
  }

  async function enviarMensagem() {
    if (!usuario || !chatId) return;

    if (!mensagem.trim()) return;

    if (!mensagemValida(mensagem)) {
      alert("Não é permitido compartilhar telefone, WhatsApp, PIX, email ou contato externo.");
      return;
    }

    try {
      setEnviando(true);

      const texto = mensagem.trim();
      setMensagem("");

      const { error } = await supabase.from("mensagens").insert([
        {
          chat_id: chatId,
          remetente_id: usuario.id,
          mensagem: texto,
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao enviar mensagem.");
      }
    } finally {
      setEnviando(false);
    }
  }

  function voltarPainel() {
    if (usuario?.tipo_usuario === "freelancer") return "/convites";
    if (usuario?.tipo_usuario === "contratante") return "/meus-projetos";
    return "/";
  }

  if (loading) {
    return <Loading />;
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
            Não foi possível localizar ou criar o chat deste projeto.
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
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Chat do Projeto</h1>

            <p className="mt-2 text-sm text-emerald-300">
              Conectado em tempo real
            </p>
          </div>

          <Link
            href={voltarPainel()}
            className="rounded-xl border border-white/20 px-5 py-3 font-bold hover:bg-white/5"
          >
            Voltar
          </Link>
        </div>

        <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          Por segurança, não compartilhe WhatsApp, telefone, PIX, e-mail ou contatos externos.
        </div>

        <div
          ref={mensagensRef}
          className="mb-4 h-[580px] overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-900 p-6"
        >
          {mensagens.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-400">Nenhuma mensagem ainda.</p>
            </div>
          )}

          <div className="space-y-4">
            {mensagens.map((m) => {
              const minha = m.remetente_id === usuario.id;

              return (
                <div
                  key={m.id}
                  className={`flex ${minha ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-xl ${
                      minha
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-7">
                      {m.mensagem}
                    </p>

                    {m.created_at && (
                      <p
                        className={`mt-3 text-right text-xs ${
                          minha ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <textarea
            rows={2}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
              }
            }}
            placeholder="Digite sua mensagem..."
            className="flex-1 resize-none rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500"
          />

          <button
            onClick={enviarMensagem}
            disabled={enviando}
            className="rounded-2xl bg-emerald-400 px-8 py-4 font-black text-slate-950 disabled:opacity-60"
          >
            {enviando ? "..." : "Enviar"}
          </button>
        </div>
      </section>
    </main>
  );
}