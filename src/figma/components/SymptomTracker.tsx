"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Activity, Pill, NotebookPen, Check, Droplet, ArrowRight, ArrowLeft, Save } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { it } from "date-fns/locale";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SymptomTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
}

// PRD defined colors for pain levels
const PAIN_COLORS = [
  { value: 0, label: "Nessuno", color: "bg-[#E8E8E8] text-gray-600 border-gray-300" },
  { value: 1, label: "Basso", color: "bg-[#B5E4C4] text-[#0A332E] border-[#8CD6A3]" },
  { value: 2, label: "Medio", color: "bg-[#FDE8B0] text-[#5C3D00] border-[#FBD982]" },
  { value: 3, label: "Alto", color: "bg-[#F4A0A0] text-[#5C1414] border-[#EFA3A3]" },
  { value: 4, label: "Intenso", color: "bg-[#E05A5A] text-white border-[#C53030]" },
];

export function SymptomTrackerModal({ isOpen, onClose, date }: SymptomTrackerModalProps) {
  const [step, setStep] = useState(1);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [hasPeriod, setHasPeriod] = useState(false);
  const [periodFlow, setPeriodFlow] = useState<string>("medium");
  const [therapies, setTherapies] = useState([
    { id: 1, name: "Amitriptilina", dose: "10mg", time: "20:00", taken: false },
    { id: 2, name: "Diazepam", dose: "2.5mg", time: "22:00", taken: false },
    { id: 3, name: "Crema galenica", dose: "1 app", time: "22:30", taken: false },
  ]);
  const [notes, setNotes] = useState("");

  // Reset or load data when date changes
  useEffect(() => {
    if (isOpen) {
        setStep(1);
        // Reset/Load logic would go here
    }
  }, [date, isOpen]);

  const toggleTherapy = (id: number) => {
    setTherapies(therapies.map(t => t.id === id ? { ...t, taken: !t.taken } : t));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = () => {
    // Save logic here
    onClose();
  };

  const Step1_Pain = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#14443F] mb-2">Livello di dolore</h3>
        <p className="text-gray-500">Come valuti il tuo dolore oggi?</p>
      </div>
      <div className="flex flex-col gap-3">
        {PAIN_COLORS.map((level) => (
          <button
            key={level.value}
            onClick={() => setPainLevel(level.value)}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
              painLevel === level.value 
                ? `border-current shadow-md transform scale-[1.02] ${level.color}` 
                : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
            )}
          >
            <span className="text-lg font-bold">{level.label}</span>
            <div className={cn("w-6 h-6 rounded-full border-2", painLevel === level.value ? "bg-current border-transparent" : "border-gray-300")} />
          </button>
        ))}
      </div>
    </div>
  );

  const Step2_Period = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#14443F] mb-2">Mestruazioni</h3>
        <p className="text-gray-500">Hai il ciclo mestruale oggi?</p>
      </div>
      
      <div className="bg-gray-50 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-8">
          <span className="text-lg font-medium text-[#14443F]">Stato ciclo</span>
          <button 
            onClick={() => setHasPeriod(!hasPeriod)}
            className={cn(
              "w-14 h-8 rounded-full transition-colors relative",
              hasPeriod ? "bg-[#14443F]" : "bg-gray-300"
            )}
          >
            <motion.div 
              className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
              animate={{ left: hasPeriod ? "28px" : "4px" }}
            />
          </button>
        </div>

        <AnimatePresence>
          {hasPeriod && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide">Intensità flusso</p>
              <div className="grid grid-cols-3 gap-3">
                {["light", "medium", "heavy"].map((flow) => (
                  <button
                    key={flow}
                    onClick={() => setPeriodFlow(flow)}
                    className={cn(
                      "py-3 text-sm font-medium rounded-xl transition-all border-2",
                      periodFlow === flow
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-white text-gray-400 border-transparent hover:bg-gray-100"
                    )}
                  >
                    {flow === "light" ? "Leggero" : flow === "medium" ? "Medio" : "Abbondante"}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const Step3_Therapy = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#14443F] mb-2">Aderenza Terapia</h3>
        <p className="text-gray-500">Quali farmaci hai assunto?</p>
      </div>

      <div className="space-y-3">
        {therapies.map((therapy) => (
          <button
            key={therapy.id}
            onClick={() => toggleTherapy(therapy.id)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
              therapy.taken 
                ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]" 
                : "border-gray-100 bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            <div>
              <p className="font-bold text-lg">{therapy.name}</p>
              <p className="text-sm opacity-70">{therapy.dose} • {therapy.time}</p>
            </div>
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              therapy.taken ? "bg-[#14443F] border-[#14443F]" : "border-gray-300"
            )}>
              {therapy.taken && <Check size={14} className="text-white" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const Step4_Notes = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#14443F] mb-2">Note</h3>
        <p className="text-gray-500">Qualcos'altro da segnalare?</p>
      </div>
      
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={500}
        placeholder="Scrivi qui eventuali sintomi aggiuntivi, dettagli sui rapporti o altre osservazioni..."
        className="w-full h-48 p-5 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-[#14443F] focus:bg-white transition-all outline-none resize-none text-[#14443F] text-lg leading-relaxed placeholder:text-gray-400"
      />
      <div className="text-right text-xs text-gray-400">
        {notes.length}/500
      </div>
    </div>
  );

  const Step5_Summary = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-[#14443F] mb-2">Riepilogo</h3>
        <p className="text-gray-500">Confermi i dati inseriti?</p>
      </div>

      <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Dolore</span>
          <span className={cn("px-3 py-1 rounded-full text-sm font-bold", PAIN_COLORS.find(p => p.value === painLevel)?.color)}>
            {PAIN_COLORS.find(p => p.value === painLevel)?.label || "Non specificato"}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Ciclo</span>
          <span className="font-medium text-[#14443F]">
            {hasPeriod ? `Sì (${periodFlow === "light" ? "Leggero" : periodFlow === "medium" ? "Medio" : "Abbondante"})` : "No"}
          </span>
        </div>

        <div className="py-2 border-b border-gray-100">
          <span className="text-gray-500 block mb-2">Terapie assunte</span>
          <div className="flex flex-wrap gap-2">
            {therapies.filter(t => t.taken).length > 0 ? (
              therapies.filter(t => t.taken).map(t => (
                <span key={t.id} className="text-xs bg-[#EBF5F0] text-[#14443F] px-2 py-1 rounded-lg font-medium">
                  {t.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400 italic">Nessuna terapia segnata</span>
            )}
          </div>
        </div>

        {notes && (
          <div className="py-2">
            <span className="text-gray-500 block mb-1">Note</span>
            <p className="text-sm text-[#14443F] italic">"{notes}"</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 shadow-2xl h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <button 
                onClick={step > 1 ? prevStep : onClose}
                className="p-2 rounded-full hover:bg-gray-50 text-[#14443F]"
              >
                {step > 1 ? <ArrowLeft size={24} /> : <X size={24} />}
              </button>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      i <= step ? "bg-[#14443F]" : "bg-gray-200"
                    )} 
                  />
                ))}
              </div>

              <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {step === 1 && <Step1_Pain />}
                  {step === 2 && <Step2_Period />}
                  {step === 3 && <Step3_Therapy />}
                  {step === 4 && <Step4_Notes />}
                  {step === 5 && <Step5_Summary />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-100 bg-white pb-10">
              {step < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={step === 1 && painLevel === null}
                  className="w-full py-4 bg-[#14443F] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#0F3833] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Avanti <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-[#14443F] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#0F3833] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Salva <Save size={20} />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
