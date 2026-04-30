import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Duracao = "mensal" | "trimestral" | "anual";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN ausente" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const payment = await res.json();

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    let usuarioId = payment.metadata?.usuario_id;
    let plano = payment.metadata?.plano;
    let duracao: Duracao = payment.metadata?.duracao;

    if ((!usuarioId || !plano || !duracao) && payment.external_reference) {
      const partes = String(payment.external_reference).split("|");
      usuarioId = partes[0];
      plano = partes[1];
      duracao = partes[2] as Duracao;
    }

    if (!usuarioId || !plano || !duracao) {
      return NextResponse.json(
        { error: "Metadata incompleta no pagamento" },
        { status: 400 }
      );
    }

    const mesesPorDuracao: Record<Duracao, number> = {
      mensal: 1,
      trimestral: 3,
      anual: 12,
    };

    const validade = new Date();
    validade.setMonth(validade.getMonth() + mesesPorDuracao[duracao]);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from("usuarios")
      .update({
        plano,
        plano_validade: validade.toISOString(),
      })
      .eq("id", usuarioId);

    await supabase.from("pagamentos").insert([
      {
        usuario_id: usuarioId,
        plano,
        duracao,
        valor: payment.transaction_amount,
        status: "pago",
        pagamento_id: String(paymentId),
      },
    ]);

    await supabase.from("notificacoes").insert([
      {
        usuario_id: usuarioId,
        titulo: "Plano ativado",
        descricao: `Seu plano ${String(plano).toUpperCase()} foi ativado por ${
          duracao === "mensal"
            ? "1 mês"
            : duracao === "trimestral"
            ? "3 meses"
            : "1 ano"
        }.`,
        lida: false,
        link: "/planos",
      },
    ]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro webhook" },
      { status: 500 }
    );
  }
}