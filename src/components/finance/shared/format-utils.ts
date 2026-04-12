/** Shared formatting utilities for the finance module. */

export function formatAmount(amount: number, currency = "S/"): string {
  return `${currency} ${amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
