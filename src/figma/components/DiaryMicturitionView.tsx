"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Droplet, Edit2, X, GlassWater, Coffee, Leaf, Citrus, Bottle } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Diary } from "@/lib/diaries";
import type { FluidIntake, FluidIntakeType, VoidingEntry } from "@/lib/types";
import {
  getFluidIntakesForDiary,
  getVoidingEntriesForDiary,
  upsertFluidIntake,
  upsertVoidingEntry,
  removeFluidIntake,
  removeVoidingEntry,
} from "@/lib/storage";
import { groupByTimeBlock, type TimeBlock } from "@/lib/voiding";

const FLUID_TYPE_LABELS: Record<FluidIntakeType, string> = {
  acqua: "Acqua",
  caffe: "Caffè",
  te: "Tè",
  succo: "Succo",
  altro: "Altro",
};

const FLUID_ICONS: Record<FluidIntakeType, React.ReactNode> = {
  acqua: <GlassWater size={18} className="text-blue-500 shrink-0" />,
  caffe: <Coffee size={18} className="text-amber-800 shrink-0" />,
  te: <Leaf size={18} className="text-green-600 shrink-0" />,
  succo: <Citrus size={18} className="text-amber-500 shrink-0" />,
  altro: <Bottle size={18} className="text-gray-500 shrink-0" />,
};

const QUICK_VOLUMES_FLUID = [100, 200, 250, 330, 500];
const QUICK_VOLUMES_VOID = [100, 150, 200, 300, 400, 500];

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toTimestamp(date: string, time: string): string {
  return `${date}T${time}:00`;
}

interface DiaryMicturitionViewProps {
  diary: Diary;
  onBack: () => void;
}

const today = format(new Date(), "yyyy-MM-dd");

export function DiaryMicturitionView({ diary, onBack }: DiaryMicturitionViewProps) {
  const [fluids, setFluids] = useState<FluidIntake[]>([]);
  const [voidings, setVoidings] = useState<VoidingEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"bevanda" | "minzione">("bevanda");
  const [editingFluid, setEditingFluid] = useState<FluidIntake | null>(null);
  const [editingVoiding, setEditingVoiding] = useState<VoidingEntry | null>(null);

  const load = useCallback(() => {
    setFluids(getFluidIntakesForDiary(diary.id));
    setVoidings(getVoidingEntriesForDiary(diary.id));
  }, [diary.id]);

  useEffect(() => {
    load();
  }, [load]);

  const datesWithEntries = useMemo(() => {
    const dates = new Set<string>();
    fluids.forEach((f) => dates.add(f.date));
    voidings.forEach((v) => dates.add(v.date));
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [fluids, voidings]);
  const hasAnyEntries = datesWithEntries.length > 0;

  const openAdd = () => {
    setEditingFluid(null);
    setEditingVoiding(null);
    setModalTab("bevanda");
    setModalOpen(true);
  };

  const openEditFluid = (f: FluidIntake) => {
    setEditingFluid(f);
    setEditingVoiding(null);
    setModalTab("bevanda");
    setModalOpen(true);
  };

  const openEditVoiding = (v: VoidingEntry) => {
    setEditingVoiding(v);
    setEditingFluid(null);
    setModalTab("minzione");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFluid(null);
    setEditingVoiding(null);
  };

  return (
    <div className="p-4 pt-8 pb-24 space-y-6 relative min-h-dvh bg-[#F8FBF9] flex flex-col">
      <AnimatePresence>
        {modalOpen && (
          <AddOrEditEntryModal
            diaryId={diary.id}
            initialDate={
              editingFluid ? editingFluid.date : editingVoiding ? editingVoiding.date : today
            }
            tab={modalTab}
            onTabChange={setModalTab}
            initialFluid={editingFluid}
            initialVoiding={editingVoiding}
            onClose={closeModal}
            onSaved={() => {
              load();
              closeModal();
            }}
            onDeleteFluid={(id) => {
              removeFluidIntake(id);
              load();
              closeModal();
            }}
            onDeleteVoiding={(id) => {
              removeVoidingEntry(id);
              load();
              closeModal();
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 text-[#14443F]"
          aria-label="Indietro"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center mx-2">
          <h2 className="text-xl font-bold text-[#14443F]">{diary.name}</h2>
          <p className="text-sm text-[#5C8D89]">{format(new Date(), "EEEE d MMMM", { locale: it })}</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="p-2 bg-[#EBF5F0] rounded-full text-[#14443F] hover:bg-[#14443F] hover:text-white transition-colors"
          aria-label="Aggiungi voce"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Content: empty state or timeline grouped by day */}
      {!hasAnyEntries ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <p className="text-center text-gray-500 mb-6">Nessuna voce registrata. Tocca + per iniziare.</p>
          <button
            type="button"
            onClick={openAdd}
            className="px-6 py-3 bg-[#14443F] text-white font-medium rounded-full hover:bg-[#0f332f] transition-colors"
          >
            Aggiungi nuova azione
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-h-[50vh] overflow-y-auto">
          {datesWithEntries.map((date) => {
            const dayFluids = fluids.filter((f) => f.date === date);
            const dayVoidings = voidings.filter((v) => v.date === date);
            const dayBlocks = groupByTimeBlock(dayFluids, dayVoidings);
            const nonEmptyBlocks = dayBlocks.filter((b) => b.fluids.length > 0 || b.voidings.length > 0);
            const dateLabel = format(new Date(date + "T12:00:00"), "EEEE d MMMM yyyy", { locale: it });
            return (
              <div key={date} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-[#14443F]">{dateLabel}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {nonEmptyBlocks.map((block) => (
                    <TimeBlockRow
                      key={`${date}-${block.start}-${block.end}`}
                      block={block}
                      onEditFluid={openEditFluid}
                      onEditVoiding={openEditVoiding}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type BlockEntry =
  | { kind: "fluid"; entry: FluidIntake }
  | { kind: "voiding"; entry: VoidingEntry };

function TimeBlockRow({
  block,
  onEditFluid,
  onEditVoiding,
}: {
  block: TimeBlock;
  onEditFluid: (f: FluidIntake) => void;
  onEditVoiding: (v: VoidingEntry) => void;
}) {
  const hasContent = block.fluids.length > 0 || block.voidings.length > 0;
  if (!hasContent) return null;

  const entries: BlockEntry[] = [
    ...block.fluids.map((entry) => ({ kind: "fluid" as const, entry })),
    ...block.voidings.map((entry) => ({ kind: "voiding" as const, entry })),
  ].sort((a, b) => {
    const tsA = a.kind === "fluid" ? a.entry.timestamp : a.entry.timestamp;
    const tsB = b.kind === "fluid" ? b.entry.timestamp : b.entry.timestamp;
    return tsA.localeCompare(tsB);
  });

  return (
    <div className="bg-white">
      {/* Block header: bold teal time range + dark separator */}
      <div className="px-4 pt-3 pb-2 border-b-2 border-gray-200">
        <span className="text-sm font-bold text-[#14443F]">
          {block.start} – {block.end}
        </span>
      </div>
      {/* Block content: entries */}
      <div className="px-4 py-2">
        <div className="space-y-0">
          {entries.map((item, index) => (
            <div key={item.kind === "fluid" ? item.entry.id : item.entry.id}>
              {index > 0 && <div className="border-t border-gray-100 my-1.5" />}
              {item.kind === "voiding" ? (
                <div className="flex items-center justify-between gap-2 py-2 group">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-gray-500 font-mono shrink-0">
                      {formatTime(item.entry.timestamp)}
                    </span>
                    <Droplet size={18} className="text-amber-500 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {item.entry.volume_ml != null ? `${item.entry.volume_ml} ml` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-500">
                      Bruciore: {item.entry.burning ? "Sì" : "No"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Urgenza: {item.entry.urgency ? "Sì" : "No"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditVoiding(item.entry)}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#14443F] opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Modifica minzione"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 py-2 group">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-gray-500 font-mono shrink-0">
                      {formatTime(item.entry.timestamp)}
                    </span>
                    {FLUID_ICONS[item.entry.type]}
                    <span className="text-sm text-gray-700 truncate">
                      {item.entry.label ?? `${FLUID_TYPE_LABELS[item.entry.type]} (${item.entry.volume_ml} ml)`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditFluid(item.entry)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#14443F] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Modifica bevanda"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    return format(d, "HH:mm");
  } catch {
    return "?:?";
  }
}

// ---- Add/Edit entry modal ----

type ModalProps = {
  diaryId: string;
  initialDate: string;
  tab: "bevanda" | "minzione";
  onTabChange: (t: "bevanda" | "minzione") => void;
  initialFluid: FluidIntake | null;
  initialVoiding: VoidingEntry | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleteFluid: (id: string) => void;
  onDeleteVoiding: (id: string) => void;
};

function AddOrEditEntryModal({
  diaryId,
  initialDate,
  tab,
  onTabChange,
  initialFluid,
  initialVoiding,
  onClose,
  onSaved,
  onDeleteFluid,
  onDeleteVoiding,
}: ModalProps) {
  const now = new Date();
  const defaultTime = format(now, "HH:mm");

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(defaultTime);
  const [fluidType, setFluidType] = useState<FluidIntakeType>("acqua");
  const [fluidVolume, setFluidVolume] = useState(200);
  const [fluidLabel, setFluidLabel] = useState<string>("");
  const [voidVolume, setVoidVolume] = useState<number | null>(200);
  const [urgency, setUrgency] = useState(false);
  const [burning, setBurning] = useState(false);

  const isEdit = !!initialFluid || !!initialVoiding;
  const isEditFluid = !!initialFluid;
  const isEditVoiding = !!initialVoiding;

  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (!initialFluid && !initialVoiding) {
      const now = new Date();
      setDate(format(now, "yyyy-MM-dd"));
      setTime(format(now, "HH:mm"));
      setFluidType("acqua");
      setFluidVolume(200);
      setFluidLabel("");
      setVoidVolume(200);
      setUrgency(false);
      setBurning(false);
    }
  }, [initialFluid, initialVoiding]);

  useEffect(() => {
    if (initialFluid) {
      setDate(initialFluid.date);
      setTime(format(new Date(initialFluid.timestamp), "HH:mm"));
      setFluidType(initialFluid.type);
      setFluidVolume(initialFluid.volume_ml);
      setFluidLabel(initialFluid.label ?? "");
    }
  }, [initialFluid]);

  useEffect(() => {
    if (initialVoiding) {
      setDate(initialVoiding.date);
      setTime(format(new Date(initialVoiding.timestamp), "HH:mm"));
      setVoidVolume(initialVoiding.volume_ml);
      setUrgency(initialVoiding.urgency);
      setBurning(initialVoiding.burning);
    }
  }, [initialVoiding]);

  const handleSaveBevanda = () => {
    const id = initialFluid?.id ?? newId();
    const timestamp = toTimestamp(date, time);
    const entry: FluidIntake = {
      id,
      diaryId,
      date,
      timestamp,
      type: fluidType,
      volume_ml: fluidVolume,
      label: fluidLabel.trim() || undefined,
    };
    upsertFluidIntake(entry);
    onSaved();
  };

  const handleSaveMinzione = () => {
    const id = initialVoiding?.id ?? newId();
    const timestamp = toTimestamp(date, time);
    const entry: VoidingEntry = {
      id,
      diaryId,
      date,
      timestamp,
      volume_ml: voidVolume ?? null,
      urgency,
      burning,
    };
    upsertVoidingEntry(entry);
    onSaved();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <h3 className="text-xl font-bold text-[#14443F]">
          {isEdit ? "Modifica voce" : "Nuova voce"}
        </h3>
        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Chiudi">
          <X size={24} />
        </button>
      </div>

      {!isEdit && (
        <div className="flex p-1 bg-gray-100 rounded-xl mx-4 mt-4">
          <button
            type="button"
            onClick={() => onTabChange("bevanda")}
            className={cn(
              "flex-1 py-3 rounded-lg font-bold transition-all",
              tab === "bevanda" ? "bg-white shadow text-[#14443F]" : "text-gray-400"
            )}
          >
            Bevanda
          </button>
          <button
            type="button"
            onClick={() => onTabChange("minzione")}
            className={cn(
              "flex-1 py-3 rounded-lg font-bold transition-all",
              tab === "minzione" ? "bg-white shadow text-[#14443F]" : "text-gray-400"
            )}
          >
            Minzione
          </button>
        </div>
      )}

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] focus:outline-none focus:ring-2 focus:ring-[#14443F]/20"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Orario</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] focus:outline-none focus:ring-2 focus:ring-[#14443F]/20"
          />
        </div>

        {tab === "bevanda" ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Tipo</label>
              <div className="flex flex-wrap gap-2">
                {(["acqua", "caffe", "te", "succo", "altro"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFluidType(t)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-medium border-2 transition-all",
                      fluidType === t ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]" : "border-gray-100 text-gray-400"
                    )}
                  >
                    {FLUID_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Quantità</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_VOLUMES_FLUID.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFluidVolume(v)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-bold transition-all",
                      fluidVolume === v ? "bg-[#14443F] text-white" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {v} ml
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFluidVolume(50)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-sm font-bold transition-all",
                    fluidVolume === 50 ? "bg-[#14443F] text-white" : "bg-gray-100 text-gray-500"
                  )}
                >
                  Qualche sorso (50 ml)
                </button>
              </div>
              <input
                type="number"
                min={1}
                value={fluidVolume}
                onChange={(e) => setFluidVolume(Number(e.target.value) || 0)}
                className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] focus:outline-none focus:ring-2 focus:ring-[#14443F]/20"
              />
              <input
                type="text"
                placeholder="Es. 1 bicchiere, qualche sorso"
                value={fluidLabel}
                onChange={(e) => setFluidLabel(e.target.value)}
                className="mt-2 w-full p-2 rounded-lg border border-gray-200 text-sm text-gray-600 placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-3">
              {isEditFluid && (
                <button
                  type="button"
                  onClick={() => initialFluid && onDeleteFluid(initialFluid.id)}
                  className="py-3 px-4 rounded-xl border border-red-200 text-red-600 font-medium"
                >
                  Elimina
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveBevanda}
                className="flex-1 py-4 bg-[#14443F] text-white rounded-2xl font-bold"
              >
                Salva
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Volume (ml) — facoltativo</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_VOLUMES_VOID.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoidVolume(v)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-bold transition-all",
                      voidVolume === v ? "bg-[#14443F] text-white" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {v} ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                placeholder="Non misurato"
                value={voidVolume ?? ""}
                onChange={(e) => setVoidVolume(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] focus:outline-none focus:ring-2 focus:ring-[#14443F]/20"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Urgenza</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium border-2 transition-all",
                    !urgency ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]" : "border-gray-100 text-gray-400"
                  )}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency(true)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium border-2 transition-all",
                    urgency ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]" : "border-gray-100 text-gray-400"
                  )}
                >
                  Sì
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Bruciore</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBurning(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium border-2 transition-all",
                    !burning ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]" : "border-gray-100 text-gray-400"
                  )}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setBurning(true)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium border-2 transition-all",
                    burning ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]" : "border-gray-100 text-gray-400"
                  )}
                >
                  Sì
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              {isEditVoiding && (
                <button
                  type="button"
                  onClick={() => initialVoiding && onDeleteVoiding(initialVoiding.id)}
                  className="py-3 px-4 rounded-xl border border-red-200 text-red-600 font-medium"
                >
                  Elimina
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveMinzione}
                className="flex-1 py-4 bg-[#14443F] text-white rounded-2xl font-bold"
              >
                Salva
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
