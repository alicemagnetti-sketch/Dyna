"use client";

import { useState } from "react";
import { Header } from "@/figma/components/Header";
import { Calendar } from "@/figma/components/Calendar";
import { CalendarUpcoming } from "@/figma/components/CalendarUpcoming";
import { SymptomTrackerModal } from "@/figma/components/SymptomTracker";
import { DayOverviewModal } from "@/figma/components/DayOverviewModal";
import { BottomNav } from "@/figma/components/BottomNav";
import { TherapyView } from "@/figma/components/TherapyView";
import { DiaryView } from "@/figma/components/DiaryView";
import { ProfileView } from "@/figma/components/ProfileView";
import { useDayEntries } from "@/context/DayEntriesContext";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [dayOverviewModalOpen, setDayOverviewModalOpen] = useState(false);
  const { getEntry } = useDayEntries();

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setDayOverviewModalOpen(true);
  };

  return (
    <div className="min-h-dvh bg-[#F8FBF9] pb-24">
      <Header userName="Alice" />

      {activeTab === "calendar" && (
        <>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
          <CalendarUpcoming />
        </>
      )}

      {activeTab === "therapy" && <TherapyView />}
      {activeTab === "diary" && <DiaryView />}
      {activeTab === "profile" && <ProfileView />}

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFabClick={() => setSymptomModalOpen(true)}
      />

      <DayOverviewModal
        isOpen={dayOverviewModalOpen}
        onClose={() => setDayOverviewModalOpen(false)}
        date={selectedDate}
        entry={getEntry(selectedDate)}
        onEdit={() => setSymptomModalOpen(true)}
      />

      <SymptomTrackerModal
        isOpen={symptomModalOpen}
        onClose={() => setSymptomModalOpen(false)}
        date={selectedDate}
      />
    </div>
  );
}
