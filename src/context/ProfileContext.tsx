"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { getProfile, updateProfile as updateProfileStorage } from "@/lib/storage";

interface ProfileContextValue {
  profile: Profile;
  updateProfile: (partial: Partial<Profile>) => void;
  refresh: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() =>
    typeof window === "undefined" ? ({} as Profile) : getProfile()
  );

  const refresh = useCallback(() => {
    setProfile(getProfile());
  }, []);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    updateProfileStorage(partial);
    setProfile(getProfile());
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

/** Nome da mostrare (es. Header): firstName + lastName oppure name legacy */
export function getDisplayName(p: Profile): string {
  const first = (p.firstName ?? "").trim();
  const last = (p.lastName ?? "").trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return (p.name ?? "").trim() || "Utente";
}
