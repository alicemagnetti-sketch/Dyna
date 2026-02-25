"use client";
import { useState } from "react";
import { Plus, Coffee, Droplet, Clock, Edit2, AlertCircle, ChevronRight, X, GlassWater } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Types based on PRD
type VoidingEntry = {
  id: number;
  type: "urine" | "fluid";
  time: string;
  volume: number;
  urgency?: number; // 1-5
  pain?: boolean;
  notes?: string;
  fluidType?: string;
};

export function DiaryView() {
  const [entries, setEntries] = useState<VoidingEntry[]>([
    { id: 1, type: "urine", time: "08:15", volume: 300, urgency: 1, pain: false, notes: "Normale" },
    { id: 2, type: "fluid", time: "09:30", volume: 250, fluidType: "Caffè" },
    { id: 3, type: "urine", time: "11:45", volume: 200, urgency: 3, pain: true, notes: "Bruciore lieve" },
    { id: 4, type: "fluid", time: "13:00", volume: 500, fluidType: "Acqua" },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newEntryType, setNewEntryType] = useState<"urine" | "fluid">("urine");

  const totalVolume = entries.filter(e => e.type === "fluid").reduce((acc, curr) => acc + curr.volume, 0);
  const totalUrine = entries.filter(e => e.type === "urine").reduce((acc, curr) => acc + curr.volume, 0);
  const avgUrgency = Math.round(entries.filter(e => e.type === "urine").reduce((acc, curr) => acc + (curr.urgency || 0), 0) / entries.filter(e => e.type === "urine").length || 0);

  // Add Entry Modal Component
  const AddEntryModal = () => {
    const [volume, setVolume] = useState(200);
    const [urgency, setUrgency] = useState(1);
    const [pain, setPain] = useState(false);
    const [fluidType, setFluidType] = useState("Acqua");
    
    return (
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        className="fixed inset-0 z-50 bg-white flex flex-col"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#14443F]">Nuova Voce</h3>
          <button onClick={() => setIsAdding(false)}><X size={24} /></button>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Type Selector */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setNewEntryType("urine")}
              className={cn("flex-1 py-3 rounded-lg font-bold transition-all", newEntryType === "urine" ? "bg-white shadow text-[#14443F]" : "text-gray-400")}
            >
              Minzione
            </button>
            <button
              onClick={() => setNewEntryType("fluid")}
              className={cn("flex-1 py-3 rounded-lg font-bold transition-all", newEntryType === "fluid" ? "bg-white shadow text-[#14443F]" : "text-gray-400")}
            >
              Liquidi
            </button>
          </div>

          {newEntryType === "urine" ? (
            <>
              {/* Volume */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Volume (ml)</label>
                <input 
                  type="range" 
                  min="0" max="1000" step="50" 
                  value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-[#14443F] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-4 text-center font-bold text-4xl text-[#14443F]">{volume} ml</div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Urgenza (1-5)</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((u) => (
                    <button
                      key={u}
                      onClick={() => setUrgency(u)}
                      className={cn(
                        "w-12 h-12 rounded-full font-bold text-lg transition-all",
                        urgency === u ? "bg-orange-500 text-white shadow-lg scale-110" : "bg-orange-100 text-orange-400"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pain */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                <span className="font-bold text-red-800">Dolore presente?</span>
                <button 
                  onClick={() => setPain(!pain)}
                  className={cn(
                    "w-12 h-7 rounded-full transition-colors relative",
                    pain ? "bg-red-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn("w-5 h-5 bg-white rounded-full absolute top-1 transition-all", pain ? "left-6" : "left-1")} />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Fluid Type */}
              <div className="grid grid-cols-2 gap-3">
                {["Acqua", "Caffè", "Tè", "Succo", "Altro"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFluidType(f)}
                    className={cn(
                      "p-4 rounded-2xl font-bold border-2 transition-all",
                      fluidType === f ? "border-[#14443F] bg-[#EBF5F0] text-[#14443F]" : "border-gray-100 text-gray-400"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              {/* Volume */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Quantità</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[150, 250, 330, 500].map((v) => (
                    <button 
                      key={v}
                      onClick={() => setVolume(v)}
                      className={cn(
                        "py-2 rounded-lg text-sm font-bold transition-all",
                        volume === v ? "bg-[#14443F] text-white" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {v}ml
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full p-4 text-center text-3xl font-bold text-[#14443F] bg-gray-50 rounded-2xl border border-gray-200"
                />
              </div>
            </>
          )}

          <button
            onClick={() => {
              const newEntry = {
                id: Date.now(),
                type: newEntryType,
                time: format(new Date(), "HH:mm"),
                volume,
                ...(newEntryType === "urine" ? { urgency, pain } : { fluidType })
              };
              setEntries([newEntry, ...entries]);
              setIsAdding(false);
            }}
            className="w-full py-4 bg-[#14443F] text-white rounded-2xl font-bold text-lg shadow-lg"
          >
            Salva Voce
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 pt-8 pb-24 space-y-6 relative">
      <AnimatePresence>{isAdding && <AddEntryModal />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#14443F]">Diario Minzionale</h2>
          <p className="text-sm text-[#5C8D89]">{format(new Date(), "EEEE d MMMM", { locale: it })}</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 bg-[#EBF5F0] rounded-full text-[#14443F] hover:bg-[#14443F] hover:text-white transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
            <GlassWater size={20} />
          </div>
          <span className="text-2xl font-bold text-[#14443F]">{totalVolume}ml</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Liquidi in</span>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-2">
            <Droplet size={20} />
          </div>
          <span className="text-2xl font-bold text-[#14443F]">{totalUrine}ml</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Urine out</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-[#14443F]">Timeline Oggi</h3>
          <span className="text-xs font-semibold text-gray-400">
             Urgenza Media: <span className="text-orange-500">{avgUrgency}/5</span>
          </span>
        </div>
        
        <div className="divide-y divide-gray-50">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  entry.type === "urine" ? "bg-yellow-50 text-yellow-600" : "bg-blue-50 text-blue-500"
                }`}>
                  {entry.type === "urine" ? <Droplet size={20} /> : <Coffee size={20} />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#14443F] text-lg">
                      {entry.type === "urine" ? "Minzione" : entry.fluidType}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                      {entry.time}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-2 items-center">
                    <span className="font-medium">{entry.volume} ml</span>
                    
                    {entry.type === "urine" && (
                      <>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className={cn(
                          "px-1.5 rounded text-[10px] font-bold uppercase",
                          (entry.urgency || 0) > 3 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                        )}>
                          Urg {entry.urgency}
                        </span>
                        
                        {entry.pain && (
                          <span className="text-red-500 flex items-center gap-1 text-[10px] font-bold uppercase bg-red-50 px-1.5 rounded">
                            <AlertCircle size={10} /> Dolore
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-300 transition-colors">
                <Edit2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
