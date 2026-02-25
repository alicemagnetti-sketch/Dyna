"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Plus, CalendarClock, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDayEntries } from "@/context/DayEntriesContext";
import {
  PAIN_LABELS,
  getAppointmentTypeLabel,
  dateKey,
  parseDateKey,
  type Appointment,
  type AppointmentType,
} from "@/lib/day-entries";

interface SymptomTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
}

const PAIN_LEVELS = [1, 2, 3, 4] as const;
const PAIN_STYLES: Record<number, string> = {
  1: "bg-[#B5E4C4] text-[#0A332E] border-[#8CD6A3]",
  2: "bg-[#FDE8B0] text-[#5C3D00] border-[#FBD982]",
  3: "bg-[#F4A0A0] text-[#5C1414] border-[#EFA3A3]",
  4: "bg-[#E05A5A] text-white border-[#C53030]",
};

const PERIOD_OPTIONS: { value: "light" | "medium" | "heavy"; label: string; drops: number }[] = [
  { value: "light", label: "Leggero", drops: 1 },
  { value: "medium", label: "Medio", drops: 2 },
  { value: "heavy", label: "Intenso", drops: 3 },
];

const APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: "ginecologo", label: "Ginecologo" },
  { value: "nutrizionista", label: "Nutrizionista" },
  { value: "fisioterapista", label: "Fisioterapista" },
  { value: "altro", label: "Altro" },
];

function Droplets({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5 text-red-500">
      {Array.from({ length: count }).map((_, i) => (
        <Droplet key={i} size={16} fill="currentColor" />
      ))}
    </span>
  );
}

/** Normalizza appuntamenti legacy (title, time) in formato nuovo (type, date, place) */
function normalizeAppointments(appointments: unknown[], fallbackDate: string): Appointment[] {
  return (appointments ?? []).map((a: unknown) => {
    const any = a as Record<string, unknown>;
    if (any.type && any.date != null && any.place != null) {
      return a as Appointment;
    }
    return {
      id: String(any.id ?? crypto.randomUUID()),
      type: "altro",
      typeOther: String(any.title ?? ""),
      date: String(any.date ?? fallbackDate),
      time: String(any.time ?? "14:00"),
      place: "",
    } as Appointment;
  });
}

export function SymptomTrackerModal({ isOpen, onClose, date }: SymptomTrackerModalProps) {
  const { getEntry, setEntry } = useDayEntries();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [periodFlow, setPeriodFlow] = useState<"light" | "medium" | "heavy" | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApt, setNewApt] = useState<{
    type: AppointmentType;
    typeOther: string;
    date: string;
    time: string;
    place: string;
  }>(() => ({
    type: "ginecologo",
    typeOther: "",
    date: dateKey(date),
    time: "14:00",
    place: "",
  }));

  useEffect(() => {
    if (isOpen) {
      const entry = getEntry(date);
      const key = dateKey(date);
      setAppointments(normalizeAppointments(entry.appointments ?? [], key));
      setPainLevel(entry.painLevel);
      setNotes(entry.notes ?? "");
      setPeriodFlow(entry.periodFlow ?? null);
      setNewApt((prev) => ({ ...prev, date: key }));
    }
  }, [date, isOpen]);

  const updateAppointment = (id: string, field: keyof Appointment, value: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const openAddForm = () => {
    setNewApt({
      type: "ginecologo",
      typeOther: "",
      date: dateKey(date),
      time: "14:00",
      place: "",
    });
    setShowAddForm(true);
  };

  const saveNewAppointment = () => {
    const apt: Appointment = {
      id: crypto.randomUUID(),
      type: newApt.type,
      typeOther: newApt.type === "altro" ? newApt.typeOther : undefined,
      date: newApt.date,
      time: newApt.time,
      place: newApt.place,
    };
    const targetKey = newApt.date;
    const targetDate = parseDateKey(targetKey);
    const isSameDay = targetKey === dateKey(date);

    if (isSameDay) {
      setAppointments((prev) => [...prev, apt]);
    } else {
      const targetEntry = getEntry(targetDate);
      const existing = normalizeAppointments(targetEntry.appointments ?? [], targetKey) as Appointment[];
      setEntry(targetDate, {
        ...targetEntry,
        appointments: [...existing, apt],
      });
    }
    setShowAddForm(false);
  };

  const handleSave = () => {
    setEntry(date, {
      ...getEntry(date),
      painLevel,
      periodFlow,
      appointments,
      notes,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-100 shrink-0">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-50 text-[#14443F]"
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
              <h2 className="text-lg font-bold text-[#14443F]">Sintomi e note</h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-28">
              {/* 1. Appuntamenti */}
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  <CalendarClock size={18} />
                  Appuntamenti
                </h3>
                <div className="space-y-2">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex flex-col gap-1 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-[#14443F]">
                          {getAppointmentTypeLabel(apt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAppointment(apt.id)}
                          className="text-gray-400 hover:text-red-500 text-sm shrink-0"
                        >
                          Elimina
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {apt.date} · {apt.time}
                        {apt.place ? ` · ${apt.place}` : ""}
                      </div>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {showAddForm ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 rounded-2xl border-2 border-[#14443F]/20 bg-[#EBF5F0]/50 space-y-3"
                    >
                      <label className="block text-xs font-medium text-gray-600">
                        Tipo
                      </label>
                      <select
                        value={newApt.type}
                        onChange={(e) =>
                          setNewApt((p) => ({ ...p, type: e.target.value as AppointmentType }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] bg-white"
                      >
                        {APPOINTMENT_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {newApt.type === "altro" && (
                        <input
                          type="text"
                          value={newApt.typeOther}
                          onChange={(e) => setNewApt((p) => ({ ...p, typeOther: e.target.value }))}
                          placeholder="Specifica (es. Riabilitazione pavimento pelvico)"
                          className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] placeholder:text-gray-400"
                        />
                      )}
                      <label className="block text-xs font-medium text-gray-600">Giorno</label>
                      <input
                        type="date"
                        value={newApt.date}
                        onChange={(e) => setNewApt((p) => ({ ...p, date: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                      />
                      <label className="block text-xs font-medium text-gray-600">Ora</label>
                      <input
                        type="time"
                        value={newApt.time}
                        onChange={(e) => setNewApt((p) => ({ ...p, time: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                      />
                      <label className="block text-xs font-medium text-gray-600">Luogo</label>
                      <input
                        type="text"
                        value={newApt.place}
                        onChange={(e) => setNewApt((p) => ({ ...p, place: e.target.value }))}
                        placeholder="Indirizzo o nome dello studio"
                        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] placeholder:text-gray-400"
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600"
                        >
                          Annulla
                        </button>
                        <button
                          type="button"
                          onClick={saveNewAppointment}
                          className="flex-1 py-2 rounded-xl bg-[#14443F] text-white font-medium"
                        >
                          Aggiungi
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={openAddForm}
                      className="mt-2 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 flex items-center justify-center gap-2 hover:border-[#14443F] hover:text-[#14443F] transition-colors"
                    >
                      <Plus size={18} />
                      Aggiungi appuntamento
                    </button>
                  )}
                </AnimatePresence>
              </section>

              {/* 2. Dolore */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Dolore
                </h3>
                <div className="flex gap-2">
                  {PAIN_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPainLevel(level)}
                      className={cn(
                        "flex-1 py-3 px-2 rounded-2xl border-2 text-center text-sm font-bold transition-all",
                        painLevel === level
                          ? PAIN_STYLES[level]
                          : "border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      <span className="block">{level}</span>
                      <span className="block text-[10px] mt-0.5 opacity-90">
                        {PAIN_LABELS[level]}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 3. Note */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Note
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  placeholder="Scrivi qui eventuali sintomi aggiuntivi o osservazioni..."
                  className="w-full min-h-28 p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#14443F] focus:bg-white outline-none resize-none text-[#14443F] text-sm placeholder:text-gray-400"
                />
                <div className="text-right text-xs text-gray-400 mt-1">{notes.length}/500</div>
              </section>

              {/* 4. Ciclo */}
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  <Droplet size={18} className="text-red-400" />
                  Ciclo
                </h3>
                <p className="text-xs text-gray-500 mb-2">Seleziona solo se presente oggi.</p>
                <div className="grid grid-cols-3 gap-2">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPeriodFlow(periodFlow === opt.value ? null : opt.value)}
                      className={cn(
                        "py-3 px-2 rounded-2xl border-2 text-center text-sm font-medium transition-all flex flex-col items-center gap-1",
                        periodFlow === opt.value
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "border-gray-100 bg-white text-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <Droplets count={opt.drops} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-white border-t border-gray-100 pb-8">
              <button
                onClick={handleSave}
                className="w-full py-4 bg-[#14443F] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#0F3833] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Salva
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
