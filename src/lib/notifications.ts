/**
 * Notifiche locali: permesso, salvataggio reminder (medicine e appuntamenti),
 * controllo periodico e visualizzazione notifiche reali sul dispositivo.
 */

const REMINDERS_KEY = "dyna_reminders_v1";
const SHOWN_KEY = "dyna_notifications_shown_v1";
const PREFS_KEY = "dyna_notification_prefs_v1";
const LOG_KEY = "dyna_notification_log_v1";

export type MedicineReminder = { time: string; enabled: boolean };
export type AppointmentReminder = { minutesBefore: number; enabled: boolean };

export interface NotificationPrefs {
  medicineEnabled: boolean;
  appointmentEnabled: boolean;
  appointmentMinutesBefore: number;
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
    return { medicineEnabled: true, appointmentEnabled: true, appointmentMinutesBefore: 15 };
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return { medicineEnabled: true, appointmentEnabled: true, appointmentMinutesBefore: 15 };
    const parsed = JSON.parse(raw) as NotificationPrefs;
    return {
      medicineEnabled: parsed.medicineEnabled ?? true,
      appointmentEnabled: parsed.appointmentEnabled ?? true,
      appointmentMinutesBefore: parsed.appointmentMinutesBefore ?? 15,
    };
  } catch {
    return { medicineEnabled: true, appointmentEnabled: true, appointmentMinutesBefore: 15 };
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
