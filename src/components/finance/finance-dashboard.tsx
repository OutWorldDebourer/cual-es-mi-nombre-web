"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OnboardingWizard } from "@/components/finance/shared/onboarding-wizard";
import type { OnboardingResult } from "@/components/finance/shared/onboarding-wizard";
import { OverviewTab } from "@/components/finance/tabs/overview-tab";
import { TransactionsTab } from "@/components/finance/tabs/transactions-tab";
import { BudgetsTab } from "@/components/finance/tabs/budgets-tab";
import { ReportsTab } from "@/components/finance/tabs/reports-tab";
import { CategoriesTab } from "@/components/finance/tabs/categories-tab";
import { AccountsTab } from "@/components/finance/tabs/accounts-tab";
import { SettingsTab } from "@/components/finance/tabs/settings-tab";
import { useFinanceRealtime } from "@/components/finance/use-finance-realtime";
import { useFinanceMutations } from "@/components/finance/use-finance-mutations";
import { AddTransactionModal } from "@/components/finance/modals/add-transaction-modal";
import { EditCategoryModal } from "@/components/finance/modals/edit-category-modal";
import { CreateAccountModal } from "@/components/finance/modals/create-account-modal";
import { TransferModal } from "@/components/finance/modals/transfer-modal";
import type {
  FinanceProfile,
  FinanceTransaction,
  FinanceCategory,
  FinanceAccount,
  FinanceBudget,
} from "@/types/database";

// ── Tab definitions ────────────────────────────────────────────────────────

const TABS = [
  { value: "overview", label: "Resumen" },
  { value: "transactions", label: "Movimientos" },
  { value: "budgets", label: "Presupuestos" },
  { value: "reports", label: "Reportes" },
  { value: "categories", label: "Categorias" },
  { value: "accounts", label: "Cuentas" },
  { value: "settings", label: "Configuracion" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const VALID_TABS = new Set<string>(TABS.map((t) => t.value));

// ── Props ──────────────────────────────────────────────────────────────────

interface FinanceDashboardProps {
  profile: FinanceProfile | null;
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  budgets: FinanceBudget[];
  timezone: string;
  initialTab?: string;
}

// ── Component ──────────────────────────────────────────────────────────────

/** Tab container for the Finance module. Shows onboarding wizard when profile is incomplete. */
export function FinanceDashboard({
  profile,
  transactions,
  categories,
  accounts,
  budgets,
  timezone,
  initialTab,
}: FinanceDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resolvedTab: TabValue =
    initialTab && VALID_TABS.has(initialTab) ? (initialTab as TabValue) : "overview";

  const [activeTab, setActiveTab] = useState<TabValue>(resolvedTab);
  const [showOnboarding, setShowOnboarding] = useState(
    !profile || !profile.onboarding_completed
  );

  // ── Modal state ────────────────────────────────────────────────────────

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  // ── Realtime subscription ──────────────────────────────────────────────

  useFinanceRealtime(() => router.refresh());

  // ── Mutations ──────────────────────────────────────────────────────────

  const mutations = useFinanceMutations(() => router.refresh());

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as TabValue;
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.replace(`/dashboard/finance${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleOnboardingComplete = useCallback(
    (_result: OnboardingResult) => {
      // TODO: POST onboarding result to API, then refresh
      setShowOnboarding(false);
      router.refresh();
    },
    [router]
  );

  // ── Onboarding gate ────────────────────────────────────────────────────

  if (showOnboarding) {
    return (
      <OnboardingWizard
        open
        onComplete={handleOnboardingComplete}
        categories={categories}
      />
    );
  }

  // ── Tab layout ─────────────────────────────────────────────────────────

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full overflow-x-auto justify-start">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          {profile && (
            <OverviewTab
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              budgets={budgets}
              profile={profile}
              timezone={timezone}
              onAddTransaction={() => setShowAddTransaction(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            onRefresh={() => router.refresh()}
            onAddTransaction={() => setShowAddTransaction(true)}
          />
        </TabsContent>

        <TabsContent value="budgets">
          {profile && (
            <BudgetsTab
              budgets={budgets}
              categories={categories}
              profile={profile}
            />
          )}
        </TabsContent>

        <TabsContent value="reports">
          {profile && (
            <ReportsTab
              transactions={transactions}
              categories={categories}
              profile={profile}
              timezone={timezone}
            />
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab
            categories={categories}
            onRefresh={() => router.refresh()}
            onAddCategory={() => setShowEditCategory(true)}
          />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsTab
            accounts={accounts}
            onRefresh={() => router.refresh()}
            onAddAccount={() => setShowCreateAccount(true)}
            onTransfer={() => setShowTransfer(true)}
          />
        </TabsContent>

        <TabsContent value="settings">
          {profile && (
            <SettingsTab
              profile={profile}
              categories={categories}
              onProfileUpdate={() => router.refresh()}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* ── Modals ──────────────────────────────────────────────────────── */}

      <AddTransactionModal
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        categories={categories}
        accounts={accounts}
        onSubmit={(data) =>
          mutations.createTransaction({
            type: data.type,
            amount: data.amount,
            categoryId: data.categoryId,
            accountId: data.accountId,
            description: data.description,
            transactionDate: data.transactionDate,
            tags: data.tags,
          })
        }
      />

      <EditCategoryModal
        open={showEditCategory}
        onOpenChange={setShowEditCategory}
        category={null}
        onSubmit={(data) =>
          mutations.createCategory({
            name: data.name,
            icon: data.icon,
            color: data.color,
            type: data.type,
          })
        }
      />

      <CreateAccountModal
        open={showCreateAccount}
        onOpenChange={setShowCreateAccount}
        onSubmit={(data) =>
          mutations.createAccount({
            name: data.name,
            type: data.type,
            currency: data.currency,
            initialBalance: data.initialBalance,
          })
        }
      />

      <TransferModal
        open={showTransfer}
        onOpenChange={setShowTransfer}
        accounts={accounts}
        onSubmit={(data) =>
          mutations.transferBetweenAccounts({
            fromAccountId: data.fromAccountId,
            toAccountId: data.toAccountId,
            amount: data.amount,
            description: data.description,
          })
        }
      />
    </>
  );
}
