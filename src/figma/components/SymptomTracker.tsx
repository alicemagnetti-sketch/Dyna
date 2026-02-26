"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Plus, CalendarClock, Droplet, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
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
  /** Se true, alla prima apertura mostra subito il form "Aggiungi appuntamento" */
  initialOpenAddForm?: boolean;
  /** Se true, mostra solo la sezione appuntamenti (pannello Appuntamento da FAB) */
  appointmentOnly?: boolean;
  /** Se false, nasconde la riga "Aggiungi appuntamento" (pannello Sintomi da FAB) */
  showAddAppointmentRow?: boolean;
}

const PAIN_LEVELS = [1, 2, 3, 4] as const;
/** Stili per scala dolore: colori con contrasto WCAG AA (≥4.5:1) */
const PAIN_STYLES: Record<number, string> = {
  1: "bg-[#B5E4C4] text-[#0A332E] border-[#7AB88E]",
  2: "bg-[#FDE8B0] text-[#4A3000] border-[#F5D76E]",
  3: "bg-[#F4A0A0] text-[#4A0F0F] border-[#E07A7A]",
  4: "bg-[#B91C1C] text-white border-[#991B1B]",
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

function AppointmentEditForm({
  apt,
  onSave,
  onUpdate,
  onCancel,
}: {
  apt: Appointment;
  onSave: () => void;
  onUpdate: (field: keyof Appointment, value: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 space-y-3 bg-white">
      <label className="block text-xs font-medium text-gray-600">Tipo</label>
      <select
        value={apt.type}
        onChange={(e) => onUpdate("type", e.target.value)}
        className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2314443F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        {APPOINTMENT_TYPES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {apt.type === "altro" && (
        <input
          type="text"
          value={apt.typeOther ?? ""}
          onChange={(e) => onUpdate("typeOther", e.target.value)}
          placeholder="Specifica"
          className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] placeholder:text-gray-400"
        />
      )}
      <label className="block text-xs font-medium text-gray-600">Giorno</label>
      <input
        type="date"
        value={apt.date}
        onChange={(e) => onUpdate("date", e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
      />
      <label className="block text-xs font-medium text-gray-600">Ora</label>
      <input
        type="time"
        value={apt.time}
        onChange={(e) => onUpdate("time", e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
      />
      <label className="block text-xs font-medium text-gray-600">Luogo</label>
      <input
        type="text"
        value={apt.place}
        onChange={(e) => onUpdate("place", e.target.value)}
        placeholder="Indirizzo o studio"
        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] placeholder:text-gray-400"
      />
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex-1 py-2 rounded-xl bg-[#14443F] text-white font-medium"
        >
          Salva
        </button>
      </div>
    </div>
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

export function SymptomTrackerModal({
  isOpen,
  onClose,
  date,
  initialOpenAddForm,
  appointmentOnly = false,
  showAddAppointmentRow = true,
}: SymptomTrackerModalProps) {
  const { getEntry, setEntry } = useDayEntries();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [periodFlow, setPeriodFlow] = useState<"light" | "medium" | "heavy" | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedAptId, setExpandedAptId] = useState<string | null>(null);
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
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
      setExpandedAptId(null);
      setEditingAptId(null);
      setShowAddForm(!!initialOpenAddForm);
    }
  }, [date, isOpen, getEntry, initialOpenAddForm]);

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
              <h2 className="text-lg font-bold text-[#14443F]">
                {appointmentOnly ? "Appuntamento" : "Sintomi e note"}
              </h2>
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
                  {appointments.map((apt) => {
                    const isExpanded = expandedAptId === apt.id;
                    const isEditing = editingAptId === apt.id;
                    return (
                      <div
                        key={apt.id}
                        className="rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                          className="w-full flex items-center justify-between gap-2 p-3 text-left"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-[#14443F] block truncate">
                              {getAppointmentTypeLabel(apt)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {apt.date} · {apt.time}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-gray-400 shrink-0" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400 shrink-0" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-100"
                            >
                              {isEditing ? (
                                <AppointmentEditForm
                                  apt={apt}
                                  onSave={() => setEditingAptId(null)}
                                  onUpdate={(field, value) => updateAppointment(apt.id, field, value)}
                                  onCancel={() => setEditingAptId(null)}
                                />
                              ) : (
                                <>
                                  <div className="p-3 pt-2 text-sm text-gray-600 space-y-1">
                                    {apt.place ? (
                                      <p><span className="text-gray-500">Luogo:</span> {apt.place}</p>
                                    ) : null}
                                    <p className="text-xs text-gray-500">
                                      {apt.date} · {apt.time}
                                      {apt.place ? ` · ${apt.place}` : ""}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 p-3 pt-0">
                                    <button
                                      type="button"
                                      onClick={() => setEditingAptId(apt.id)}
                                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#14443F] text-[#14443F] text-sm font-medium"
                                    >
                                      <Pencil size={16} />
                                      Modifica
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        removeAppointment(apt.id);
                                        setExpandedAptId(null);
                                      }}
                                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                      Elimina
                                    </button>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {(showAddAppointmentRow || !appointmentOnly) && (
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
                        className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2314443F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        }}
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
                )}
              </section>

              {!appointmentOnly && (
              <>
              {/* 2. Dolore (stessa struttura scala del Ciclo: icona + etichetta) */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Dolore
                </h3>
                <p className="text-xs text-gray-500 mb-2">Seleziona l&apos;intensità del dolore.</p>
                <div className="grid grid-cols-4 gap-2">
                  {PAIN_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPainLevel(painLevel === level ? null : level)}
                      className={cn(
                        "py-3 px-2 rounded-2xl border-2 text-center text-sm font-bold transition-all flex flex-col items-center gap-1",
                        painLevel === level
                          ? PAIN_STYLES[level]
                          : "border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      <span>{level}</span>
                      <span className="text-[14px] font-medium opacity-90">
                        {PAIN_LABELS[level]}
                      </span>
                    </button>
                  ))}
                </div>
                {painLevel !== null && (
                  <button
                    type="button"
                    onClick={() => setPainLevel(null)}
                    className="mt-2 text-xs text-gray-500 hover:text-red-600 underline"
                  >
                    Rimuovi dolore
                  </button>
                )}
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
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
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
                {periodFlow !== null && (
                  <button
                    type="button"
                    onClick={() => setPeriodFlow(null)}
                    className="mt-2 text-xs text-gray-500 hover:text-red-600 underline"
                  >
                    Rimuovi ciclo
                  </button>
                )}
              </section>
              </>
              )}
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
