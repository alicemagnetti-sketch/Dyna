"use client";
import { Calendar, Pill, NotebookPen, User, Plus } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFabClick?: () => void;
}

export function BottomNav({ activeTab, onTabChange, onFabClick }: BottomNavProps) {
  const leftTabs = [
    { id: "calendar", label: "Calendario", icon: Calendar },
    { id: "therapy", label: "Terapia", icon: Pill },
  ];
  const rightTabs = [
    { id: "diary", label: "Diario", icon: NotebookPen },
    { id: "profile", label: "Profilo", icon: User },
  ];

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
        className={`flex flex-1 flex-col items-center justify-end gap-1 pb-1 transition-colors ${
          isActive ? "text-[#14443F]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
      <div className="flex items-end justify-between px-2 pb-6 pt-2 max-w-lg mx-auto">
        {leftTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}

        {/* Centro: FAB con recesso */}
        <div className="flex-1 flex flex-col items-center justify-end min-w-0 px-1">
          <div className="relative flex flex-col items-center w-full">
            {/* Sfondo recesso (cerchio grigio sotto il FAB) */}
            <div className="w-16 h-10 rounded-t-full bg-gray-100/90 flex items-end justify-center pb-0.5 opacity-0" />
            <button
              onClick={onFabClick}
              aria-label="Aggiungi sintomi"
              className="absolute bottom-0 w-14 h-14 -translate-y-2 rounded-full bg-[#14443F] text-white shadow-[0px_8px_4px_0px_rgba(0,0,0,0.05),0px_4px_12px_0px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-[#0f3530] active:scale-95 transition-all z-10"
            >
              <Plus size={26} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {rightTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}
      </div>
    </div>
  );
}
