"use client";
/* Il tuo Piano: card con Giorno/Notte per creme, orario solo se impostato per orali */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Clock, Plus, Pencil, FileText, Sun, Moon, Pill } from "lucide-react";
import { useTherapyPlan } from "@/context/TherapyPlanContext";
import {
  type TherapyPlanItem,
  THERAPY_FORM_LABELS,
  isOralForm,
  getTherapyDoseDisplay,
} from "@/lib/therapy";
import { EditTherapyModal } from "./EditTherapyModal";

const CARD_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
];

function getColor(index: number) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

/** Colore solo bg per pallini (prima parte della classe, es. bg-purple-100) */
function getColorBg(index: number): string {
  return getColor(index).split(" ")[0];
}

/** Classe per il pallino: purple usa var(--color-purple-500) per bg e color; pink usa var(--color-pink-400) per bg */
function getDotClass(bgClass: string): string {
  if (bgClass === "bg-purple-100") {
    return "w-2 h-2 rounded-full bg-[var(--color-purple-500)] text-[var(--color-purple-500)]";
  }
  if (bgClass === "bg-pink-100") {
    return "w-2 h-2 rounded-full bg-[var(--color-pink-400)]";
  }
  return `w-2 h-2 rounded-full ${bgClass}`;
}

function formatDuration(d: TherapyPlanItem["duration"]) {
  if (d.type === "days") return `${d.value} giorni`;
  if (d.type === "months") return `${d.value} mesi`;
  return `${d.value} giorni/mese`;
}

interface TherapyViewProps {
  openAddTherapy?: boolean;
  onAddTherapyClose?: () => void;
}

export function TherapyView({ openAddTherapy, onAddTherapyClose }: TherapyViewProps = {}) {
  const { plan, history } = useTherapyPlan();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const activePlan = plan.filter((t) => !t.paused);
  const editingItem = editingId !== null ? plan.find((t) => t.id === editingId) ?? null : null;

  // Apri modale "Aggiungi farmaco" se richiesto dal FAB (es. da tab Calendario)
  useEffect(() => {
    if (openAddTherapy) setAddingNew(true);
  }, [openAddTherapy]);

  return (
    <div className="p-4 pt-8 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#14443F]">Il tuo Piano</h2>
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="p-2 bg-[#EBF5F0] rounded-full text-[#14443F]"
          aria-label="Aggiungi farmaco"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {plan.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-[#EBF5F0] p-6 mb-6" aria-hidden>
              <Pill size={64} className="text-[#14443F]" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-semibold text-[#14443F] mb-6">Non hai terapie attive</p>
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#14443F] text-white font-medium rounded-full hover:bg-[#0f332f] transition-colors"
              aria-label="Aggiungi un farmaco"
            >
              <Plus size={20} />
              Aggiungi un farmaco
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-[#14443F] text-lg">Farmaci Attivi</h3>
              <span className="text-xs font-bold text-[#5C8D89] bg-[#EBF5F0] px-3 py-1 rounded-full uppercase tracking-wide">
                {activePlan.length} in corso
              </span>
            </div>

            {plan.map((therapy, index) => {
          const alternateTherapy = therapy.alternateWithId
            ? plan.find((t) => t.id === therapy.alternateWithId)
            : null;
          const alternateIndex =
            alternateTherapy != null ? plan.findIndex((t) => t.id === therapy.alternateWithId) : -1;
          const thisDotColor = getColorBg(index);
          const otherDotColor = alternateIndex >= 0 ? getColorBg(alternateIndex) : "bg-gray-200";

          return (
            <div
              key={therapy.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all relative overflow-hidden ${
                therapy.paused ? "border-gray-200 opacity-75" : "border-gray-100 group hover:border-[#14443F]"
              }`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${getColorBg(index)}`}
              />
              <div className="p-4 pl-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-bold text-[#14443F] text-lg leading-tight">
                        {therapy.name}
                      </h4>
                      <span className="font-medium text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
                        {THERAPY_FORM_LABELS[therapy.form]}
                      </span>
                      {therapy.paused && (
                        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          In pausa
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                      {isOralForm(therapy.form) && (
                        <>
                          {therapy.time?.trim() && (
                            <>
                              <span className="flex items-center gap-1 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                                <Clock size={10} /> {therapy.time}
                              </span>
                              <span className="text-gray-300">•</span>
                            </>
                          )}
                          <span>{getTherapyDoseDisplay(therapy)}</span>
                        </>
                      )}
                      {therapy.form === "crema" && therapy.creamTimeOfDay && (
                        <span className="flex items-center gap-1 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                          {therapy.creamTimeOfDay === "day" ? (
                            <Sun size={10} /> 
                          ) : (
                            <Moon size={10} />
                          )}{" "}
                          {therapy.creamTimeOfDay === "day" ? "Giorno" : "Notte"}
                        </span>
                      )}
                    </div>
                    {therapy.notes.trim() !== "" && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                        <FileText size={12} className="shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{therapy.notes}</span>
                      </div>
                    )}
                    {therapy.alternateWithId && alternateTherapy && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span>Alternato con {alternateTherapy.name}</span>
                        <div className="flex items-center gap-0.5 shrink-0" aria-hidden>
                          <span className={getDotClass(thisDotColor)} />
                          <span className={getDotClass(otherDotColor)} />
                          <span className={getDotClass(thisDotColor)} />
                          <span className={getDotClass(otherDotColor)} />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Da {therapy.startDate} • {formatDuration(therapy.duration)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingId(therapy.id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
                    aria-label="Modifica"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
          </>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-bold text-[#14443F] text-lg mb-4">Storico Modifiche</h3>
        <div className="pl-4 border-l-2 border-gray-200 space-y-6 relative">
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nessuna modifica registrata</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-400 border-2 border-white box-content" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  {format(new Date(item.date), "d MMM yyyy", { locale: it })}
                </p>
                <p className="font-bold text-[#14443F]">{item.action}</p>
                <p className="text-sm text-gray-500">{item.detail}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <EditTherapyModal
        isOpen={editingId !== null || addingNew}
        onClose={() => {
          const wasAddingNew = addingNew;
          setEditingId(null);
          setAddingNew(false);
          if (wasAddingNew) onAddTherapyClose?.();
        }}
        therapy={addingNew ? null : editingItem}
        onSaved={() => {
          setEditingId(null);
          setAddingNew(false);
          onAddTherapyClose?.();
        }}
      />
    </div>
  );
}
