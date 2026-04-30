import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { plano, usuario_id } = await req.json();

    if (!plano || !usuario_id) {
      return NextResponse.json(
        { error: "Plano ou usuário não informado." },
        { status: 400 }
      );
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!accessToken) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN não configurado na Vercel." },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_BASE_URL não configurado na Vercel." },
        { status: 500 }
      );
    }

    const valor = plano === "plus" ? 19.99 : 29.99;

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
              title: `Plano ${plano.toUpperCase()} - FreelaBrasil`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: valor,
            },
          ],
          back_urls: {
            success: `${baseUrl}/planos/sucesso`,
            failure: `${baseUrl}/planos/falhas`,
            pending: `${baseUrl}/planos/pendente`,
          },
          auto_return: "approved",
          metadata: {
            usuario_id,
            plano,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.message || "Erro Mercado Pago",
          detalhe: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro interno" },
      { status: 500 }
    );
  }
}