import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "LoyerSûr CI — La plateforme immobilière de confiance en Côte d'Ivoire",
  description: "LoyerSûr CI connecte propriétaires et locataires en Côte d'Ivoire. Paiements Mobile Money sécurisés, profils vérifiés, quittances automatiques. Find and rent properties in Abidjan, Cocody, Yopougon, Abobo.",
  keywords: "location appartement abidjan, loyer côte d'ivoire, mobile money rent, immobilier CI, loyersur",
  openGraph: {
    title: "LoyerSûr CI",
    description: "La plateforme immobilière de confiance en Côte d'Ivoire",
    locale: "fr_CI",
    type: "website",
  },
};

import { LangProvider } from "@/lib/lang";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased font-sans bg-bg-cream text-text-main">
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
