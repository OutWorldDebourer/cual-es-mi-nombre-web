"use client";

/**
 * CreditsCard — "Cuál es mi nombre" Web
 *
 * Client Component that renders the user's current credit balance and
 * live-updates it when a `credits:update` CustomEvent is dispatched on
 * the window. The event is dispatched by the in-app chat view after
 * every successful `POST /api/chat/send` with the fresh
 * `credits_remaining` value returned by the backend.
 *
 * Why an event, not a fetch: the send response already carries the
 * up-to-date balance, so re-querying the DB (or invalidating the Next.js
 * Server Component cache) is redundant work. A window-scoped event is
 * the minimal mechanism that keeps every card / badge in sync across
 * the dashboard layout without prop-drilling or a global store.
 *
 * Multi-tab note: only the tab that sent the message receives the event
 * — inactive tabs refresh their balance on next focus / hard reload.
 *
 * See audit chat web 2026-04-17, Bug #1 (iter5).
 *
 * @module components/dashboard/credits-card
 */

import { useEffect, useState } from "react";
import { CountUp } from "@/components/dashboard/count-up";

/**
 * Name of the window event that carries an updated credit balance.
 *
 * Exported so dispatchers (e.g. chat-view) and consumers share the
 * exact literal and never drift out of sync via typos.
 */
export const CREDITS_UPDATE_EVENT = "credits:update";

interface CreditsCardProps {
  /** Server-rendered initial balance. Used as the first render value. */
  initial: number;
  /**
   * When `true`, render only the raw number as plain text (no CountUp
   * animation wrapper). Used by compact placements such as the sidebar
   * badge where the numeric digit sits inside a sentence. Defaults to
   * `false` — the main dashboard card uses the animated CountUp.
   */
  compact?: boolean;
  /** Optional className forwarded to the rendered element. */
  className?: string;
}

/**
 * Render the current credits balance and subscribe to live updates.
 *
 * The component stores the balance in local state seeded from `initial`.
 * A `credits:update` window event replaces the state with the new value
 * so the displayed number stays in sync with backend truth without any
 * Server Component refetch.
 */
export function CreditsCard({
  initial,
  compact = false,
  className,
}: CreditsCardProps) {
  const [credits, setCredits] = useState<number>(initial);

  // If the parent re-renders with a new `initial` (e.g. hard reload of
  // the dashboard page), adopt the fresh server value. This keeps the
  // component correct even when the CustomEvent path is bypassed.
  useEffect(() => {
    setCredits(initial);
  }, [initial]);

  useEffect(() => {
    function onUpdate(event: Event) {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === "number" && Number.isFinite(detail)) {
        setCredits(detail);
      }
    }

    window.addEventListener(CREDITS_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(CREDITS_UPDATE_EVENT, onUpdate);
  }, []);

  if (compact) {
    return (
      <span className={className} data-testid="credits-card-compact">
        {credits}
      </span>
    );
  }

  return (
    <span data-testid="credits-card">
      <CountUp end={credits} delay={0} className={className} />
    </span>
  );
}
