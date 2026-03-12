/**
 * Auth Server Actions — "Cuál es mi nombre" Web
 *
 * Server-side action for logout.
 * Login and signup are handled client-side via Supabase SDK (phone + password).
 *
 * @module app/(auth)/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
