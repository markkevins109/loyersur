import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300","400","500","600","700"],
});
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400","500","600","700","800"],
});

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
    <html lang="fr" className={`${inter.variable} ${jakartaSans.variable}`}>
      <body className="antialiased font-sans bg-bg-warm text-text-main">
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
