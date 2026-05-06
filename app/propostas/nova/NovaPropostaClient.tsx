"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { enviarEmail } from "../../lib/enviarEmail";

export default function NovaPropostaClient({ projetoId }: any) {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [projeto, setProjeto] = useState<any>(null);
  const [contratante, setContratante] = useState<any>(null);

  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [carregandoIA, setCarregandoIA] = useState(false);

  const [analiseIA, setAnaliseIA] = useState<any>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      await carregarUsuario(parsed.id);
    }

    if (projetoId) {
      await carregarProjeto();
    }
  }

  async function carregarProjeto() {
    const { data, error } = await supabase
      .from("projetos")
      .select("*")
      .eq("id", projetoId)
      .maybeSingle();

    if (error) {
      console.error(error);
      alert("Erro ao carregar projeto.");
      return;
    }

    setProjeto(data);

    if (data?.contratante_id) {
      const { data: contratanteData } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", data.contratante_id)
        .maybeSingle();

      if (contratanteData) {
        setContratante(contratanteData);
      }
    }
  }

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
      return Number(usuario.propostas_enviadas || 0) < 2;
    }

    if (usuario.plano === "plus") {
      return Number(usuario.propostas_enviadas || 0) < 10;
    }

    if (usuario.plano === "pro") {
      return true;
    }

    return false;
  }

  async function melhorarPropostaIA() {
    if (!mensagem.trim()) {
      alert("Escreva uma proposta inicial para a IA melhorar.");
      return;
    }

    try {
      setCarregandoIA(true);

      const res = await fetch("/api/ia/melhorar-proposta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projeto,
          proposta: mensagem,
          valor,
          prazo,
          perfilFreelancer: usuario
        })
      });

      const data = await res.json();

      if (!data.success || !data.resultado) {
        alert("Não foi possível melhorar a proposta agora.");
        return;
      }

      setAnaliseIA(data.resultado);

      if (data.resultado.proposta_melhorada) {
        setMensagem(data.resultado.proposta_melhorada);
      }

    } catch (error) {
      console.error(error);
      alert("Erro ao consultar IA.");
    } finally {
      setCarregandoIA(false);
    }
  }

  async function enviarProposta() {
    if (!usuario) {
      alert("Você precisa estar logado.");
      return;
    }

    if (!projetoId) {
      alert("Projeto não identificado.");
      return;
    }

    if (!valor.trim() || !prazo.trim() || !mensagem.trim()) {
      alert("Preencha valor, prazo e mensagem.");
      return;
    }

    if (!podeEnviarProposta()) {
      alert("Você atingiu o limite do seu plano.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.from("propostas").insert([
        {
          projeto_id: projetoId,
          freelancer_id: usuario.id,
          valor,
          prazo,
          mensagem,
          status: "pendente"
        }
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao enviar proposta.");
        return;
      }

      await supabase
        .from("usuarios")
        .update({
          propostas_enviadas: Number(usuario.propostas_enviadas || 0) + 1
        })
        .eq("id", usuario.id);

      if (contratante?.email) {
        await enviarEmail({
          para: contratante.email,
          assunto: "Nova proposta recebida 🚀",
          titulo: `Você recebeu uma nova proposta no projeto "${projeto?.titulo}"`,
          mensagem: `
            O freelancer ${usuario.nome} enviou uma proposta para seu projeto.

            Valor proposto: ${valor}
            Prazo: ${prazo} dias

            Acesse a plataforma para visualizar os detalhes e iniciar uma conversa.
          `,
          botaoTexto: "Ver propostas",
          botaoLink: "https://www.freellabrasil.com.br/propostas-recebidas"
        });
      }

      if (contratante?.id) {
        await supabase.from("notificacoes").insert([
          {
            usuario_id: contratante.id,
            titulo: "Nova proposta recebida 🚀",
            descricao: `${usuario.nome} enviou uma proposta para o projeto "${projeto?.titulo}".`,
            link: "/propostas-recebidas",
            lida: false
          }
        ]);
      }

      alert("Proposta enviada.");
      router.push("/projetos");

    } catch (error) {
      console.error(error);
      alert("Erro ao enviar proposta.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <section className="mx-auto max-w-4xl">

        <div className="mb-8">
          <h1 className="text-4xl font-black">
            Enviar proposta
          </h1>

          {projeto && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">
                Projeto
              </p>

              <h2 className="mt-1 text-2xl font-black">
                {projeto.titulo}
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                {projeto.descricao}
              </p>

              <p className="mt-3 text-sm text-emerald-300">
                Área: {projeto.area || "Não informada"} | Orçamento:{" "}
                {projeto.orcamento || "Não informado"}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="grid gap-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Valor
              </label>

              <input
                placeholder="Ex: R$ 500"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Prazo em dias
              </label>

              <input
                placeholder="Ex: 7"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Mensagem da proposta
              </label>

              <textarea
                placeholder="Explique como você pode ajudar neste projeto..."
                rows={8}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <h3 className="text-lg font-black text-purple-300">
                    Melhorar proposta com IA
                  </h3>

                  <p className="mt-1 text-sm text-purple-100">
                    A IA deixa sua proposta mais profissional, clara e convincente.
                  </p>
                </div>

                <button
                  onClick={melhorarPropostaIA}
                  disabled={carregandoIA}
                  className="rounded-xl bg-purple-400 px-5 py-3 font-black text-slate-950 disabled:opacity-60"
                >
                  {carregandoIA ? "Melhorando..." : "Melhorar com IA"}
                </button>
              </div>

              {analiseIA && (
                <div className="mt-5 space-y-4">

                  {analiseIA.pontos_fortes?.length > 0 && (
                    <div>
                      <p className="font-bold text-purple-200">
                        Pontos fortes:
                      </p>

                      <ul className="mt-2 list-disc pl-6 text-sm text-slate-200">
                        {analiseIA.pontos_fortes.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analiseIA.alertas?.length > 0 && (
                    <div>
                      <p className="font-bold text-yellow-300">
                        Alertas:
                      </p>

                      <ul className="mt-2 list-disc pl-6 text-sm text-yellow-100">
                        {analiseIA.alertas.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>

            <button
              onClick={enviarProposta}
              disabled={carregando}
              className="rounded-xl bg-emerald-400 px-6 py-4 font-black text-slate-950 disabled:opacity-60"
            >
              {carregando ? "Enviando..." : "Enviar proposta"}
            </button>

            {usuario && (
              <p className="text-sm text-slate-400">
                Plano: {usuario.plano || "gratuito"} | Propostas usadas:{" "}
                {Number(usuario.propostas_enviadas || 0)}
              </p>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}