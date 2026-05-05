"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FreelancersPage() {
  const [freelas, setFreelas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase
      .from("ranking_freelancers")
      .select("*")
      .order("media", { ascending: false });

    setFreelas(data || []);
  }

  const filtrados = freelas.filter((f) =>
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-6">
          Encontre freelancers ⭐
        </h1>

        <input
          placeholder="Buscar freelancer..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full mb-6 bg-slate-900 border border-white/10 px-4 py-3 rounded-xl"
        />

        <div className="grid gap-4">
          {filtrados.map((f) => (
            <div
              key={f.id}
              className="bg-white/5 border border-white/10 p-5 rounded-2xl"
            >
              <h2 className="text-xl font-bold">{f.nome}</h2>

              <p className="text-yellow-300 mt-2">
                ⭐ {Number(f.media).toFixed(1)} ({f.total_avaliacoes} avaliações)
              </p>

              <p className="text-sm text-slate-400 mt-2">
                {f.email}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}