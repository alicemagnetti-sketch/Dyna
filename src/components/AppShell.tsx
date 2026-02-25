"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/figma/components/Header";
import { Calendar } from "@/figma/components/Calendar";
import { SymptomTrackerModal } from "@/figma/components/SymptomTracker";
import { BottomNav } from "@/figma/components/BottomNav";
import { TherapyView } from "@/figma/components/TherapyView";
import { DiaryView } from "@/figma/components/DiaryView";
import { ProfileView } from "@/figma/components/ProfileView";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#F8FBF9] pb-24">
      <Header userName="Alice" />

      {activeTab === "calendar" && (
        <>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <button
            onClick={() => setSymptomModalOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#14443F] text-white shadow-lg flex items-center justify-center z-30 hover:bg-[#0f3530] transition-colors"
            aria-label="Aggiungi giornata"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </>
      )}

      {activeTab === "therapy" && <TherapyView />}
      {activeTab === "diary" && <DiaryView />}
      {activeTab === "profile" && <ProfileView />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <SymptomTrackerModal
        isOpen={symptomModalOpen}
        onClose={() => setSymptomModalOpen(false)}
        date={selectedDate}
      />
    </div>
  );
}
