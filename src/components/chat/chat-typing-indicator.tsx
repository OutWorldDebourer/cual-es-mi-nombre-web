import { cn } from "@/lib/utils";

export function ChatTypingIndicator() {
  return (
    <div className="flex justify-start px-4 py-2">
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60",
                "animate-bounce",
              )}
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
