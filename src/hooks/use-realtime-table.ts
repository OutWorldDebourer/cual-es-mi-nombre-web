"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/** Payload shape passed to `onEvent` callbacks. */
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: Partial<T> | null;
}

/**
 * Subscribe to Supabase Realtime changes on a table.
 * Calls `onEvent` immediately for every INSERT, UPDATE, or DELETE,
 * forwarding the Realtime payload so consumers can merge incrementally.
 * No debounce — each event triggers a cheap in-memory state merge,
 * so dropping intermediate events would cause data loss.
 * The subscription is cleaned up automatically on unmount.
 */
export function useRealtimeTable<T = Record<string, unknown>>(
  table: string,
  onEvent: (payload: RealtimePayload<T>) => void,
) {
  const callbackRef = useRef(onEvent);

  useEffect(() => {
    callbackRef.current = onEvent;
  });
  const channelName = useRef(`realtime:${table}:${crypto.randomUUID()}`);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (raw) => {
          const payload: RealtimePayload<T> = {
            eventType: raw.eventType as RealtimePayload<T>["eventType"],
            new: (raw.new && Object.keys(raw.new).length > 0 ? raw.new : null) as T | null,
            old: (raw.old && Object.keys(raw.old).length > 0 ? raw.old : null) as Partial<T> | null,
          };
          callbackRef.current(payload);
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
      supabase.removeChannel(channel);
    };
  }, [table]);
}
