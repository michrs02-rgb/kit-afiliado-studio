import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kit do Afiliado Studio — Shopee Vídeos + Google AI Studio",
  description:
    "Crie vídeos contínuos de 15s com Gemini Omni no Google AI Studio, headlines de alta conversão e legendas prontas para a Shopee Vídeos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Afiliado Studio",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-900 text-slate-100 min-h-screen antialiased select-none sm:select-auto">
        {children}
      </body>
    </html>
  );
}
