"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sun, Moon } from "lucide-react";
import { useTherapyPlan } from "@/context/TherapyPlanContext";
import {
  type TherapyPlanItem,
  type TherapyFormType,
  type DurationType,
  type AlternateFrequencyType,
  type GocceRamp,
  type CreamTimeOfDay,
  THERAPY_FORM_LABELS,
  DURATION_TYPE_LABELS,
  ALTERNATE_FREQUENCY_LABELS,
  isOralForm,
} from "@/lib/therapy";

const selectBgSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2314443F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

interface EditTherapyModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapy: TherapyPlanItem | null;
  onSaved?: () => void;
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
  const [quantity, setQuantity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationType, setDurationType] = useState<DurationType>("months");
  const [durationValue, setDurationValue] = useState(1);
  const [quantityChangeDate, setQuantityChangeDate] = useState<string | null>(null);
  const [quantityAfterChange, setQuantityAfterChange] = useState<string | null>(null);
  const [alternateWithId, setAlternateWithId] = useState<number | null>(null);
  const [alternateFrequency, setAlternateFrequency] = useState<AlternateFrequencyType | null>(null);
  const [alternateMonthsValue, setAlternateMonthsValue] = useState<number | null>(null);
  const [time, setTime] = useState("09:00");
  const [creamTimeOfDay, setCreamTimeOfDay] = useState<CreamTimeOfDay | null>(null);
  const [paused, setPaused] = useState(false);
  const [notes, setNotes] = useState("");
  const [gocceRamp, setGocceRamp] = useState<GocceRamp | null>(null);

  const isNew = therapy === null;
  const oral = isOralForm(form);
  const isGocce = form === "gocce";
  const isCream = form === "crema";

  useEffect(() => {
    if (!isOpen) return;
    if (therapy) {
      setName(therapy.name);
      setForm(therapy.form);
      setQuantity(therapy.quantity);
      setStartDate(therapy.startDate);
      setDurationType(therapy.duration.type);
      setDurationValue(therapy.duration.value);
      setQuantityChangeDate(therapy.quantityChangeDate);
      setQuantityAfterChange(therapy.quantityAfterChange);
      setGocceRamp(therapy.gocceRamp);
      setAlternateWithId(therapy.alternateWithId);
      setAlternateFrequency(therapy.alternateFrequency);
      setAlternateMonthsValue(therapy.alternateMonthsValue);
      setTime(therapy.time);
      setCreamTimeOfDay(therapy.creamTimeOfDay ?? null);
      setPaused(therapy.paused);
      setNotes(therapy.notes ?? "");
    } else {
      setName("");
      setForm("pastiglia");
      setQuantity("");
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setDurationType("months");
      setDurationValue(1);
      setQuantityChangeDate(null);
      setQuantityAfterChange(null);
      setGocceRamp(null);
      setAlternateWithId(null);
      setAlternateFrequency(null);
      setAlternateMonthsValue(null);
      setTime("09:00");
      setCreamTimeOfDay(null);
      setPaused(false);
      setNotes("");
    }
  }, [isOpen, therapy]);

  const handleSave = () => {
    const duration = { type: durationType, value: durationValue };
    const payload = {
      name: name.trim() || (therapy?.name ?? "Nuovo farmaco"),
      form,
      quantity: quantity.trim(),
      startDate: startDate || therapy?.startDate || new Date().toISOString().slice(0, 10),
      duration,
      quantityChangeDate: isGocce ? null : quantityChangeDate || null,
      quantityAfterChange: isGocce ? null : quantityAfterChange?.trim() || null,
      gocceRamp: isGocce ? gocceRamp : null,
      alternateWithId,
      alternateFrequency,
      alternateMonthsValue: alternateFrequency === "x_months_x_months" ? alternateMonthsValue : null,
      time: time.trim() || "09:00",
      creamTimeOfDay: isCream ? creamTimeOfDay : null,
      paused,
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

  const otherTherapies = plan.filter((t) => t.id !== therapy?.id);

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

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Formato
                </label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value as TherapyFormType)}
                  className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                  style={{ backgroundImage: selectBgSvg }}
                >
                  {(Object.entries(THERAPY_FORM_LABELS) as [TherapyFormType, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {isCream && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Quando applicare la crema
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCreamTimeOfDay(creamTimeOfDay === "day" ? null : "day")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${
                        creamTimeOfDay === "day"
                          ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <Sun size={20} />
                      Giorno
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreamTimeOfDay(creamTimeOfDay === "night" ? null : "night")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${
                        creamTimeOfDay === "night"
                          ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <Moon size={20} />
                      Notte
                    </button>
                  </div>
                </div>
              )}

              {oral && (
                <>
                  {form !== "gocce" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Quantità
                      </label>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Es. 10mg, 1 bustina"
                        className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                      />
                    </div>
                  )}
                  {isGocce && (
                    <div className="space-y-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Aumento progressivo gocce
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Gocce iniziali</label>
                          <input
                            type="number"
                            min={0}
                            value={gocceRamp?.startDrops ?? 1}
                            onChange={(e) =>
                              setGocceRamp((r) => ({
                                ...(r ?? { startDrops: 1, increaseEveryDays: 7, increaseBy: 1, maxDrops: 12 }),
                                startDrops: Math.max(0, parseInt(e.target.value, 10) || 0),
                              }))
                            }
                            className="w-full p-2 rounded-lg border border-gray-200 text-[#14443F]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Ogni (giorni)</label>
                          <input
                            type="number"
                            min={1}
                            value={gocceRamp?.increaseEveryDays ?? 7}
                            onChange={(e) =>
                              setGocceRamp((r) => ({
                                ...(r ?? { startDrops: 1, increaseEveryDays: 7, increaseBy: 1, maxDrops: 12 }),
                                increaseEveryDays: Math.max(1, parseInt(e.target.value, 10) || 1),
                              }))
                            }
                            className="w-full p-2 rounded-lg border border-gray-200 text-[#14443F]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Aumento di (gocce)</label>
                          <input
                            type="number"
                            min={1}
                            value={gocceRamp?.increaseBy ?? 1}
                            onChange={(e) =>
                              setGocceRamp((r) => ({
                                ...(r ?? { startDrops: 1, increaseEveryDays: 7, increaseBy: 1, maxDrops: 12 }),
                                increaseBy: Math.max(1, parseInt(e.target.value, 10) || 1),
                              }))
                            }
                            className="w-full p-2 rounded-lg border border-gray-200 text-[#14443F]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Massimo gocce</label>
                          <input
                            type="number"
                            min={1}
                            value={gocceRamp?.maxDrops ?? 12}
                            onChange={(e) =>
                              setGocceRamp((r) => ({
                                ...(r ?? { startDrops: 1, increaseEveryDays: 7, increaseBy: 1, maxDrops: 12 }),
                                maxDrops: Math.max(1, parseInt(e.target.value, 10) || 1),
                              }))
                            }
                            className="w-full p-2 rounded-lg border border-gray-200 text-[#14443F]"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Es. da {gocceRamp?.startDrops ?? 1} goccia/e, +{gocceRamp?.increaseBy ?? 1} ogni{" "}
                        {gocceRamp?.increaseEveryDays ?? 7} gg fino a {gocceRamp?.maxDrops ?? 12}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      A che ora prenderlo
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Data inizio terapia
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Durata
                  </label>
                  <select
                    value={durationType}
                    onChange={(e) => setDurationType(e.target.value as DurationType)}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                    style={{ backgroundImage: selectBgSvg }}
                  >
                    {(Object.entries(DURATION_TYPE_LABELS) as [DurationType, string][]).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {durationType === "days" ? "Giorni" : durationType === "months" ? "Mesi" : "Giorni/mese"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationValue}
                    onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                  />
                </div>
              </div>

              {!isGocce && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Cambio quantità nel corso della terapia
                  </label>
                  <input
                    type="date"
                    value={quantityChangeDate ?? ""}
                    onChange={(e) => setQuantityChangeDate(e.target.value || null)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                  />
                  {quantityChangeDate && (
                    <input
                      type="text"
                      value={quantityAfterChange ?? ""}
                      onChange={(e) => setQuantityAfterChange(e.target.value || null)}
                      placeholder="Nuova quantità da questa data"
                      className="mt-2 w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Alternare con altro medicinale
                </label>
                <select
                  value={alternateWithId ?? ""}
                  onChange={(e) => setAlternateWithId(e.target.value === "" ? null : Number(e.target.value))}
                  className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                  style={{ backgroundImage: selectBgSvg }}
                >
                  <option value="">No</option>
                  {otherTherapies.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {alternateWithId !== null && (
                  <>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1.5">
                      Frequenza alternanza
                    </label>
                    <select
                      value={alternateFrequency ?? ""}
                      onChange={(e) =>
                        setAlternateFrequency(
                          e.target.value === "" ? null : (e.target.value as AlternateFrequencyType)
                        )
                      }
                      className="w-full p-3 pr-10 rounded-xl border border-gray-200 text-[#14443F] bg-white bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] appearance-none"
                      style={{ backgroundImage: selectBgSvg }}
                    >
                      <option value="">—</option>
                      {(Object.entries(ALTERNATE_FREQUENCY_LABELS) as [AlternateFrequencyType, string][]).map(
                        ([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        )
                      )}
                    </select>
                    {alternateFrequency === "x_months_x_months" && (
                      <div className="mt-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Mesi (uno / l&apos;altro)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={alternateMonthsValue ?? 1}
                          onChange={(e) =>
                            setAlternateMonthsValue(Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F]"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

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

              {therapy && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-[#14443F]">In pausa</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={paused}
                    onClick={() => setPaused(!paused)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${paused ? "bg-[#14443F]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${paused ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
              )}

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
