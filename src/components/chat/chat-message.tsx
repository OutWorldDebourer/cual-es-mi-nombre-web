"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  shouldAnimate?: boolean;
}

/** Agent label mapping for display */
const AGENT_LABELS: Record<string, string> = {
  general: "General",
  calendar: "Calendario",
  notes: "Notas",
  reminders: "Recordatorios",
  config: "Configuracion",
  sales: "Ventas",
  register: "Registro",
};

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Ahora";
    if (diffMin < 60) return `${diffMin}m`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;

    return date.toLocaleDateString("es", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function ChatMessage({ message, shouldAnimate = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const prefersReducedMotion = useReducedMotion();
  const animate = shouldAnimate && !prefersReducedMotion;

  return (
    <motion.div
      initial={animate ? { opacity: 0, x: isUser ? 20 : -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "flex w-full px-4 py-1",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground",
          message.isOptimistic && "opacity-70",
          message.error && "border border-destructive/40 bg-destructive/10",
        )}
      >
        {/* Agent badge for assistant messages */}
        {!isUser && message.agent && (
          <Badge
            variant="secondary"
            className="mb-1 text-[10px] font-normal"
          >
            {AGENT_LABELS[message.agent] ?? message.agent}
          </Badge>
        )}

        {/* Message content */}
        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>

        {/* Error indicator */}
        {message.error && (
          <p className="mt-1 text-xs text-destructive">{message.error}</p>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            "mt-1 text-[10px]",
            isUser ? "text-primary-foreground/60" : "text-muted-foreground",
          )}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </motion.div>
  );
}
