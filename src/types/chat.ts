/**
 * Chat Types — "Cuál es mi nombre" Web
 *
 * Type definitions for the web chat feature, matching the backend
 * `ChatSendResponse` and `ChatHistoryResponse` contracts.
 *
 * @module types/chat
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  /** Client-only: optimistic message not yet confirmed by server */
  isOptimistic?: boolean;
  /** Client-only: error message if send failed */
  error?: string;
}

export interface ChatSendResponse {
  response: string;
  intent: string;
  agent_used: string;
  credits_cost: number;
  credits_remaining: number;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  has_more: boolean;
}
