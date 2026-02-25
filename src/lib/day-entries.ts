/**
 * Tipi e utilità per i dati giornalieri (sintomi, terapia, note, appuntamenti).
 * Allineato alla pagina Terapia.
 */

export interface Appointment {
  id: string;
  title: string;
  time: string;
}

export interface TherapyEntry {
  id: number;
  name: string;
  dose: string;
  time: string;
  taken: boolean;
}

export interface DayEntry {
  /** 1 = Basso, 4 = Intenso. null = non impostato */
  painLevel: number | null;
  /** null = nessun ciclo. light | medium | heavy = intensità */
  periodFlow: "light" | "medium" | "heavy" | null;
  appointments: Appointment[];
  therapies: TherapyEntry[];
  notes: string;
}

/** Scala dolore: da 1 (Basso) a 4 (Intenso). Nessun valore 0. */
export const PAIN_LABELS: Record<number, string> = {
  1: "Basso",
  2: "Medio",
  3: "Alto",
  4: "Intenso",
};

export const PERIOD_FLOW_LABELS: Record<string, string> = {
  light: "Leggero",
  medium: "Medio",
  heavy: "Intenso",
};

/** Chiave univoca per una data (YYYY-MM-DD) */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Piano terapia allineato alla pagina Terapia: Amitriptilina, Lilith, Deha/Ubigel (alternati), Diazepam */
export const THERAPY_PLAN = [
  { id: 1, name: "Amitriptilina", dose: "10mg", time: "22:00", pattern: "daily" as const },
  { id: 2, name: "Lilith", dose: "1 bustina", time: "08:00", pattern: "daily" as const },
  { id: 3, name: "Deha / Ubigel", dose: "Alternati", time: "22:30", pattern: "alternating" as const },
  { id: 4, name: "Diazepam", dose: "2.5mg", time: "21:00", pattern: "custom" as const },
];

/** Per i giorni alterni: restituisce "Deha" o "Ubigel" in base alla data */
export function getAlternatingTherapyName(date: Date): "Deha" | "Ubigel" {
  const dayOfEpoch = Math.floor(date.getTime() / 86400000);
  return dayOfEpoch % 2 === 0 ? "Deha" : "Ubigel";
}

/** Lista terapie da mostrare per una data (nomi corretti per alternanza) */
export function getTherapiesForDay(date: Date): TherapyEntry[] {
  return THERAPY_PLAN.map((t) => {
    if (t.pattern === "alternating") {
      const name = getAlternatingTherapyName(date);
      return { id: t.id, name, dose: t.dose, time: t.time, taken: false };
    }
    return { id: t.id, name: t.name, dose: t.dose, time: t.time, taken: false };
  });
}

export function emptyEntry(): DayEntry {
  return {
    painLevel: null,
    periodFlow: null,
    appointments: [],
    therapies: [],
    notes: "",
  };
}

/** Merge terapie salvate (taken) con il piano del giorno */
export function mergeTherapiesForDay(date: Date, saved: TherapyEntry[]): TherapyEntry[] {
  const base = getTherapiesForDay(date);
  const byId = new Map(saved.map((t) => [t.id, t]));
  return base.map((t) => ({
    ...t,
    taken: byId.get(t.id)?.taken ?? false,
  }));
}
