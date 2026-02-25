"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Bell } from "lucide-react";
import {
  getNotificationLog,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";
import type { NotificationLogEntry } from "@/lib/notifications";

function formatNotificationTime(at: number): string {
  const d = new Date(at);
  const now = Date.now();
  const diffMs = now - at;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Adesso";
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} h fa`;
  if (diffDays < 7) return `${diffDays} g fa`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Alice" }: HeaderProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [log, setLog] = useState<NotificationLogEntry[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLog(getNotificationLog());
  }, []);

  useEffect(() => {
    if (panelOpen) {
      const list = [...getNotificationLog()].reverse();
      markAllNotificationsRead();
      setLog(list.map((n) => ({ ...n, read: true })));
    }
  }, [panelOpen]);

  useEffect(() => {
    const onFocus = () => setLog(getNotificationLog());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [panelOpen]);

  const unreadCount = log.filter((n) => !n.read).length;

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

      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className="relative p-2 rounded-full bg-white text-[#14443F] shadow-sm hover:bg-gray-50 transition-colors"
          aria-label="Notifiche"
          aria-expanded={panelOpen}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#14443F] text-white text-[10px] font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {panelOpen && (
          <div className="absolute right-0 top-full mt-2 z-50 w-[min(320px,calc(100vw-2rem))] max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h2 className="font-bold text-[#14443F] text-sm">Notifiche</h2>
            </div>
            <div className="overflow-y-auto flex-1">
              {log.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">Nessuna notifica</p>
              ) : (
                <ul className="py-2">
                  {log.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationRead(entry.id);
                          setLog((prev) =>
                            prev.map((n) => (n.id === entry.id ? { ...n, read: true } : n))
                          );
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                          !entry.read ? "bg-[#EBF5F0]/50" : ""
                        }`}
                      >
                        <p className="font-medium text-[#14443F] text-sm">{entry.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{entry.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatNotificationTime(entry.at)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
