"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OnboardingNamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trimmed = useMemo(() => name.trim(), [name]);

  function onContinue() {
    if (!trimmed) {
      setError("Inserisci il tuo nome (puoi cambiarlo più tardi).");
      return;
    }

    updateProfile({ name: trimmed });
    router.push("/onboarding/age");
  }

  return (
    <main className="min-h-dvh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
          <h1 className="font-heading text-2xl font-semibold leading-tight">
            Come ti chiami?
          </h1>
          <p className="text-sm text-muted-foreground">
            Puoi saltare e completarlo in seguito dal profilo.
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium font-body">
            Nome
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Es. Alice"
            autoComplete="given-name"
            inputMode="text"
          />
          {error ? (
            <p className="text-sm text-destructive-foreground">{error}</p>
          ) : null}
        </section>

        <section className="flex flex-col gap-3">
          <Button type="button" onClick={onContinue} className="h-11">
            Continua
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => {
              updateProfile({ name: null });
              router.push("/onboarding/age");
            }}
          >
            Salta per ora
          </Button>
        </section>
      </div>
    </main>
  );
}


