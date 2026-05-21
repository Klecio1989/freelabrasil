import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.freellabrasil.com.br"),

  title: {
    default: "FreellaBrasil | Marketplace de Freelancers",
    template: "%s | FreellaBrasil",
  },

  description:
    "Encontre freelancers especializados em Power BI, Excel, Python, Automação, Desenvolvimento Web, Design, Marketing e muito mais.",

  keywords: [
    "freelancer",
    "freelancers brasil",
    "power bi",
    "excel",
    "python",
    "automação",
    "desenvolvedor",
    "dashboard",
    "freela",
    "programador",
    "designer",
    "marketing digital",
  ],

  authors: [
    {
      name: "FreellaBrasil",
      url: "https://www.freellabrasil.com.br",
    },
  ],

  creator: "FreellaBrasil",
  publisher: "FreellaBrasil",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.freellabrasil.com.br",
    siteName: "FreellaBrasil",

    title: "FreellaBrasil | Marketplace de Freelancers",

    description:
      "Contrate freelancers ou encontre projetos em Power BI, Excel, Python, Automação, Design, Desenvolvimento Web e muito mais.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FreellaBrasil",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "FreellaBrasil | Marketplace de Freelancers",

    description:
      "Encontre freelancers e projetos em tecnologia, automação, design, marketing e desenvolvimento.",

    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://www.freellabrasil.com.br",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}