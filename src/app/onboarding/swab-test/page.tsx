"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SwabOption = "positivo" | "negativo" | "non_eseguito";

export default function OnboardingSwabTestPage() {
  const router = useRouter();
  const [result, setResult] = useState<SwabOption | null>(null);
  const [note, setNote] = useState<string>("");

  function handleContinue() {
    if (result) {
      updateProfile({
        swabTest: {
          result,
          note: note.trim() || null,
        },
      });
    }
    router.push("/onboarding/therapies");
  }

  function handleSkip() {
    updateProfile({
      swabTest: {
        result: "non_eseguito",
        note: null,
      },
    });
    router.push("/onboarding/therapies");
  }

  return (
    <main className="min-h-dvh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
          <h1 className="font-heading text-2xl font-semibold leading-tight">
            Hai fatto uno swab test?
          </h1>
          <p className="text-sm text-muted-foreground">
            È il test con il cotton fioc sul vestibolo. Puoi sempre aggiornare
            questa informazione in seguito.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={result === "positivo" ? "primary" : "ghost"}
              className="h-10 flex-1"
              onClick={() => setResult("positivo")}
            >
              Positivo
            </Button>
            <Button
              type="button"
              variant={result === "negativo" ? "primary" : "ghost"}
              className="h-10 flex-1"
              onClick={() => setResult("negativo")}
            >
              Negativo
            </Button>
            <Button
              type="button"
              variant={result === "non_eseguito" ? "primary" : "ghost"}
              className="h-10 flex-1"
              onClick={() => setResult("non_eseguito")}
            >
              Non so / non fatto
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="note" className="text-sm font-medium font-body">
              Note opzionali
            </label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Es. zona più sensibile, commento del medico..."
            />
            <p className="text-xs text-muted-foreground">
              Facoltativo. Puoi lasciare vuoto.
            </p>
          </div>
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

