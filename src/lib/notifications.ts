/**
 * Notifiche locali: permesso, salvataggio reminder (medicine e appuntamenti),
 * controllo periodico e visualizzazione notifiche reali sul dispositivo.
 */

import type { TherapyPlanItem, TherapyVariation, PosologyPeriod } from "@/lib/therapy";

const REMINDERS_KEY = "dyna_reminders_v1";
const SHOWN_KEY = "dyna_notifications_shown_v1";
const PREFS_KEY = "dyna_notification_prefs_v1";
const LOG_KEY = "dyna_notification_log_v1";
const THERAPY_SNAPSHOT_KEY = "dyna_therapy_snapshot_v1";
const THERAPY_VARIATION_SHOWN_KEY = "dyna_therapy_variation_shown_v1";

export type MedicineReminder = { time: string; enabled: boolean };
export type AppointmentReminder = { minutesBefore: number; enabled: boolean };

/** Snapshot di una terapia per confronto (nome, quantità, ora, in pausa). */
export type TherapySnapshotItem = { name: string; quantity: string; time: string; paused: boolean };
export type TherapySnapshotState = Record<string, TherapySnapshotItem>;

export interface NotificationPrefs {
  medicineEnabled: boolean;
  appointmentEnabled: boolean;
  appointmentMinutesBefore: number;
  /** Avvisa quando una terapia viene modificata (quantità, orario, ecc.). */
  therapyChangeEnabled: boolean;
}

export interface NotificationLogEntry {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
}

export interface RemindersState {
  medicine: Record<string, MedicineReminder>;
  appointment: Record<string, AppointmentReminder>;
}

export interface ShownState {
  medicine: Record<string, string>;
  appointment: Record<string, number>;
}

function loadReminders(): RemindersState {
  if (typeof window === "undefined")
    return { medicine: {}, appointment: {} };
  try {
    const raw = window.localStorage.getItem(REMINDERS_KEY);
    if (!raw) return { medicine: {}, appointment: {} };
    const parsed = JSON.parse(raw) as RemindersState;
    return {
      medicine: parsed.medicine ?? {},
      appointment: parsed.appointment ?? {},
    };
  } catch {
    return { medicine: {}, appointment: {} };
  }
}

function saveReminders(state: RemindersState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(state));
  } catch {}
}

function loadShown(): ShownState {
  if (typeof window === "undefined")
    return { medicine: {}, appointment: {} };
  try {
    const raw = window.localStorage.getItem(SHOWN_KEY);
    if (!raw) return { medicine: {}, appointment: {} };
    return JSON.parse(raw) as ShownState;
  } catch {
    return { medicine: {}, appointment: {} };
  }
}

function saveShown(state: ShownState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHOWN_KEY, JSON.stringify(state));
  } catch {}
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window))
    return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const perm = await Notification.requestPermission();
  return perm;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window))
    return "denied";
  return Notification.permission;
}

export function setMedicineReminder(therapyId: number, time: string, enabled: boolean) {
  const state = loadReminders();
  if (enabled) {
    state.medicine[String(therapyId)] = { time, enabled: true };
  } else {
    delete state.medicine[String(therapyId)];
  }
  saveReminders(state);
}

export function getMedicineReminder(therapyId: number): MedicineReminder | null {
  return loadReminders().medicine[String(therapyId)] ?? null;
}

export function setAppointmentReminder(
  appointmentId: string,
  minutesBefore: number,
  enabled: boolean
) {
  const state = loadReminders();
  if (enabled) {
    state.appointment[appointmentId] = { minutesBefore, enabled: true };
  } else {
    delete state.appointment[appointmentId];
  }
  saveReminders(state);
}

export function getAppointmentReminder(appointmentId: string): AppointmentReminder | null {
  return loadReminders().appointment[appointmentId] ?? null;
}

export function getAllReminders(): RemindersState {
  return loadReminders();
}

function loadPrefs(): NotificationPrefs {
  if (typeof window === "undefined")
    return { medicineEnabled: true, appointmentEnabled: true, appointmentMinutesBefore: 15, therapyChangeEnabled: true };
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return { medicineEnabled: true, appointmentEnabled: true, appointmentMinutesBefore: 15, therapyChangeEnabled: true };
    const parsed = JSON.parse(raw) as NotificationPrefs;
    return {
      medicineEnabled: parsed.medicineEnabled ?? true,
      appointmentEnabled: parsed.appointmentEnabled ?? true,
      appointmentMinutesBefore: parsed.appointmentMinutesBefore ?? 15,
      therapyChangeEnabled: parsed.therapyChangeEnabled ?? true,
    };
  } catch {
    return { medicineEnabled: true, appointmentEnabled: true, appointmentMinutesBefore: 15, therapyChangeEnabled: true };
  }
}

function savePrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function getNotificationPrefs(): NotificationPrefs {
  return loadPrefs();
}

export function setNotificationPrefs(prefs: Partial<NotificationPrefs>) {
  const current = loadPrefs();
  savePrefs({ ...current, ...prefs });
}

function loadLog(): NotificationLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NotificationLogEntry[];
  } catch {
    return [];
  }
}

function saveLog(log: NotificationLogEntry[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = log.slice(-100);
    window.localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function getNotificationLog(): NotificationLogEntry[] {
  return loadLog();
}

export function pushNotificationToLog(title: string, body: string) {
  const log = loadLog();
  log.push({
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title,
    body,
    at: Date.now(),
    read: false,
  });
  saveLog(log);
}

export function markNotificationRead(id: string) {
  const log = loadLog();
  const i = log.findIndex((e) => e.id === id);
  if (i !== -1) {
    log[i] = { ...log[i], read: true };
    saveLog(log);
  }
}

export function markAllNotificationsRead() {
  const log = loadLog().map((e) => ({ ...e, read: true }));
  saveLog(log);
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Aggiunge amount periodi (day/month/year) a una data YYYY-MM-DD; restituisce YYYY-MM-DD. */
function addPeriodToDate(dateKey: string, amount: number, period: PosologyPeriod): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  if (period === "day") {
    date.setDate(date.getDate() + amount);
  } else if (period === "month") {
    date.setMonth(date.getMonth() + amount);
  } else {
    date.setFullYear(date.getFullYear() + amount);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Restituisce le dateKey (YYYY-MM-DD) in cui scatta la variazione: giorno 1, 2, 3... dall'inizio (ogni everyValue everyPeriod). */
function getVariationDateKeys(startDate: string, v: TherapyVariation): string[] {
  const steps = Math.max(0, Math.ceil((v.finalQty - v.initialQty) / v.increaseBy));
  const keys: string[] = [];
  let current = startDate;
  for (let i = 0; i < steps; i++) {
    current = addPeriodToDate(current, v.everyValue, v.everyPeriod);
    keys.push(current);
  }
  return keys;
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function showNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  pushNotificationToLog(title, body);
  try {
    const n = new Notification(title, {
      body,
      tag: `dyna-${Date.now()}`,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {}
}

/** Controlla reminder medicine: se ora corrente coincide e non ancora mostrato oggi, mostra notifica */
export function checkMedicineReminders(therapyNames: Record<number, string>) {
  const prefs = loadPrefs();
  if (!prefs.medicineEnabled) return;
  const reminders = loadReminders();
  const shown = loadShown();
  const today = todayKey();
  const currentMin = nowMinutes();

  for (const [id, r] of Object.entries(reminders.medicine)) {
    if (!r.enabled) continue;
    const reminderMin = timeToMinutes(r.time);
    if (Math.abs(currentMin - reminderMin) > 1) continue;
    if (shown.medicine[id] === today) continue;
    const name = therapyNames[Number(id)] ?? "Farmaco";
    showNotification("Dyna – Promemoria", `${name}: ora di prendere il farmaco.`);
    shown.medicine[id] = today;
    saveShown(shown);
  }
}

/** Controlla reminder appuntamenti: per ogni appuntamento con reminder, se siamo nel minuto di notifica, mostra */
export function checkAppointmentReminders(
  appointments: { id: string; dateKey: string; time: string; label: string }[]
) {
  const prefs = loadPrefs();
  if (!prefs.appointmentEnabled) return;
  const reminders = loadReminders();
  const shown = loadShown();
  const now = Date.now();

  for (const apt of appointments) {
    const r = reminders.appointment[apt.id];
    if (!r?.enabled) continue;
    const [h, m] = apt.time.split(":").map(Number);
    const aptDate = new Date(
      parseInt(apt.dateKey.slice(0, 4), 10),
      parseInt(apt.dateKey.slice(5, 7), 10) - 1,
      parseInt(apt.dateKey.slice(8, 10), 10),
      h ?? 0,
      m ?? 0
    );
    const notifyAt = aptDate.getTime() - r.minutesBefore * 60 * 1000;
    if (now < notifyAt - 60 * 1000) continue;
    if (now > notifyAt + 60 * 1000) continue;
    if (shown.appointment[apt.id]) continue;
    showNotification(
      "Dyna – Appuntamento",
      `${apt.label} tra ${r.minutesBefore} minuti (${apt.time})`
    );
    shown.appointment[apt.id] = now;
    saveShown(shown);
  }
}

function loadTherapySnapshot(): TherapySnapshotState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(THERAPY_SNAPSHOT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as TherapySnapshotState;
  } catch {
    return {};
  }
}

function saveTherapySnapshot(state: TherapySnapshotState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THERAPY_SNAPSHOT_KEY, JSON.stringify(state));
  } catch {}
}

function therapyToSnapshotItem(t: TherapyPlanItem): TherapySnapshotItem {
  return {
    name: t.name,
    quantity: t.quantity,
    time: t.time,
    paused: t.paused,
  };
}

function snapshotEqual(a: TherapySnapshotItem, b: TherapySnapshotItem): boolean {
  return a.name === b.name && a.quantity === b.quantity && a.time === b.time && a.paused === b.paused;
}

/** Stato notifiche "oggi varia" già mostrate: chiave `${therapyId}_${dateKey}`. */
type VariationShownState = Record<string, true>;

function loadVariationShown(): VariationShownState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(THERAPY_VARIATION_SHOWN_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VariationShownState;
  } catch {
    return {};
  }
}

function saveVariationShown(state: VariationShownState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THERAPY_VARIATION_SHOWN_KEY, JSON.stringify(state));
  } catch {}
}

/** Per ogni terapia con "la terapia varia nel tempo", se oggi è un giorno di variazione, mostra notifica (una volta per terapia/data). */
export function checkTherapyVariationReminders(plan: TherapyPlanItem[]) {
  const prefs = loadPrefs();
  if (!prefs.therapyChangeEnabled) return;
  const today = todayKey();
  const shown = loadVariationShown();
  for (const t of plan) {
    if (t.paused || !t.therapyVariation) continue;
    const v = t.therapyVariation;
    const variationDates = getVariationDateKeys(t.startDate, v);
    if (!variationDates.includes(today)) continue;
    const key = `${t.id}_${today}`;
    if (shown[key]) continue;
    showNotification(
      "Dyna – Terapia",
      `Oggi la terapia "${t.name}" varia: controlla la nuova posologia.`
    );
    shown[key] = true;
    saveVariationShown(shown);
  }
}

/** Confronta il piano terapia con l'ultimo snapshot; se ci sono modifiche, mostra notifica e aggiorna snapshot. */
export function checkTherapyChanges(plan: TherapyPlanItem[]) {
  const prefs = loadPrefs();
  if (!prefs.therapyChangeEnabled) return;
  const snapshot = loadTherapySnapshot();
  const current: TherapySnapshotState = {};
  for (const t of plan) {
    current[String(t.id)] = therapyToSnapshotItem(t);
  }
  const hasPrevious = Object.keys(snapshot).length > 0;
  if (!hasPrevious) {
    saveTherapySnapshot(current);
    return;
  }
  const changedNames: string[] = [];
  for (const t of plan) {
    const prev = snapshot[String(t.id)];
    const cur = current[String(t.id)];
    if (prev && !snapshotEqual(prev, cur)) changedNames.push(t.name);
  }
  for (const id of Object.keys(snapshot)) {
    if (!current[id]) {
      const name = snapshot[id]?.name ?? "Terapia";
      changedNames.push(`${name} (rimossa o modificata)`);
    }
  }
  if (changedNames.length === 0) {
    saveTherapySnapshot(current);
    return;
  }
  const body =
    changedNames.length === 1
      ? `Modifica a "${changedNames[0]}". Controlla il piano.`
      : `Modifiche a ${changedNames.length} terapie: ${changedNames.slice(0, 3).join(", ")}${changedNames.length > 3 ? "…" : ""}. Controlla il piano.`;
  showNotification("Dyna – Terapia aggiornata", body);
  saveTherapySnapshot(current);
}
