"use client";

import { useState } from "react";
import { useNotificationChecker } from "@/hooks/useNotificationChecker";
import { Header } from "@/figma/components/Header";
import { Calendar } from "@/figma/components/Calendar";
import { CalendarUpcoming } from "@/figma/components/CalendarUpcoming";
import { EditAppointmentModal } from "@/figma/components/EditAppointmentModal";
import { SymptomTrackerModal } from "@/figma/components/SymptomTracker";
import { DayOverviewModal } from "@/figma/components/DayOverviewModal";
import { BottomNav, type FabAction } from "@/figma/components/BottomNav";
import { TherapyView } from "@/figma/components/TherapyView";
import { EditTherapyModal } from "@/figma/components/EditTherapyModal";
import { DiaryView } from "@/figma/components/DiaryView";
import { ProfileView } from "@/figma/components/ProfileView";
import { useDayEntries } from "@/context/DayEntriesContext";
import type { Appointment } from "@/lib/day-entries";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [symptomModalOpenAddForm, setSymptomModalOpenAddForm] = useState(false);
  const [dayOverviewModalOpen, setDayOverviewModalOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<{ dateKey: string; appointment: Appointment } | null>(null);
  const [addTherapyOpen, setAddTherapyOpen] = useState(false);
  const { getEntry } = useDayEntries();
  useNotificationChecker();

  const handleFabAction = (action: FabAction) => {
    if (action === "appointment") {
      setSymptomModalOpenAddForm(true);
      setSymptomModalOpen(true);
    } else if (action === "symptom") {
      setSymptomModalOpenAddForm(false);
      setSymptomModalOpen(true);
    } else if (action === "therapy") {
      setAddTherapyOpen(true);
    }
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setDayOverviewModalOpen(true);
  };

  const handleEditAppointmentFromCard = (dateKey: string, appointment: Appointment) => {
    setEditAppointment({ dateKey, appointment });
  };

  return (
    <div className="min-h-dvh bg-[#F8FBF9] pb-24">
      {activeTab === "calendar" && <Header userName="Alice" />}

      {activeTab === "calendar" && (
        <div className="-mt-4">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
          <CalendarUpcoming onEditAppointment={handleEditAppointmentFromCard} />
        </div>
      )}

      {activeTab === "therapy" && (
        <TherapyView
          openAddTherapy={addTherapyOpen}
          onAddTherapyClose={() => setAddTherapyOpen(false)}
        />
      )}
      {activeTab === "diary" && <DiaryView />}
      {activeTab === "profile" && <ProfileView />}

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFabAction={handleFabAction}
      />

      <DayOverviewModal
        isOpen={dayOverviewModalOpen}
        onClose={() => setDayOverviewModalOpen(false)}
        date={selectedDate}
        entry={getEntry(selectedDate)}
        onEdit={() => setSymptomModalOpen(true)}
      />

      {editAppointment && (
        <EditAppointmentModal
          isOpen={!!editAppointment}
          onClose={() => setEditAppointment(null)}
          dateKeyStr={editAppointment.dateKey}
          appointment={editAppointment.appointment}
          onSaved={() => setEditAppointment(null)}
        />
      )}

      <SymptomTrackerModal
        isOpen={symptomModalOpen}
        onClose={() => {
          setSymptomModalOpen(false);
          setSymptomModalOpenAddForm(false);
        }}
        date={selectedDate}
        initialOpenAddForm={symptomModalOpenAddForm}
        appointmentOnly={symptomModalOpenAddForm}
        showAddAppointmentRow={symptomModalOpenAddForm}
      />

      {addTherapyOpen && activeTab === "calendar" && (
        <EditTherapyModal
          isOpen={true}
          therapy={null}
          onClose={() => setAddTherapyOpen(false)}
          onSaved={() => setAddTherapyOpen(false)}
        />
      )}
    </div>
  );
}
