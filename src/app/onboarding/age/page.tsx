"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OnboardingAgePage() {
  const router = useRouter();
  const [age, setAge] = useState<string>("");

  function handleContinue() {
    const value = age.trim();
    if (value) {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed < 120) {
        updateProfile({ age: parsed });
      }
    }
    router.push("/onboarding/diagnosis");
  }

  function handleSkip() {
    updateProfile({ age: null });
    router.push("/onboarding/diagnosis");
  }

  return (
    <main className="min-h-dvh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
          <h1 className="font-heading text-2xl font-semibold leading-tight">
            Quanti anni hai?
          </h1>
          <p className="text-sm text-muted-foreground">
            Questa informazione serve solo per contestualizzare meglio i tuoi
            dati.
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <label htmlFor="age" className="text-sm font-medium font-body">
            Età
          </label>
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            min={10}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Es. 27"
          />
          <p className="text-xs text-muted-foreground">
            Puoi saltare questo passo e compilarlo più tardi dal profilo.
          </p>
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

