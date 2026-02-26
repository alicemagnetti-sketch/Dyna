/**
 * Tipi e costanti per il piano terapia (farmaci editabili).
 * Deploy: terapie di oggi filtrate, giorno/notte creme, opzioni per formato.
 */

export type TherapyFormType =
  | "crema"
  | "gocce"
  | "pastiglia"
  | "bustine"
  | "supposta"
  | "integratore"
  | "ovulo"
  | "altro";

/** Tipologia mostrata in modale (6 opzioni). supposta/integratore mappati a ovulo/altro. */
export const TIPOLOGIA_FORM_OPTIONS: { value: TherapyFormType; label: string }[] = [
  { value: "pastiglia", label: "Pastiglia" },
  { value: "bustine", label: "Bustine" },
  { value: "gocce", label: "Gocce" },
  { value: "crema", label: "Crema" },
  { value: "ovulo", label: "Ovulo" },
  { value: "altro", label: "Altro" },
];

export type PosologyPeriod = "day" | "month" | "year";

/** Posologia: n volte per periodo × n periodi (es. 1 volta al giorno x 4 mesi) */
export interface Posology {
  /** Es. 1 = una volta */
  doseValue: number;
  /** Periodo sinistro: Giorno, Mese, Anno (es. "volta al giorno") */
  dosePeriod: PosologyPeriod;
  /** Es. 4 */
  freqValue: number;
  /** Periodo destro: Giorno, Mese, Anno (es. "4 mesi") */
  freqPeriod: PosologyPeriod;
}

export const POSOLOGY_PERIOD_LABELS: Record<PosologyPeriod, string> = {
  day: "Giorno",
  month: "Mese",
  year: "Anno",
};

/** Etichette per la parte sinistra: "volta al giorno", "volta al mese", "volta all'anno" */
export const POSOLOGY_DOSE_PERIOD_LABELS: Record<PosologyPeriod, string> = {
  day: "volta al giorno",
  month: "volta al mese",
  year: "volta all'anno",
};

/** Etichette plurali per la parte destra: "giorni", "mesi", "anni" */
export const POSOLOGY_FREQ_PERIOD_LABELS_PLURAL: Record<PosologyPeriod, string> = {
  day: "giorni",
  month: "mesi",
  year: "anni",
};

/** La terapia varia nel tempo: da q.tà iniziale aumenta fino a q.tà finale */
export interface TherapyVariation {
  initialQty: number;
  increaseBy: number;
  everyValue: number;
  everyPeriod: PosologyPeriod;
  finalQty: number;
}

export type DurationType = "days" | "months" | "days_per_month";

export type AlternateFrequencyType =
  | "1_day_1_day"   // un giorno uno, un giorno l'altro
  | "1_week_1_week" // una settimana uno, una settimana l'altro
  | "x_months_x_months"; // x mesi uno, x mesi l'altro

export interface TherapyDuration {
  type: DurationType;
  value: number;
}

/** Schema aumento progressivo gocce: es. +1 goccia ogni 7 giorni fino a 12 */
export interface GocceRamp {
  /** Quantità iniziale (gocce) */
  startDrops: number;
  /** Ogni quanti giorni aumentare */
  increaseEveryDays: number;
  /** Di quante gocce aumentare */
  increaseBy: number;
  /** Massimo gocce */
  maxDrops: number;
}

export interface TherapyPlanItem {
  id: number;
  name: string;
  /** Tipologia: pastiglia, bustine, gocce, crema, ovulo, altro */
  form: TherapyFormType;
  /** Specifica se form === "altro" */
  formOther?: string | null;
  /** Quantità/posologia (testo libero o derivato da posology per display) */
  quantity: string;
  /** Posologia strutturata (opzionale, usata dalla modale unificata) */
  posology?: Posology | null;
  /** Data inizio terapia (YYYY-MM-DD) */
  startDate: string;
  /** Durata: x giorni, x mesi (non in modale, default in save) */
  duration: TherapyDuration;
  /** @deprecated usare therapyVariation */
  quantityChangeDate: string | null;
  /** @deprecated usare therapyVariation */
  quantityAfterChange: string | null;
  /** @deprecated usare therapyVariation */
  gocceRamp: GocceRamp | null;
  /** La terapia varia nel tempo (q.tà iniziale → finale) */
  therapyVariation?: TherapyVariation | null;
  /** Alternare con altro farmaco (id) */
  alternateWithId: number | null;
  /** Frequenza alternanza */
  alternateFrequency: AlternateFrequencyType | null;
  /** Valore mesi per alternanza "x mesi / x mesi" */
  alternateMonthsValue: number | null;
  /** Ora assunzione – HH:mm */
  time: string;
  /** Giorno (mattina) o Notte (sera) – usato per tutti i tipi */
  creamTimeOfDay: "day" | "night" | null;
  /** In pausa (non in modale, default false in save) */
  paused: boolean;
  /** Note libere per la terapia */
  notes: string;
}

export const THERAPY_FORM_LABELS: Record<TherapyFormType, string> = {
  crema: "Crema",
  gocce: "Gocce",
  pastiglia: "Pastiglia",
  bustine: "Bustine",
  supposta: "Supposta",
  integratore: "Integratore",
  ovulo: "Ovulo",
  altro: "Altro",
};

export const DURATION_TYPE_LABELS: Record<DurationType, string> = {
  days: "Giorni",
  months: "Mesi",
  days_per_month: "Giorni al mese",
};

export const ALTERNATE_FREQUENCY_LABELS: Record<AlternateFrequencyType, string> = {
  "1_day_1_day": "1 giorno uno, 1 giorno l'altro",
  "1_week_1_week": "1 settimana uno, 1 settimana l'altra",
  "x_months_x_months": "X mesi uno, X mesi l'altro",
};

/** Mappa form salvato a una delle 6 tipologie modale (supposta→ovulo, integratore→altro). */
export function formToTipologia(form: TherapyFormType): TherapyFormType {
  if (form === "supposta") return "ovulo";
  if (form === "integratore") return "altro";
  return form;
}

/** Unità posologia per tipologia (es. pastiglia → mg, crema → applicazioni). */
export function getPosologyUnits(form: TherapyFormType): string[] {
  switch (form) {
    case "pastiglia":
    case "ovulo":
    case "supposta":
      return ["mg", "ml", "unità"];
    case "bustine":
      return ["bustina/e", "mg"];
    case "gocce":
      return ["gocce", "mg"];
    case "crema":
      return ["applicazioni", "pomate", "g"];
    case "integratore":
    case "altro":
    default:
      return ["mg", "ml", "gocce", "bustina/e", "applicazioni", "unità"];
  }
}

/** Da posologia strutturata a stringa per quantity (es. "1 volta al giorno x 4 mesi"). */
export function formatPosologyToQuantity(p: Posology & { doseUnit?: string }): string {
  if ("dosePeriod" in p && p.dosePeriod) {
    const doseBase = POSOLOGY_DOSE_PERIOD_LABELS[p.dosePeriod];
    const doseLabel = p.doseValue === 1 ? doseBase : doseBase.replace(/^volta\s/, "volte ");
    const freqLabel = p.freqValue === 1 ? POSOLOGY_PERIOD_LABELS[p.freqPeriod] : POSOLOGY_FREQ_PERIOD_LABELS_PLURAL[p.freqPeriod];
    return `${p.doseValue} ${doseLabel} x ${p.freqValue} ${freqLabel}`;
  }
  // Legacy: doseUnit (es. "10 mg x 2 Giorno")
  const periodLabel = POSOLOGY_PERIOD_LABELS[p.freqPeriod];
  return `${p.doseValue} ${(p as { doseUnit?: string }).doseUnit ?? "mg"} x ${p.freqValue} ${periodLabel}`;
}

/** Formati considerati "orali" (mostrano quantità e ora) */
export const ORAL_FORMS: TherapyFormType[] = [
  "pastiglia",
  "bustine",
  "gocce",
  "integratore",
];

export function isOralForm(form: TherapyFormType): boolean {
  return ORAL_FORMS.includes(form);
}

export type CreamTimeOfDay = "day" | "night";

/** Restituisce true se questa terapia va mostrata nella lista "terapie di oggi" in base all'alternanza. */
export function shouldShowTherapyToday(
  t: TherapyPlanItem,
  plan: TherapyPlanItem[],
  date: Date
): boolean {
  const other = t.alternateWithId
    ? plan.find((x) => x.id === t.alternateWithId)
    : plan.find((x) => x.alternateWithId === t.id);
  const freq = t.alternateFrequency ?? other?.alternateFrequency ?? null;
  if (!other || !freq) return true;

  const firstId = Math.min(t.id, other.id);
  const start = new Date(
    t.startDate < other.startDate ? t.startDate : other.startDate
  );
  start.setHours(0, 0, 0, 0);
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / msPerDay);

  let showFirst: boolean;
  if (freq === "1_day_1_day") {
    showFirst = daysSinceStart % 2 === 0;
  } else if (freq === "1_week_1_week") {
    const weeksSinceStart = Math.floor(daysSinceStart / 7);
    showFirst = weeksSinceStart % 2 === 0;
  } else if (freq === "x_months_x_months") {
    const monthsValue = t.alternateMonthsValue ?? other?.alternateMonthsValue ?? 1;
    const monthsSinceStart =
      (date.getFullYear() - start.getFullYear()) * 12 +
      (date.getMonth() - start.getMonth()) +
      (date.getDate() >= start.getDate() ? 0 : -1);
    const block = Math.floor(monthsSinceStart / monthsValue);
    showFirst = block % 2 === 0;
  } else {
    return true;
  }
  return t.id === firstId ? showFirst : !showFirst;
}

/** Testo orario per display: Giorno/Notte se impostato, altrimenti ora. */
export function getTherapyTimeDisplay(t: TherapyPlanItem): string {
  if (t.creamTimeOfDay === "day") return "Giorno";
  if (t.creamTimeOfDay === "night") return "Notte";
  return t.time?.trim() ? t.time : "";
}

/** Testo dose per display: posologia, therapyVariation, gocceRamp legacy, o quantity. */
export function getTherapyDoseDisplay(t: TherapyPlanItem): string {
  if (t.posology) {
    const main = formatPosologyToQuantity(t.posology);
    if (t.therapyVariation) {
      const v = t.therapyVariation;
      const periodLabel = POSOLOGY_PERIOD_LABELS[v.everyPeriod];
      return `${main} (da ${v.initialQty} a ${v.finalQty}, +${v.increaseBy} ogni ${v.everyValue} ${periodLabel})`;
    }
    return main;
  }
  if (t.form === "gocce" && t.gocceRamp) {
    const r = t.gocceRamp;
    return `${r.startDrops} goccia/e → +${r.increaseBy} ogni ${r.increaseEveryDays} gg fino a ${r.maxDrops}`;
  }
  return t.quantity || "—";
}

const STORAGE_KEY = "dyna-therapy-plan";
const HISTORY_STORAGE_KEY = "dyna-therapy-history";

export interface TherapyHistoryEntry {
  id: string;
  date: string;
  action: string;
  detail: string;
  therapyId?: number;
}

function newHistoryId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function nextId(plan: TherapyPlanItem[]): number {
  if (plan.length === 0) return 1;
  return Math.max(...plan.map((t) => t.id), 0) + 1;
}

export const DEFAULT_THERAPY_PLAN: TherapyPlanItem[] = [
  {
    id: 1,
    name: "Amitriptilina",
    form: "pastiglia",
    quantity: "10mg",
    startDate: "2024-01-01",
    duration: { type: "months", value: 6 },
    quantityChangeDate: null,
    quantityAfterChange: null,
    gocceRamp: null,
    alternateWithId: null,
    alternateFrequency: null,
    alternateMonthsValue: null,
    time: "22:00",
    creamTimeOfDay: null,
    paused: false,
    notes: "",
  },
  {
    id: 2,
    name: "Lilith",
    form: "bustine",
    quantity: "1 bustina",
    startDate: "2024-01-01",
    duration: { type: "months", value: 3 },
    quantityChangeDate: null,
    quantityAfterChange: null,
    gocceRamp: null,
    alternateWithId: null,
    alternateFrequency: null,
    alternateMonthsValue: null,
    time: "08:00",
    creamTimeOfDay: null,
    paused: false,
    notes: "",
  },
  {
    id: 3,
    name: "Deha / Ubigel",
    form: "crema",
    quantity: "",
    startDate: "2024-01-01",
    duration: { type: "months", value: 6 },
    quantityChangeDate: null,
    quantityAfterChange: null,
    gocceRamp: null,
    alternateWithId: null,
    alternateFrequency: null,
    alternateMonthsValue: null,
    time: "22:30",
    creamTimeOfDay: null,
    paused: false,
    notes: "",
  },
  {
    id: 4,
    name: "Diazepam",
    form: "pastiglia",
    quantity: "2.5mg",
    startDate: "2024-01-01",
    duration: { type: "months", value: 12 },
    quantityChangeDate: null,
    quantityAfterChange: null,
    gocceRamp: null,
    alternateWithId: null,
    alternateFrequency: null,
    alternateMonthsValue: null,
    time: "21:00",
    creamTimeOfDay: null,
    paused: false,
    notes: "",
  },
];

function normalizeItem(t: Partial<TherapyPlanItem> & { id: number; name: string; form: TherapyFormType; startDate: string; duration: TherapyDuration; time: string }): TherapyPlanItem {
  return {
    ...t,
    quantity: t.quantity ?? "",
    formOther: t.formOther ?? null,
    posology: t.posology ?? null,
    quantityChangeDate: t.quantityChangeDate ?? null,
    quantityAfterChange: t.quantityAfterChange ?? null,
    gocceRamp: t.gocceRamp ?? null,
    therapyVariation: t.therapyVariation ?? null,
    alternateWithId: t.alternateWithId ?? null,
    alternateFrequency: t.alternateFrequency ?? null,
    alternateMonthsValue: t.alternateMonthsValue ?? null,
    creamTimeOfDay: t.creamTimeOfDay ?? null,
    paused: t.paused ?? false,
    notes: t.notes ?? "",
  } as TherapyPlanItem;
}

export function loadTherapyPlan(): TherapyPlanItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (TherapyPlanItem | Record<string, unknown>)[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed.map((t) => {
      const item = t as Partial<TherapyPlanItem> & { id: number; name: string; form: TherapyFormType; startDate: string; duration: TherapyDuration; time: string };
      return normalizeItem(item);
    });
  } catch {
    return [];
  }
}

export function loadTherapyHistory(): TherapyHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TherapyHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addTherapyHistoryEntry(entry: Omit<TherapyHistoryEntry, "id">): void {
  if (typeof window === "undefined") return;
  const list = loadTherapyHistory();
  const newEntry: TherapyHistoryEntry = { ...entry, id: newHistoryId() };
  list.unshift(newEntry);
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function saveTherapyPlan(plan: TherapyPlanItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function addTherapyPlanItem(plan: TherapyPlanItem[], item: Omit<TherapyPlanItem, "id">): TherapyPlanItem[] {
  const id = nextId(plan);
  const newItem: TherapyPlanItem = normalizeItem({ ...item, id } as TherapyPlanItem);
  const next = [...plan, newItem];
  saveTherapyPlan(next);
  return next;
}

export function updateTherapyPlanItem(plan: TherapyPlanItem[], id: number, patch: Partial<TherapyPlanItem>): TherapyPlanItem[] {
  const next = plan.map((t) => (t.id === id ? normalizeItem({ ...t, ...patch } as TherapyPlanItem) : t));
  saveTherapyPlan(next);
  return next;
}

export function removeTherapyPlanItem(plan: TherapyPlanItem[], id: number): TherapyPlanItem[] {
  const next = plan.filter((t) => t.id !== id);
  saveTherapyPlan(next);
  return next;
}
