import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leboncoin Price Tracker — Offres en temps réel",
  description:
    "Suivez les prix et comparez les meilleures offres Leboncoin.fr. Recherche d'objets, images, prix et localisation dans un interface style Apple.",
  keywords: ["leboncoin", "price tracker", "RTX 5060", "offres", "annonce"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a84ff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
