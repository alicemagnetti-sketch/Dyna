"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save } from "lucide-react";
import type { Profile, SwabScores } from "@/lib/types";

const SWAB_LABELS: (keyof SwabScores)[] = [
  "clitoride",
  "orefizioUretrale",
  "labbroDestro",
  "labbroSinistro",
  "forchetta",
];

const SWAB_LABEL_IT: Record<keyof SwabScores, string> = {
  clitoride: "Clitoride",
  orefizioUretrale: "Orefizio uretrale",
  labbroDestro: "Labbro destro",
  labbroSinistro: "Labbro sinistro",
  forchetta: "Forchetta",
};

interface ProfileSwabTestViewProps {
  profile: Profile;
  onBack: () => void;
  onSave: (scores: SwabScores) => void;
}

function emptyScores(): SwabScores {
  return {
    clitoride: null,
    orefizioUretrale: null,
    labbroDestro: null,
    labbroSinistro: null,
    forchetta: null,
  };
}

export function ProfileSwabTestView({ profile, onBack, onSave }: ProfileSwabTestViewProps) {
  const current = profile.swabTest?.scores ?? emptyScores();
  const [scores, setScores] = useState<SwabScores>({ ...emptyScores(), ...current });

  useEffect(() => {
    const c = profile.swabTest?.scores ?? emptyScores();
    setScores({ ...emptyScores(), ...c });
  }, [profile.swabTest?.scores]);

  const setScore = (key: keyof SwabScores, value: number | null) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(scores);
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
      <h2 className="text-xl font-bold text-[#14443F] mb-2">Swab Test</h2>
      <p className="text-sm text-gray-500 mb-6">Valore da 1 a 10 per ogni zona.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {SWAB_LABELS.map((key) => (
          <div key={key} className="p-4 flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-[#14443F] shrink-0 min-w-[140px]">
              {SWAB_LABEL_IT[key]}
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={scores[key] ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                if (v === null || (v >= 1 && v <= 10)) setScore(key, v);
              }}
              placeholder="1–10"
              className="w-20 p-2.5 rounded-xl border border-gray-200 text-[#14443F] text-center focus:outline-none focus:ring-2 focus:ring-[#14443F]/20 focus:border-[#14443F]"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-6 py-3.5 rounded-xl bg-[#14443F] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#0f332f] transition-colors"
      >
        <Save size={18} />
        Salva
      </button>
    </div>
  );
}
