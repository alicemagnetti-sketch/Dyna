"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Pencil, Activity, Droplet, Pill, FileText, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  type DayEntry,
  PAIN_LABELS,
  PERIOD_FLOW_LABELS,
} from "@/lib/day-entries";

const PAIN_STYLES: Record<number, string> = {
  1: "bg-[#B5E4C4] text-[#0A332E]",
  2: "bg-[#FDE8B0] text-[#5C3D00]",
  3: "bg-[#F4A0A0] text-[#5C1414]",
  4: "bg-[#E05A5A] text-white",
};

interface DayOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  entry: DayEntry;
  onEdit: () => void;
}

export function DayOverviewModal({
  isOpen,
  onClose,
  date,
  entry,
  onEdit,
}: DayOverviewModalProps) {
  const hasData =
    entry.painLevel !== null ||
    entry.periodFlow !== null ||
    (entry.appointments?.length ?? 0) > 0 ||
    (entry.therapies?.some((t) => t.taken) ?? false) ||
    (entry.notes?.trim() ?? "") !== "";

  const handleEdit = () => {
    onClose();
    onEdit();
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
            <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-50 text-[#14443F]"
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
              <h2 className="text-lg font-bold text-[#14443F] capitalize">
                {format(date, "EEEE d MMMM yyyy", { locale: it })}
              </h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {!hasData ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">Nessun dato registrato per questo giorno.</p>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#14443F] text-white rounded-2xl font-medium hover:bg-[#0F3833] transition-colors"
                  >
                    <Pencil size={18} />
                    Aggiungi sintomi e note
                  </button>
                </div>
              ) : (
                <>
                  {/* Appuntamenti */}
                  {(entry.appointments?.length ?? 0) > 0 && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <CalendarClock size={16} />
                        Appuntamenti
                      </h3>
                      <ul className="space-y-2">
                        {entry.appointments!.map((apt) => (
                          <li
                            key={apt.id}
                            className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 text-[#14443F]"
                          >
                            <span className="font-medium">{apt.time}</span>
                            <span>{apt.title}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Dolore (1–4) */}
                  {entry.painLevel !== null && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <Activity size={16} />
                        Dolore
                      </h3>
                      <span
                        className={cn(
                          "inline-block px-3 py-1.5 rounded-xl text-sm font-bold",
                          PAIN_STYLES[entry.painLevel]
                        )}
                      >
                        {PAIN_LABELS[entry.painLevel]}
                      </span>
                    </section>
                  )}

                  {/* Note */}
                  {(entry.notes?.trim() ?? "") !== "" && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <FileText size={16} />
                        Note
                      </h3>
                      <p className="p-4 rounded-2xl bg-gray-50 text-[#14443F] text-sm leading-relaxed">
                        {entry.notes}
                      </p>
                    </section>
                  )}

                  {/* Ciclo */}
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      <Droplet size={16} />
                      Ciclo
                    </h3>
                    <p className="text-[#14443F] font-medium">
                      {entry.periodFlow != null
                        ? PERIOD_FLOW_LABELS[entry.periodFlow] ?? entry.periodFlow
                        : "No"}
                    </p>
                  </section>

                  {/* Terapie assunte (non mostrate in calendario, ma sì in overview) */}
                  {(entry.therapies?.some((t) => t.taken) ?? false) && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <Pill size={16} />
                        Terapie assunte
                      </h3>
                      <ul className="space-y-2">
                        {entry.therapies!
                          .filter((t) => t.taken)
                          .map((t) => (
                            <li
                              key={t.id}
                              className="flex items-center justify-between p-3 rounded-2xl bg-[#EBF5F0] text-[#14443F]"
                            >
                              <span className="font-medium">{t.name}</span>
                              <span className="text-sm opacity-80">
                                {t.dose} · {t.time}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </section>
                  )}

                  <button
                    onClick={handleEdit}
                    className="w-full py-4 mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-[#14443F] text-[#14443F] font-bold hover:bg-[#EBF5F0] transition-colors"
                  >
                    <Pencil size={20} />
                    Modifica
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
