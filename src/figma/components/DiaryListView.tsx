"use client";

import { useState, useEffect } from "react";
import { NotebookPen, Pencil, Trash2, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import type { Diary, DiaryType } from "@/lib/diaries";
import { cn } from "@/lib/utils";

interface DiaryListViewProps {
  diaries: Diary[];
  onSelect: (diary: Diary) => void;
  onEdit: (diary: Diary) => void;
  onDelete: (diary: Diary) => void;
  onCreateNew: () => void;
}

export function DiaryListView({
  diaries,
  onSelect,
  onEdit,
  onDelete,
  onCreateNew,
}: DiaryListViewProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<Diary | null>(null);

  if (diaries.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 pb-24 bg-[#F8FBF9]">
        <div className="rounded-full bg-[#EBF5F0] p-8 mb-6" aria-hidden>
          <NotebookPen size={64} className="text-[#14443F]" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-[#14443F] text-center mb-2">Non hai diari attivi</h2>
        <p className="text-gray-500 text-sm text-center mb-8">Inizia un diario per tenere traccia di minzioni o note personali.</p>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#14443F] text-white font-medium rounded-full hover:bg-[#0f332f] transition-colors"
          aria-label="Aggiungi"
        >
          Aggiungi
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pt-8 space-y-6 pb-24 bg-[#F8FBF9] min-h-dvh">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#14443F]">Diari</h2>
        <button
          type="button"
          onClick={onCreateNew}
          className="p-2 bg-[#EBF5F0] rounded-full text-[#14443F]"
          aria-label="Aggiungi diario"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {diaries.map((diary) => (
          <div
            key={diary.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-[#14443F] transition-all"
          >
            <div className="p-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelect(diary)}
                className="flex-1 flex items-center gap-2 text-left min-w-0 font-medium text-[#14443F] hover:underline"
              >
                <span className="min-w-0 truncate text-xl font-semibold">{diary.name}</span>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(diary);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#14443F] transition-colors"
                  aria-label="Modifica diario"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(diary);
                  }}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Elimina diario"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#14443F] mb-2">Elimina diario</h3>
              <p className="text-gray-600 text-sm mb-6">
                Vuoi eliminare &quot;{deleteConfirm.name}&quot;? Questa azione non si può annullare.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
                >
                  Elimina
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CreateEditDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: Diary | null;
  onSave: (data: { name: string; type: DiaryType; startDate: string }) => void;
}

export function CreateEditDiaryModal({ isOpen, onClose, initial, onSave }: CreateEditDiaryModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<DiaryType>(initial?.type ?? "minzionale");
  const [startDate, setStartDate] = useState(initial?.startDate ?? format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (isOpen) {
      setName(initial?.name ?? "");
      setType(initial?.type ?? "minzionale");
      setStartDate(initial?.startDate ?? format(new Date(), "yyyy-MM-dd"));
    }
  }, [isOpen, initial?.id, initial?.name, initial?.type, initial?.startDate]);

  const isEdit = !!initial;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || !startDate) return;
    onSave({ name: trimmed, type, startDate });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-[#14443F]">
            {isEdit ? "Modifica diario" : "Nuovo diario"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Chiudi"
          >
            <X size={22} />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome diario</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Diario minzioni marzo"
              className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14443F]/20 focus:border-[#14443F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipologia</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("minzionale")}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium border-2 transition-all",
                  type === "minzionale"
                    ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]"
                    : "border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                Minzionale
              </button>
              <button
                type="button"
                onClick={() => setType("personale")}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium border-2 transition-all",
                  type === "personale"
                    ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]"
                    : "border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                Personale
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data inizio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] focus:outline-none focus:ring-2 focus:ring-[#14443F]/20 focus:border-[#14443F]"
            />
          </div>
        </div>
        <div className="p-6 pt-0 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || !startDate}
            className="w-full py-4 bg-[#14443F] text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0f332f] transition-colors"
          >
            {isEdit ? "Salva modifiche" : "Crea diario"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
