"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import {
  type ColumnMetrics,
  type ConsoleMessage,
  computeMetrics,
  MESSAGE_FETCH_LIMIT,
  pairLatencies,
  PHONE_PROFILES,
  PROFILE_BY_ID,
  type PhoneProfile,
} from "./lib/qa-console";

interface MessageRow {
  id: string;
  profile_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function rowToMessage(row: MessageRow): ConsoleMessage {
  const md = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    profileId: row.profile_id,
    role: row.role,
    content: row.content,
    metadata: row.metadata,
    createdAt: row.created_at,
    agentUsed: typeof md.agent_used === "string" ? md.agent_used : undefined,
    intent: typeof md.intent === "string" ? md.intent : undefined,
    creditsCost:
      typeof md.credits_cost === "number" ? md.credits_cost : undefined,
  };
}

export function ConsoleClient() {
  const supabase = useMemo(() => createClient(), []);
  const [messagesByProfile, setMessagesByProfile] = useState<
    Record<string, ConsoleMessage[]>
  >(() =>
    Object.fromEntries(PHONE_PROFILES.map((p) => [p.profileId, []]))
  );
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(PHONE_PROFILES.map((p) => [p.profileId, ""]))
  );
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<string | null>(null);

  const fetchInitial = useCallback(async () => {
    const ids = PHONE_PROFILES.map((p) => p.profileId);
    const { data, error } = await supabase
      .from("messages")
      .select("id,profile_id,role,content,metadata,created_at")
      .in("profile_id", ids)
      .order("created_at", { ascending: false })
      .limit(MESSAGE_FETCH_LIMIT * ids.length);
    if (error || !data) return;
    const grouped: Record<string, ConsoleMessage[]> = Object.fromEntries(
      ids.map((i) => [i, []])
    );
    for (const row of data as MessageRow[]) {
      grouped[row.profile_id]?.push(rowToMessage(row));
    }
    for (const k of Object.keys(grouped)) {
      grouped[k] = pairLatencies(grouped[k]);
    }
    setMessagesByProfile(grouped);
  }, [supabase]);

  useEffect(() => {
    void fetchInitial();
    const ids = PHONE_PROFILES.map((p) => p.profileId);
    const channel = supabase
      .channel("qa-console-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as MessageRow;
          if (!ids.includes(row.profile_id)) return;
          setMessagesByProfile((prev) => {
            const list = [...(prev[row.profile_id] ?? []), rowToMessage(row)];
            return { ...prev, [row.profile_id]: pairLatencies(list).slice(-MESSAGE_FETCH_LIMIT) };
          });
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, fetchInitial]);

  const send = useCallback(
    async (profile: PhoneProfile, text: string, interactiveId?: string) => {
      if (!text && !interactiveId) return;
      setSending((s) => ({ ...s, [profile.profileId]: true }));
      try {
        const res = await fetch("/qa-console/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: profile.phone,
            text,
            interactiveId,
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          alert(`Error enviando: ${json.error ?? json.upstreamBody ?? "desconocido"}`);
          return;
        }
        if (text) {
          setDrafts((d) => ({ ...d, [profile.profileId]: "" }));
        }
      } finally {
        setSending((s) => ({ ...s, [profile.profileId]: false }));
      }
    },
    []
  );

  const runCleanup = useCallback(
    async (includeReal: boolean) => {
      if (
        includeReal &&
        !confirm(
          "Esto borrará messages, finance_transactions, notes y reminders del PROFILE REAL creados en los últimos 60 minutos. ¿Continuar?"
        )
      )
        return;
      setCleanupBusy(true);
      try {
        const res = await fetch("/qa-console/api/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ includeReal, minutes: 60 }),
        });
        const json = await res.json();
        if (json.ok) {
          setLastCleanup(new Date().toISOString());
          await fetchInitial();
        } else {
          alert(`Cleanup falló: ${JSON.stringify(json)}`);
        }
      } finally {
        setCleanupBusy(false);
      }
    },
    [fetchInitial]
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">QA Console — e2e Validation</h1>
          <p className="text-xs text-zinc-400">
            9 phones · webhook firmado a Railway prod · validación realtime via Supabase
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {lastCleanup && (
            <span className="text-zinc-500">
              último cleanup {new Date(lastCleanup).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => runCleanup(false)}
            disabled={cleanupBusy}
            className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40"
          >
            Cleanup fakes
          </button>
          <button
            onClick={() => runCleanup(true)}
            disabled={cleanupBusy}
            className="px-3 py-1.5 rounded-md bg-amber-900/60 hover:bg-amber-800/80 disabled:opacity-40"
          >
            Cleanup all (incluye real, 60min)
          </button>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-px bg-zinc-800 flex-1 overflow-hidden">
        {PHONE_PROFILES.map((profile) => (
          <ChatColumn
            key={profile.profileId}
            profile={profile}
            messages={messagesByProfile[profile.profileId] ?? []}
            draft={drafts[profile.profileId] ?? ""}
            sending={sending[profile.profileId] ?? false}
            onDraftChange={(v) =>
              setDrafts((d) => ({ ...d, [profile.profileId]: v }))
            }
            onSend={() => send(profile, drafts[profile.profileId] ?? "")}
            onTap={(id) => send(profile, "", id)}
          />
        ))}
      </div>
    </div>
  );
}

function ChatColumn({
  profile,
  messages,
  draft,
  sending,
  onDraftChange,
  onSend,
  onTap,
}: {
  profile: PhoneProfile;
  messages: ConsoleMessage[];
  draft: string;
  sending: boolean;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onTap: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const metrics = useMemo(() => computeMetrics(messages), [messages]);

  return (
    <section className="flex flex-col bg-zinc-950 min-h-0">
      <header
        className={`px-3 py-2 border-b border-zinc-800 flex items-center justify-between text-xs ${
          profile.isReal ? "bg-rose-950/40" : "bg-zinc-900"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{profile.emoji}</span>
          <div className="min-w-0">
            <div className="font-semibold truncate">{profile.label}</div>
            <div className="text-[10px] text-zinc-500 truncate">
              {profile.phone}
              {profile.isReal && <span className="text-rose-400 ml-1">REAL</span>}
              {profile.oauthRequired && <span className="text-cyan-400 ml-1">OAuth</span>}
            </div>
          </div>
        </div>
        <MetricsPill metrics={metrics} />
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-zinc-600 text-xs py-8">sin mensajes aún</div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} onTap={onTap} />
        ))}
      </div>
      <footer className="border-t border-zinc-800 p-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={profile.isReal ? "[ojo: phone real]" : "mensaje…"}
          disabled={sending}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-zinc-600 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={sending || !draft.trim()}
          className="px-3 py-1 text-xs rounded-md bg-emerald-700 hover:bg-emerald-600 disabled:opacity-30"
        >
          {sending ? "…" : "send"}
        </button>
      </footer>
    </section>
  );
}

function MetricsPill({ metrics }: { metrics: ColumnMetrics }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
      <span title="mensajes totales">{metrics.totalMessages}m</span>
      {metrics.totalCredits > 0 && (
        <span className="text-amber-500" title="créditos consumidos">
          {metrics.totalCredits}c
        </span>
      )}
      {metrics.avgLatencyMs !== null && (
        <span
          className={
            metrics.avgLatencyMs > 12000
              ? "text-rose-400"
              : metrics.avgLatencyMs > 8000
              ? "text-amber-400"
              : "text-emerald-400"
          }
          title={`p95 ${metrics.p95LatencyMs?.toFixed(0)}ms`}
        >
          {(metrics.avgLatencyMs / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  onTap,
}: {
  message: ConsoleMessage;
  onTap: (id: string) => void;
}) {
  const isUser = message.role === "user";
  const md = (message.metadata ?? {}) as Record<string, unknown>;
  const buttons = Array.isArray(md.reply_buttons)
    ? (md.reply_buttons as Array<{ id: string; title: string }>)
    : null;
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-lg px-2 py-1 text-xs ${
          isUser
            ? "bg-emerald-700/30 border border-emerald-800/50"
            : "bg-zinc-800/70 border border-zinc-700/50"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-zinc-500">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {message.agentUsed && (
            <span className="text-cyan-400">{message.agentUsed}</span>
          )}
          {message.intent && (
            <span className="text-purple-400">{message.intent}</span>
          )}
          {typeof message.creditsCost === "number" && message.creditsCost > 0 && (
            <span className="text-amber-400">{message.creditsCost}c</span>
          )}
          {typeof message.latencyMs === "number" && (
            <span
              className={
                message.latencyMs > 12000
                  ? "text-rose-400"
                  : message.latencyMs > 8000
                  ? "text-amber-400"
                  : "text-emerald-400"
              }
            >
              {(message.latencyMs / 1000).toFixed(2)}s
            </span>
          )}
        </div>
        {buttons && buttons.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {buttons.map((b) => (
              <button
                key={b.id}
                onClick={() => onTap(b.id)}
                className="px-2 py-0.5 text-[10px] rounded bg-zinc-900 hover:bg-zinc-700 border border-zinc-700"
                title={b.id}
              >
                {b.title}
              </button>
            ))}
          </div>
        )}
        {/* Si no hay reply_buttons en metadata, ofrecer atajos típicos cuando bot pide confirmación */}
        {!buttons && !isUser && /confirmas|sí.{0,8}\?|no, cancela/i.test(message.content) && (
          <div className="mt-1 flex gap-1">
            <button
              onClick={() => onTap("confirm_action")}
              className="px-2 py-0.5 text-[10px] rounded bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700"
            >
              ✓ confirm
            </button>
            <button
              onClick={() => onTap("cancel_action")}
              className="px-2 py-0.5 text-[10px] rounded bg-rose-900/60 hover:bg-rose-800 border border-rose-700"
            >
              ✗ cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
