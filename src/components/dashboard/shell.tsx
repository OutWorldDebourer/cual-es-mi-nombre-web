"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile, SubscriptionPlan } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  Home,
  StickyNote,
  Bell,
  CreditCard,
  Gem,
  Settings,
  MessageCircle,
  Calendar,
  Menu,
  X,
  Sparkles,
  Coins,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DashboardShellProps {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: "main" | "settings";
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home, group: "main" },
  { href: "/dashboard/notes", label: "Notas", icon: StickyNote, group: "main" },
  { href: "/dashboard/reminders", label: "Recordatorios", icon: Bell, group: "main" },
  { href: "/dashboard/credits", label: "Creditos", icon: CreditCard, group: "main" },
  { href: "/dashboard/plans", label: "Planes", icon: Gem, group: "main" },
  { href: "/dashboard/settings", label: "Configuracion", icon: Settings, group: "settings" },
  { href: "/dashboard/settings/whatsapp", label: "WhatsApp", icon: MessageCircle, group: "settings" },
  { href: "/dashboard/settings/google", label: "Google Calendar", icon: Calendar, group: "settings" },
];

const mainNav = navItems.filter((i) => i.group === "main");
const settingsNav = navItems.filter((i) => i.group === "settings");

const PLAN_STYLES: Record<SubscriptionPlan, string> = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-info/15 text-info dark:bg-info/25",
  pro: "bg-primary/15 text-primary dark:bg-primary/25",
  premium: "bg-accent/20 text-accent-foreground dark:bg-accent/30",
};

function SidebarContent({
  pathname,
  assistantName,
  plan,
  credits,
  onNavigate,
}: {
  pathname: string;
  assistantName: string;
  plan: SubscriptionPlan;
  credits: number;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-display font-bold text-base tracking-tight"
          onClick={onNavigate}
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Cual es mi nombre</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Settings separator */}
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Ajustes
          </p>
          <div className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer — user info */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{assistantName}</p>
          <Badge className={cn("text-[10px] font-semibold uppercase", PLAN_STYLES[plan])}>
            {plan}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Coins className="h-3.5 w-3.5" />
          <span>
            <strong className="text-foreground">{credits}</strong> creditos
          </span>
        </div>
      </div>
    </>
  );
}

export function DashboardShell({ user, profile, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const assistantName = profile?.assistant_name ?? "Asistente";
  const plan = (profile?.plan ?? "free") as SubscriptionPlan;
  const credits = profile?.credits_remaining ?? 0;

  return (
    <div className="flex min-h-screen">
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Ir al contenido principal
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <SidebarContent
          pathname={pathname}
          assistantName={assistantName}
          plan={plan}
          credits={credits}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 w-72 flex flex-col bg-sidebar shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent
              pathname={pathname}
              assistantName={assistantName}
              plan={plan}
              credits={credits}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback>
                  {(user.email ?? user.phone ?? "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {user.email ?? user.phone}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
