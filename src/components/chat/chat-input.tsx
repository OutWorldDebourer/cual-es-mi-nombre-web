"use client";

import { useRef, useCallback, type KeyboardEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const value = textarea.value.trim();
      if (!value || disabled) return;

      onSend(value);
      textarea.value = "";
      textarea.style.height = "auto";
      textarea.focus();
    },
    [onSend, disabled],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    // Max 4 lines (~96px)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <textarea
        ref={textareaRef}
        placeholder="Escribe un mensaje..."
        aria-label="Mensaje"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-2.5 text-sm",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors",
        )}
        maxLength={4000}
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled}
        className="shrink-0 rounded-xl"
        aria-label="Enviar mensaje"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
