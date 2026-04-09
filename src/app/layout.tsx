import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inscription guidée pour tracker privé",
  description:
    "Onboarding interactif avec rappel des règles, création de compte après validation."
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
