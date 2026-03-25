import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message: string | null | undefined;
  className?: string;
}

/**
 * Inline form error with slide-in animation and icon.
 *
 * Replaces raw `{error && <div>...</div>}` blocks across the app.
 * Renders nothing when `message` is falsy.
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive animate-[fade-in-up_0.25s_ease-out_both] ${className ?? ""}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
