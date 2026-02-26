import type { DailyLog, DailyLogDraft, DynaData, FluidIntake, Profile, SwabScores, VoidingEntry } from "./types";

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
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      age: null,
      diagnosisDate: null,
      specialists: [],
      swabTest: { result: "non_eseguito", note: null, scores: null },
      swabVisits: [],
      currentTherapies: [],
      features: { voidingDiaryEnabled: false },
      supportRemoved: false,
    },
    dailyLogs: [],
    medications: [],
    fluidIntakes: [],
    voidingEntries: [],
    appointments: [],
  };
}

export function loadData(): DynaData {
  if (typeof window === "undefined") return getEmptyData();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getEmptyData();

  try {
    const data = JSON.parse(raw) as DynaData;
    if (!Array.isArray(data.fluidIntakes)) data.fluidIntakes = [];
    if (!Array.isArray(data.voidingEntries)) data.voidingEntries = [];
    return data;
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
  const data = loadData();
  const p = data.profile;
  return {
    name: p.name ?? null,
    firstName: p.firstName ?? null,
    lastName: p.lastName ?? null,
    dateOfBirth: p.dateOfBirth ?? null,
    age: p.age ?? null,
    diagnosisDate: p.diagnosisDate ?? null,
    specialists: Array.isArray(p.specialists) ? p.specialists : [],
    swabTest: {
      result: p.swabTest?.result ?? "non_eseguito",
      note: p.swabTest?.note ?? null,
      scores: p.swabTest?.scores ?? null,
    },
    swabVisits: Array.isArray(p.swabVisits) ? p.swabVisits : [],
    currentTherapies: p.currentTherapies ?? [],
    features: p.features ?? { voidingDiaryEnabled: false },
    supportRemoved: p.supportRemoved ?? false,
  };
}

export function updateProfile(partial: Partial<Profile>): DynaData {
  const data = loadData();
  const prev = data.profile;

  const updated: DynaData = {
    ...data,
    profile: {
      ...prev,
      ...partial,
      swabTest: partial.swabTest
        ? (() => {
            const base: Partial<SwabScores> = prev.swabTest.scores ?? {};
            const patch: Partial<SwabScores> = partial.swabTest.scores ?? {};
            const scores: SwabScores = {
              clitoride: patch.clitoride ?? base.clitoride ?? null,
              orefizioUretrale: patch.orefizioUretrale ?? base.orefizioUretrale ?? null,
              labbroDestro: patch.labbroDestro ?? base.labbroDestro ?? null,
              labbroSinistro: patch.labbroSinistro ?? base.labbroSinistro ?? null,
              forchetta: patch.forchetta ?? base.forchetta ?? null,
            };
            return {
              ...prev.swabTest,
              ...partial.swabTest,
              scores: partial.swabTest.scores !== undefined ? scores : prev.swabTest.scores,
            };
          })()
        : prev.swabTest,
      features: partial.features
        ? { ...prev.features, ...partial.features }
        : prev.features,
      currentTherapies: partial.currentTherapies ?? prev.currentTherapies,
      specialists: partial.specialists ?? prev.specialists,
      swabVisits: partial.swabVisits ?? prev.swabVisits,
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

// ---- Voiding diary (fluid intakes + voiding entries) ----

function isNewShapeVoidingEntry(e: unknown): e is VoidingEntry {
  return (
    typeof e === "object" &&
    e !== null &&
    "id" in e &&
    "diaryId" in e &&
    "date" in e &&
    "timestamp" in e &&
    "urgency" in e &&
    typeof (e as VoidingEntry).urgency === "boolean" &&
    "burning" in e &&
    typeof (e as VoidingEntry).burning === "boolean"
  );
}

export function getVoidingEntries(diaryId: string, date: string): VoidingEntry[] {
  const data = loadData();
  return data.voidingEntries.filter(
    (e) => isNewShapeVoidingEntry(e) && e.diaryId === diaryId && e.date === date
  );
}

export function getFluidIntakes(diaryId: string, date: string): FluidIntake[] {
  const data = loadData();
  return (data.fluidIntakes ?? []).filter((f) => f.diaryId === diaryId && f.date === date);
}

export function getFluidIntakesForDiary(diaryId: string): FluidIntake[] {
  const data = loadData();
  return (data.fluidIntakes ?? []).filter((f) => f.diaryId === diaryId);
}

export function getVoidingEntriesForDiary(diaryId: string): VoidingEntry[] {
  const data = loadData();
  return data.voidingEntries.filter(
    (e) => isNewShapeVoidingEntry(e) && e.diaryId === diaryId
  );
}

export function upsertVoidingEntry(entry: VoidingEntry): DynaData {
  const data = loadData();
  const idx = data.voidingEntries.findIndex((e) => e.id === entry.id);
  const next = idx === -1 ? [...data.voidingEntries, entry] : data.voidingEntries.map((e, i) => (i === idx ? entry : e));
  const updated: DynaData = { ...data, voidingEntries: next };
  saveData(updated);
  return updated;
}

export function removeVoidingEntry(id: string): DynaData {
  const data = loadData();
  const updated: DynaData = { ...data, voidingEntries: data.voidingEntries.filter((e) => e.id !== id) };
  saveData(updated);
  return updated;
}

export function upsertFluidIntake(entry: FluidIntake): DynaData {
  const data = loadData();
  const intakes = data.fluidIntakes ?? [];
  const idx = intakes.findIndex((f) => f.id === entry.id);
  const next = idx === -1 ? [...intakes, entry] : intakes.map((f, i) => (i === idx ? entry : f));
  const updated: DynaData = { ...data, fluidIntakes: next };
  saveData(updated);
  return updated;
}

export function removeFluidIntake(id: string): DynaData {
  const data = loadData();
  const updated: DynaData = { ...data, fluidIntakes: (data.fluidIntakes ?? []).filter((f) => f.id !== id) };
  saveData(updated);
  return updated;
}

/** Chiavi localStorage usate dall'app (per reset completo) */
const ALL_APP_KEYS = [
  "dyna_data_v1",
  "dyna-day-entries",
  "dyna_diaries_v1",
  "dyna_reminders_v1",
  "dyna_notifications_shown_v1",
  "dyna_notification_prefs_v1",
  "dyna_notification_log_v1",
  "dyna_therapy_snapshot_v1",
  "dyna_therapy_variation_shown_v1",
  "dyna-therapy-plan",
  "dyna-therapy-history",
];

/** Cancella tutto lo storage locale. Da usare dopo conferma Reset app. */
export function clearAllAppStorage(): void {
  if (typeof window === "undefined") return;
  ALL_APP_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

