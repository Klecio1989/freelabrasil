"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function NovaPropostaClient({ projetoId }: any) {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      carregarUsuario(parsed.id);
    }
  }, []);

  async function carregarUsuario(id: string) {
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (data) setUsuario(data);
  }

  function podeEnviarProposta() {
    if (!usuario) return false;

    if (usuario.plano === "gratuito") {
      return usuario.propostas_enviadas < 2;
    }

    if (usuario.plano === "plus") {
      return usuario.propostas_enviadas < 10;
    }

    if (usuario.plano === "pro") {
      return true;
    }

    return false;
  }

  async function enviarProposta() {
    if (!podeEnviarProposta()) {
      alert("Você atingiu o limite do seu plano.");
      return;
    }

    const { error } = await supabase.from("propostas").insert([
      {
        projeto_id: projetoId,
        freelancer_id: usuario.id,
        valor,
        prazo,
        mensagem
      }
    ]);

    if (error) {
      alert("Erro ao enviar proposta");
      return;
    }

    await supabase
      .from("usuarios")
      .update({
        propostas_enviadas: usuario.propostas_enviadas + 1
      })
      .eq("id", usuario.id);

    alert("Proposta enviada");
    router.push("/projetos");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="bg-slate-900 p-10 rounded-xl space-y-4 w-[500px]">

        <h1 className="text-2xl font-bold">Enviar proposta</h1>

        <input
          placeholder="Valor"
          className="w-full p-3 rounded bg-slate-800"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <input
          placeholder="Prazo (dias)"
          className="w-full p-3 rounded bg-slate-800"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
        />

        <textarea
          placeholder="Mensagem"
          className="w-full p-3 rounded bg-slate-800"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />

        <button
          onClick={enviarProposta}
          className="bg-emerald-400 text-black px-6 py-3 rounded font-bold w-full"
        >
          Enviar proposta
        </button>

        {usuario && (
          <p className="text-sm text-slate-400">
            Plano: {usuario.plano} | Propostas usadas: {usuario.propostas_enviadas}
          </p>
        )}

      </div>
    </main>
  );
}