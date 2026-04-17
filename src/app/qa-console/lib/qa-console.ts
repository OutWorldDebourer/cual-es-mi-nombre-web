/**
 * QA Console — tipos y constantes para el dashboard de validación e2e
 *
 * Mapping de los 9 phones de prueba del runbook en
 * `docs/agentes/conversaciones/`. Phones fake nunca llegan a Meta.
 */

export type AgentDomain =
  | "calendar"
  | "orchestrator"
  | "notes"
  | "reminders"
  | "info"
  | "config"
  | "register"
  | "sales"
  | "finance";

export interface PhoneProfile {
  phone: string;
  profileId: string;
  domain: AgentDomain;
  label: string;
  emoji: string;
  isReal: boolean;
  oauthRequired: boolean;
}

export const PHONE_PROFILES: ReadonlyArray<PhoneProfile> = [
  {
    phone: "51942961598",
    profileId: "63a6c466-89e6-4ed0-a03c-c8758d01e372",
    domain: "finance",
    label: "Finanzas",
    emoji: "💰",
    isReal: true,
    oauthRequired: false,
  },
  {
    phone: "51900000001",
    profileId: "e2e90001-0000-4000-8000-519000000001",
    domain: "calendar",
    label: "Calendario",
    emoji: "📅",
    isReal: false,
    oauthRequired: true,
  },
  {
    phone: "51900000002",
    profileId: "e2e90002-0000-4000-8000-519000000002",
    domain: "orchestrator",
    label: "Orquestador",
    emoji: "🎯",
    isReal: false,
    oauthRequired: true,
  },
  {
    phone: "51900000003",
    profileId: "e2e90003-0000-4000-8000-519000000003",
    domain: "notes",
    label: "Notas",
    emoji: "📝",
    isReal: false,
    oauthRequired: false,
  },
  {
    phone: "51900000004",
    profileId: "e2e90004-0000-4000-8000-519000000004",
    domain: "reminders",
    label: "Recordatorios",
    emoji: "⏰",
    isReal: false,
    oauthRequired: false,
  },
  {
    phone: "51900000005",
    profileId: "e2e90005-0000-4000-8000-519000000005",
    domain: "info",
    label: "Información",
    emoji: "💬",
    isReal: false,
    oauthRequired: false,
  },
  {
    phone: "51900000006",
    profileId: "e2e90006-0000-4000-8000-519000000006",
    domain: "config",
    label: "Configuración",
    emoji: "⚙️",
    isReal: false,
    oauthRequired: false,
  },
  {
    phone: "51900000007",
    profileId: "e2e90007-0000-4000-8000-519000000007",
    domain: "register",
    label: "Registro",
    emoji: "🚀",
    isReal: false,
    oauthRequired: false,
  },
  {
    phone: "51900000008",
    profileId: "e2e90008-0000-4000-8000-519000000008",
    domain: "sales",
    label: "Ventas",
    emoji: "🛒",
    isReal: false,
    oauthRequired: false,
  },
];

export const PROFILE_BY_ID = new Map(
  PHONE_PROFILES.map((p) => [p.profileId, p])
);
export const PROFILE_BY_PHONE = new Map(
  PHONE_PROFILES.map((p) => [p.phone, p])
);

export interface ConsoleMessage {
  id: string;
  profileId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  // Cliente-side enriquecimiento
  latencyMs?: number;
  agentUsed?: string;
  intent?: string;
  creditsCost?: number;
}

export interface ColumnMetrics {
  totalMessages: number;
  totalCredits: number;
  avgLatencyMs: number | null;
  p95LatencyMs: number | null;
  lastError: string | null;
}

export function computeMetrics(messages: ConsoleMessage[]): ColumnMetrics {
  const assistant = messages.filter((m) => m.role === "assistant");
  const latencies = assistant
    .map((m) => m.latencyMs)
    .filter((x): x is number => typeof x === "number");
  const totalCredits = assistant.reduce(
    (acc, m) => acc + (m.creditsCost ?? 0),
    0
  );
  const avg =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;
  const sorted = [...latencies].sort((a, b) => a - b);
  const p95Idx = Math.floor(sorted.length * 0.95);
  const p95 = sorted.length > 0 ? sorted[Math.min(p95Idx, sorted.length - 1)] : null;
  return {
    totalMessages: messages.length,
    totalCredits,
    avgLatencyMs: avg,
    p95LatencyMs: p95,
    lastError: null,
  };
}

export function pairLatencies(messages: ConsoleMessage[]): ConsoleMessage[] {
  // Empareja cada assistant con el user inmediatamente anterior y calcula latencyMs.
  const sorted = [...messages].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  let lastUserAt: number | null = null;
  return sorted.map((m) => {
    if (m.role === "user") {
      lastUserAt = new Date(m.createdAt).getTime();
      return m;
    }
    if (m.role === "assistant" && lastUserAt !== null) {
      const latency = new Date(m.createdAt).getTime() - lastUserAt;
      lastUserAt = null;
      return { ...m, latencyMs: latency };
    }
    return m;
  });
}

export const MESSAGE_FETCH_LIMIT = 50;
