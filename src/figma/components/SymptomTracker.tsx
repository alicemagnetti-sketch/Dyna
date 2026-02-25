"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Check, Plus, CalendarClock, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDayEntries } from "@/context/DayEntriesContext";
import {
  getTherapiesForDay,
  mergeTherapiesForDay,
  PAIN_LABELS,
  type Appointment,
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

function Droplets({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5 text-red-500">
      {Array.from({ length: count }).map((_, i) => (
        <Droplet key={i} size={16} fill="currentColor" />
      ))}
    </span>
  );
}

export function SymptomTrackerModal({ isOpen, onClose, date }: SymptomTrackerModalProps) {
  const { getEntry, setEntry } = useDayEntries();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [periodFlow, setPeriodFlow] = useState<"light" | "medium" | "heavy" | null>(null);
  const [therapies, setTherapies] = useState(getTherapiesForDay(date));

  useEffect(() => {
    if (isOpen) {
      const entry = getEntry(date);
      setAppointments(entry.appointments ?? []);
      setPainLevel(entry.painLevel);
      setNotes(entry.notes ?? "");
      setPeriodFlow(entry.periodFlow ?? null);
      setTherapies(mergeTherapiesForDay(date, entry.therapies ?? []));
    }
  }, [date, isOpen]);

  const addAppointment = () => {
    setAppointments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "Nuovo appuntamento", time: "14:00" },
    ]);
  };

  const updateAppointment = (id: string, field: keyof Appointment, value: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleTherapy = (id: number) => {
    setTherapies((prev) =>
      prev.map((t) => (t.id === id ? { ...t, taken: !t.taken } : t))
    );
  };

  const handleSave = () => {
    setEntry(date, {
      painLevel,
      periodFlow,
      appointments,
      therapies,
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
              {/* 1. Appuntamenti con terapisti */}
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  <CalendarClock size={18} />
                  Appuntamenti
                </h3>
                <div className="space-y-2">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <input
                        type="time"
                        value={apt.time}
                        onChange={(e) => updateAppointment(apt.id, "time", e.target.value)}
                        className="w-20 text-sm font-medium text-[#14443F] bg-transparent border-none focus:ring-0 p-0"
                      />
                      <input
                        type="text"
                        value={apt.title}
                        onChange={(e) => updateAppointment(apt.id, "title", e.target.value)}
                        placeholder="Es. Riabilitazione pavimento pelvico"
                        className="flex-1 text-sm text-[#14443F] bg-transparent border-none focus:ring-0 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => removeAppointment(apt.id)}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        Elimina
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addAppointment}
                  className="mt-2 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 flex items-center justify-center gap-2 hover:border-[#14443F] hover:text-[#14443F] transition-colors"
                >
                  <Plus size={18} />
                  Aggiungi appuntamento
                </button>
              </section>

              {/* 2. Scala dolore 1–4 orizzontale */}
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

              {/* 4. Ciclo: 3 pulsanti con gocce (opzionale) */}
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

              {/* 5. Terapia del giorno (allineata a pagina Terapia, non in anteprima calendario) */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Terapia del giorno
                </h3>
                <div className="space-y-2">
                  {therapies.map((therapy) => (
                    <button
                      key={therapy.id}
                      type="button"
                      onClick={() => toggleTherapy(therapy.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                        therapy.taken
                          ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]"
                          : "border-gray-100 bg-white text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      <div>
                        <p className="font-bold">{therapy.name}</p>
                        <p className="text-sm opacity-70">
                          {therapy.dose} · {therapy.time}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                          therapy.taken ? "bg-[#14443F] border-[#14443F]" : "border-gray-300"
                        )}
                      >
                        {therapy.taken && <Check size={14} className="text-white" />}
                      </div>
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
