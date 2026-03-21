/**
 * Cached Auth Helpers — "Cuál es mi nombre" Web
 *
 * Uses React `cache()` to deduplicate Supabase auth + profile calls
 * within a single Server Component render pass.
 *
 * Before: layout.tsx getUser() + profile query + page.tsx getUser() + profile query = 5 round-trips
 * After:  getAuthUser() + getProfile() = 2 round-trips (deduplicated by React)
 *
 * @module lib/supabase/auth
 */

import { cache } from "react";
import { createClient } from "./server";

/**
 * Get the authenticated Supabase user (cached per render).
 *
 * Multiple Server Components calling this in the same render
 * will share a single `auth.getUser()` round-trip.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});

/**
 * Get a user's profile from the `profiles` table (cached per render).
 *
 * @param userId - The auth user's UUID
 */
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  return supabase.from("profiles").select("*").eq("id", userId).single();
});
