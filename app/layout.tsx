import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";


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
      <body>{children}</body>
    </html>
  );
}