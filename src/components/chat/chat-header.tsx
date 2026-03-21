import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface ChatHeaderProps {
  assistantName: string;
  isSending: boolean;
}

export function ChatHeader({ assistantName, isSending }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{assistantName}</p>
        <p className="text-xs text-muted-foreground">
          {isSending ? "Escribiendo..." : "En linea"}
        </p>
      </div>
      <Badge variant="secondary" className="text-[10px]">
        Web
      </Badge>
    </div>
  );
}
