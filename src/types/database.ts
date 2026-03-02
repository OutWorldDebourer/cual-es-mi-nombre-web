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
  | "active"
  | "cancelled"
  | "expired"
  | "pending";
export type OnboardingStatus = "new" | "in_progress" | "completed";

export interface Profile {
  id: string; // UUID — matches auth.users.id
  phone_number: string | null;
  assistant_name: string;
  timezone: string;
  locale: string;
  onboarding_status: OnboardingStatus;
  subscription_plan: SubscriptionPlan;
  credits_remaining: number;
  google_calendar_connected: boolean;
  vault_secret_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  mp_preapproval_id: string | null;
  started_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  profile_id: string;
  title: string;
  remind_at: string; // UTC timestamp
  is_sent: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  profile_id: string;
  amount: number;
  operation: "deduct" | "add" | "reset";
  reason: string;
  created_at: string;
}
