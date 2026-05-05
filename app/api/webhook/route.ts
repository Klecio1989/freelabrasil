import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const mpAccessToken = process.env.MP_ACCESS_TOKEN!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split?.("/")?.pop() ||
      null;

    const topic = body?.type || body?.topic || body?.action || "";

    console.log("Webhook Mercado Pago recebido:", {
      topic,
      paymentId,
      body,
    });

    if (!paymentId) {
      return NextResponse.json({ received: true, ignored: "sem payment id" });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      }
    );

    const payment = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error("Erro ao consultar pagamento MP:", payment);
      return NextResponse.json(
        { received: true, error: "erro ao consultar pagamento" },
        { status: 200 }
      );
    }

    const mpStatus = payment.status;
    const externalReference = payment.external_reference;

    let referencia: any = {};

    try {
      referencia = externalReference ? JSON.parse(externalReference) : {};
    } catch {
      referencia = {};
    }

    const pagamentoId = referencia.pagamento_id;
    const projetoId = referencia.projeto_id;

    if (!pagamentoId && !projetoId) {
      console.log("Pagamento sem referência interna:", externalReference);
      return NextResponse.json({
        received: true,
        ignored: "sem referencia interna",
      });
    }

    const updatePayload: any = {
      mp_payment_id: String(payment.id),
      mp_status: mpStatus,
      mp_external_reference: externalReference,
    };

    if (mpStatus === "approved") {
      updatePayload.status = "retido";
      updatePayload.pago_em = new Date().toISOString();
    }

    let query = supabaseAdmin.from("pagamentos").update(updatePayload);

    if (pagamentoId) {
      query = query.eq("id", pagamentoId);
    } else {
      query = query.eq("projeto_id", projetoId);
    }

    const { error } = await query;

    if (error) {
      console.error("Erro ao atualizar pagamento no Supabase:", error);
      return NextResponse.json(
        { received: true, error: "erro supabase" },
        { status: 200 }
      );
    }

    if (mpStatus === "approved") {
      const { data: pagamento } = await supabaseAdmin
        .from("pagamentos")
        .select("freela_id, contratante_id, projeto_id")
        .eq(pagamentoId ? "id" : "projeto_id", pagamentoId || projetoId)
        .maybeSingle();

      if (pagamento) {
        await supabaseAdmin.from("notificacoes").insert([
          {
            usuario_id: pagamento.contratante_id,
            titulo: "Pagamento aprovado",
            descricao:
              "O pagamento do projeto foi aprovado e ficará retido até a conclusão e avaliação.",
            lida: false,
            link: "/meus-projetos",
          },
          {
            usuario_id: pagamento.freela_id,
            titulo: "Pagamento retido",
            descricao:
              "O contratante realizou o pagamento. O valor ficará retido até a confirmação da entrega.",
            lida: false,
            link: "/meus-trabalhos",
          },
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro webhook Mercado Pago:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook Mercado Pago ativo.",
  });
}