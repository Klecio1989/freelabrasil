"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { enviarEmail } from "@/lib/enviarEmail";

export default function NovoConvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const freelaId = searchParams.get("freela_id");

  const [usuario, setUsuario] = useState<any>(null);
  const [freela, setFreela] = useState<any>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [projetoId, setProjetoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const user = localStorage.getItem("freelabrasil_usuario");

    if (!user) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(user);
    setUsuario(parsed);

    if (parsed.tipo_usuario !== "contratante") {
      setLoading(false);
      return;
    }

    if (!freelaId) {
      setLoading(false);
      return;
    }

    const { data: freelaData } = await supabase
      .from("usuarios")
      .select("id,nome,email")
      .eq("id", freelaId)
      .maybeSingle();

    setFreela(freelaData);

    const { data: projetosData } = await supabase
      .from("projetos")
      .select("id,titulo,descricao,status,created_at")
      .eq("contratante_id", parsed.id)
      .order("created_at", { ascending: false });

    setProjetos(projetosData || []);
    setLoading(false);
  }

  async function enviarConvite() {
    if (!usuario) {
      alert("Você precisa estar logado.");
      return;
    }

    if (usuario.tipo_usuario !== "contratante") {
      alert("Apenas contratantes podem enviar convites.");
      return;
    }

    if (!freelaId || !freela) {
      alert("Freelancer não localizado.");
      return;
    }

    if (!projetoId) {
      alert("Selecione um projeto.");
      return;
    }

    if (!mensagem.trim()) {
      alert("Escreva uma mensagem para o freelancer.");
      return;
    }

    try {
      setEnviando(true);

      const { error } = await supabase.from("convites").insert([
        {
          contratante_id: usuario.id,
          freelancer_id: freelaId,
          projeto_id: projetoId,
          mensagem: mensagem.trim(),
          status: "pendente",
          proposta_id: null,
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao enviar convite.");
        return;
      }

      await supabase.from("notificacoes").insert([
        {
          usuario_id: freelaId,
          titulo: "Novo convite recebido 🚀",
          descricao: `${usuario.nome} convidou você para um projeto.`,
          link: "/convites",
          lida: false,
        },
      ]);

      if (freela.email) {
        await enviarEmail({
          para: freela.email,
          assunto: "Você recebeu um convite no FreellaBrasil 🚀",
          titulo: "Você recebeu um novo convite de projeto.",
          mensagem: `
            Olá ${freela.nome},

            ${usuario.nome} convidou você para participar de um projeto na FreellaBrasil.

            Mensagem do contratante:
            ${mensagem.trim()}

            Acesse a plataforma para visualizar e responder ao convite.
          `,
          botaoTexto: "Ver convite",
          botaoLink: "https://www.freellabrasil.com.br/convites",
        });
      }

      alert("Convite enviado com sucesso.");
      router.push("/freelancers");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar convite.");
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando convite...
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

  if (usuario.tipo_usuario !== "contratante") {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Esta área é exclusiva para contratantes.
      </main>
    );
  }

  if (!freela) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Freelancer não encontrado.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/freelancers" className="text-sm font-bold text-emerald-300">
          ← Voltar para freelancers
        </Link>

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h1 className="text-4xl font-black">Convidar freelancer</h1>

          <p className="mt-3 text-slate-400">
            Você está convidando <strong className="text-white">{freela.nome}</strong>.
          </p>

          <div className="mt-8">
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Selecione um projeto
            </label>

            <select
              value={projetoId}
              onChange={(e) => setProjetoId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            >
              <option value="">Escolha um projeto</option>

              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>

            {projetos.length === 0 && (
              <p className="mt-3 text-sm text-yellow-300">
                Você ainda não possui projetos publicados.
              </p>
            )}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Mensagem
            </label>

            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={7}
              placeholder="Explique rapidamente o projeto e por que gostaria de convidar este freelancer..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={enviarConvite}
              disabled={enviando || projetos.length === 0}
              className="rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950 disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar convite"}
            </button>

            <Link
              href="/projetos/novo"
              className="rounded-xl border border-white/20 px-6 py-3 font-bold hover:bg-white/5"
            >
              Criar novo projeto
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}