/**
 * Supabase Database Types — "Cuál es mi nombre" Web
 *
 * Minimal type definitions matching the backend Supabase schema.
 * These types should be kept in sync with the SQL migrations
 * in the backend repo (sql/*.sql).
 *
 * TODO: Generate automatically with `supabase gen types typescript`
 *
 * @module types/database
 */

export type SubscriptionPlan = "free" | "basic" | "pro" | "premium";
export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "pending"
  | "cancelled"
  | "expired";
export type OnboardingStatus =
  | "new"
  | "payment_pending"
  | "payment_confirmed"
  | "name_chosen"
  | "timezone_set"
  | "google_connected"
  | "completed";

export interface Profile {
  id: string; // UUID — matches auth.users.id
  phone_number: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  assistant_name: string;
  timezone: string;
  locale: string;
  onboarding_status: OnboardingStatus;
  plan: SubscriptionPlan; // DB column is "plan", not "subscription_plan"
  credits_remaining: number;
  credits_total: number;
  free_credits_granted_at: string | null;
  free_credits_expires_at: string | null;
  free_pool_exhausted_at: string | null;
  google_token_vault_id: string | null; // non-null = Google connected
  google_calendar_id: string;
  message_wait_seconds: number;
  channel_origin: "whatsapp" | "web" | null;
  is_active: boolean;
  wa_verification_code: string | null;
  wa_verification_expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  mp_preapproval_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type NoteStatus = "active" | "en_curso" | "completed";
export type NotePriority = "urgent" | "high" | "normal" | "low";

export interface Note {
  id: string;
  profile_id: string;
  title: string | null;
  content: string;
  tags: string[];
  status: NoteStatus;
  priority: NotePriority;
  position: string;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type ReminderStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "cancelled";

export interface Reminder {
  id: string;
  profile_id: string;
  content: string;
  trigger_at: string; // UTC timestamp
  original_text: string | null;
  status: ReminderStatus;
  retry_count: number;
  max_retries: number;
  channel: "whatsapp" | "web";
  sent_at: string | null;
  failed_reason: string | null;
  // Recurring fields
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurrence_parent_id: string | null;
  occurrence_number: number;
  created_at: string;
}

export type CreditAction =
  | "message"
  | "calendar_op"
  | "note"
  | "reminder"
  | "audio_transcription"
  | "complex_query"
  | "monthly_reset"
  | "admin_adjustment"
  | "bonus";

export interface CreditTransaction {
  id: string;
  profile_id: string;
  amount: number;
  action: CreditAction;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

// ── Plans / Checkout (Step 9) ──────────────────────────────────────────────

export interface PlanInfo {
  key: string;
  label: string;
  price_pen: number;
  credits_per_month: number;
  description: string;
  features: string[];
  badge: string;
  is_highlighted: boolean;
}

export interface PlansListResponse {
  plans: PlanInfo[];
  currency: string;
  currency_symbol: string;
}

export interface CheckoutPreferenceResponse {
  init_point: string;
  preference_id: string;
}

// ── Subscription management ───────────────────────────────────────────────

export interface CancelSubscriptionResponse {
  status: string;
  grace_ends_at: string;
  message: string;
}

export interface SubscriptionStatusResponse {
  status: string;
  plan: string;
  cancelled_at: string | null;
  grace_ends_at: string | null;
  current_period_end: string | null;
}

// ── Finance Module Types ─────────────────────────────────────────────────

export type IncomeType = "fixed" | "variable" | "mixed";
export type IncomePeriod = "daily" | "weekly" | "biweekly" | "monthly" | "project";
export type SavingsGoalType = "none" | "percentage" | "fixed_amount";
export type BudgetMode = "fixed" | "percentage" | "envelope";
export type AccountType = "cash" | "bank" | "credit_card" | "savings" | "investment";
export type TransactionType = "income" | "expense" | "transfer";
export type CategoryType = "expense" | "income" | "transfer";
export type TransactionSource = "whatsapp" | "web" | "auto" | "recurring";
export type TransactionStatus = "confirmed" | "pending_review";
export type BudgetPeriod = "weekly" | "biweekly" | "monthly" | "yearly";

export interface FinanceProfile {
  profile_id: string;
  income_type: IncomeType;
  income_period: IncomePeriod;
  fixed_income_amount: number | null;
  pay_day: number | null;
  savings_goal_type: SavingsGoalType;
  savings_goal_value: number | null;
  budget_mode: BudgetMode;
  default_currency: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceCategory {
  id: string;
  profile_id: string | null;
  parent_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  sort_order: number;
  show_in_quick_entry: boolean;
  usage_count: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceAccount {
  id: string;
  profile_id: string;
  name: string;
  type: AccountType;
  currency: string;
  initial_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceTransaction {
  id: string;
  profile_id: string;
  account_id: string | null;
  category_id: string | null;
  parent_transaction_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  transaction_date: string;
  tags: string[];
  is_recurring: boolean;
  recurrence_rule: string | null;
  source: TransactionSource;
  status: TransactionStatus;
  original_message: string | null;
  confidence: number | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceBudget {
  id: string;
  profile_id: string;
  category_id: string | null;
  budget_mode: BudgetMode;
  amount_limit: number | null;
  percentage: number | null;
  envelope_assigned: number | null;
  period: BudgetPeriod;
  rollover: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceCategoryRule {
  id: string;
  profile_id: string;
  pattern: string;
  original_category_id: string | null;
  corrected_category_id: string | null;
  correction_count: number;
  created_at: string;
}
