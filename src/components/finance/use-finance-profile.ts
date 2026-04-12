"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FinanceProfile } from "@/types/database";

/**
 * State management for the user's finance profile.
 * Provides optimistic updates and persists changes to Supabase.
 */
export function useFinanceProfile(initialProfile: FinanceProfile) {
  const [profile, setProfile] = useState<FinanceProfile>(initialProfile);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(
    async (patch: Partial<FinanceProfile>) => {
      const previous = profile;
      const optimistic = { ...profile, ...patch, updated_at: new Date().toISOString() };
      setProfile(optimistic);
      setIsUpdating(true);

      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("finance_profiles")
          .update(patch)
          .eq("profile_id", profile.profile_id);

        if (error) {
          // Rollback on failure
          setProfile(previous);
          throw error;
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [profile]
  );

  return { profile, updateProfile, isUpdating } as const;
}
