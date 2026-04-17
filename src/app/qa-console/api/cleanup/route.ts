/**
 * POST /qa-console/api/cleanup
 *
 * Borra el contenido de los profiles fake y, si se incluye `includeReal`,
 * limpia datos del profile real creados en los últimos `minutes` minutos.
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY para saltar RLS.
 *
 * Body: { includeReal?: boolean; minutes?: number }
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { PHONE_PROFILES } from "../../lib/qa-console";

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const FAKE_PROFILE_IDS = PHONE_PROFILES.filter((p) => !p.isReal).map(
  (p) => p.profileId
);
const REAL_PROFILE_ID = PHONE_PROFILES.find((p) => p.isReal)?.profileId ?? null;

const FAKE_TABLES = [
  "messages",
  "notes",
  "reminders",
  "finance_transactions",
  "finance_budgets",
  "credit_transactions",
  "event_notifications",
  "classification_log",
  "funnel_events",
];

const REAL_TABLES = [
  "messages",
  "finance_transactions",
  "notes",
  "reminders",
];

export async function POST(req: Request) {
  if (!SERVICE_KEY || !SUPABASE_URL) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL faltan" },
      { status: 500 }
    );
  }

  const { includeReal = false, minutes = 60 } = (await req
    .json()
    .catch(() => ({}))) as { includeReal?: boolean; minutes?: number };

  const sb = createClient(SUPABASE_URL.trim(), SERVICE_KEY.trim(), {
    auth: { persistSession: false },
  });

  const result: Record<string, { fakeDeleted: number; realDeleted?: number; error?: string }> =
    {};

  for (const table of FAKE_TABLES) {
    const { error, count } = await sb
      .from(table)
      .delete({ count: "exact" })
      .in("profile_id", FAKE_PROFILE_IDS);
    result[table] = {
      fakeDeleted: count ?? 0,
      ...(error ? { error: error.message } : {}),
    };
  }

  if (includeReal && REAL_PROFILE_ID) {
    const cutoff = new Date(Date.now() - minutes * 60_000).toISOString();
    for (const table of REAL_TABLES) {
      const { error, count } = await sb
        .from(table)
        .delete({ count: "exact" })
        .eq("profile_id", REAL_PROFILE_ID)
        .gt("created_at", cutoff);
      const prev = result[table] ?? { fakeDeleted: 0 };
      result[table] = {
        ...prev,
        realDeleted: count ?? 0,
        ...(error ? { error: error.message } : {}),
      };
    }
  }

  return NextResponse.json({
    ok: true,
    includeReal,
    cutoffMinutes: minutes,
    result,
    timestamp: new Date().toISOString(),
  });
}
