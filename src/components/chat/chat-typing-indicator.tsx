export function ChatTypingIndicator() {
  return (
    <div className="flex justify-start px-4 py-2">
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 animate-[typing-bounce_0.6s_ease-in-out_infinite] rounded-full bg-muted-foreground/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
