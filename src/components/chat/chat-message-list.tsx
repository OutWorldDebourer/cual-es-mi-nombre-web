"use client";

import { useRef, useEffect } from "react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { ChatMessage } from "./chat-message";
import { ChatTypingIndicator } from "./chat-typing-indicator";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isSending: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export function ChatMessageList({
  messages,
  isSending,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string | null>(null);

  // Auto-scroll to bottom only when a NEW message appears at the end
  // (send/receive), not when older messages are prepended (loadMore).
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const lastId = lastMsg?.id ?? null;
    if (lastId && lastId !== lastMsgIdRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    lastMsgIdRef.current = lastId;
  }, [messages]);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isSending) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isSending]);

  // IntersectionObserver for infinite scroll (replaces scroll handler)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div
      className="flex-1 overflow-y-auto py-4"
      role="log"
      aria-live="polite"
    >
      {/* Sentinel for infinite scroll */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}

      {/* Load more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-3" role="status" aria-label="Cargando mensajes anteriores">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !isSending && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Envía un mensaje para comenzar la conversación.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {/* Typing indicator */}
      {isSending && <ChatTypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
