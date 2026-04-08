import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formulaire d'inscription guide",
  description:
    "Parcours ludique pour apprendre les bases du peer-to-peer et du ratio avant une inscription."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
