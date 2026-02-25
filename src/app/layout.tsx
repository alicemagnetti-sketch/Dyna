import type { Metadata } from "next";
import "./globals.css";
import { DayEntriesProvider } from "@/context/DayEntriesContext";

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
    <html lang="it">
      <body>
        <DayEntriesProvider>{children}</DayEntriesProvider>
      </body>
    </html>
  );
}
