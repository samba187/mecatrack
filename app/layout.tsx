import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fiavo — Suivi de réparation en temps réel pour garages",
    template: "%s — Fiavo",
  },
  description:
    "Fiavo permet aux garages indépendants d'envoyer à chaque client un lien de suivi de réparation : photos, statuts en temps réel, devis validés et signés en ligne. Moins d'appels, zéro litige.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} font-sans`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
