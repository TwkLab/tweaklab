import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientBackground3D from "@/components/AmbientBackground3D";

export const metadata: Metadata = {
  metadataBase: new URL("https://twklab.com"),
  title: "TweakLab (TWK) — Suporte & Performance com Evidências",
  description:
    "Atendimento técnico remoto especializado em computadores, Windows e desempenho em jogos. Diagnósticos baseados em evidências, medições antes/depois e transparência total.",
  keywords: [
    "TweakLab",
    "TWK",
    "otimização windows",
    "desempenho jogos",
    "diagnóstico pc",
    "stuttering",
    "fps drop",
    "suporte técnico remoto",
    "benchmarks",
  ],
  authors: [{ name: "TweakLab Team" }],
  icons: {
    icon: "/branding/twk-symbol.png",
  },
  openGraph: {
    title: "TweakLab (TWK) — Diagnóstico & Otimização Windows com Evidências",
    description:
      "Sem promessas milagrosas. Diagnosticar antes de otimizar, medir antes e depois com testes reproduzíveis e reversibilidade documentada.",
    url: "https://twklab.com",
    siteName: "TweakLab",
    images: [
      {
        url: "/branding/twk-badge-3d.jpg",
        width: 1200,
        height: 630,
        alt: "TweakLab - Diagnóstico e Performance",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050605",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-twk-bg text-twk-text min-h-screen flex flex-col selection:bg-twk-green selection:text-twk-bg antialiased bg-tech-grid relative overflow-x-hidden">
        {/* Subtle ambient 3D particle & grid field spanning across desktop and mobile */}
        <AmbientBackground3D />

        {/* Ambient lateral edge glow for wide monitors */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,255,136,0.06),transparent)]" />
        <div className="fixed inset-y-0 left-0 w-32 pointer-events-none -z-10 bg-gradient-to-r from-twk-green/[0.02] to-transparent hidden xl:block" />
        <div className="fixed inset-y-0 right-0 w-32 pointer-events-none -z-10 bg-gradient-to-l from-twk-cyber/[0.02] to-transparent hidden xl:block" />

        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
