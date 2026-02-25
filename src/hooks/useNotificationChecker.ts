"use client";

import { useEffect, useRef } from "react";
import { useDayEntries } from "@/context/DayEntriesContext";
import { getUpcomingAppointments, getAppointmentTypeLabel } from "@/lib/day-entries";
import { checkMedicineReminders, checkAppointmentReminders } from "@/lib/notifications";
import { THERAPY_PLAN } from "@/lib/day-entries";

const THERAPY_NAMES: Record<number, string> = Object.fromEntries(
  THERAPY_PLAN.map((t) => [t.id, t.pattern === "alternating" ? "Deha / Ubigel" : t.name])
);

export function useNotificationChecker() {
  const { entries } = useDayEntries();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    function check() {
      if (!document.hasFocus?.() && document.visibilityState !== "visible") return;
      checkMedicineReminders(THERAPY_NAMES);
      const upcoming = getUpcomingAppointments(entries, 7);
      const list = upcoming.map(({ dateKey, appointment }) => ({
        id: appointment.id,
        dateKey,
        time: appointment.time,
        label: getAppointmentTypeLabel(appointment),
      }));
      checkAppointmentReminders(list);
    }

    check();
    intervalRef.current = setInterval(check, 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [entries]);
}
