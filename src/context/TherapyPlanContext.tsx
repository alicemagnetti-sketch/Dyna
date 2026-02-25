"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  type TherapyPlanItem,
  type TherapyHistoryEntry,
  loadTherapyPlan,
  loadTherapyHistory,
  addTherapyPlanItem,
  updateTherapyPlanItem,
  removeTherapyPlanItem,
  addTherapyHistoryEntry,
} from "@/lib/therapy";

interface TherapyPlanContextValue {
  plan: TherapyPlanItem[];
  history: TherapyHistoryEntry[];
  addItem: (item: Omit<TherapyPlanItem, "id">) => void;
  updateItem: (id: number, patch: Partial<TherapyPlanItem>) => void;
  removeItem: (id: number) => void;
  setPaused: (id: number, paused: boolean) => void;
}

const TherapyPlanContext = createContext<TherapyPlanContextValue | null>(null);

export function TherapyPlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<TherapyPlanItem[]>([]);
  const [history, setHistory] = useState<TherapyHistoryEntry[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setPlan(loadTherapyPlan());
    setHistory(loadTherapyHistory());
    setHasHydrated(true);
  }, []);

  const addItem = useCallback((item: Omit<TherapyPlanItem, "id">) => {
    setPlan((prev) => {
      const next = addTherapyPlanItem(prev, item);
      const added = next.find((n) => !prev.some((p) => p.id === n.id));
      if (added) {
        addTherapyHistoryEntry({
          date: new Date().toISOString(),
          action: "Aggiunto",
          detail: added.name,
          therapyId: added.id,
        });
        setHistory(loadTherapyHistory());
      }
      return next;
    });
  }, []);

  const updateItem = useCallback((id: number, patch: Partial<TherapyPlanItem>) => {
    setPlan((prev) => {
      const therapy = prev.find((t) => t.id === id);
      const next = updateTherapyPlanItem(prev, id, patch);
      if (therapy) {
        const action =
          patch.paused === true
            ? "In pausa"
            : patch.paused === false
              ? "Ripreso"
              : "Modificato";
        addTherapyHistoryEntry({
          date: new Date().toISOString(),
          action,
          detail: therapy.name,
          therapyId: id,
        });
        setHistory(loadTherapyHistory());
      }
      return next;
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setPlan((prev) => {
      const therapy = prev.find((t) => t.id === id);
      const next = removeTherapyPlanItem(prev, id);
      if (therapy) {
        addTherapyHistoryEntry({
          date: new Date().toISOString(),
          action: "Rimosso",
          detail: therapy.name,
          therapyId: id,
        });
        setHistory(loadTherapyHistory());
      }
      return next;
    });
  }, []);

  const setPaused = useCallback((id: number, paused: boolean) => {
    setPlan((prev) => updateTherapyPlanItem(prev, id, { paused }));
  }, []);

  const value: TherapyPlanContextValue = {
    plan,
    history,
    addItem,
    updateItem,
    removeItem,
    setPaused,
  };

  return (
    <TherapyPlanContext.Provider value={value}>
      {children}
    </TherapyPlanContext.Provider>
  );
}

export function useTherapyPlan() {
  const ctx = useContext(TherapyPlanContext);
  if (!ctx) throw new Error("useTherapyPlan must be used within TherapyPlanProvider");
  return ctx;
}
