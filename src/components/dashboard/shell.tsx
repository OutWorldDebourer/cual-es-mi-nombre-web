/**
 * Dashboard Shell — "Cuál es mi nombre" Web
 *
 * Main layout wrapper for the authenticated dashboard area.
 * Contains sidebar navigation and top header with user info.
 *
 * @module components/dashboard/shell
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/dashboard/logout-button";

interface DashboardShellProps {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/dashboard/settings", label: "Configuración", icon: "⚙️" },
  {
    href: "/dashboard/settings/whatsapp",
    label: "WhatsApp",
    icon: "📱",
  },
  {
    href: "/dashboard/settings/google",
    label: "Google Calendar",
    icon: "📅",
  },
];

export function DashboardShell({
  user,
  profile,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  const assistantName = profile?.assistant_name ?? "Asistente";
  const plan = profile?.subscription_plan ?? "free";
  const credits = profile?.credits_remaining ?? 0;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="font-semibold">
            ¿Cuál es mi nombre?
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4 space-y-2">
          <div className="text-xs text-muted-foreground">
            <p>
              Asistente: <strong>{assistantName}</strong>
            </p>
            <p>
              Plan:{" "}
              <strong className="capitalize">{plan}</strong>
            </p>
            <p>
              Créditos: <strong>{credits}</strong>
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b px-6">
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
          <LogoutButton />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
