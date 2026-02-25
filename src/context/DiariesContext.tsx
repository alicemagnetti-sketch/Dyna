"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  type Diary,
  type DiaryType,
  loadDiaries,
  addDiary as addDiaryStorage,
  updateDiary as updateDiaryStorage,
  removeDiary as removeDiaryStorage,
} from "@/lib/diaries";

interface DiariesContextValue {
  diaries: Diary[];
  addDiary: (d: Omit<Diary, "id">) => Diary;
  updateDiary: (id: string, patch: Partial<Pick<Diary, "name" | "type" | "startDate" | "content">>) => void;
  removeDiary: (id: string) => void;
  getDiary: (id: string) => Diary | undefined;
  refresh: () => void;
}

const DiariesContext = createContext<DiariesContextValue | null>(null);

export function DiariesProvider({ children }: { children: React.ReactNode }) {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDiaries(loadDiaries());
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => {
    setDiaries(loadDiaries());
  }, []);

  const addDiary = useCallback((d: Omit<Diary, "id">) => {
    const added = addDiaryStorage(d);
    setDiaries(loadDiaries());
    return added;
  }, []);

  const updateDiary = useCallback((id: string, patch: Partial<Pick<Diary, "name" | "type" | "startDate" | "content">>) => {
    updateDiaryStorage(id, patch);
    setDiaries(loadDiaries());
  }, []);

  const removeDiary = useCallback((id: string) => {
    removeDiaryStorage(id);
    setDiaries(loadDiaries());
  }, []);

  const getDiary = useCallback((id: string) => {
    return diaries.find((d) => d.id === id) ?? undefined;
  }, [diaries]);

  if (!hydrated) return null;

  return (
    <DiariesContext.Provider
      value={{
        diaries,
        addDiary,
        updateDiary,
        removeDiary,
        getDiary,
        refresh,
      }}
    >
      {children}
    </DiariesContext.Provider>
  );
}

export function useDiaries() {
  const ctx = useContext(DiariesContext);
  if (!ctx) throw new Error("useDiaries must be used within DiariesProvider");
  return ctx;
}
