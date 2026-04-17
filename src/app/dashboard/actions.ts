/**
 * Dashboard Server Actions — "Cuál es mi nombre" Web
 *
 * Server-side actions scoped to the /dashboard segment. These are
 * invoked from Client Components via the Next.js Server Actions RPC
 * mechanism (serialized as POST to the generated endpoint) and run
 * on the server so they can mutate the Full Route Cache and the
 * Client Router Cache in one atomic call.
 *
 * See audit chat web 2026-04-17, Bug #1 (iter3): client-side
 * `router.refresh()` did NOT invalidate the Client Router Cache
 * reliably when the mutation targeted an external FastAPI backend
 * (not a Next.js API route). `revalidatePath(..., "layout")` from a
 * Server Action does, because it runs server-side and busts both
 * cache layers.
 *
 * @module app/dashboard/actions
 */

"use server";

import { revalidatePath } from "next/cache";

/**
 * Invalidate every Server Component under /dashboard so stale data
 * (credits card, sidebar credits badge, activity feed, …) is re-read
 * from the DB on the next render. Argument `"layout"` broadens the
 * invalidation from a single page to the entire layout subtree.
 */
export async function refreshDashboard(): Promise<void> {
  revalidatePath("/dashboard", "layout");
}
