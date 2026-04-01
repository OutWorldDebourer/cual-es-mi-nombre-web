"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile, SubscriptionPlan } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiStatusBanner } from "@/components/dashboard/api-status-banner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserMenu } from "@/components/dashboard/user-menu";
import { DashboardBreadcrumb } from "@/components/dashboard/breadcrumb-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ChatFab } from "@/components/chat/chat-fab";
import { ChatOverlay } from "@/components/chat/chat-overlay";
import { FloatingOrbs } from "@/components/ui/floating-orbs";
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
  PanelLeftClose,
  PanelLeftOpen,
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
const routeLabels = Object.fromEntries(
  navItems.map((item) => [item.href, item.label])
);

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
  collapsed = false,
  showToggle = false,
  onNavigate,
  onToggle,
}: {
  pathname: string;
  assistantName: string;
  plan: SubscriptionPlan;
  credits: number;
  collapsed?: boolean;
  showToggle?: boolean;
  onNavigate?: () => void;
  onToggle?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className={cn(
        "flex h-14 items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center font-display font-bold text-base tracking-tight",
            collapsed ? "justify-center" : "gap-2"
          )}
          onClick={onNavigate}
        >
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
          {!collapsed && <span>Cual es mi nombre</span>}
        </Link>
        {showToggle && !collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label="Colapsar sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>
      {showToggle && collapsed && (
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label="Expandir sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-4 space-y-6 overflow-y-auto",
        collapsed ? "px-2" : "px-3"
      )}>
        {/* Main */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all duration-150",
                  collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </div>

        {/* Settings separator */}
        <div>
          {collapsed ? (
            <hr className="border-t border-sidebar-border my-2 mx-2" />
          ) : (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Ajustes
            </p>
          )}
          <div className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-all duration-150",
                    collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </div>
        </div>
      </nav>

      {/* Footer — user info */}
      {collapsed ? (
        <div className="border-t border-sidebar-border p-2 space-y-2 flex flex-col items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={cn("text-[10px] font-semibold uppercase cursor-default", PLAN_STYLES[plan])}>
                {plan}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="right">{assistantName} — Plan {plan}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center text-muted-foreground cursor-default">
                <Coins className="h-3.5 w-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{credits} creditos</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center justify-between min-w-0">
            <p className="text-sm font-medium truncate min-w-0">{assistantName}</p>
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
      )}
    </>
  );
}

export function DashboardShell({ user, profile, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

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
      <aside className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex overflow-hidden transition-[width] duration-200 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent
          pathname={pathname}
          assistantName={assistantName}
          plan={plan}
          credits={credits}
          collapsed={collapsed}
          showToggle
          onToggle={toggleSidebar}
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
      <div className="relative flex flex-1 flex-col min-w-0">
        <FloatingOrbs count={3} />

        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] px-4 md:px-6">
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
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu email={user.email ?? user.phone ?? "Usuario"} />
            </div>
          </div>
          <DashboardBreadcrumb pathname={pathname} routeLabels={routeLabels} />
        </header>

        {/* Page content */}
        <main id="main-content" className="relative z-10 flex-1 p-4 pb-28 md:p-6 md:pb-6">
          <ApiStatusBanner />
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />

      {/* Chat FAB + Overlay */}
      <ChatFab isOpen={chatOpen} onClick={() => setChatOpen(true)} />
      <ChatOverlay
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        assistantName={assistantName}
      />
    </div>
  );
}
