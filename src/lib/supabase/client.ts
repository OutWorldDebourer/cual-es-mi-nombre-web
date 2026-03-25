/**
 * Supabase Browser Client — "Cuál es mi nombre" Web
 *
 * Used in Client Components (useState, useEffect, onClick, etc.)
 * This client runs in the browser and handles auth cookies automatically.
 *
 * @module lib/supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  );
}
