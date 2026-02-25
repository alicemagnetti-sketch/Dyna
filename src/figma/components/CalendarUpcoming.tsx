"use client";

import { CalendarClock, Pill } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useDayEntries } from "@/context/DayEntriesContext";
import {
  getNextAppointment,
  getTherapiesForDay,
  getAppointmentTypeLabel,
  parseDateKey,
} from "@/lib/day-entries";

export function CalendarUpcoming() {
  const { entries } = useDayEntries();
  const today = new Date();
  const next = getNextAppointment(entries);
  const therapiesToday = getTherapiesForDay(today);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm mx-4 mt-4">
      {/* Prossimi appuntamenti */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Prossimi appuntamenti
      </p>
      {next ? (
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50">
          <CalendarClock size={20} className="text-[#14443F] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#14443F]">
              {getAppointmentTypeLabel(next.appointment)}
            </p>
            <p className="text-sm text-gray-600">
              {format(parseDateKey(next.dateKey), "EEEE d MMMM", { locale: it })} ore{" "}
              {next.appointment.time}
            </p>
            {next.appointment.place && (
              <p className="text-xs text-gray-500 mt-0.5">{next.appointment.place}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic py-1">Nessun appuntamento in programma</p>
      )}

      {/* Separatore 1px gray-300 */}
      <div className="border-t border-gray-300 my-4" />

      {/* Terapie di oggi */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Terapie di oggi
      </p>
      <ul className="space-y-2">
        {therapiesToday.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-[#EBF5F0] text-[#14443F]"
          >
            <Pill size={18} className="shrink-0 text-[#14443F]/70" />
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-sm opacity-80">{t.dose} · {t.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
