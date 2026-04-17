"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { backendApi, ApiError } from "@/lib/api";
import { refreshDashboard } from "@/app/dashboard/actions";
import type { ChatMessage } from "@/types/chat";
import { motion } from "motion/react";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { ChatSkeleton } from "./chat-skeleton";

interface ChatViewProps {
  assistantName: string;
}

const PAGE_SIZE = 50;

export function ChatView({ assistantName }: ChatViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Lazy-init API ref to avoid side effects in render
  const apiRef = useRef<ReturnType<typeof backendApi> | null>(null);
  if (!apiRef.current) apiRef.current = backendApi(createClient());

  // Ref to track oldest message cursor without re-creating loadMore
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Load initial history ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let retries = 0;
    const MAX_RETRIES = 2;

    async function loadHistory() {
      try {
        const res = await apiRef.current!.chat.history({ limit: PAGE_SIZE });
        if (cancelled) return;
        // API returns newest-first, reverse for chronological render
        setMessages(res.messages.reverse());
        setHasMore(res.has_more);
      } catch (err) {
        if (cancelled) return;

        // Retry on network errors (not auth errors)
        const isNetworkError = !(err instanceof ApiError);
        const isServerError = err instanceof ApiError && err.status >= 500;
        if ((isNetworkError || isServerError) && retries < MAX_RETRIES) {
          retries++;
          const delay = 1000 * retries;
          setTimeout(() => { if (!cancelled) loadHistory(); }, delay);
          return;
        }

        let detail: string;
        if (err instanceof ApiError) {
          detail = err.detail;
        } else if (err instanceof TypeError) {
          // Network/CORS error — fetch throws TypeError
          detail = "No se pudo conectar al servidor. Verifica tu conexión.";
        } else {
          detail = "Error al cargar historial";
        }
        toast.error(detail);
      } finally {
        if (!cancelled) setIsInitialLoad(false);
      }
    }

    loadHistory();
    return () => { cancelled = true; };
  }, []);

  // ── Load older messages ───────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    const current = messagesRef.current;
    if (isLoadingMore || !hasMore || current.length === 0) return;

    setIsLoadingMore(true);
    const oldestMessage = current[0];

    try {
      const res = await apiRef.current!.chat.history({
        limit: PAGE_SIZE,
        before: oldestMessage.created_at,
      });
      // Prepend older messages (reversed from newest-first)
      setMessages((prev) => [...res.messages.reverse(), ...prev]);
      setHasMore(res.has_more);
    } catch (err) {
      const detail = err instanceof ApiError ? err.detail : "Error al cargar más mensajes";
      toast.error(detail);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  // ── Send message ──────────────────────────────────────────────────────
  // Deps: none. Setters, refs, toast, and the imported Server Action
  // (`refreshDashboard`) are all module-level / stable so nothing is
  // tracked here.
  const handleSend = useCallback(async (text: string) => {
    const optimisticId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      role: "user",
      content: text,
      agent: null,
      created_at: new Date().toISOString(),
      metadata: null,
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      const res = await apiRef.current!.chat.send(text);

      // Confirm user message + add assistant response
      setMessages((prev) => {
        const confirmed = prev.map((m) =>
          m.id === optimisticId ? { ...m, isOptimistic: false } : m,
        );

        const assistantMsg: ChatMessage = {
          id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: "assistant",
          content: res.response,
          agent: res.agent_used,
          created_at: new Date().toISOString(),
          metadata: { intent: res.intent, credits_cost: res.credits_cost },
        };

        return [...confirmed, assistantMsg];
      });

      // Invalidate Server Component cache so the dashboard card
      // ("Créditos restantes") and the sidebar credits badge re-read
      // `profile.credits_remaining` from the DB. Without this the numbers
      // stay stale until a manual reload.
      //
      // Iter1 used `router.refresh()` but the Client Router Cache of
      // Next.js 16 was not invalidated when the mutation targeted the
      // external FastAPI backend. A Server Action running
      // `revalidatePath("/dashboard", "layout")` invalidates both the
      // Full Route Cache server-side. Follow with router.refresh()
      // so the client discards its Router Cache for the current
      // segment and re-fetches the revalidated payload. The Server
      // Action alone is not enough in Next.js 16: revalidatePath
      // invalidates the server, but the browser keeps serving the
      // prior RSC payload until a navigation event flushes the
      // Client Router Cache — router.refresh() is that event.
      // See audit chat web 2026-04-17 Bug #1 (iter4).
      await refreshDashboard();
      router.refresh();
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.detail
          : "No se pudo enviar el mensaje. Intenta de nuevo.";

      // Mark optimistic message as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, isOptimistic: false, error: detail } : m,
        ),
      );
      toast.error(detail);
    } finally {
      setIsSending(false);
    }
  }, [router]);

  // ── Initial loading state ─────────────────────────────────────────────
  if (isInitialLoad) {
    return (
      <div className="flex h-[calc(100dvh-14rem)] md:h-[calc(100vh-10rem)] flex-col rounded-xl border bg-card shadow-sm" role="status" aria-label="Cargando mensajes">
        <ChatSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[calc(100dvh-14rem)] md:h-[calc(100vh-10rem)] flex-col rounded-xl border bg-card shadow-sm"
    >
      <ChatHeader assistantName={assistantName} isSending={isSending} />
      <ChatMessageList
        messages={messages}
        isSending={isSending}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isLoadingMore={isLoadingMore}
      />
      <ChatInput onSend={handleSend} disabled={isSending} />
    </motion.div>
  );
}
