import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!supabaseUrl || !serviceKey || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Variáveis não configuradas." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();

    console.log("Webhook Mercado Pago recebido:", body);

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split("/")?.pop();

    if (!paymentId) {
      return NextResponse.json({
        success: true,
        message: "Webhook recebido, mas sem paymentId.",
      });
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
        { success: false, error: "Erro ao consultar pagamento." },
        { status: 500 }
      );
    }

    if (pagamento.status !== "approved") {
      await supabaseAdmin
        .from("pagamentos")
        .update({
          status: pagamento.status || "pendente",
          mercado_pago_payment_id: String(paymentId),
        })
        .eq("mercado_pago_payment_id", String(paymentId));

      return NextResponse.json({
        success: true,
        message: `Pagamento ainda não aprovado: ${pagamento.status}`,
      });
    }

    const externalReference = pagamento.external_reference || "";
    const [usuarioId, plano, duracaoRecebida] = externalReference.split("|");

    const duracao = duracaoRecebida || "mensal";

    if (!usuarioId || !plano) {
      return NextResponse.json(
        { success: false, error: "external_reference inválido." },
        { status: 400 }
      );
    }

    const dataExpiracao = calcularDataExpiracao(duracao);

    const { error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .update({
        plano,
        plano_status: "ativo",
        plano_duracao: duracao,
        plano_ativado_em: new Date().toISOString(),
        plano_expira_em: dataExpiracao,
      })
      .eq("id", usuarioId);

    if (usuarioError) {
      console.error("Erro ao atualizar usuário:", usuarioError);

      return NextResponse.json(
        { success: false, error: "Erro ao atualizar plano do usuário." },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("pagamentos").upsert(
      {
        usuario_id: usuarioId,
        plano,
        valor: pagamento.transaction_amount || 0,
        status: "aprovado",
        mercado_pago_payment_id: String(paymentId),
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "mercado_pago_payment_id",
      }
    );

    await supabaseAdmin.from("notificacoes").insert({
      usuario_id: usuarioId,
      titulo: "Plano ativado com sucesso",
      descricao: `Seu plano ${plano.toUpperCase()} foi ativado com sucesso.`,
      link: "/planos",
      lida: false,
    });

    return NextResponse.json({
      success: true,
      message: "Plano ativado via webhook.",
      usuarioId,
      plano,
      duracao,
      paymentId,
    });
  } catch (error: any) {
    console.error("Erro webhook:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro no webhook.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook Mercado Pago ativo.",
  });
}