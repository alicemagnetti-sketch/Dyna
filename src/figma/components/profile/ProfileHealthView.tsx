"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Save } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Profile, Specialist, SpecialistType, SwabVisit, SwabScores } from "@/lib/types";
import { cn } from "@/lib/utils";

const SPECIALIST_TYPES: { value: SpecialistType; label: string }[] = [
  { value: "ginecologo", label: "Ginecologo" },
  { value: "nutrizionista", label: "Nutrizionista" },
  { value: "fisioterapista", label: "Fisioterapista" },
  { value: "altro", label: "Altro" },
];

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

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

interface ProfileHealthViewProps {
  profile: Profile;
  onBack: () => void;
  onSave: (data: {
    diagnosisDate: string | null;
    specialists: Specialist[];
    swabVisits: SwabVisit[];
  }) => void;
}

export function ProfileHealthView({ profile, onBack, onSave }: ProfileHealthViewProps) {
  const [diagnosisDate, setDiagnosisDate] = useState(profile.diagnosisDate ?? "");
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [swabVisits, setSwabVisits] = useState<SwabVisit[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [addingVisit, setAddingVisit] = useState(false);

  useEffect(() => {
    setDiagnosisDate(profile.diagnosisDate ?? "");
    setSpecialists(profile.specialists ?? []);
    setSwabVisits(profile.swabVisits ?? []);
  }, [profile.diagnosisDate, profile.specialists, profile.swabVisits]);

  const handleSave = () => {
    onSave({
      diagnosisDate: diagnosisDate.trim() || null,
      specialists,
      swabVisits,
    });
    onBack();
  };

  const addSpecialist = (s: Omit<Specialist, "id">) => {
    setSpecialists((prev) => [...prev, { ...s, id: newId() }]);
    setAdding(false);
  };

  const updateSpecialist = (id: string, patch: Partial<Specialist>) => {
    setSpecialists((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch } : x))
    );
    setEditingId(null);
  };

  const removeSpecialist = (id: string) => {
    setSpecialists((prev) => prev.filter((x) => x.id !== id));
    setEditingId(null);
  };

  const getTypeLabel = (s: Specialist) =>
    s.type === "altro" && s.typeOther?.trim()
      ? s.typeOther.trim()
      : SPECIALIST_TYPES.find((t) => t.value === s.type)?.label ?? s.type;

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
      <h2 className="text-xl font-bold text-[#14443F] mb-6">Salute e Terapia</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Data diagnosi</label>
          <input
            type="date"
            value={diagnosisDate}
            onChange={(e) => setDiagnosisDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 text-[#14443F] focus:outline-none focus:ring-2 focus:ring-[#14443F]/20 focus:border-[#14443F]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Specialisti</label>
            {!adding && (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="text-sm font-medium text-[#14443F] flex items-center gap-1"
              >
                <Plus size={16} />
                Aggiungi
              </button>
            )}
          </div>
          <div className="space-y-2">
            {specialists.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 p-4 space-y-2"
              >
                {editingId === s.id ? (
                  <SpecialistEditForm
                    specialist={s}
                    onSave={(patch) => updateSpecialist(s.id, patch)}
                    onCancel={() => setEditingId(null)}
                    onRemove={() => removeSpecialist(s.id)}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#14443F]">{getTypeLabel(s)}</span>
                      <button
                        type="button"
                        onClick={() => setEditingId(s.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Da {format(new Date(s.startDate + "T12:00:00"), "d MMM yyyy", { locale: it })}
                      {s.stillActive
                        ? " · Ancora in corso"
                        : s.endDate
                          ? ` → ${format(new Date(s.endDate + "T12:00:00"), "d MMM yyyy", { locale: it })}`
                          : ""}
                    </p>
                  </>
                )}
              </div>
            ))}
            {adding && (
              <SpecialistEditForm
                specialist={{
                  id: "",
                  type: "ginecologo",
                  startDate: new Date().toISOString().slice(0, 10),
                  endDate: null,
                  stillActive: true,
                }}
                onSave={(patch) =>
                  addSpecialist({
                    type: patch.type ?? "ginecologo",
                    typeOther: patch.typeOther ?? null,
                    startDate: patch.startDate ?? new Date().toISOString().slice(0, 10),
                    endDate: patch.stillActive ? null : patch.endDate ?? null,
                    stillActive: patch.stillActive ?? true,
                  })
                }
                onCancel={() => setAdding(false)}
                onRemove={() => setAdding(false)}
                isNew
              />
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Visite con Swab Test</label>
            {!addingVisit && editingVisitId === null && (
              <button
                type="button"
                onClick={() => setAddingVisit(true)}
                className="text-sm font-medium text-[#14443F] flex items-center gap-1"
              >
                <Plus size={16} />
                Aggiungi visita
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Data visita e risultati swab test (1–10 per zona) per ogni visita.
          </p>
          <div className="space-y-2">
            {swabVisits.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                {editingVisitId === v.id ? (
                  <SwabVisitForm
                    visit={v}
                    onSave={(date, scores) => {
                      setSwabVisits((prev) =>
                        prev.map((x) =>
                          x.id === v.id
                            ? { ...x, date, swabScores: scores }
                            : x
                        )
                      );
                      setEditingVisitId(null);
                    }}
                    onCancel={() => setEditingVisitId(null)}
                    onRemove={() => {
                      setSwabVisits((prev) => prev.filter((x) => x.id !== v.id));
                      setEditingVisitId(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#14443F]">
                        {format(new Date(v.date + "T12:00:00"), "d MMM yyyy", { locale: it })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingVisitId(v.id)}
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSwabVisits((prev) => prev.filter((x) => x.id !== v.id))
                          }
                          className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {SWAB_LABELS.map(
                        (k) =>
                          v.swabScores[k] != null &&
                          `${SWAB_LABEL_IT[k]}: ${v.swabScores[k]}`
                      )
                        .filter(Boolean)
                        .join(" · ") || "Nessun valore"}
                    </p>
                  </>
                )}
              </div>
            ))}
            {addingVisit && (
              <SwabVisitForm
                visit={{
                  id: "",
                  date: new Date().toISOString().slice(0, 10),
                  swabScores: emptyScores(),
                }}
                onSave={(date, scores) => {
                  setSwabVisits((prev) => [
                    ...prev,
                    { id: newId(), date, swabScores: scores },
                  ]);
                  setAddingVisit(false);
                }}
                onCancel={() => setAddingVisit(false)}
                onRemove={() => setAddingVisit(false)}
                isNew
              />
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-6 py-3.5 rounded-xl bg-[#14443F] text-white font-medium hover:bg-[#0f332f] transition-colors"
      >
        Salva
      </button>
    </div>
  );
}

function SwabVisitForm({
  visit,
  onSave,
  onCancel,
  onRemove,
  isNew,
}: {
  visit: SwabVisit;
  onSave: (date: string, scores: SwabScores) => void;
  onCancel: () => void;
  onRemove: () => void;
  isNew?: boolean;
}) {
  const [date, setDate] = useState(visit.date);
  const [scores, setScores] = useState<SwabScores>({ ...emptyScores(), ...visit.swabScores });

  const setScore = (key: keyof SwabScores, value: number | null) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(date, scores);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Data visita</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-200 text-sm text-[#14443F]"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500">Risultati swab (1–10)</label>
        {SWAB_LABELS.map((key) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-sm text-[#14443F] shrink-0 min-w-[120px]">
              {SWAB_LABEL_IT[key]}
            </span>
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
              className="w-16 p-2 rounded-lg border border-gray-200 text-[#14443F] text-center text-sm"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        {!isNew && (
          <button
            type="button"
            onClick={onRemove}
            className="py-2 px-3 rounded-lg border border-red-200 text-red-600 text-sm font-medium"
          >
            Elimina
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-3 rounded-lg border border-gray-300 text-gray-600 text-sm"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="py-2 px-3 rounded-lg bg-[#14443F] text-white text-sm font-medium flex items-center gap-1"
        >
          <Save size={14} />
          Salva
        </button>
      </div>
    </div>
  );
}

function SpecialistEditForm({
  specialist,
  onSave,
  onCancel,
  onRemove,
  isNew,
}: {
  specialist: Specialist;
  onSave: (patch: Partial<Specialist>) => void;
  onCancel: () => void;
  onRemove: () => void;
  isNew?: boolean;
}) {
  const [type, setType] = useState<SpecialistType>(specialist.type);
  const [typeOther, setTypeOther] = useState(specialist.typeOther ?? "");
  const [startDate, setStartDate] = useState(specialist.startDate);
  const [endDate, setEndDate] = useState(specialist.endDate ?? "");
  const [stillActive, setStillActive] = useState(specialist.stillActive);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALIST_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                type === opt.value
                  ? "bg-[#14443F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {type === "altro" && (
          <input
            type="text"
            value={typeOther}
            onChange={(e) => setTypeOther(e.target.value)}
            placeholder="Specifica"
            className="mt-2 w-full p-2 rounded-lg border border-gray-200 text-sm"
          />
        )}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Data inizio consulenza</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={stillActive}
          onChange={(e) => setStillActive(e.target.checked)}
          className="rounded border-gray-300 text-[#14443F] focus:ring-[#14443F]"
        />
        <span className="text-sm font-medium text-gray-700">Ancora in corso</span>
      </label>
      {!stillActive && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Data fine consulenza</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
      )}
      <div className="flex gap-2 pt-2">
        {!isNew && (
          <button
            type="button"
            onClick={onRemove}
            className="py-2 px-3 rounded-lg border border-red-200 text-red-600 text-sm font-medium"
          >
            Elimina
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-3 rounded-lg border border-gray-300 text-gray-600 text-sm"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              type,
              typeOther: type === "altro" ? typeOther.trim() || null : null,
              startDate,
              endDate: stillActive ? null : endDate.trim() || null,
              stillActive,
            })
          }
          className="py-2 px-3 rounded-lg bg-[#14443F] text-white text-sm font-medium"
        >
          Salva
        </button>
      </div>
    </div>
  );
}
