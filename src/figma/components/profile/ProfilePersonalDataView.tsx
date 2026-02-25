"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, X } from "lucide-react";
import type { Profile } from "@/lib/types";

interface ProfilePersonalDataViewProps {
  profile: Profile;
  onBack: () => void;
  onSave: (data: { firstName: string; lastName: string; dateOfBirth: string | null }) => void;
}

export function ProfilePersonalDataView({ profile, onBack, onSave }: ProfilePersonalDataViewProps) {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");

  useEffect(() => {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setDateOfBirth(profile.dateOfBirth ?? "");
  }, [profile.firstName, profile.lastName, profile.dateOfBirth]);

  const handleSave = () => {
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth.trim() || null,
    });
    onBack();
  };

  return (
    <div className="p-4 pb-24 min-h-dvh bg-[#F8FBF9]">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[#14443F] font-medium"
        >
          <ChevronLeft size={20} />
          Indietro
        </button>
      </div>
      <h2 className="text-xl font-bold text-[#14443F] mb-6">Dati Personali</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Es. Alice"
            className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14443F]/20 focus:border-[#14443F]"
          />
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cognome</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Es. Bianchi"
            className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14443F]/20 focus:border-[#14443F]"
          />
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Data di nascita</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] focus:outline-none focus:ring-2 focus:ring-[#14443F]/20 focus:border-[#14443F]"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-600 font-medium flex items-center justify-center gap-2"
        >
          <X size={18} />
          Annulla
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-3.5 rounded-xl bg-[#14443F] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#0f332f] transition-colors"
        >
          <Save size={18} />
          Salva
        </button>
      </div>
    </div>
  );
}
