"use client";

import { useState } from "react";
import { Calendar, Pill, NotebookPen, User, Plus, CalendarClock, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type FabAction = "appointment" | "symptom" | "therapy";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFabAction?: (action: FabAction) => void;
}

const FAB_OPTIONS: { id: FabAction; label: string; icon: typeof CalendarClock }[] = [
  { id: "appointment", label: "Appuntamento", icon: CalendarClock },
  { id: "symptom", label: "Sintomo", icon: Activity },
  { id: "therapy", label: "Terapia", icon: Pill },
];

const NAV_TABS = [
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "therapy", label: "Terapia", icon: Pill },
  { id: "diary", label: "Diario", icon: NotebookPen },
  { id: "profile", label: "Profilo", icon: User },
] as const;

/** Riserva a destra (8px) per la nav bar. */

export function BottomNav({ activeTab, onTabChange, onFabAction }: BottomNavProps) {
  const [fabOpen, setFabOpen] = useState(false);

  const TabButton = ({
    tab,
  }: {
    tab: { id: string; label: string; icon: typeof Calendar };
  }) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        onClick={() => onTabChange(tab.id)}
        className={`flex flex-1 flex-col items-center justify-end gap-1 pb-1 min-w-0 transition-colors ${
          isActive ? "text-[#14443F]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
        <span className="text-[10px] font-medium truncate w-full text-center">{tab.label}</span>
      </button>
    );
  };

  const handleFabOption = (action: FabAction) => {
    setFabOpen(false);
    onFabAction?.(action);
  };

  const showFab = activeTab === "calendar";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Stack: nav bar + FAB sopra di essa */}
      <div className="relative bg-white border-t border-gray-100">
        {/* Nav row: distribuzione uniforme (spaceEvenly), padding destro per non sovrapporre il FAB */}
        <div className="flex items-end justify-evenly px-2 pr-2 pb-6 pt-2 max-w-lg mx-auto">
          {NAV_TABS.map((tab) => (
            <TabButton key={tab.id} tab={tab} />
          ))}
        </div>

        {/* FAB: 24px sopra il bordo superiore della nav bar, 24px dal bordo destro dello schermo */}
        {showFab && (
          <div
            className="absolute flex flex-col items-end gap-2 z-50 pointer-events-none"
            style={{ right: 24, bottom: "100%", marginBottom: 24 }}
          >
            <div className="pointer-events-auto flex flex-col items-end">
              <AnimatePresence>
                {fabOpen && (
                  <>
                    {/* Overlay rimosso: niente schermo scuro, pagina e bottoni FAB restano usabili */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 invisible"
                      aria-hidden
                      style={{ pointerEvents: "none" }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="flex flex-col gap-0 shadow-lg rounded-2xl bg-white border border-gray-100 overflow-hidden min-w-[200px] mb-2"
                    >
                      {FAB_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleFabOption(opt.id)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-[#14443F] font-medium hover:bg-[#EBF5F0] transition-colors first:pt-4 last:pb-4"
                          >
                            <Icon size={20} className="text-[#5C8D89] shrink-0" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              <button
                onClick={() => setFabOpen((o) => !o)}
                aria-label="Aggiungi"
                aria-expanded={fabOpen}
                className="w-14 h-14 rounded-full bg-[#14443F] text-white shadow-[0px_8px_4px_0px_rgba(0,0,0,0.05),0px_4px_12px_0px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-[#0f3530] active:scale-95 transition-all"
              >
                <Plus size={26} strokeWidth={2.5} className={fabOpen ? "rotate-45" : ""} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
