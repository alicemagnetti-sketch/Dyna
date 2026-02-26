"use client";

import { Calendar, Pill, NotebookPen, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_TABS = [
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "therapy", label: "Terapia", icon: Pill },
  { id: "diary", label: "Diario", icon: NotebookPen },
  { id: "profile", label: "Profilo", icon: User },
] as const;

/** Riserva a destra (8px) per la nav bar. */

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Stack: nav bar + FAB sopra di essa */}
      <div className="relative bg-white border-t border-gray-100">
        <div className="flex items-end justify-evenly px-2 pb-6 pt-2 max-w-lg mx-auto">
          {NAV_TABS.map((tab) => (
            <TabButton key={tab.id} tab={tab} />
          ))}
        </div>
      </div>
    </div>
  );
}
