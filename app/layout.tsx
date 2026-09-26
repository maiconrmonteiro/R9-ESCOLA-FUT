import type { Metadata } from "next";
import "./globals.css";

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#042d26",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: { default: "RS9 · Escola de Futebol", template: "%s · RS9" },
  description: "Inscrição e gestão de atletas da Escola de Futebol RS9.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RS9 Escola",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><head><link rel="apple-touch-icon" href="/logo-rs9.png" /></head><body>{children}</body></html>;
}
