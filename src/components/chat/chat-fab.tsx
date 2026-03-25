/**
 * Chat FAB (Floating Action Button) — "Cuál es mi nombre" Web
 *
 * Circular button fixed to the bottom-right corner that opens
 * the chat overlay. Hidden when the overlay is open.
 *
 * @module components/chat/chat-fab
 */

"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatFabProps {
  isOpen: boolean;
  onClick: () => void;
}

export function ChatFab({ isOpen, onClick }: ChatFabProps) {
  if (isOpen) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-28 right-4 z-50 h-14 w-14 rounded-full shadow-lg",
        "md:bottom-6 md:right-6",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "transition-transform hover:scale-105 active:scale-95",
      )}
      aria-label="Abrir chat"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}
