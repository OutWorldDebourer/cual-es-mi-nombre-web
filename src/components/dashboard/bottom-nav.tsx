"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, StickyNote, Bell, Wallet, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const bottomNavItems: BottomNavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/notes", label: "Notas", icon: StickyNote },
  { href: "/dashboard/reminders", label: "Recordatorios", icon: Bell },
  { href: "/dashboard/finance", label: "Finanzas", icon: Wallet },
  { href: "/dashboard/settings", label: "Config", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-16 items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-primary/70"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-150",
                  isActive && "scale-110"
                )}
              />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
