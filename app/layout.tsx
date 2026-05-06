import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "FreellaBrasil",
  description: "Conecta talentos, realiza projetos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}