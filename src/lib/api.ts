/**
 * Typed REST client for the Vouch / referral-engine backend.
 *
 * All /v1 endpoints require `Authorization: Bearer <supabase_jwt>`.
 * The token is stored in localStorage under `vouch_token` and attached
 * automatically by `api()`.
 */

export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://referral-engine-api.onrender.com';

const TOKEN_KEY = 'vouch_token';

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = opts;
  let url = `${API_BASE}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data as { message?: string; error?: string })?.message ||
      (data as { message?: string; error?: string })?.error ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/* Backend response shapes                                             */
/* ------------------------------------------------------------------ */

export interface ApiWorkspace {
  id: string;
  owner_id: string;
  name: string;
  plan: string;
  notification_prefs: Record<string, boolean> | null;
  created_at: string;
}

export interface ApiMember {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ApiProgramCounts {
  links: number;
  signups: number;
  conversions: number;
}

export interface ApiProgram {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  redirect_url: string | null;
  workspace_id: string;
  owner_id: string;
  attribution_window_days: number;
  attribution_model: string;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  counts: ApiProgramCounts;
}

export interface ApiProgramStats {
  links: number;
  clicks: number;
  signups: number;
  conversions: number;
  attributed_mrr_cents: number;
  rewards_by_status: Record<string, number>;
  rewards_issued_cents: number;
}

export interface ApiTimeseriesPoint {
  date: string;
  clicks: number;
  signups: number;
  conversions: number;
}

export interface ApiActivityItem {
  type: 'signup' | 'conversion' | 'reward_issued' | 'clawback';
  at: string;
  text: string;
  meta: Record<string, unknown>;
}

export interface ApiRuleAction {
  recipient: 'referrer' | 'referee';
  type: 'credit' | 'discount_percent' | 'trial_extension' | 'feature_unlock' | 'cash' | 'webhook';
  amount_cents?: number;
  percent?: number;
  url?: string;
  description?: string;
}

export interface ApiRule {
  id: string;
  program_id: string;
  name: string;
  trigger: 'referee.signup' | 'referee.first_payment' | 'referee.retained_days' | 'referee.upgraded';
  trigger_config: { delay_days?: number; monthly_cap_per_referrer?: number } | null;
  conditions: unknown;
  actions: ApiRuleAction[];
  clawback_days: number;
  priority: number;
  active: boolean;
  created_at: string;
}

export interface ApiLink {
  id: string;
  program_id: string;
  referrer_customer_id: string;
  code: string;
  label: string | null;
  created_at: string;
  counts: { clicks: number; signups: number; paid: number };
}

export interface ApiJourneyEvent {
  id: string;
  type: 'link_created' | 'click' | 'signup' | 'payment' | 'reward_issued' | 'clawback';
  at: string;
  label: string;
}

export interface ApiReward {
  id: string;
  program_id: string;
  conversion_id: string | null;
  rule_id: string | null;
  recipient_type: string;
  recipient_customer_id: string;
  type: string;
  amount_cents: number;
  metadata: Record<string, unknown>;
  status: string;
  issue_at: string | null;
  issued_at: string | null;
  error: string | null;
  created_at: string;
  reward_rules: { name: string } | null;
}

export interface ApiMeta {
  service: string;
  version: string;
  api_base_url: string;
  stripe_configured: boolean;
  webhook_url: string;
}

/* ------------------------------------------------------------------ */
/* Endpoint functions                                                  */
/* ------------------------------------------------------------------ */

export const getMeta = () => api<ApiMeta>('/v1/meta');

export const getMe = () =>
  api<{ workspace: ApiWorkspace; role: string; auth_type: string }>('/v1/workspaces/me');

export const patchMe = (body: { name?: string; notification_prefs?: Record<string, boolean> }) =>
  api<{ workspace: ApiWorkspace }>('/v1/workspaces/me', { method: 'PATCH', body });

export const deleteMe = (name: string) =>
  api<{ deleted: boolean }>('/v1/workspaces/me', { method: 'DELETE', body: { name } });

export const getMembers = () =>
  api<{ members: ApiMember[]; owner: { email: string; role: string; status: string } }>(
    '/v1/workspaces/me/members'
  );

export const inviteMember = (email: string, role: 'admin' | 'viewer') =>
  api<{ member: ApiMember }>('/v1/workspaces/me/members', {
    method: 'POST',
    body: { email, role }
  });

export const removeMember = (id: string) =>
  api<{ removed: boolean }>(`/v1/workspaces/me/members/${id}`, { method: 'DELETE' });

export const listApiKeys = () => api<{ api_keys: ApiKeyRecord[] }>('/v1/api-keys');

export const createApiKey = (name: string) =>
  api<{ api_key: ApiKeyRecord; key: string; warning: string }>('/v1/api-keys', {
    method: 'POST',
    body: { name }
  });

export const revokeApiKey = (id: string) =>
  api<{ revoked: boolean }>(`/v1/api-keys/${id}`, { method: 'DELETE' });

export const listPrograms = () => api<{ programs: ApiProgram[] }>('/v1/programs');

export const createProgram = (body: {
  name: string;
  slug?: string;
  description?: string;
  redirect_url?: string;
  attribution_window_days?: number;
  attribution_model?: string;
}) => api<{ program: ApiProgram }>('/v1/programs', { method: 'POST', body });

export const getProgram = (id: string) => api<{ program: ApiProgram }>(`/v1/programs/${id}`);

export const patchProgram = (
  id: string,
  body: {
    name?: string;
    description?: string;
    redirect_url?: string;
    status?: 'active' | 'paused' | 'archived';
    attribution_window_days?: number;
    attribution_model?: string;
  }
) => api<{ program: ApiProgram }>(`/v1/programs/${id}`, { method: 'PATCH', body });

export const getProgramStats = (id: string) =>
  api<ApiProgramStats>(`/v1/programs/${id}/stats`);

export const getTimeseries = (id: string, days: number) =>
  api<{ series: ApiTimeseriesPoint[] }>(`/v1/programs/${id}/timeseries`, {
    query: { days }
  });

export const getActivity = (id: string) =>
  api<{ activity: ApiActivityItem[] }>(`/v1/programs/${id}/activity`);

export const listRules = (programId: string) =>
  api<{ rules: ApiRule[] }>(`/v1/programs/${programId}/rules`);

export const createRule = (
  programId: string,
  body: {
    name: string;
    trigger: ApiRule['trigger'];
    trigger_config?: { delay_days?: number; monthly_cap_per_referrer?: number };
    conditions?: unknown;
    actions: ApiRuleAction[];
    clawback_days?: number;
    priority?: number;
  }
) => api<{ rule: ApiRule }>(`/v1/programs/${programId}/rules`, { method: 'POST', body });

export const patchRule = (programId: string, ruleId: string, body: Partial<{
  name: string;
  trigger: ApiRule['trigger'];
  trigger_config: { delay_days?: number; monthly_cap_per_referrer?: number };
  conditions: unknown;
  actions: ApiRuleAction[];
  clawback_days: number;
  priority: number;
  active: boolean;
}>) =>
  api<{ rule: ApiRule }>(`/v1/programs/${programId}/rules/${ruleId}`, {
    method: 'PATCH',
    body
  });

export const deleteRule = (programId: string, ruleId: string) =>
  api<{ deleted: boolean }>(`/v1/programs/${programId}/rules/${ruleId}`, { method: 'DELETE' });

export const listLinks = (programId: string) =>
  api<{ links: ApiLink[] }>(`/v1/programs/${programId}/links`);

export const getJourney = (programId: string, linkId: string) =>
  api<{ link: ApiLink; journey: ApiJourneyEvent[] }>(
    `/v1/programs/${programId}/links/${linkId}/journey`
  );

export const createReferralLink = (body: {
  program_id: string;
  referrer_customer_id: string;
  label?: string;
}) => api<{ link: ApiLink; created: boolean }>('/v1/referral-links', { method: 'POST', body });

export const listRewards = (programId: string, status?: 'pending' | 'issued' | 'cancelled' | 'failed') =>
  api<{ rewards: ApiReward[] }>(`/v1/programs/${programId}/rewards`, {
    query: status ? { status } : {}
  });

export const issueReward = (programId: string, rewardId: string) =>
  api<{ reward: ApiReward; note: string }>(`/v1/programs/${programId}/rewards/${rewardId}/issue`, {
    method: 'POST'
  });

export const createAttribution = (body: {
  program_id: string;
  referral_code: string;
  referred_customer_id: string;
  referred_email?: string;
}) => api<{ attribution: unknown; created: boolean }>('/v1/attributions', { method: 'POST', body });
