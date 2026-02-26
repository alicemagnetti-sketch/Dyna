"use client";
/* Modifica farmaco: form unificato per tutte le tipologie (wireframe) */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sun, Moon } from "lucide-react";
import { useTherapyPlan } from "@/context/TherapyPlanContext";
import {
  type TherapyPlanItem,
  type TherapyFormType,
  type Posology,
  type PosologyPeriod,
  type TherapyVariation,
  TIPOLOGIA_FORM_OPTIONS,
  POSOLOGY_PERIOD_LABELS,
  formToTipologia,
  formatPosologyToQuantity,
} from "@/lib/therapy";

const selectBgSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2314443F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

const defaultPosology: Posology = {
  doseValue: 1,
  dosePeriod: "day",
  freqValue: 1,
  freqPeriod: "day",
};

const defaultTherapyVariation: TherapyVariation = {
  initialQty: 1,
  increaseBy: 1,
  everyValue: 1,
  everyPeriod: "day",
  finalQty: 2,
};

interface EditTherapyModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapy: TherapyPlanItem | null;
  onSaved?: () => void;
}

/** Parses existing quantity string into posology when possible. */
function parseQuantityToPosology(quantity: string): Posology {
  // "1 volta al giorno x 4 mesi" (o giorno/mese/anno)
  const newMatch = quantity.match(/^(\d+(?:\.\d+)?)\s+volta\s+al\s+(giorno|mese|anno)\s+x\s+(\d+)\s+(giorni|mesi|anni|giorno|mese|anno)/i);
  if (newMatch) {
    const [, dVal, doseP, fVal, freqP] = newMatch;
    const periodMap: Record<string, PosologyPeriod> = { giorno: "day", giorni: "day", mese: "month", mesi: "month", anno: "year", anni: "year" };
    return {
      doseValue: parseFloat(dVal!) || 1,
      dosePeriod: periodMap[doseP!.toLowerCase()] ?? "day",
      freqValue: Math.max(1, parseInt(fVal!, 10) || 1),
      freqPeriod: periodMap[freqP!.toLowerCase()] ?? "day",
    };
  }
  // Legacy "10 mg x 2 Giorno"
  const legacyMatch = quantity.match(/^(\d+(?:\.\d+)?)\s*\S*\s*x\s*(\d+)\s*(giorno|mese|anno)/i);
  if (legacyMatch) {
    const [, dVal, fVal, period] = legacyMatch;
    const periodMap: Record<string, PosologyPeriod> = { giorno: "day", mese: "month", anno: "year" };
    const p = periodMap[period!.toLowerCase()] ?? "day";
    return {
      doseValue: parseFloat(dVal!) || 1,
      dosePeriod: p,
      freqValue: Math.max(1, parseInt(fVal!, 10) || 1),
      freqPeriod: p,
    };
  }
  return { ...defaultPosology };
}

export function EditTherapyModal({
  isOpen,
  onClose,
  therapy,
  onSaved,
}: EditTherapyModalProps) {
  const { plan, updateItem, addItem } = useTherapyPlan();
  const [name, setName] = useState("");
  const [form, setForm] = useState<TherapyFormType>("pastiglia");
  const [formOther, setFormOther] = useState("");
  const [posology, setPosology] = useState<Posology>(defaultPosology);
  const [therapyVariationOn, setTherapyVariationOn] = useState(false);
  const [therapyVariation, setTherapyVariation] = useState<TherapyVariation>(defaultTherapyVariation);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night" | null>("day");
  const [time, setTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const timeInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [alternateOn, setAlternateOn] = useState(false);
  const [alternateWithId, setAlternateWithId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const isNew = therapy === null;
  const tipologiaOptions = TIPOLOGIA_FORM_OPTIONS;
  const otherTherapies = plan.filter((t) => t.id !== therapy?.id);

  useEffect(() => {
    if (!isOpen) return;
    if (therapy) {
      setName(therapy.name);
      const tipologia = formToTipologia(therapy.form);
      setForm(tipologia);
      setFormOther(therapy.formOther ?? "");
      if (therapy.posology) {
        setPosology(therapy.posology);
      } else {
        setPosology(parseQuantityToPosology(therapy.quantity));
      }
      setTherapyVariationOn(!!therapy.therapyVariation);
      setTherapyVariation(therapy.therapyVariation ?? defaultTherapyVariation);
      setTimeOfDay(therapy.creamTimeOfDay ?? null);
      setTime(therapy.time?.trim() ?? "");
      setStartDate(therapy.startDate ?? "");
      setAlternateOn(!!therapy.alternateWithId);
      setAlternateWithId(therapy.alternateWithId ?? null);
      setNotes(therapy.notes ?? "");
    } else {
      setName("");
      setForm("pastiglia");
      setFormOther("");
      setPosology(defaultPosology);
      setTherapyVariationOn(false);
      setTherapyVariation(defaultTherapyVariation);
      setTimeOfDay(null);
      setTime("");
      setStartDate("");
      setAlternateOn(false);
      setAlternateWithId(null);
      setNotes("");
    }
  }, [isOpen, therapy]);

  const handleSave = () => {
    const quantityStr = formatPosologyToQuantity(posology);
    const formToSave: TherapyFormType = form === "ovulo" ? "ovulo" : form === "altro" ? "altro" : form;
    const payload: Omit<TherapyPlanItem, "id"> = {
      name: name.trim() || (therapy?.name ?? "Nuovo farmaco"),
      form: formToSave,
      formOther: form === "altro" ? formOther.trim() || null : null,
      quantity: quantityStr,
      posology,
      startDate: startDate || therapy?.startDate || new Date().toISOString().slice(0, 10),
      duration: therapy?.duration ?? { type: "months", value: 12 },
      quantityChangeDate: null,
      quantityAfterChange: null,
      gocceRamp: null,
      therapyVariation: therapyVariationOn ? therapyVariation : null,
      alternateWithId: alternateOn ? alternateWithId : null,
      alternateFrequency: alternateOn && alternateWithId ? "1_day_1_day" : null,
      alternateMonthsValue: null,
      time: time.trim(),
      creamTimeOfDay: timeOfDay ?? null,
      paused: therapy?.paused ?? false,
      notes: notes.trim(),
    };
    if (therapy) {
      updateItem(therapy.id, payload);
    } else {
      addItem(payload);
    }
    onSaved?.();
    onClose();
  };

  const handleTimeOfDayChange = (value: "day" | "night") => {
    setTimeOfDay((prev) => (prev === value ? null : value));
    if (value === "day" && time === "22:00") setTime("");
    if (value === "night" && time === "08:00") setTime("");
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-50 text-[#14443F]"
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
              <h2 className="text-lg font-bold text-[#14443F]">
                {isNew ? "Nuovo farmaco" : "Modifica farmaco"}
              </h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {/* 1. Nome medicinale */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nome medicinale
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Amitriptilina"
                  className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                />
              </div>

              {/* 2. Tipologia */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Tipologia
                </label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value as TherapyFormType)}
                  className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                  style={{ backgroundImage: selectBgSvg }}
                >
                  {tipologiaOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {form === "altro" && (
                  <input
                    type="text"
                    value={formOther}
                    onChange={(e) => setFormOther(e.target.value)}
                    placeholder="Specifica tipologia"
                    className="mt-2 w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                  />
                )}
              </div>

              {/* 3. Posologia */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Posologia
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={posology.doseValue}
                    onChange={(e) =>
                      setPosology((p) => ({ ...p, doseValue: Math.max(0, parseFloat(e.target.value) || 0) }))
                    }
                    className="w-20 p-3 rounded-xl border border-gray-200 text-[#14443F]"
                  />
                  <select
                    value={posology.dosePeriod}
                    onChange={(e) =>
                      setPosology((p) => ({ ...p, dosePeriod: e.target.value as PosologyPeriod }))
                    }
                    className="p-3 pr-8 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1rem] bg-[right_0.5rem_center] appearance-none min-w-[7rem]"
                    style={{ backgroundImage: selectBgSvg }}
                  >
                    {(Object.entries(POSOLOGY_PERIOD_LABELS) as [PosologyPeriod, string][]).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <span className="text-[#14443F] font-medium">x</span>
                  <input
                    type="number"
                    min={1}
                    value={posology.freqValue}
                    onChange={(e) =>
                      setPosology((p) => ({ ...p, freqValue: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                    }
                    className="w-16 p-3 rounded-xl border border-gray-200 text-[#14443F]"
                  />
                  <select
                    value={posology.freqPeriod}
                    onChange={(e) =>
                      setPosology((p) => ({ ...p, freqPeriod: e.target.value as PosologyPeriod }))
                    }
                    className="p-3 pr-8 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1rem] bg-[right_0.5rem_center] appearance-none min-w-[6rem]"
                    style={{ backgroundImage: selectBgSvg }}
                  >
                    {(Object.entries(POSOLOGY_PERIOD_LABELS) as [PosologyPeriod, string][]).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. La terapia varia nel tempo */}
              <div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-[#14443F]">La terapia varia nel tempo</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={therapyVariationOn}
                    onClick={() => setTherapyVariationOn(!therapyVariationOn)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${therapyVariationOn ? "bg-[#14443F]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${therapyVariationOn ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
                {therapyVariationOn && (
                  <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Q.tà iniziale</label>
                        <input
                          type="number"
                          min={0}
                          value={therapyVariation.initialQty}
                          onChange={(e) =>
                            setTherapyVariation((v) => ({
                              ...v,
                              initialQty: Math.max(0, parseFloat(e.target.value) || 0),
                            }))
                          }
                          className="w-full p-2 rounded-lg border border-gray-200 text-[#14443F]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Aumenta di</label>
                        <input
                          type="number"
                          min={0}
                          value={therapyVariation.increaseBy}
                          onChange={(e) =>
                            setTherapyVariation((v) => ({
                              ...v,
                              increaseBy: Math.max(0, parseFloat(e.target.value) || 0),
                            }))
                          }
                          className="w-full p-2 rounded-lg border border-gray-200 text-[#14443F]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ogni</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={therapyVariation.everyValue}
                            onChange={(e) =>
                              setTherapyVariation((v) => ({
                                ...v,
                                everyValue: Math.max(1, parseInt(e.target.value, 10) || 1),
                              }))
                            }
                            className="w-16 p-2 rounded-lg border border-gray-200 text-[#14443F]"
                          />
                          <select
                            value={therapyVariation.everyPeriod}
                            onChange={(e) =>
                              setTherapyVariation((v) => ({
                                ...v,
                                everyPeriod: e.target.value as PosologyPeriod,
                              }))
                            }
                            className="p-2 pr-8 rounded-lg border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:0.875rem] bg-[right_0.35rem_center] appearance-none min-w-[5rem]"
                            style={{ backgroundImage: selectBgSvg }}
                          >
                            {(Object.entries(POSOLOGY_PERIOD_LABELS) as [PosologyPeriod, string][]).map(
                              ([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Q.tà finale</label>
                        <input
                          type="number"
                          min={0}
                          value={therapyVariation.finalQty}
                          onChange={(e) =>
                            setTherapyVariation((v) => ({
                              ...v,
                              finalQty: Math.max(0, parseFloat(e.target.value) || 0),
                            }))
                          }
                          className="w-full p-2 rounded-lg border border-gray-200 text-[#14443F]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Orario */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Orario
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleTimeOfDayChange("day")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${
                      timeOfDay === "day"
                        ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Sun size={20} />
                    Giorno
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTimeOfDayChange("night")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${
                      timeOfDay === "night"
                        ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Moon size={20} />
                    Notte
                  </button>
                </div>
                <div
                  className="relative w-full cursor-pointer min-h-[50px]"
                  onClick={() => timeInputRef.current?.showPicker?.() ?? timeInputRef.current?.focus()}
                >
                  {!time ? (
                    <div className="absolute inset-0 flex items-center px-3 rounded-xl border border-gray-200 bg-white text-gray-400">
                      Scegli un orario
                    </div>
                  ) : null}
                  <input
                    ref={timeInputRef}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full p-3 rounded-xl border border-gray-200 text-[#14443F] bg-transparent relative z-10 [color-scheme:light] ${!time ? "absolute opacity-0 inset-0 w-full h-full cursor-pointer" : ""}`}
                  />
                </div>
              </div>

              {/* 6. Inizio terapia */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Inizio terapia
                </label>
                <div
                  className="relative w-full cursor-pointer min-h-[50px]"
                  onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.focus()}
                >
                  {!startDate ? (
                    <div className="absolute inset-0 flex items-center px-3 rounded-xl border border-gray-200 bg-white text-gray-400">
                      Aggiungi una data
                    </div>
                  ) : null}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full p-3 rounded-xl border border-gray-200 text-[#14443F] bg-transparent relative z-10 [color-scheme:light] ${!startDate ? "absolute opacity-0 inset-0 w-full h-full cursor-pointer" : ""}`}
                  />
                </div>
              </div>

              {/* 7. Da alternare con altro farmaco */}
              <div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-[#14443F]">Da alternare con altro farmaco</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={alternateOn}
                    onClick={() => {
                      setAlternateOn(!alternateOn);
                      if (alternateOn) setAlternateWithId(null);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${alternateOn ? "bg-[#14443F]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${alternateOn ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
                {alternateOn && (
                  <select
                    value={alternateWithId ?? ""}
                    onChange={(e) => setAlternateWithId(e.target.value === "" ? null : Number(e.target.value))}
                    className="mt-2 w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                    style={{ backgroundImage: selectBgSvg }}
                  >
                    <option value="">Seleziona farmaco</option>
                    {otherTherapies.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 8. Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Note
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note sulla terapia..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] resize-none"
                />
              </div>

              {/* 9. Annulla / Salva */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-[#14443F] font-medium"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-[#14443F] text-white font-medium hover:bg-[#0f332f] transition-colors"
                >
                  Salva
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
