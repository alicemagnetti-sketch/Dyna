"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingTherapiesPage() {
  const router = useRouter();
  const [text, setText] = useState("");

  function handleContinue() {
    // Per l'MVP usiamo questa schermata solo come raccolta iniziale
    // soft: le terapie verranno gestite in dettaglio dalla pagina
    // /therapies. Qui non salviamo ancora strutturato.
    router.push("/");
  }

  function handleSkip() {
    router.push("/");
  }

  return (
    <main className="min-h-dvh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
          <h1 className="font-heading text-2xl font-semibold leading-tight">
            Quali terapie stai seguendo?
          </h1>
          <p className="text-sm text-muted-foreground">
            Puoi scrivere liberamente i farmaci o le creme che usi. Più avanti
            potrai strutturare il piano terapeutico in dettaglio.
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <label htmlFor="therapies" className="text-sm font-medium font-body">
            Terapie correnti (testo libero)
          </label>
          <Input
            id="therapies"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Es. Lidocaina 2% la sera, antidepressivo a basso dosaggio..."
          />
          <p className="text-xs text-muted-foreground">
            Puoi lasciare vuoto e compilare più avanti.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <Button type="button" onClick={handleContinue} className="h-11">
            Vai al calendario
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={handleSkip}
          >
            Salta per ora
          </Button>
        </section>
      </div>
    </main>
  );
}

