"use client";

import { useMemo } from "react";
import {
  Banknote,
  Building2,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Plus,
  ArrowLeftRight,
  Wallet,
} from "lucide-react";
import type { FinanceAccount, AccountType } from "@/types/database";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/finance/shared/empty-state";

// ── Constants ──────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_CONFIG: Record<
  AccountType,
  { label: string; icon: typeof Banknote; colorClass: string; bgClass: string }
> = {
  cash: {
    label: "Efectivo",
    icon: Banknote,
    colorClass: "text-green-600 dark:text-green-400",
    bgClass: "bg-green-100 dark:bg-green-900/30",
  },
  bank: {
    label: "Banco",
    icon: Building2,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
  },
  credit_card: {
    label: "Tarjeta de credito",
    icon: CreditCard,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
  },
  savings: {
    label: "Ahorros",
    icon: PiggyBank,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
  },
  investment: {
    label: "Inversion",
    icon: TrendingUp,
    colorClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-100 dark:bg-indigo-900/30",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBalance(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "\u20AC" : "S/";
  return `${symbol} ${amount.toFixed(2)}`;
}

// ── Props ──────────────────────────────────────────────────────────────────

interface AccountsTabProps {
  accounts: FinanceAccount[];
  onRefresh: () => void;
  onAddAccount?: () => void;
  onTransfer?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

/** Account management tab: total balance, account cards, add/transfer actions. */
export function AccountsTab({ accounts, onRefresh, onAddAccount, onTransfer }: AccountsTabProps) {
  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.is_active),
    [accounts],
  );

  const inactiveAccounts = useMemo(
    () => accounts.filter((a) => !a.is_active),
    [accounts],
  );

  const totalBalance = useMemo(
    () => activeAccounts.reduce((sum, a) => sum + a.initial_balance, 0),
    [activeAccounts],
  );

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Sin cuentas"
        description="Agrega tus cuentas para llevar control de tus saldos."
        actionLabel="Agregar cuenta"
        onAction={onAddAccount}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onAddAccount}
        >
          <Plus className="size-4" />
          Nueva cuenta
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onTransfer}
        >
          <ArrowLeftRight className="size-4" />
          Transferir
        </Button>
      </div>

      {/* Total balance hero card */}
      <TotalBalanceCard balance={totalBalance} accountCount={activeAccounts.length} />

      {/* Active accounts */}
      {activeAccounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Cuentas activas
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive accounts */}
      {inactiveAccounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Cuentas inactivas
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inactiveAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Total balance card ─────────────────────────────────────────────────────

function TotalBalanceCard({
  balance,
  accountCount,
}: {
  balance: number;
  accountCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          Balance total
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p
          className={cn(
            "text-3xl font-bold tabular-nums sm:text-4xl",
            balance >= 0
              ? "text-foreground"
              : "text-red-600 dark:text-red-400",
          )}
        >
          S/ {balance.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {accountCount} cuenta{accountCount !== 1 ? "s" : ""} activa
          {accountCount !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Account card ───────────────────────────────────────────────────────────

function AccountCard({ account }: { account: FinanceAccount }) {
  const config = ACCOUNT_TYPE_CONFIG[account.type];
  const Icon = config.icon;

  return (
    <Card variant="interactive" className={cn(!account.is_active && "opacity-60")}>
      <CardContent className="flex items-center gap-3 py-3">
        {/* Type icon */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            config.bgClass,
          )}
        >
          <Icon className={cn("size-5", config.colorClass)} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {account.name}
            </span>
            {!account.is_active && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Inactiva
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {account.currency}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              account.initial_balance >= 0
                ? "text-foreground"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {formatBalance(account.initial_balance, account.currency)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
