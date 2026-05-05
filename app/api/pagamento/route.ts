import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { titulo, valor } = body;

    const accessToken = process.env.MP_ACCESS_TOKEN;

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: [
            {
              title: titulo,
              quantity: 1,
              currency_id: "BRL",
              unit_price: Number(valor),
            },
          ],
          back_urls: {
            success: "https://freellabrasil.com.br/sucesso",
            failure: "https://freellabrasil.com.br/erro",
          },
          auto_return: "approved",
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      url: data.init_point,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao gerar pagamento" }, { status: 500 });
  }
}