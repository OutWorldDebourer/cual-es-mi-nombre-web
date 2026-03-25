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

import { redirect } from "next/navigation";
import { getAuthUser, getProfile } from "@/lib/supabase/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { user },
  } = await getAuthUser();

  // Double-check: middleware should catch this, but defense in depth
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await getProfile(user.id);

  return (
    <DashboardShell
      user={user}
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
