"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
};

export default function NovaPropostaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const projetoId = searchParams.get("projeto_id") || "";

  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (usuarioSalvo) {
      const usuarioParseado = JSON.parse(usuarioSalvo) as UsuarioLogado;
      setUsuario(usuarioParseado);
    }
  }, []);

  async function enviarProposta() {
    console.log("clicou no botão");
    console.log("usuario:", usuario);
    console.log("projetoId:", projetoId);
    console.log("valor:", valor);
    console.log("prazo:", prazo);
    console.log("mensagem:", mensagem);
    
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
        console.log(error);
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

          <div className="flex gap-3">
            <Link
              href="/projetos"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Voltar para projetos
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Proposta freelancer
          </span>

          <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
            Envie sua proposta de forma profissional.
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-300">
            Apresente seu valor, prazo e mensagem de forma clara para aumentar
            suas chances de fechar o projeto.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
            <h3 className="text-2xl font-black">Formulário da proposta</h3>
            <p className="mt-2 text-slate-300">
              Preencha os dados da sua proposta com atenção.
            </p>

            <div className="mt-8 grid gap-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                <div className="text-sm text-slate-400">Freelancer logado</div>
                <div className="mt-1 text-lg font-bold">
                  {usuario ? usuario.nome : "Carregando usuário..."}
                </div>
                {usuario && (
                  <div className="mt-1 text-sm text-slate-400">{usuario.email}</div>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Valor da proposta
                  </label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                    placeholder="Ex.: R$ 1.500"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Prazo em dias
                  </label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                    placeholder="Ex.: 10"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Mensagem da proposta
                </label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  placeholder="Explique por que você é a pessoa certa para esse projeto."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={enviarProposta}
                  disabled={carregando}
                  className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {carregando ? "Enviando..." : "Enviar proposta"}
                </button>

                <Link
                  href="/projetos"
                  className="rounded-xl border border-white/15 px-6 py-3 text-center font-medium text-white transition hover:bg-white/5"
                >
                  Cancelar
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-sm text-slate-400">Projeto selecionado</div>
              <div className="mt-2 break-all text-lg font-bold">
                {projetoId || "Projeto não informado"}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <h3 className="text-xl font-black">Dicas para fechar mais projetos</h3>

              <ul className="mt-4 space-y-3 text-slate-300">
                <li>• Seja claro no valor e no prazo.</li>
                <li>• Mostre segurança e objetividade na mensagem.</li>
                <li>• Explique rapidamente sua experiência na área.</li>
                <li>• Evite propostas genéricas.</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-7">
              <h3 className="text-xl font-black text-white">Agora está mais profissional</h3>
              <p className="mt-3 text-slate-100">
                O sistema usa automaticamente o usuário logado para preencher o
                freelancer da proposta. O usuário não precisa mais digitar ID manualmente.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}