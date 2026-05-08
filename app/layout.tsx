import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Clarity from "@/components/Clarity";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.freellabrasil.com.br"),

  title: {
    default: "FreellaBrasil | Plataforma de Freelancers com IA",
    template: "%s | FreellaBrasil",
  },

  description:
    "Encontre freelancers especialistas em Power BI, Excel, Python, automações, dashboards, design e tecnologia. Plataforma brasileira com IA integrada.",

  keywords: [
    "freelancer",
    "freelancers brasil",
    "power bi freelancer",
    "excel freelancer",
    "python freelancer",
    "dashboard power bi",
    "automação excel",
    "freella brasil",
    "freellabrasil",
    "desenvolvedor freelancer",
    "freelancer tecnologia",
  ],

  openGraph: {
    title: "FreellaBrasil",
    description:
      "Plataforma brasileira para freelancers e contratantes com IA integrada.",
    url: "https://www.freellabrasil.com.br",
    siteName: "FreellaBrasil",
    locale: "pt_BR",
    type: "website",
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
    title: "FreellaBrasil",
    description: "Plataforma brasileira para freelancers e contratantes.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950">
        <GoogleAnalytics />
        <Clarity />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}