"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Proposta = {
  id: string;
  freelancer_id: string;
  projeto_id: string;
  valor: string;
  prazo: number;
  mensagem: string;
  status: string;
  created_at?: string;
  freelancer_nome?: string;
  projeto_titulo?: string;
};

export default function PropostasRecebidasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPropostas();
  }, []);

  function valorParaNumero(valor: string) {
    if (!valor) return 0;

    const limpo = String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    const numero = Number(limpo);

    return isNaN(numero) ? 0 : numero;
  }

  async function carregarPropostas() {
    setCarregando(true);

    const usuarioSalvo = localStorage.getItem("freelabrasil_usuario");

    if (!usuarioSalvo) {
      setCarregando(false);
      return;
    }

    const parsed = JSON.parse(usuarioSalvo);
    setUsuario(parsed);

    const { data: projetos, error: projetosError } = await supabase
      .from("projetos")
      .select("id,titulo")
      .eq("contratante_id", parsed.id);

    if (projetosError) {
      console.error(projetosError);
      alert("Erro ao carregar projetos.");
      setCarregando(false);
      return;
    }

    if (!projetos || projetos.length === 0) {
      setPropostas([]);
      setCarregando(false);
      return;
    }

    const projetoIds = projetos.map((p: any) => p.id);

    const { data: propostasData, error: propostasError } = await supabase
      .from("propostas")
      .select("*")
      .in("projeto_id", projetoIds)
      .order("created_at", { ascending: false });

    if (propostasError) {
      console.error(propostasError);
      alert("Erro ao carregar propostas.");
      setCarregando(false);
      return;
    }

    if (!propostasData) {
      setPropostas([]);
      setCarregando(false);
      return;
    }

    const freelancerIds = [
      ...new Set(propostasData.map((p: any) => p.freelancer_id)),
    ];

    const { data: freelancers } = await supabase
      .from("usuarios")
      .select("id,nome")
      .in("id", freelancerIds);

    const mapFreela = Object.fromEntries(
      freelancers?.map((f: any) => [f.id, f.nome]) || []
    );

    const mapProjeto = Object.fromEntries(
      projetos.map((p: any) => [p.id, p.titulo])
    );

    const formatadas = propostasData.map((p: any) => ({
      ...p,
      freelancer_nome: mapFreela[p.freelancer_id] || "Freelancer",
      projeto_titulo: mapProjeto[p.projeto_id] || "Projeto",
    }));

    setPropostas(formatadas);
    setCarregando(false);
  }

  async function criarProjetoEmAndamento(proposta: Proposta) {
    if (!usuario) return null;

    const { data: existente, error: buscarError } = await supabase
      .from("projetos_andamento")
      .select("id")
      .eq("projeto_id", proposta.projeto_id)
      .maybeSingle();

    if (buscarError) {
      console.error("Erro ao verificar projeto em andamento:", buscarError);
      alert("Erro ao verificar projeto em andamento.");
      return null;
    }

    if (existente) {
      return existente.id;
    }

    const { data, error: insertError } = await supabase
      .from("projetos_andamento")
      .insert([
        {
          projeto_id: proposta.projeto_id,
          freela_id: proposta.freelancer_id,
          contratante_id: usuario.id,
          status: "em_andamento",
          data_inicio: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      console.error("Erro ao criar projeto em andamento:", insertError);
      alert("Erro ao criar projeto em andamento: " + insertError.message);
      return null;
    }

    return data.id;
  }

  async function criarChat(proposta: Proposta) {
    if (!usuario) return;

    const { data: chatExistente } = await supabase
      .from("chats")
      .select("id")
      .eq("projeto_id", proposta.projeto_id)
      .eq("freela_id", proposta.freelancer_id)
      .eq("contratante_id", usuario.id)
      .maybeSingle();

    if (chatExistente) return;

    const { error } = await supabase.from("chats").insert([
      {
        projeto_id: proposta.projeto_id,
        freela_id: proposta.freelancer_id,
        contratante_id: usuario.id,
      },
    ]);

    if (error) {
      console.error("Erro ao criar chat:", error);
    }
  }

  async function criarPagamentoRetido(
    proposta: Proposta,
    projetoAndamentoId: string
  ) {
    if (!usuario) return false;

    const valorBruto = valorParaNumero(proposta.valor);

    if (valorBruto <= 0) {
      alert("O valor da proposta precisa ser maior que zero.");
      return false;
    }

    const { data: pagamentoExistente, error: buscarPagamentoError } =
      await supabase
        .from("pagamentos")
        .select("id")
        .eq("projeto_id", proposta.projeto_id)
        .maybeSingle();

    if (buscarPagamentoError) {
      console.error("Erro ao verificar pagamento:", buscarPagamentoError);
      alert("Erro ao verificar pagamento.");
      return false;
    }

    if (pagamentoExistente) {
      return true;
    }

    /*
      IMPORTANTE:
      A comissão NÃO é calculada aqui no front.
      O banco calcula automaticamente via trigger:
      - taxa_percentual default 5
      - comissao_plataforma = valor_bruto * 5%
      - valor_freelancer = valor_bruto - comissão
    */
    const { error } = await supabase.from("pagamentos").insert([
      {
        projeto_id: proposta.projeto_id,
        projeto_andamento_id: projetoAndamentoId,
        contratante_id: usuario.id,
        freela_id: proposta.freelancer_id,
        valor_bruto: valorBruto,
        status: "retido",
      },
    ]);

    if (error) {
      console.error("Erro ao criar pagamento:", error);
      alert("Erro ao criar pagamento: " + error.message);
      return false;
    }

    return true;
  }

  async function atualizarStatus(
    proposta: Proposta,
    status: "aceita" | "recusada"
  ) {
    if (!usuario) {
      alert("Usuário não localizado.");
      return;
    }

    if (status === "aceita") {
      const confirmar = confirm(
        "Deseja aceitar esta proposta e iniciar o projeto com este freelancer?"
      );

      if (!confirmar) return;

      const projetoAndamentoId = await criarProjetoEmAndamento(proposta);

      if (!projetoAndamentoId) return;

      await criarChat(proposta);

      const pagamentoCriado = await criarPagamentoRetido(
        proposta,
        projetoAndamentoId
      );

      if (!pagamentoCriado) return;
    }

    const { error } = await supabase
      .from("propostas")
      .update({ status })
      .eq("id", proposta.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (status === "aceita") {
      await supabase
        .from("propostas")
        .update({ status: "recusada" })
        .eq("projeto_id", proposta.projeto_id)
        .neq("id", proposta.id)
        .eq("status", "pendente");
    }

    await supabase.from("notificacoes").insert([
      {
        usuario_id: proposta.freelancer_id,
        titulo: status === "aceita" ? "Proposta aceita" : "Proposta recusada",
        descricao:
          status === "aceita"
            ? `Sua proposta para "${proposta.projeto_titulo}" foi aceita. O projeto já está em Meus Trabalhos.`
            : `Sua proposta para "${proposta.projeto_titulo}" foi recusada.`,
        lida: false,
        link: status === "aceita" ? "/meus-trabalhos" : "/minhas-propostas",
      },
    ]);

    setPropostas((prev) =>
      prev.map((p) => {
        if (p.id === proposta.id) {
          return { ...p, status };
        }

        if (status === "aceita" && p.projeto_id === proposta.projeto_id) {
          return p.status === "pendente" || !p.status
            ? { ...p, status: "recusada" }
            : p;
        }

        return p;
      })
    );

    alert(
      status === "aceita"
        ? "Proposta aceita! Projeto iniciado, chat criado e pagamento retido com comissão automática de 5%."
        : "Proposta recusada."
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black">Propostas recebidas</h1>
            <p className="mt-3 text-slate-400">
              Aceite uma proposta para iniciar automaticamente o projeto.
            </p>
          </div>

          <Link
            href="/painel-contratante"
            className="rounded-xl border border-white/20 px-5 py-3 font-bold"
          >
            Voltar
          </Link>
        </div>

        {carregando && <p className="text-slate-400">Carregando...</p>}

        {!carregando && propostas.length === 0 && (
          <p className="text-slate-400">Nenhuma proposta recebida.</p>
        )}

        <div className="grid gap-6">
          {propostas.map((p) => (
            <div
              key={p.id}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{p.projeto_titulo}</h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Freelancer: {p.freelancer_nome}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    p.status === "aceita"
                      ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                      : p.status === "recusada"
                      ? "bg-red-400/10 text-red-300 border border-red-400/20"
                      : "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20"
                  }`}
                >
                  {p.status || "pendente"}
                </span>
              </div>

              <p className="mt-4 text-slate-200">{p.mensagem}</p>

              <div className="mt-4 text-sm text-slate-300">
                💰 Valor: {p.valor} <br />
                🧾 Comissão promocional: 5% calculada automaticamente <br />
                ⏱ Prazo: {p.prazo} dias
              </div>

              <div className="mt-6 flex gap-3 flex-wrap">
                {(!p.status || p.status === "pendente") && (
                  <>
                    <button
                      onClick={() => atualizarStatus(p, "aceita")}
                      className="bg-emerald-400 text-black px-4 py-2 rounded font-bold"
                    >
                      Aceitar e iniciar projeto
                    </button>

                    <button
                      onClick={() => atualizarStatus(p, "recusada")}
                      className="border border-red-400 text-red-300 px-4 py-2 rounded"
                    >
                      Recusar
                    </button>
                  </>
                )}

                {p.status === "aceita" && (
                  <>
                    <Link
                      href="/meus-projetos"
                      className="bg-emerald-400 text-black px-4 py-2 rounded font-bold"
                    >
                      Ver em Meus Projetos
                    </Link>

                    <Link
                      href={`/chat?proposta_id=${p.id}`}
                      className="border border-white/20 px-4 py-2 rounded font-bold"
                    >
                      Abrir chat
                    </Link>
                  </>
                )}

                {p.status === "recusada" && (
                  <span className="text-red-400 font-bold">
                    Proposta recusada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}