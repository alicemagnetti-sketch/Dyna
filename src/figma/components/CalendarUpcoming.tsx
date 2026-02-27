"use client";
/* Widget Terapie di oggi: solo farmaci da assumere oggi, dose solo orali, orario/giorno-notte se impostato */

import { useMemo, useState } from "react";
import { CalendarClock, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useDayEntries } from "@/context/DayEntriesContext";
import { useTherapyPlan } from "@/context/TherapyPlanContext";
import {
  getUpcomingAppointments,
  getAppointmentTypeLabel,
  parseDateKey,
} from "@/lib/day-entries";
import {
  getTherapyDoseDisplay,
  getTherapyTimeDisplay,
  shouldShowTherapyToday,
} from "@/lib/therapy";
import type { Appointment } from "@/lib/day-entries";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

interface CalendarUpcomingProps {
  /** Aperto cliccando sull'icona modifica: riceve dateKey (YYYY-MM-DD) e appuntamento. Non apre il modale giorno. */
  onEditAppointment?: (dateKey: string, appointment: Appointment) => void;
}

export function CalendarUpcoming({ onEditAppointment }: CalendarUpcomingProps) {
  const { entries, getEntry, setEntry } = useDayEntries();
  const { plan } = useTherapyPlan();
  const today = new Date();
  const upcomingList = useMemo(
    () => getUpcomingAppointments(entries, 3650),
    [entries]
  );
  const [appointmentsExpanded, setAppointmentsExpanded] = useState(false);
  const therapiesToday = useMemo(
    () =>
      [...plan]
        .filter((t) => !t.paused && shouldShowTherapyToday(t, plan, today))
        .sort((a, b) => timeToMinutes(a.time || "00:00") - timeToMinutes(b.time || "00:00")),
    [plan, today]
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm mx-4 mt-4">
      {/* Prossimi appuntamenti */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Prossimi appuntamenti
      </p>
      {upcomingList.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-1">Nessun appuntamento in programma</p>
      ) : (
        <div className="space-y-2">
          {(appointmentsExpanded ? upcomingList : upcomingList.slice(0, 2)).map((item) => (
            <div
              key={`${item.dateKey}-${item.appointment.id}`}
              className="w-full flex items-start gap-3 p-3 rounded-2xl bg-gray-50 text-left group"
            >
              <CalendarClock size={20} className="text-[#14443F] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#14443F]">
                  {getAppointmentTypeLabel(item.appointment)}
                </p>
                <p className="text-sm text-gray-600">
                  {format(parseDateKey(item.dateKey), "EEEE d MMMM", { locale: it })} ore{" "}
                  {item.appointment.time}
                </p>
                {item.appointment.place && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.appointment.place}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onEditAppointment && (
                  <button
                    type="button"
                    onClick={() => onEditAppointment(item.dateKey, item.appointment)}
                    className="p-2 rounded-full text-[#14443F] opacity-70 hover:opacity-100 hover:bg-gray-100 transition-colors"
                    aria-label="Modifica appuntamento"
                  >
                    <Pencil size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const date = parseDateKey(item.dateKey);
                    const entry = getEntry(date);
                    setEntry(date, {
                      ...entry,
                      appointments: (entry.appointments ?? []).filter((a) => a.id !== item.appointment.id),
                    });
                  }}
                  className="p-2 rounded-full text-[#14443F] opacity-70 hover:opacity-100 hover:bg-gray-100 transition-colors"
                  aria-label="Elimina appuntamento"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {upcomingList.length > 2 && (
            <button
              type="button"
              onClick={() => setAppointmentsExpanded((e) => !e)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-[#14443F] hover:bg-gray-50 rounded-xl transition-colors"
              aria-expanded={appointmentsExpanded}
            >
              {appointmentsExpanded ? (
                <>
                  Mostra meno
                  <ChevronUp size={18} />
                </>
              ) : (
                <>
                  Mostra tutti gli appuntamenti ({upcomingList.length})
                  <ChevronDown size={18} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Separatore 1px gray-300 */}
      <div className="border-t border-gray-300 my-4" />

      {/* Terapie di oggi */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Terapie di oggi
      </p>
      <ul className="space-y-2">
        {therapiesToday.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-1">Nessuna terapia in corso</p>
        ) : (
          therapiesToday.map((t) => {
            const dose = getTherapyDoseDisplay(t);
            const timeLabel = getTherapyTimeDisplay(t);
            const subtitle = [dose, timeLabel].filter(Boolean).join(" · ");
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 py-3 px-0 rounded-2xl bg-[var(--card)] text-[#14443F]"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t.name}</p>
                  {subtitle ? (
                    <p className="text-sm opacity-80">{subtitle}</p>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
