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
  | "cancelled"
  | "expired";
export type OnboardingStatus =
  | "new"
  | "payment_pending"
  | "payment_confirmed"
  | "name_chosen"
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
  google_token_vault_id: string | null; // non-null = Google connected
  google_calendar_id: string;
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
  started_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  profile_id: string;
  title: string | null;
  content: string;
  tags: string[];
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
