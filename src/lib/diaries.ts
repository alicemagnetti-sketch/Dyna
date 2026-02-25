/** Entità diario: elenco diari attivi (livello 1) */

export type DiaryType = "minzionale" | "personale";

export type Diary = {
  id: string;
  name: string;
  type: DiaryType;
  startDate: string; // YYYY-MM-DD
  /** Solo per type === "personale": contenuto della nota */
  content?: string;
};

const STORAGE_KEY = "dyna_diaries_v1";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function loadDiaries(): Diary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Diary[];
  } catch {
    return [];
  }
}

function saveDiaries(diaries: Diary[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
}

export function addDiary(diary: Omit<Diary, "id">): Diary {
  const list = loadDiaries();
  const newDiary: Diary = {
    ...diary,
    id: newId(),
    content: diary.type === "personale" ? diary.content ?? "" : undefined,
  };
  saveDiaries([...list, newDiary]);
  return newDiary;
}

export function updateDiary(id: string, patch: Partial<Pick<Diary, "name" | "type" | "startDate" | "content">>) {
  const list = loadDiaries();
  const next = list.map((d) => (d.id === id ? { ...d, ...patch } : d));
  saveDiaries(next);
}

export function removeDiary(id: string): void {
  saveDiaries(loadDiaries().filter((d) => d.id !== id));
}

export function getDiary(id: string): Diary | undefined {
  return loadDiaries().find((d) => d.id === id);
}

export const DIARY_TYPE_LABELS: Record<DiaryType, string> = {
  minzionale: "Minzionale",
  personale: "Personale",
};
