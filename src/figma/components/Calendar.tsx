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
  addDays,
  isToday
} from "date-fns";
import { it } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Droplet, Star, Pill } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils"; 

// Mock data for Dyna
// Pain levels: 0 (gray) to 4 (red)
const mockData = [
  { date: new Date(2023, 9, 1), pain: 2, period: false, therapy: true },
  { date: new Date(2023, 9, 2), pain: 3, period: false, therapy: true },
  { date: new Date(2023, 9, 3), pain: 1, period: true, therapy: true },
  { date: new Date(2023, 9, 4), pain: 0, period: true, therapy: false }, 
  { date: new Date(2023, 9, 5), pain: 4, period: true, therapy: true },
];

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function Calendar({ 
  selectedDate, 
  onSelectDate, 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const firstDayCurrentMonth = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { weekStartsOn: 1 }), 
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Helper to get simulated data for a day
  const getDayData = (day: Date) => {
    const dayNum = day.getDate();
    // Simulate pain levels based on day number for visual variety
    let painLevel = 0;
    if (dayNum % 7 === 0) painLevel = 4;
    else if (dayNum % 5 === 0) painLevel = 3;
    else if (dayNum % 3 === 0) painLevel = 2;
    else if (dayNum % 2 === 0) painLevel = 1;
    
    const hasPeriod = dayNum > 10 && dayNum < 15;
    const takenTherapy = dayNum % 3 !== 0; 
    
    return { painLevel, hasPeriod, takenTherapy };
  };

  const getPainColor = (level: number) => {
    switch(level) {
      case 0: return "bg-[#E8E8E8]"; // Nessuno (Grigio neutro)
      case 1: return "bg-[#B5E4C4]"; // Basso (Verde menta)
      case 2: return "bg-[#FDE8B0]"; // Medio (Giallo ambra)
      case 3: return "bg-[#F4A0A0]"; // Alto (Arancio-rosso tenue)
      case 4: return "bg-[#E05A5A]"; // Intenso (Rosso acceso)
      default: return "bg-[#E8E8E8]";
    }
  };

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

      <div className="grid grid-cols-7 gap-y-4">
        {days.map((day, dayIdx) => {
          const { painLevel, hasPeriod, takenTherapy } = getDayData(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div key={day.toString()} className="flex flex-col items-center justify-center relative h-14">
              <button
                onClick={() => onSelectDate(day)}
                className={cn(
                  "w-10 h-10 flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all relative z-10",
                  !isCurrentMonth && "text-gray-300 opacity-50",
                  isCurrentMonth && !isSelected && "text-gray-700 hover:bg-gray-50",
                  isSelected && "bg-[#14443F] text-white shadow-md transform scale-105",
                  isTodayDate && !isSelected && "border-2 border-[#14443F] text-[#14443F]",
                )}
              >
                <span className="mb-1 text-xs">{format(day, "d")}</span>
                
                {/* Pain Indicator Dot */}
                {isCurrentMonth && (
                   <div className={cn("w-2 h-2 rounded-full", getPainColor(painLevel))}></div>
                )}
              </button>
              
              {/* Secondary Indicators (Period, Therapy) */}
              {isCurrentMonth && (
                <div className="flex gap-1 mt-1 justify-center absolute -bottom-1 w-full">
                    {hasPeriod && <div className="w-1 h-1 rounded-full bg-red-400"></div>}
                    {takenTherapy && <div className="w-1 h-1 rounded-full bg-blue-400"></div>} 
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#E8E8E8]"></div>
          <span>Nessuno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#B5E4C4]"></div>
          <span>Basso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FDE8B0]"></div>
          <span>Medio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#F4A0A0]"></div>
          <span>Alto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#E05A5A]"></div>
          <span>Intenso</span>
        </div>
      </div>
    </div>
  );
}
