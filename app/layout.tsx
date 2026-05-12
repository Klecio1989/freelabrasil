import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Clarity from "@/components/Clarity";


export const metadata = {
  title: "FreellaBrasil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <Navbar />
      <Footer />
      <GoogleAnalytics />
      <Clarity />          
      <body>{children}</body>
    </html>
  );
}