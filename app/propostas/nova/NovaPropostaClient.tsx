"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
};

type Props = {
  projetoId: string;
};

export default function NovaPropostaClient({ projetoId }: Props) {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (usuarioSalvo) {
      const usuarioParseado = JSON.parse(usuarioSalvo) as UsuarioLogado;
      setUsuario(usuarioParseado);
    }

    setCarregandoUsuario(false);
  }, []);

  async function enviarProposta() {
    if (!projetoId) {
      alert("Projeto não identificado.");
      return;
    }

    if (!usuario) {
      alert("Você precisa estar logado.");
      router.push("/login");
      return;
    }

    if (usuario.tipo_usuario !== "freelancer") {
      alert("Somente freelancers podem enviar propostas.");
      return;
    }

    if (!valor || !prazo || !mensagem) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.from("propostas").insert([
        {
          projeto_id: projetoId,
          freelancer_id: usuario.id,
          valor,
          prazo: Number(prazo),
          mensagem,
        },
      ]);

      if (error) {
        alert(`Erro ao enviar proposta: ${error.message}`);
        return;
      }

      alert("Proposta enviada com sucesso.");
      router.push("/projetos");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar proposta.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">FreelaBrasil</h1>
            <p className="text-sm text-slate-400">Enviar proposta</p>
          </div>

          <Link
            href="/projetos"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            Voltar para projetos
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-4xl font-black leading-tight md:text-5xl">
            Envie sua proposta
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
              <div className="text-sm text-slate-400">Freelancer logado</div>
              <div className="mt-1 text-lg font-bold">
                {carregandoUsuario
                  ? "Carregando..."
                  : usuario
                  ? usuario.nome
                  : "Nenhum usuário carregado"}
              </div>
              {usuario && (
                <div className="mt-1 text-sm text-slate-400">{usuario.email}</div>
              )}
            </div>

            <div className="mt-8 grid gap-6">
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                placeholder="Valor da proposta"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                placeholder="Prazo em dias"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />

              <textarea
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                placeholder="Mensagem da proposta"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
              />

              <button
                type="button"
                onClick={enviarProposta}
                disabled={carregando || carregandoUsuario}
                className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {carregando ? "Enviando..." : "Enviar proposta"}
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <div className="text-sm text-slate-400">Projeto selecionado</div>
            <div className="mt-2 break-all text-lg font-bold">
              {projetoId || "Projeto não informado"}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}