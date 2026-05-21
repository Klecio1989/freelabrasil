import type { Metadata } from "next";
import Link from "next/link";
import HeaderClient from "./HeaderClient";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.freellabrasil.com.br"),
  title: {
    default: "FreellaBrasil | Marketplace de Freelancers",
    template: "%s | FreellaBrasil",
  },
  description:
    "Marketplace profissional de freelancers do Brasil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white">
        <HeaderClient />

        {children}

        <footer className="border-t border-white/10 bg-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                <span className="text-white">Freella</span>
                <span className="text-emerald-400">Brasil</span>
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Marketplace profissional de freelancers do Brasil.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <Link href="/planos">Planos</Link>
              <Link href="/projetos">Projetos</Link>
              <Link href="/freelancers">Freelancers</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}