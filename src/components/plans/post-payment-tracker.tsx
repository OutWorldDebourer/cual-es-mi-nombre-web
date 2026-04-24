/**
 * PostPaymentTracker — Fires ``post_payment_web_visit`` funnel event
 *
 * Client component that inspects the ``?status=`` query param on the
 * ``/dashboard/plans`` route. When the status is ``approved``, ``pending``
 * or ``failure`` (i.e. a MercadoPago ``back_url`` redirect), it emits a
 * single ``post_payment_web_visit`` funnel event with the status in
 * metadata.
 *
 * Rendering: returns ``null`` — pure side-effect component.
 *
 * Guards against double-tracking:
 * - ``useRef`` sentinel prevents duplicate fires on re-render (dev
 *   StrictMode remounts, router refreshes).
 * - No dependency on auth state: if the user is not logged in, the inner
 *   ``funnel.track`` call throws a 401 which is swallowed as designed.
 *
 * @module components/plans/post-payment-tracker
 */

"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { backendApi } from "@/lib/api";

const TRACKED_STATUSES = new Set(["approved", "pending", "failure"]);

export function PostPaymentTracker() {
  const searchParams = useSearchParams();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    const status = searchParams.get("status");
    if (!status || !TRACKED_STATUSES.has(status)) return;

    tracked.current = true;
    const supabase = createClient();
    void backendApi(supabase).funnel.track("post_payment_web_visit", {
      status,
    });
  }, [searchParams]);

  return null;
}
