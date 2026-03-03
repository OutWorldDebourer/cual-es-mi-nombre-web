/**
 * Auth Server Actions — "Cuál es mi nombre" Web
 *
 * Server-side actions for login, signup, and logout.
 * These run on the server and can securely manage Supabase sessions.
 *
 * @module app/(auth)/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolve the canonical site URL for redirects.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL (explicit — must be set in Vercel env vars for prod)
 *   2. NEXT_PUBLIC_VERCEL_URL (auto-injected by Vercel on every deployment)
 *   3. Fallback to localhost for local dev
 *
 * @see https://supabase.com/docs/guides/auth/redirect-urls#vercel-preview-urls
 */
function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  // NEXT_PUBLIC_VERCEL_URL does not include the protocol
  url = url.startsWith("http") ? url : `https://${url}`;
  // Ensure trailing slash for consistent URL concatenation
  url = url.endsWith("/") ? url : `${url}/`;

  return url;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Server-side validation
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const siteURL = getSiteURL();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteURL}auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/auth/confirm");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
