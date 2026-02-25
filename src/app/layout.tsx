import type { Metadata } from "next";
import "./globals.css";
import { DayEntriesProvider } from "@/context/DayEntriesContext";
import { TherapyPlanProvider } from "@/context/TherapyPlanContext";
import { DiariesProvider } from "@/context/DiariesContext";

/** Versione app: incrementa a ogni deploy per verificare che Netlify serva la build nuova */
const APP_VERSION = "3.0";

export const metadata: Metadata = {
  title: "Dyna",
  description: "Il tuo compagno per la vulvodinia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" data-app-version={APP_VERSION}>
      <body>
        <DayEntriesProvider>
          <TherapyPlanProvider>
          <DiariesProvider>{children}</DiariesProvider>
        </TherapyPlanProvider>
        </DayEntriesProvider>
        {/* Indicatore versione per verificare deploy: rimuovere quando confermato */}
        <span
          className="fixed bottom-20 right-2 text-[10px] text-gray-400/70 pointer-events-none z-0"
          aria-hidden
        >
          v{APP_VERSION}
        </span>
      </body>
    </html>
  );
}
