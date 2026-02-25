"use client";
import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns";
import { it } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDayEntries } from "@/context/DayEntriesContext";

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

/** Colori heatmap dolore: 1 Basso → 4 Intenso. null = nessun dato (cella neutra). */
function getPainCellColor(painLevel: number | null): string {
  if (painLevel === null) return "bg-white";
  switch (painLevel) {
    case 1:
      return "bg-[#B5E4C4]"; // Basso
    case 2:
      return "bg-[#FDE8B0]"; // Medio
    case 3:
      return "bg-[#F4A0A0]"; // Alto
    case 4:
      return "bg-[#E05A5A]"; // Intenso
    default:
      return "bg-white";
  }
}

export function Calendar({
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getEntry } = useDayEntries();

  const firstDayCurrentMonth = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm mx-4 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#14443F] capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: it })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-[#14443F]">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-[#14443F]">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const entry = getEntry(day);
          const painLevel = entry.painLevel;
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div key={day.toString()} className="flex flex-col items-center justify-center min-h-14">
              <button
                onClick={() => onSelectDate(day)}
                className={cn(
                  "w-full min-h-12 flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all",
                  isCurrentMonth ? getPainCellColor(painLevel) : "bg-gray-50",
                  !isCurrentMonth && "text-gray-300 opacity-60",
                  isCurrentMonth && "text-gray-800",
                  isCurrentMonth && "hover:bg-accent",
                  isTodayDate && "ring-2 ring-[#14443F] ring-offset-1",
                )}
              >
                <span>{format(day, "d")}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend: 1–4 only */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-[#B5E4C4]" />
          <span>Basso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-[#FDE8B0]" />
          <span>Medio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-[#F4A0A0]" />
          <span>Alto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-[#E05A5A]" />
          <span>Intenso</span>
        </div>
      </div>
    </div>
  );
}
