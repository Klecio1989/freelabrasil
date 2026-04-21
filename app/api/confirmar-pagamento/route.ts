import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId obrigatório" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const pagamento = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao consultar pagamento no Mercado Pago" },
        { status: 500 }
      );
    }

    if (pagamento.status !== "approved") {
      return NextResponse.json(
        { error: "Pagamento ainda não aprovado" },
        { status: 400 }
      );
    }

    const externalReference = pagamento.external_reference || "";
    const [usuarioId, plano] = externalReference.split("|");

    if (!usuarioId || !plano) {
      return NextResponse.json(
        { error: "external_reference inválido" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("usuarios")
      .update({ plano })
      .eq("id", usuarioId);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao atualizar plano no Supabase" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      plano,
      usuarioId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao confirmar pagamento" },
      { status: 500 }
    );
  }
}