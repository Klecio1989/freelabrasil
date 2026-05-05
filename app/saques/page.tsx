"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminSaquesPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [saques, setSaques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    const { data, error } = await supabase
      .from("saques")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar saques.");
      setLoading(false);
      return;
    }

    setSaques(data || []);
    setLoading(false);
  }

  async function atualizarStatus(id: string, status: "pago" | "cancelado") {
    const confirmar = confirm(
      status === "pago"
        ? "Confirma que este saque foi pago?"
        : "Confirma o cancelamento deste saque?"
    );

    if (!confirmar) return;

    const payload: any = {
      status,
    };

    if (status === "pago") {
      payload.pago_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("saques")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao atualizar saque.");
      return;
    }

    alert(status === "pago" ? "Saque marcado como pago." : "Saque cancelado.");
    carregar();
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function corStatus(status: string) {
    if (status === "pago") return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
    if (status === "cancelado") return "text-red-300 bg-red-400/10 border-red-400/20";
    return "text-yellow-300 bg-yellow-400/10 border-yellow-400/20";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando...
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Admin - Saques</h1>
            <p className="mt-3 text-slate-400">
              Aprove, cancele e acompanhe solicitações de saque dos freelancers.
            </p>
          </div>

          <Link href="/admin" className="rounded-xl border border-white/20 px-5 py-3 font-bold">
            Voltar
          </Link>
        </div>

        {saques.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            Nenhum saque solicitado.
          </div>
        )}

        <div className="grid gap-5">
          {saques.map((s) => (
            <div key={s.id} className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    {formatar(Number(s.valor || 0))}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Freela ID: {s.freela_id}
                  </p>

                  {s.chave_pix && (
                    <p className="mt-2 text-sm text-slate-300">
                      PIX: {s.chave_pix}
                    </p>
                  )}

                  {s.created_at && (
                    <p className="mt-2 text-sm text-slate-500">
                      Solicitado em {new Date(s.created_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>

                <span className={`rounded-full border px-4 py-2 text-sm font-bold ${corStatus(s.status)}`}>
                  {s.status || "pendente"}
                </span>
              </div>

              {s.status === "pendente" && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => atualizarStatus(s.id, "pago")}
                    className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950"
                  >
                    Marcar como pago
                  </button>

                  <button
                    onClick={() => atualizarStatus(s.id, "cancelado")}
                    className="rounded-xl border border-red-400 px-5 py-3 font-bold text-red-300"
                  >
                    Cancelar saque
                  </button>
                </div>
              )}

              {s.status === "pago" && s.pago_at && (
                <p className="mt-4 font-bold text-emerald-300">
                  Pago em {new Date(s.pago_at).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}