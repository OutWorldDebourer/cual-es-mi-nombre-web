"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const FINANCE_TABLES = [
  "finance_transactions",
  "finance_budgets",
  "finance_categories",
  "finance_accounts",
] as const;

/**
 * Subscribe to realtime changes on finance tables.
 * Calls `onUpdate` on any INSERT/UPDATE/DELETE, typically to trigger `router.refresh()`.
 */
export function useFinanceRealtime(onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("finance-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: FINANCE_TABLES[0] },
        onUpdate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: FINANCE_TABLES[1] },
        onUpdate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: FINANCE_TABLES[2] },
        onUpdate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: FINANCE_TABLES[3] },
        onUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
