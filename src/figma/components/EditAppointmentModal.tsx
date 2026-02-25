"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useDayEntries } from "@/context/DayEntriesContext";
import {
  type Appointment,
  type AppointmentType,
  APPOINTMENT_TYPE_LABELS,
  parseDateKey,
} from "@/lib/day-entries";

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Data dell'appuntamento (YYYY-MM-DD) */
  dateKeyStr: string;
  appointment: Appointment;
  /** Chiamato dopo aver salvato; il modale si chiude senza aprire il giorno */
  onSaved?: () => void;
}

export function EditAppointmentModal({
  isOpen,
  onClose,
  dateKeyStr,
  appointment,
  onSaved,
}: EditAppointmentModalProps) {
  const { getEntry, setEntry } = useDayEntries();
  const [type, setType] = useState<AppointmentType>(appointment.type);
  const [typeOther, setTypeOther] = useState(appointment.typeOther ?? "");
  const [dateStr, setDateStr] = useState(appointment.date || dateKeyStr);
  const [time, setTime] = useState(appointment.time || "09:00");
  const [place, setPlace] = useState(appointment.place ?? "");

  useEffect(() => {
    if (isOpen) {
      setType(appointment.type);
      setTypeOther(appointment.typeOther ?? "");
      setDateStr(appointment.date || dateKeyStr);
      setTime(appointment.time || "09:00");
      setPlace(appointment.place ?? "");
    }
  }, [isOpen, appointment.id, appointment.type, appointment.typeOther, appointment.date, appointment.time, appointment.place, dateKeyStr]);

  const handleSave = () => {
    const updated: Appointment = {
      ...appointment,
      type,
      typeOther: type === "altro" ? typeOther.trim() : undefined,
      date: dateStr,
      time: time.trim() || "09:00",
      place: place.trim(),
    };

    const oldKey = dateKeyStr;
    const newKey = dateStr;
    const oldDate = parseDateKey(oldKey);
    const newDate = parseDateKey(newKey);

    const oldEntryFull = getEntry(oldDate);
    const oldAppointments = (oldEntryFull.appointments ?? []).filter((a) => a.id !== appointment.id);

    setEntry(oldDate, {
      ...oldEntryFull,
      appointments: oldKey === newKey ? [...oldAppointments, updated] : oldAppointments,
    });

    if (oldKey !== newKey) {
      const newEntryFull = getEntry(newDate);
      setEntry(newDate, {
        ...newEntryFull,
        appointments: [...(newEntryFull.appointments ?? []), updated],
      });
    }

    onSaved?.();
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-50 text-[#14443F]"
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
              <h2 className="text-lg font-bold text-[#14443F]">Modifica appuntamento</h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Tipo di specialista
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AppointmentType)}
                  className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2314443F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  {(Object.entries(APPOINTMENT_TYPE_LABELS) as [AppointmentType, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {type === "altro" && (
                  <input
                    type="text"
                    value={typeOther}
                    onChange={(e) => setTypeOther(e.target.value)}
                    placeholder="Specifica tipo"
                    className="mt-2 w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Data
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Ora
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Luogo
                </label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Es. Studio, Ospedale..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-[#14443F] font-medium"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-[#14443F] text-white font-medium hover:bg-[#0f332f] transition-colors"
                >
                  Salva
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
