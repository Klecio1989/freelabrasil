"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminSaquesPage() {
  const [saques, setSaques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState("");

  useEffect(() => {
    carregarSaques();
  }, []);

  async function carregarSaques() {
    setLoading(true);

    const { data } = await supabase
      .from("saques")
      .select("*")
      .order("created_at", { ascending: false });

    setSaques(data || []);
    setLoading(false);
  }

  async function atualizarStatus(
    saqueId: string,
    status: string
  ) {
    setProcessando(saqueId);

    const userLocal = localStorage.getItem("freelabrasil_usuario");

    let adminId = null;

    if (userLocal) {
      const admin = JSON.parse(userLocal);
      adminId = admin.id;
    }

    const { error, data } = await supabase
      .from("saques")
      .update({
        status,
        aprovado_por: adminId,
        aprovado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", saqueId)
      .select("*")
      .single();

    setProcessando("");

    if (error || !data) {
      console.error(error);
      alert("Erro ao atualizar saque.");
      return;
    }

    await supabase.from("notificacoes").insert({
      usuario_id: data.usuario_id,
      titulo:
        status === "aprovado"
          ? "Saque aprovado"
          : "Saque reprovado",
      descricao:
        status === "aprovado"
          ? "Seu saque foi aprovado."
          : "Seu saque foi reprovado.",
      link: "/saques",
      lida: false,
    });

    carregarSaques();
  }

  function corStatus(status: string) {
    if (status === "aprovado") {
      return "text-emerald-300";
    }

    if (status === "reprovado") {
      return "text-red-300";
    }

    return "text-yellow-300";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando saques...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-white">
      <section className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black">
              Administração de Saques
            </h1>

            <p className="mt-4 text-slate-300">
              Gerencie solicitações PIX dos freelancers.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5">

          {saques.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              Nenhum saque encontrado.
            </div>
          )}

          {saques.map((saque) => (
            <div
              key={saque.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-7"
            >

              <div className="flex flex-wrap items-center justify-between gap-6">

                <div>
                  <p className="text-3xl font-black">
                    {Number(saque.valor || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>

                  <p className="mt-3 text-slate-300">
                    PIX {saque.tipo_pix} — {saque.chave_pix}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {saque.created_at
                      ? new Date(saque.created_at).toLocaleString("pt-BR")
                      : ""}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4">

                  <span
                    className={`text-lg font-black ${corStatus(
                      saque.status
                    )}`}
                  >
                    {saque.status?.toUpperCase()}
                  </span>

                  {saque.status === "pendente" && (
                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          atualizarStatus(saque.id, "aprovado")
                        }
                        disabled={processando === saque.id}
                        className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
                      >
                        Aprovar
                      </button>

                      <button
                        onClick={() =>
                          atualizarStatus(saque.id, "reprovado")
                        }
                        disabled={processando === saque.id}
                        className="rounded-xl bg-red-500 px-5 py-3 font-black text-white"
                      >
                        Reprovar
                      </button>

                    </div>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>

      </section>
    </main>
  );
}