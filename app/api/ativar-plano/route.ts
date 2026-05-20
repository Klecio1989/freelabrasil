import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function calcularDataExpiracao(duracao: string) {
  const data = new Date();

  if (duracao === "trimestral") {
    data.setMonth(data.getMonth() + 3);
    return data.toISOString();
  }

  if (duracao === "anual") {
    data.setFullYear(data.getFullYear() + 1);
    return data.toISOString();
  }

  data.setMonth(data.getMonth() + 1);
  return data.toISOString();
}

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

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN não configurado" },
        { status: 500 }
      );
    }

    const pagamentoResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const pagamento = await pagamentoResponse.json();

    if (!pagamentoResponse.ok) {
      console.error("Erro ao consultar pagamento:", pagamento);

      return NextResponse.json(
        { error: pagamento?.message || "Erro ao consultar pagamento" },
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
    const [usuarioId, plano, duracaoRecebida] = externalReference.split("|");

    const duracao = duracaoRecebida || "mensal";

    if (!usuarioId || !plano) {
      return NextResponse.json(
        { error: "external_reference inválido" },
        { status: 400 }
      );
    }

    const dataExpiracao = calcularDataExpiracao(duracao);

    const { data: usuarioAtualizado, error: usuarioError } = await supabase
      .from("usuarios")
      .update({
        plano,
        plano_status: "ativo",
        plano_duracao: duracao,
        plano_ativado_em: new Date().toISOString(),
        plano_expira_em: dataExpiracao,
      })
      .eq("id", usuarioId)
      .select("*")
      .single();

    if (usuarioError) {
      console.error("Erro ao atualizar usuário:", usuarioError);

      return NextResponse.json(
        { error: "Erro ao atualizar plano" },
        { status: 500 }
      );
    }

    await supabase
      .from("pagamentos")
      .update({
        status: "aprovado",
        mercado_pago_payment_id: String(paymentId),
      })
      .eq("usuario_id", usuarioId)
      .eq("plano", plano)
      .eq("status", "pendente");

    return NextResponse.json({
      ok: true,
      plano,
      duracao,
      usuarioId,
      plano_expira_em: dataExpiracao,
      usuario: usuarioAtualizado,
    });
  } catch (error) {
    console.error("Erro interno ativar plano:", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}