"use client";
import { motion } from "motion/react";
import { Bell } from "lucide-react";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Alice" }: HeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 pt-12 pb-6 bg-[#EBF5F0]"
    >
      <div>
        <h1 className="text-2xl font-bold text-[#14443F]">Ciao {userName},</h1>
        <p className="text-sm text-[#5C8D89]">Come va oggi?</p>
      </div>
      
      <button className="p-2 rounded-full bg-white text-[#14443F] shadow-sm hover:bg-gray-50 transition-colors">
        <Bell size={20} />
      </button>
    </motion.header>
  );
}
