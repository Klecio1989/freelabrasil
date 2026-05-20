import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plano, duracao, usuario } = body;

    if (!plano || !duracao || !usuario?.id || !usuario?.email || !usuario?.nome) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!accessToken || !appUrl) {
      return NextResponse.json(
        { error: "Variáveis do Mercado Pago não configuradas" },
        { status: 500 }
      );
    }

    const valores: Record<string, Record<string, number>> = {
      plus: {
        mensal: 19.99,
        trimestral: 54.9,
        anual: 199,
      },
      pro: {
        mensal: 29.99,
        trimestral: 84.9,
        anual: 299,
      },
    };

    if (!valores[plano] || !valores[plano][duracao]) {
      return NextResponse.json(
        { error: "Plano ou duração inválidos" },
        { status: 400 }
      );
    }

    const nomesPlanos: Record<string, string> = {
      plus: "Plus",
      pro: "Pro",
    };

    const nomesDuracao: Record<string, string> = {
      mensal: "Mensal",
      trimestral: "Trimestral",
      anual: "Anual",
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: `Plano ${nomesPlanos[plano]} ${nomesDuracao[duracao]} - FreelaBrasil`,
              quantity: 1,
              unit_price: valores[plano][duracao],
              currency_id: "BRL",
            },
          ],
          payer: {
            name: usuario.nome,
            email: usuario.email,
          },
          external_reference: `${usuario.id}|${plano}|${duracao}`,
          back_urls: {
            success: `${appUrl}/planos/sucesso`,
            failure: `${appUrl}/planos/falhas`,
            pending: `${appUrl}/planos/pendente`,
          },
          auto_return: "approved",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);

      return NextResponse.json(
        { error: data?.message || "Erro ao criar pagamento" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      preference_id: data.id,
    });
  } catch (error) {
    console.error("Erro interno Mercado Pago:", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}