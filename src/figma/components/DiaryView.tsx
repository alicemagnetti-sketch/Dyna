"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useDiaries } from "@/context/DiariesContext";
import { DiaryListView, CreateEditDiaryModal } from "./DiaryListView";
import { DiaryMicturitionView } from "./DiaryMicturitionView";
import { DiaryPersonalView } from "./DiaryPersonalView";
import type { Diary, DiaryType } from "@/lib/diaries";

export function DiaryView() {
  const { diaries, addDiary, updateDiary, removeDiary, getDiary } = useDiaries();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editDiary, setEditDiary] = useState<Diary | null>(null);

  const selected = selectedId ? getDiary(selectedId) : null;

  const handleCreateNew = () => setCreateModalOpen(true);

  const handleCreateSave = (data: { name: string; type: DiaryType; startDate: string }) => {
    const created = addDiary(data);
    setCreateModalOpen(false);
    setSelectedId(created.id);
  };

  const handleEditSave = (data: { name: string; type: DiaryType; startDate: string }) => {
    if (!editDiary) return;
    updateDiary(editDiary.id, data);
    setEditDiary(null);
  };

  const handleDelete = (diary: Diary) => {
    removeDiary(diary.id);
    if (selectedId === diary.id) setSelectedId(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!selected ? (
          <DiaryListView
            key="list"
            diaries={diaries}
            onSelect={(d) => setSelectedId(d.id)}
            onEdit={setEditDiary}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
          />
        ) : selected.type === "minzionale" ? (
          <DiaryMicturitionView
            key={selected.id}
            diary={selected}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <DiaryPersonalView
            key={selected.id}
            diary={selected}
            onBack={() => setSelectedId(null)}
            onUpdateContent={(content) => updateDiary(selected.id, { content })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createModalOpen && (
          <CreateEditDiaryModal
            isOpen={true}
            onClose={() => setCreateModalOpen(false)}
            initial={null}
            onSave={handleCreateSave}
          />
        )}
        {editDiary && (
          <CreateEditDiaryModal
            isOpen={true}
            onClose={() => setEditDiary(null)}
            initial={editDiary}
            onSave={handleEditSave}
          />
        )}
      </AnimatePresence>
    </>
  );
}
