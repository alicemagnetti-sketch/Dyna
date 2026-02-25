"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OnboardingDiagnosisPage() {
  const router = useRouter();
  const [date, setDate] = useState<string>("");

  function handleContinue() {
    const value = date.trim();
    if (value) {
      updateProfile({ diagnosisDate: value });
    }
    router.push("/onboarding/swab-test");
  }

  function handleSkip() {
    updateProfile({ diagnosisDate: null });
    router.push("/onboarding/swab-test");
  }

  return (
    <main className="min-h-dvh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
          <h1 className="font-heading text-2xl font-semibold leading-tight">
            Quando ti hanno diagnosticato la vulvodinia?
          </h1>
          <p className="text-sm text-muted-foreground">
            Se non ricordi il giorno esatto va bene anche una data approssimativa.
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <label htmlFor="diagnosis" className="text-sm font-medium font-body">
            Data diagnosi
          </label>
          <Input
            id="diagnosis"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </section>

        <section className="flex flex-col gap-3">
          <Button type="button" onClick={handleContinue} className="h-11">
            Continua
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

