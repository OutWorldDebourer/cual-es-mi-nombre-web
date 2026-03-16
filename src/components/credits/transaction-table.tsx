/**
 * Transaction Table Component — "Cuál es mi nombre" Web
 *
 * Displays a paginated table of credit transactions (ledger).
 * Shows date, action type, amount (+/-), balance after, and description.
 * Read-only — the ledger is append-only from the backend.
 *
 * @module components/credits/transaction-table
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { CreditTransaction, CreditAction } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/dates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TransactionTableProps {
  /** Initial transactions from server-side fetch */
  initialTransactions: CreditTransaction[];
  timezone?: string;
}

const ACTION_LABELS: Record<CreditAction, { label: string; emoji: string }> = {
  message: { label: "Mensaje", emoji: "💬" },
  calendar_op: { label: "Calendario", emoji: "📅" },
  note: { label: "Nota", emoji: "📝" },
  reminder: { label: "Recordatorio", emoji: "🔔" },
  audio_transcription: { label: "Audio", emoji: "🎙️" },
  complex_query: { label: "Consulta", emoji: "🧠" },
  monthly_reset: { label: "Reset mensual", emoji: "🔄" },
  admin_adjustment: { label: "Ajuste", emoji: "🔧" },
  bonus: { label: "Bonus", emoji: "🎁" },
};

const PAGE_SIZE = 20;

export function TransactionTable({
  initialTransactions,
  timezone,
}: TransactionTableProps) {
  const [transactions, setTransactions] =
    useState<CreditTransaction[]>(initialTransactions);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(
    initialTransactions.length === PAGE_SIZE,
  );
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const fetchTransactions = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        setTransactions(data as CreditTransaction[]);
        setHasMore(data.length === PAGE_SIZE);
      }
      setIsLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    if (page > 0) {
      void fetchTransactions(page);
    }
  }, [page, fetchTransactions]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Historial de transacciones</h2>

      {transactions.length === 0 && !isLoading ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-4xl">📊</p>
          <p className="text-sm text-muted-foreground">
            No hay transacciones aún. Usa el asistente para ver tu historial
            de créditos.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Descripción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const actionInfo = ACTION_LABELS[tx.action] ?? {
                    label: tx.action,
                    emoji: "❓",
                  };
                  const isPositive = tx.amount > 0;

                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(tx.created_at, timezone)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {actionInfo.emoji} {actionInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono text-sm ${
                          isPositive ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {tx.amount}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {tx.balance_after}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground truncate max-w-[200px]">
                        {tx.description ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Página {page + 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                ← Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || isLoading}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        </>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground text-center">
          Cargando...
        </p>
      )}
    </div>
  );
}
