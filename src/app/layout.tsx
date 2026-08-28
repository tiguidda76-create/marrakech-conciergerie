import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Marrakech Conciergerie | Plateforme de Gestion Hôtelière & Riads",
  description: "Solution SaaS de gestion de conciergerie haut de gamme à Marrakech. Synchronisation iCal, suivi financier en MAD/EUR, gestion des réservations et planification des opérations de ménage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body 
        className="bg-background text-foreground antialiased selection:bg-primary/30 selection:text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
