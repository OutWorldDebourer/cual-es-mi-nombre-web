"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribe to Supabase Realtime changes on a table.
 * Calls `onEvent` (debounced) whenever an INSERT, UPDATE, or DELETE occurs.
 * The subscription is cleaned up automatically on unmount.
 */
export function useRealtimeTable(table: string, onEvent: () => void, debounceMs = 300) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const channelName = useRef(`realtime:${table}:${crypto.randomUUID()}`);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => callbackRef.current(), debounceMs);
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.debug(`[Realtime] ${table}: connected`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] ${table}: error`, err);
        } else if (status === "TIMED_OUT") {
          console.warn(`[Realtime] ${table}: timed out`);
        } else if (status === "CLOSED") {
          console.debug(`[Realtime] ${table}: closed`);
        }
      });

    return () => {
      clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [table, debounceMs]);
}
