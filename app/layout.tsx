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