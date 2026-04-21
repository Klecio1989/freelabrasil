import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plano, usuarioId } = body;

    let title = "";
    let unit_price = 0;

    if (plano === "plus") {
      title = "Plano Plus - FreelaBrasil";
      unit_price = 19.99;
    } else if (plano === "pro") {
      title = "Plano Pro - FreelaBrasil";
      unit_price = 29.99;
    } else {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 }
      );
    }

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: plano,
            title,
            quantity: 1,
            currency_id: "BRL",
            unit_price,
          },
        ],
        external_reference: `${usuarioId}|${plano}`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/planos?status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/planos?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/planos?status=pending`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({
      init_point: response.init_point,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}