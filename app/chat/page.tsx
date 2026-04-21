"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Mensagem = {
  id: string;
  mensagem: string;
  remetente_id: string;
  created_at: string;
};

export default function Chat() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const mensagensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const usuario = localStorage.getItem("freelabrasil_usuario");

    if (usuario) {
      const parsed = JSON.parse(usuario);
      setUsuarioId(parsed.id);
    }

    carregarMensagens();

    const channel = supabase
      .channel("chat-mensagens")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
        },
        (payload) => {
          setMensagens((prev) => [...prev, payload.new as Mensagem]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  async function carregarMensagens() {
    const { data } = await supabase
      .from("mensagens")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setMensagens(data as Mensagem[]);
  }

  async function enviarMensagem() {
    if (!novaMensagem.trim() || !usuarioId) return;

    await supabase.from("mensagens").insert([
      {
        mensagem: novaMensagem,
        remetente_id: usuarioId,
      },
    ]);

    setNovaMensagem("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Chat do projeto</h1>

      <div
        ref={mensagensRef}
        className="bg-slate-900 border border-white/10 rounded-xl p-6 h-[450px] overflow-y-auto space-y-4"
      >
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg max-w-[70%] ${
              m.remetente_id === usuarioId
                ? "bg-emerald-400 text-black ml-auto"
                : "bg-slate-700"
            }`}
          >
            {m.mensagem}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <input
          className="flex-1 p-3 rounded bg-slate-800"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem"
        />

        <button
          onClick={enviarMensagem}
          className="bg-emerald-400 text-black px-6 rounded font-bold"
        >
          Enviar
        </button>
      </div>
    </main>
  );
}