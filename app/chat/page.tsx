"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
  const [online, setOnline] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const mensagensRef = useRef<HTMLDivElement>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  useEffect(() => {
    scrollFinal();
  }, [mensagens]);

  function scrollFinal() {
    setTimeout(() => {
      mensagensRef.current?.scrollTo({
        top: mensagensRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

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

    const { data: proposta, error: erroProposta } = await supabase
      .from("propostas")
      .select("id, projeto_id, freelancer_id")
      .eq("id", propostaId)
      .maybeSingle();

    if (erroProposta || !proposta) {
      console.error("Erro proposta:", erroProposta);
      setLoading(false);
      return;
    }

    let contratanteId = null;

    const { data: projeto } = await supabase
      .from("projetos")
      .select("id, contratante_id")
      .eq("id", proposta.projeto_id)
      .maybeSingle();

    contratanteId = projeto?.contratante_id || null;

    if (!contratanteId) {
      const { data: andamento } = await supabase
        .from("projetos_andamento")
        .select("contratante_id")
        .eq("proposta_id", proposta.id)
        .maybeSingle();

      contratanteId = andamento?.contratante_id || null;
    }

    if (!contratanteId) {
      alert("Contratante não localizado para este projeto.");
      setLoading(false);
      return;
    }

    let chatIdEncontrado = null;

    const { data: chatPorProposta } = await supabase
      .from("chats")
      .select("id")
      .eq("proposta_id", proposta.id)
      .maybeSingle();

    chatIdEncontrado = chatPorProposta?.id || null;

    if (!chatIdEncontrado) {
      const { data: chatPorProjeto } = await supabase
        .from("chats")
        .select("id")
        .eq("projeto_id", proposta.projeto_id)
        .eq("freela_id", proposta.freelancer_id)
        .eq("contratante_id", contratanteId)
        .maybeSingle();

      chatIdEncontrado = chatPorProjeto?.id || null;
    }

    if (!chatIdEncontrado) {
      const { data: novoChat, error: erroCriarChat } = await supabase
        .from("chats")
        .insert([
          {
            projeto_id: proposta.projeto_id,
            freela_id: proposta.freelancer_id,
            contratante_id: contratanteId,
            proposta_id: proposta.id,
          },
        ])
        .select("id")
        .single();

      if (erroCriarChat) {
        alert("Erro ao criar chat: " + erroCriarChat.message);
        setLoading(false);
        return;
      }

      chatIdEncontrado = novoChat.id;
    } else {
      await supabase
        .from("chats")
        .update({ proposta_id: proposta.id })
        .eq("id", chatIdEncontrado)
        .is("proposta_id", null);
    }

    setChatId(chatIdEncontrado);

    await carregarMensagens(chatIdEncontrado);
    iniciarRealtime(chatIdEncontrado);

    setLoading(false);
  }

  function iniciarRealtime(idChat: string) {
    setOnline(true);

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

  async function carregarMensagens(idChat: string) {
    const { data } = await supabase
      .from("mensagens")
      .select("*")
      .eq("chat_id", idChat)
      .order("created_at", { ascending: true });

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
    if (termosBloqueados.some((termo) => textoLower.includes(termo))) return false;

    const numeros = texto.replace(/\D/g, "");
    if (numeros.length >= 8) return false;

    return true;
  }

  function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const limiteMb = 10;
    const tamanhoMb = file.size / 1024 / 1024;

    if (tamanhoMb > limiteMb) {
      alert(`Arquivo muito grande. Limite máximo: ${limiteMb}MB.`);
      e.target.value = "";
      return;
    }

    setArquivo(file);
  }

  async function uploadArquivo(file: File) {
    const extensao = file.name.split(".").pop();
    const nomeLimpo = file.name
      .replace(/\s+/g, "-")
      .replace(/[^\w.-]/g, "")
      .toLowerCase();

    const caminho = `${chatId}/${Date.now()}-${nomeLimpo || `arquivo.${extensao}`}`;

    const { error } = await supabase.storage
      .from("chat-arquivos")
      .upload(caminho, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("chat-arquivos")
      .getPublicUrl(caminho);

    return {
      url: data.publicUrl,
      nome: file.name,
    };
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

    if (!mensagem.trim() && !arquivo) {
      return;
    }

    if (mensagem.trim() && !mensagemValida(mensagem)) {
      alert(
        "Não é permitido compartilhar telefone, WhatsApp, PIX, email ou contato externo."
      );
      return;
    }

    try {
      setEnviando(true);

      let arquivoUrl = null;
      let arquivoNome = null;

      if (arquivo) {
        const uploaded = await uploadArquivo(arquivo);
        arquivoUrl = uploaded.url;
        arquivoNome = uploaded.nome;
      }

      const textoMensagem = mensagem.trim();

      setMensagem("");
      setArquivo(null);

      if (inputArquivoRef.current) {
        inputArquivoRef.current.value = "";
      }

      const { error } = await supabase.from("mensagens").insert([
        {
          chat_id: chatId,
          remetente_id: usuario.id,
          mensagem: textoMensagem || null,
          arquivo_url: arquivoUrl,
          arquivo_nome: arquivoNome,
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao enviar mensagem.");
      }
    } catch (error: any) {
      console.error(error);
      alert("Erro ao enviar anexo: " + (error?.message || "erro desconhecido"));
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

            <div className="mt-2 flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  online ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />

              <p className="text-sm text-slate-400">
                {online ? "Conectado em tempo real" : "Offline"}
              </p>
            </div>
          </div>

          <Link
            href={voltarPainel()}
            className="rounded-xl border border-white/20 px-5 py-3 font-bold hover:bg-white/5"
          >
            Voltar
          </Link>
        </div>

        <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          Por segurança, não compartilhe WhatsApp, telefone, PIX, e-mail ou
          contatos externos. Violações podem gerar bloqueio permanente.
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
                    className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-xl ${
                      minhaMensagem
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {m.mensagem && (
                      <p className="whitespace-pre-wrap leading-7">
                        {m.mensagem}
                      </p>
                    )}

                    {m.arquivo_url && (
                      <a
                        href={m.arquivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 block rounded-2xl border px-4 py-3 font-bold underline ${
                          minhaMensagem
                            ? "border-slate-900/20 bg-slate-950/10 text-slate-950"
                            : "border-white/10 bg-slate-950/40 text-emerald-300"
                        }`}
                      >
                        📎 {m.arquivo_nome || "Abrir anexo"}
                      </a>
                    )}

                    <div
                      className={`mt-3 flex items-center justify-end gap-2 text-xs ${
                        minhaMensagem ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      <span>
                        {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {arquivo && (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            <span>📎 {arquivo.name}</span>

            <button
              onClick={() => {
                setArquivo(null);
                if (inputArquivoRef.current) inputArquivoRef.current.value = "";
              }}
              className="font-bold text-red-300"
            >
              Remover
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <input
            ref={inputArquivoRef}
            type="file"
            onChange={selecionarArquivo}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputArquivoRef.current?.click()}
            className="rounded-2xl border border-white/20 px-5 py-4 font-black hover:bg-white/5"
          >
            📎
          </button>

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