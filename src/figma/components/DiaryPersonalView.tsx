"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import type { Diary } from "@/lib/diaries";
import { cn } from "@/lib/utils";

interface DiaryPersonalViewProps {
  diary: Diary;
  onBack: () => void;
  onUpdateContent: (content: string) => void;
}

export function DiaryPersonalView({ diary, onBack, onUpdateContent }: DiaryPersonalViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(diary.content ?? "");
  const [savedContent, setSavedContent] = useState(diary.content ?? "");

  useEffect(() => {
    const next = diary.content ?? "";
    setSavedContent(next);
    if (!isEditing) setEditContent(next);
  }, [diary.id, diary.content]);

  const handleSave = () => {
    onUpdateContent(editContent);
    setSavedContent(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(savedContent);
    setIsEditing(false);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FBF9] pb-24">
      <div className="sticky top-0 z-10 bg-[#F8FBF9] border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 text-[#14443F]"
          aria-label="Indietro"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-[#14443F] truncate flex-1 text-center mx-2">
          {diary.name}
        </h2>
        <div className="w-10 flex justify-end">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-[#14443F]"
              aria-label="Modifica"
            >
              <Pencil size={20} />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Annulla"
              >
                <X size={20} />
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="p-2 rounded-full hover:bg-[#EBF5F0] text-[#14443F]"
                aria-label="Salva"
              >
                <Save size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 min-h-0">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Scrivi qui la tua nota..."
            className={cn(
              "w-full min-h-[calc(100dvh-12rem)] p-4 rounded-2xl border-2 border-[#14443F]/20 bg-white",
              "text-[#14443F] placeholder:text-gray-400 resize-none outline-none focus:border-[#14443F]"
            )}
            autoFocus
          />
        ) : (
          <div className="w-full min-h-[calc(100dvh-12rem)] p-4 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-y-auto">
            {savedContent ? (
              <p className="text-[#14443F] whitespace-pre-wrap text-sm leading-relaxed">
                {savedContent}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">Nessuna nota. Tocca l’icona matita per aggiungere.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
