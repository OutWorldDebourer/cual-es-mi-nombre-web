/**
 * Chat Overlay — "Cuál es mi nombre" Web
 *
 * Mobile: Bottom drawer (85vh) using vaul/Drawer
 * Desktop: Right-side Sheet panel (400px)
 *
 * Reuses existing ChatHeader, ChatMessageList, ChatInput.
 * Loads messages on open, not pre-loaded.
 *
 * @module components/chat/chat-overlay
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { backendApi, ApiError } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  assistantName: string;
}

const PAGE_SIZE = 50;

export function ChatOverlay({ isOpen, onClose, assistantName }: ChatOverlayProps) {
  const isMobile = useIsMobile();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const apiRef = useRef<ReturnType<typeof backendApi> | null>(null);
  if (!apiRef.current) apiRef.current = backendApi(createClient());

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Load history when overlay opens for the first time
  useEffect(() => {
    if (!isOpen || hasLoaded) return;
    let cancelled = false;

    async function loadHistory() {
      try {
        const res = await apiRef.current!.chat.history({ limit: PAGE_SIZE });
        if (cancelled) return;
        setMessages(res.messages.reverse());
        setHasMore(res.has_more);
        setHasLoaded(true);
      } catch (err) {
        if (cancelled) return;
        let detail: string;
        if (err instanceof ApiError) {
          detail = err.detail;
        } else if (err instanceof TypeError) {
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
  }, [isOpen, hasLoaded]);

  // Load older messages
  const loadMore = useCallback(async () => {
    const current = messagesRef.current;
    if (isLoadingMore || !hasMore || current.length === 0) return;

    setIsLoadingMore(true);
    const oldest = current[0];

    try {
      const res = await apiRef.current!.chat.history({
        limit: PAGE_SIZE,
        before: oldest.created_at,
      });
      setMessages((prev) => [...res.messages.reverse(), ...prev]);
      setHasMore(res.has_more);
    } catch (err) {
      const detail = err instanceof ApiError ? err.detail : "Error al cargar más mensajes";
      toast.error(detail);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  // Send message
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
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.detail
          : "No se pudo enviar el mensaje. Intenta de nuevo.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, isOptimistic: false, error: detail } : m,
        ),
      );
      toast.error(detail);
    } finally {
      setIsSending(false);
    }
  }, []);

  const chatContent = (
    <div className="flex h-full flex-col">
      <ChatHeader assistantName={assistantName} isSending={isSending} />
      {isInitialLoad && !hasLoaded ? (
        <div className="flex flex-1 items-center justify-center" role="status" aria-label="Cargando mensajes">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
        </div>
      ) : (
        <ChatMessageList
          messages={messages}
          isSending={isSending}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isLoadingMore={isLoadingMore}
        />
      )}
      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );

  if (!isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-[400px] p-0 sm:max-w-[400px] [&>button]:hidden">
          <SheetTitle className="sr-only">Chat con {assistantName}</SheetTitle>
          {chatContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerTitle className="sr-only">Chat con {assistantName}</DrawerTitle>
        <div className="h-[85vh]">
          {chatContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
