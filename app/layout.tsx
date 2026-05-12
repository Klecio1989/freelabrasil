import "./globals.css";
import Navbar from "@/components/Navbar";

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
      <body>{children}</body>
    </html>
  );
}