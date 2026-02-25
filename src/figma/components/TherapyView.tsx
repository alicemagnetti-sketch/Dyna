"use client";

import { Pill, Clock, Plus, Droplet } from "lucide-react";

export function TherapyView() {
  const therapies = [
    {
      id: 1,
      name: "Amitriptilina",
      dosage: "10mg",
      frequency: "Ogni sera",
      pattern: "daily",
      time: "22:00",
      type: "Orale",
      icon: Pill,
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: 2,
      name: "Lilith",
      dosage: "1 bustina",
      frequency: "Ogni mattina",
      pattern: "daily",
      time: "08:00",
      type: "Integratore",
      icon: Pill,
      color: "bg-orange-100 text-orange-700"
    },
    {
      id: 3,
      name: "Deha / Ubigel",
      dosage: "Alternati",
      frequency: "Giorni alterni (A/B)",
      pattern: "alternating",
      time: "22:30",
      type: "Vaginale",
      icon: Droplet,
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: 4,
      name: "Diazepam",
      dosage: "2.5mg",
      frequency: "5 giorni ON / 2 OFF",
      pattern: "custom",
      time: "21:00",
      type: "Orale",
      icon: Pill,
      color: "bg-pink-100 text-pink-700"
    }
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#14443F]">Il tuo Piano</h2>
        <button className="p-2 bg-[#EBF5F0] rounded-full text-[#14443F]">
          <Plus size={24} />
        </button>
      </div>

      <div className="bg-[#14443F] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="font-bold text-lg mb-1">Aderenza settimanale</h3>
            <p className="text-white/70 text-sm">Hai seguito il 90% della terapia.</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center font-bold text-sm">
            90%
          </div>
        </div>
        
        <div className="flex justify-between items-end h-24 gap-2 relative z-10">
          {[80, 100, 100, 60, 100, 100, 90].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-full">
              <div className="w-full bg-white/10 rounded-t-sm relative flex items-end h-full hover:bg-white/20 transition-colors">
                <div 
                  className="w-full bg-[#B5E4C4] rounded-t-sm transition-all duration-500" 
                  style={{ height: `${h}%`, opacity: h < 100 ? 0.7 : 1 }}
                />
              </div>
              <span className="text-[10px] uppercase font-bold text-white/60">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="font-bold text-[#14443F] text-lg">Farmaci Attivi</h3>
           <span className="text-xs font-bold text-[#5C8D89] bg-[#EBF5F0] px-3 py-1 rounded-full uppercase tracking-wide">
             {therapies.length} in corso
           </span>
        </div>
        
        {therapies.map((therapy) => (
          <div key={therapy.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group hover:border-[#14443F] transition-all relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${therapy.color.split(" ")[0]}`} />
            
            <div className="flex items-center justify-between pl-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${therapy.color}`}>
                  <therapy.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#14443F] text-lg leading-tight">{therapy.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                      <Clock size={10} /> {therapy.time}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{therapy.dosage}</span>
                  </div>
                  
                  {/* Pattern Indicator */}
                  {therapy.pattern === "alternating" && (
                    <div className="mt-2 flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" title="A" />
                      <span className="w-2 h-2 rounded-full bg-gray-200" title="B" />
                      <span className="w-2 h-2 rounded-full bg-purple-500" title="A" />
                      <span className="w-2 h-2 rounded-full bg-gray-200" title="B" />
                    </div>
                  )}
                  {therapy.pattern === "custom" && (
                    <div className="mt-2 flex gap-0.5">
                      {[1,1,1,1,1,0,0].map((on, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${on ? "bg-green-400" : "bg-red-200"}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-300 transition-colors" aria-label="Modifica">
                <Edit2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-bold text-[#14443F] text-lg mb-4">Storico Modifiche</h3>
        <div className="pl-4 border-l-2 border-gray-200 space-y-6 relative">
          {[
            { date: "10 Feb 2024", action: "Aggiunto Diazepam", detail: "2.5mg (5 on / 2 off)" },
            { date: "15 Gen 2024", action: "Sospeso Laroxyl", detail: "Effetti collaterali" },
            { date: "01 Gen 2024", action: "Inizio Terapia", detail: "Protocollo iniziale Dr.ssa Rossi" }
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-400 border-2 border-white box-content" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{item.date}</p>
              <p className="font-bold text-[#14443F]">{item.action}</p>
              <p className="text-sm text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Icon helper
function Edit2({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}
