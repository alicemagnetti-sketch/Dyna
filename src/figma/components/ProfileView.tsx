"use client";

import { useState } from "react";
import {
  User,
  Settings,
  FileText,
  ChevronRight,
  LogOut,
  Heart,
  Download,
  Bell,
  ChevronLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import {
  requestNotificationPermission,
  getNotificationPermission,
  getNotificationPrefs,
  setNotificationPrefs,
  setMedicineReminder,
} from "@/lib/notifications";
import { loadTherapyPlan } from "@/lib/therapy";
import { useProfile, getDisplayName } from "@/context/ProfileContext";
import { clearAllAppStorage } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { ProfilePersonalDataView } from "@/figma/components/profile/ProfilePersonalDataView";
import { ProfileHealthView } from "@/figma/components/profile/ProfileHealthView";

const APPOINTMENT_MINUTES_OPTIONS = [
  { label: "15 min prima", value: 15 },
  { label: "30 min prima", value: 30 },
  { label: "1 ora prima", value: 60 },
  { label: "2 ore prima", value: 120 },
] as const;

type View = "main" | "personal" | "health" | "swab" | "preferences";

export function ProfileView() {
  const { profile, updateProfile } = useProfile();
  const [view, setView] = useState<View>("main");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [prefs, setPrefs] = useState(() =>
    typeof window !== "undefined" ? getNotificationPrefs() : { medicineEnabled: false, appointmentEnabled: false, appointmentMinutesBefore: 15 }
  );
  const currentPermission =
    permission ?? (typeof window !== "undefined" ? getNotificationPermission() : "default");

  const displayName = getDisplayName(profile);
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  const diagnosisLabel = profile.diagnosisDate
    ? `Diagnosi: ${formatDistanceToNow(new Date(profile.diagnosisDate + "T12:00:00"), { addSuffix: false, locale: it })} fa`
    : "Diagnosi: non impostata";

  const handleActivateNotifications = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
  };

  const handleMedicineToggle = (enabled: boolean) => {
    setNotificationPrefs({ medicineEnabled: enabled });
    setPrefs((p) => ({ ...p, medicineEnabled: enabled }));
    const plan = loadTherapyPlan();
    if (enabled) {
      plan.filter((t) => !t.paused).forEach((t) => setMedicineReminder(t.id, t.time, true));
    } else {
      plan.forEach((t) => setMedicineReminder(t.id, "", false));
    }
  };

  const handleAppointmentToggle = (enabled: boolean) => {
    setNotificationPrefs({ appointmentEnabled: enabled });
    setPrefs((p) => ({ ...p, appointmentEnabled: enabled }));
  };

  const handleAppointmentMinutes = (value: number) => {
    setNotificationPrefs({ appointmentMinutesBefore: value });
    setPrefs((p) => ({ ...p, appointmentMinutesBefore: value }));
  };

  const handleResetConfirm = () => {
    clearAllAppStorage();
    setResetDialogOpen(false);
    // Reload completo così calendario, terapia, diario e profilo ripartono da storage vuoto (primo avvio)
    window.location.href = "/onboarding/name";
  };

  if (view === "personal") {
    return (
      <ProfilePersonalDataView
        profile={profile}
        onBack={() => setView("main")}
        onSave={(data) => {
          updateProfile({
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            dateOfBirth: data.dateOfBirth,
          });
        }}
      />
    );
  }

  if (view === "health") {
    return (
      <ProfileHealthView
        profile={profile}
        onBack={() => setView("main")}
        onSave={(data) => {
          updateProfile({
            diagnosisDate: data.diagnosisDate,
            specialists: data.specialists,
            swabVisits: data.swabVisits,
          });
        }}
      />
    );
  }

  if (view === "preferences") {
    return (
      <div className="p-4 pb-24 min-h-dvh bg-[#F8FBF9]">
        <button
          type="button"
          onClick={() => setView("main")}
          className="flex items-center gap-2 text-[#14443F] font-medium mb-6"
        >
          <ChevronLeft size={20} />
          Preferenze App
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-[#14443F] flex items-center gap-2">
              <Bell size={20} />
              Notifiche
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Attiva le notifiche su questo dispositivo e scegli per cosa riceverle.
            </p>
          </div>
          <div className="p-4 space-y-4">
            {currentPermission !== "granted" ? (
              <button
                type="button"
                onClick={handleActivateNotifications}
                className="w-full py-3 rounded-xl bg-[#14443F] text-white font-medium text-sm hover:bg-[#0f332f] transition-colors"
              >
                {currentPermission === "denied"
                  ? "Notifiche bloccate (apri impostazioni browser)"
                  : "Attiva notifiche su questo dispositivo"}
              </button>
            ) : (
              <p className="text-sm text-green-600 font-medium">Notifiche attive su questo dispositivo</p>
            )}
            {currentPermission === "granted" && (
              <>
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <span className="text-sm font-medium text-[#14443F]">Promemoria medicine</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs.medicineEnabled}
                    onClick={() => handleMedicineToggle(!prefs.medicineEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${prefs.medicineEnabled ? "bg-[#14443F]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs.medicineEnabled ? "left-6" : "left-1"}`}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <span className="text-sm font-medium text-[#14443F]">Promemoria appuntamenti</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs.appointmentEnabled}
                    onClick={() => handleAppointmentToggle(!prefs.appointmentEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${prefs.appointmentEnabled ? "bg-[#14443F]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs.appointmentEnabled ? "left-6" : "left-1"}`}
                    />
                  </button>
                </label>
                {prefs.appointmentEnabled && (
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      Avvisami
                    </label>
                    <select
                      value={prefs.appointmentMinutesBefore}
                      onChange={(e) => handleAppointmentMinutes(Number(e.target.value))}
                      className="w-full p-2.5 pr-10 rounded-lg border border-gray-200 text-[#14443F] text-sm bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2314443F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      }}
                    >
                      {APPOINTMENT_MINUTES_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const menuItems: { icon: typeof User; label: string; onClick?: () => void }[] = [
    { icon: User, label: "Dati Personali", onClick: () => setView("personal") },
    { icon: Settings, label: "Preferenze App", onClick: () => setView("preferences") },
    { icon: Heart, label: "Salute e Terapia", onClick: () => setView("health") },
  ];

  return (
    <div className="p-4 pt-8 pb-24 space-y-6 min-h-dvh bg-[#F8FBF9]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#14443F] shadow-inner text-2xl font-bold">
          {initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#14443F]">{displayName}</h2>
          <p className="text-[#5C8D89] text-sm">{diagnosisLabel}</p>
        </div>
      </div>

      <div className="bg-[#14443F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FileText size={20} />
          Report Medico
        </h3>
        <p className="text-white/70 text-sm mb-6 max-w-[80%]">
          Genera un PDF con i dati degli ultimi 30 giorni per la tua prossima visita.
        </p>
        <button className="bg-white text-[#14443F] px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-md active:scale-95 w-full justify-center sm:w-auto">
          <Download size={16} />
          Scarica Report
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-[#14443F] px-2 uppercase text-xs tracking-wider opacity-60">
          Impostazioni
        </h3>
        {menuItems.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={item.onClick}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F5F8F7] flex items-center justify-center text-[#14443F]">
                <item.icon size={20} />
              </div>
              <span className="font-medium text-[#14443F]">{item.label}</span>
            </div>
            {item.onClick && <ChevronRight size={20} className="text-gray-300" />}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setResetDialogOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 mt-4 hover:bg-red-100 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500">
              <LogOut size={20} />
            </div>
            <span className="font-medium">Reset app</span>
          </div>
        </button>
      </div>

      {resetDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setResetDialogOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#14443F] mb-2">Reset app</h3>
            <p className="text-gray-600 text-sm mb-6">
              Tutti i dati salvati su questo dispositivo saranno cancellati e l’app tornerà alla schermata iniziale. Questa azione è irreversibile. Continuare?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setResetDialogOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Sì, resetta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
