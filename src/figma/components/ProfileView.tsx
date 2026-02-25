"use client";
import { User, Settings, FileText, ChevronRight, LogOut, Heart, HelpCircle, Download } from "lucide-react";

export function ProfileView() {
  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#14443F] shadow-inner text-2xl font-bold">
          AB
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#14443F]">Alice Bianchi</h2>
          <p className="text-[#5C8D89] text-sm">Diagnosi: 6 mesi fa</p>
        </div>
      </div>

      <div className="bg-[#14443F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
        
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FileText size={20} />
          Report Medico
        </h3>
        <p className="text-white/70 text-sm mb-6 max-w-[80%]">
          Genera un PDF con i dati degli ultimi 30 giorni per la tua prossima visita.
        </p>
        
        <button className="bg-white text-[#14443F] px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-md active:scale-95 w-full justify-center sm:w-auto">
          <Download size={16} />
          Scarica Report
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-[#14443F] px-2 uppercase text-xs tracking-wider opacity-60">Impostazioni</h3>
        
        {[
          { icon: User, label: "Dati Personali" },
          { icon: Settings, label: "Preferenze App" },
          { icon: Heart, label: "Salute & Terapia" },
          { icon: HelpCircle, label: "Supporto" },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-[0.99] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F5F8F7] flex items-center justify-center text-[#14443F]">
                <item.icon size={20} />
              </div>
              <span className="font-medium text-[#14443F]">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        ))}

        <button className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 mt-4 hover:bg-red-100 active:scale-[0.99] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500">
              <LogOut size={20} />
            </div>
            <span className="font-medium">Esci</span>
          </div>
        </button>
      </div>
    </div>
  );
}
