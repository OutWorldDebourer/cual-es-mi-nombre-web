/**
 * Dashboard Layout — "Cuál es mi nombre" Web
 *
 * Authenticated layout with sidebar navigation and header.
 * This layout is protected by the middleware (redirects to /login
 * if no user session). The auth guard runs in middleware.ts,
 * here we just fetch the user for display.
 *
 * @module app/dashboard/layout
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Double-check: middleware should catch this, but defense in depth
  if (!user) {
    redirect("/login");
  }

  // Fetch profile for display (credits, plan, assistant name)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      user={user}
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
