import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const { data: freelancers, error: freelancersError } = await supabase
      .from("usuarios")
      .select("id, plano")
      .eq("tipo_usuario", "freelancer");

    if (freelancersError) {
      return NextResponse.json(
        { error: freelancersError.message },
        { status: 500 }
      );
    }

    if (!freelancers || freelancers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum freelancer encontrado.",
      });
    }

    for (const freelancer of freelancers) {
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from("avaliacoes")
        .select("nota")
        .eq("avaliado_id", freelancer.id);

      if (avaliacoesError) {
        console.error("Erro ao buscar avaliações:", avaliacoesError);
        continue;
      }

      const totalAvaliacoes = avaliacoes?.length || 0;

      const notaMedia =
        totalAvaliacoes > 0
          ? avaliacoes.reduce((acc, item) => acc + Number(item.nota || 0), 0) /
            totalAvaliacoes
          : 0;

      const { count: projetosConcluidos, error: projetosError } = await supabase
        .from("projetos_andamento")
        .select("*", { count: "exact", head: true })
        .eq("freela_id", freelancer.id)
        .eq("status", "concluido");

      if (projetosError) {
        console.error("Erro ao buscar projetos concluídos:", projetosError);
      }

      let bonusPlano = 0;

      if (freelancer.plano === "plus") bonusPlano = 10;
      if (freelancer.plano === "pro") bonusPlano = 20;

      const scoreReputacao =
        notaMedia * 20 + (projetosConcluidos || 0) * 5 + bonusPlano;

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({
          nota_media: Number(notaMedia.toFixed(2)),
          projetos_concluidos: projetosConcluidos || 0,
          score_reputacao: Number(scoreReputacao.toFixed(2)),
        })
        .eq("id", freelancer.id);

      if (updateError) {
        console.error("Erro ao atualizar ranking:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Ranking recalculado com sucesso.",
    });
  } catch (error) {
    console.error("Erro geral ao recalcular ranking:", error);

    return NextResponse.json(
      { error: "Erro ao recalcular ranking." },
      { status: 500 }
    );
  }
}