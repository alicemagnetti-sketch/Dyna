import type { DailyLog, DailyLogDraft, DynaData, Profile } from "./types";

const STORAGE_KEY = "dyna_data_v1";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getEmptyData(): DynaData {
  return {
    profile: {
      name: null,
      age: null,
      diagnosisDate: null,
      swabTest: { result: "non_eseguito", note: null },
      currentTherapies: [],
      features: { voidingDiaryEnabled: false },
    },
    dailyLogs: [],
    medications: [],
    voidingEntries: [],
    appointments: [],
  };
}

export function loadData(): DynaData {
  if (typeof window === "undefined") return getEmptyData();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getEmptyData();

  try {
    return JSON.parse(raw) as DynaData;
  } catch {
    return getEmptyData();
  }
}

export function saveData(data: DynaData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ---- Profile helpers ----

export function getProfile(): Profile {
  return loadData().profile;
}

export function updateProfile(partial: Partial<Profile>): DynaData {
  const data = loadData();

  const updated: DynaData = {
    ...data,
    profile: {
      ...data.profile,
      ...partial,
      swabTest: partial.swabTest
        ? { ...data.profile.swabTest, ...partial.swabTest }
        : data.profile.swabTest,
      features: partial.features
        ? { ...data.profile.features, ...partial.features }
        : data.profile.features,
      currentTherapies: partial.currentTherapies ?? data.profile.currentTherapies,
    },
  };

  saveData(updated);
  return updated;
}

// ---- Daily log helpers ----

export function getDailyLogByDate(date: string): DailyLog | undefined {
  return loadData().dailyLogs.find((log) => log.date === date);
}

export function upsertDailyLog(draft: DailyLogDraft): DynaData {
  const data = loadData();
  const now = new Date().toISOString();

  const log: DailyLog = {
    id: draft.id ?? newId(),
    date: draft.date,
    painLevel: draft.painLevel,
    menstruation: draft.menstruation,
    flowIntensity: draft.flowIntensity ?? null,
    therapyAdherenceSimple: draft.therapyAdherenceSimple ?? null,
    notes: draft.notes ?? "",
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
  };

  const idx = data.dailyLogs.findIndex((x) => x.id === log.id || x.date === log.date);

  const nextLogs =
    idx === -1
      ? [...data.dailyLogs, log]
      : data.dailyLogs.map((x, i) =>
          i === idx ? { ...x, ...log, createdAt: x.createdAt } : x,
        );

  const updated: DynaData = { ...data, dailyLogs: nextLogs };
  saveData(updated);
  return updated;
}

export function listDailyLogsInMonth(year: number, month: number): DailyLog[] {
  const data = loadData();
  const monthStr = String(month).padStart(2, "0");
  const prefix = `${year}-${monthStr}-`;
  return data.dailyLogs.filter((log) => log.date.startsWith(prefix));
}

