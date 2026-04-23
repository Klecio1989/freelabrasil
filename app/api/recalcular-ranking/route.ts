import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST() {
  try {
    const { data: freelancers, error } = await supabase
      .from("usuarios")
      .select("id,plano,nota_media,projetos_concluidos,tempo_resposta_horas,tipo_usuario")
      .eq("tipo_usuario", "freelancer");

    if (error || !freelancers) {
      return NextResponse.json(
        { error: "Erro ao buscar freelancers" },
        { status: 500 }
      );
    }

    for (const f of freelancers) {
      const planoPeso =
        f.plano === "pro" ? 30 :
        f.plano === "plus" ? 15 :
        0;

      const nota = Number(f.nota_media || 0) * 10;
      const concluidos = Math.min(Number(f.projetos_concluidos || 0) * 2, 40);

      const tempoResposta = Number(f.tempo_resposta_horas || 999);
      let bonusResposta = 0;

      if (tempoResposta <= 1) bonusResposta = 20;
      else if (tempoResposta <= 6) bonusResposta = 15;
      else if (tempoResposta <= 24) bonusResposta = 10;
      else if (tempoResposta <= 48) bonusResposta = 5;
      else bonusResposta = 0;

      const score = planoPeso + nota + concluidos + bonusResposta;

      await supabase
        .from("usuarios")
        .update({ score_reputacao: score })
        .eq("id", f.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao recalcular ranking" },
      { status: 500 }
    );
  }
}