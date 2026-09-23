import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RS9 · Escola de Futebol", template: "%s · RS9" },
  description: "Inscrição e gestão de atletas da Escola de Futebol RS9.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
