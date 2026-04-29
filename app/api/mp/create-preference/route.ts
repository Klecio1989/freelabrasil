import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { plano, usuario_id } = body;

  const valor = plano === "plus" ? 19.99 : 29.99;

  const preference = {
    items: [
      {
        title: `Plano ${plano.toUpperCase()} - FreelaBrasil`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: valor,
      },
    ],
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/sucesso`,
      failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/falha`,
      pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/pendente`,
    },
    auto_return: "approved",
    metadata: {
      usuario_id,
      plano,
    },
  };

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    }
  );

  const data = await response.json();

  return NextResponse.json(data);
}