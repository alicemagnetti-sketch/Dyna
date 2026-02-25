"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import {
  type DayEntry,
  dateKey,
  emptyEntry,
  mergeTherapiesForDay,
} from "@/lib/day-entries";

type DayEntriesState = Record<string, DayEntry>;

interface DayEntriesContextValue {
  entries: DayEntriesState;
  getEntry: (date: Date) => DayEntry;
  setEntry: (date: Date, entry: DayEntry) => void;
  hasEntry: (date: Date) => boolean;
}

const DayEntriesContext = createContext<DayEntriesContextValue | null>(null);

export function DayEntriesProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DayEntriesState>({});

  const getEntry = useCallback((date: Date): DayEntry => {
    const key = dateKey(date);
    const stored = entries[key] as (DayEntry & { hasPeriod?: boolean }) | undefined;
    if (!stored) return emptyEntry();
    const base = emptyEntry();
    const periodFlow = stored.periodFlow ?? (stored.hasPeriod ? (stored.periodFlow || "medium") : null);
    const normalized: DayEntry = {
      painLevel: stored.painLevel != null && stored.painLevel >= 1 && stored.painLevel <= 4 ? stored.painLevel : null,
      periodFlow: periodFlow === "light" || periodFlow === "medium" || periodFlow === "heavy" ? periodFlow : null,
      appointments: stored.appointments ?? base.appointments,
      therapies: mergeTherapiesForDay(date, stored.therapies ?? []),
      notes: stored.notes ?? base.notes,
    };
    return normalized;
  }, [entries]);

  const setEntry = useCallback((date: Date, entry: DayEntry) => {
    setEntries((prev) => ({
      ...prev,
      [dateKey(date)]: entry,
    }));
  }, []);

  const hasEntry = useCallback(
    (date: Date) => {
      const key = dateKey(date);
      const e = entries[key];
      if (!e) return false;
      return (
        e.painLevel !== null ||
        e.periodFlow !== null ||
        (e.appointments?.length ?? 0) > 0 ||
        (e.therapies?.some((t) => t.taken) ?? false) ||
        (e.notes?.trim() ?? "") !== ""
      );
    },
    [entries]
  );

  const value: DayEntriesContextValue = {
    entries,
    getEntry,
    setEntry,
    hasEntry,
  };

  return (
    <DayEntriesContext.Provider value={value}>
      {children}
    </DayEntriesContext.Provider>
  );
}

export function useDayEntries() {
  const ctx = useContext(DayEntriesContext);
  if (!ctx) throw new Error("useDayEntries must be used within DayEntriesProvider");
  return ctx;
}
