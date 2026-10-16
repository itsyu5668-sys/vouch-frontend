/**
 * Backend <-> frontend normalizations.
 * Display types live in src/types; backend shapes live in src/lib/api.
 */
import { API_BASE } from './api';
import type {
  ApiProgram,
  ApiRule,
  ApiRuleAction,
  ApiLink,
  ApiJourneyEvent,
  ApiReward,
  ApiKeyRecord,
  ApiMember,
  ApiActivityItem,
  ApiWorkspace
} from './api';
import type {
  Program,
  RewardRule,
  ReferralLink,
  JourneyEvent,
  RewardItem,
  ApiKeyItem,
  TeamMember,
  NotificationItem,
  WorkspaceState
} from '../types';

/* ---------------- formatting helpers ---------------- */

export function centsToDisplay(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toLocaleString()}`
    : `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Parse "$20", "20", "$20.50" -> 2000 / 2000 / 2050 (cents). */
export function parseDollarsToCents(input: string): number {
  const n = parseFloat(String(input).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Parse "20", "$20" -> 20 (number, used for coupon percent). */
export function parseNumber(input: string): number {
  const n = parseFloat(String(input).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString();
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return String(iso);
  const diff = Date.now() - d;
  if (diff < 0) return formatDate(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(iso);
}

/** "14 days" -> 14 ; "No clawback" -> 0 */
export function parseDays(input: string): number {
  if (/no/i.test(input)) return 0;
  const n = parseInt(String(input).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/* ---------------- workspace / plan ---------------- */

const PLAN_LABELS: Record<string, WorkspaceState['plan']> = {
  free: 'Free',
  launch: 'Launch',
  growth: 'Growth',
  pro: 'Pro'
};

export function mapPlan(plan: string): WorkspaceState['plan'] {
  return PLAN_LABELS[String(plan).toLowerCase()] ?? 'Free';
}

export const PLAN_PRICE_LABEL: Record<WorkspaceState['plan'], string> = {
  Free: 'Free — $0/mo',
  Launch: 'Launch — $19/mo',
  Growth: 'Growth — $59/mo',
  Pro: 'Pro — $149/mo'
};

export const PLAN_REVENUE_LIMITS: Record<WorkspaceState['plan'], number> = {
  Free: 500,
  Launch: 3000,
  Growth: 15000,
  Pro: 50000
};

export function mapWorkspace(ws: ApiWorkspace, contactEmail: string): WorkspaceState {
  const plan = mapPlan(ws.plan);
  return {
    name: ws.name,
    website: '',
    signupUrl: '',
    contactEmail,
    isTestMode: false,
    plan,
    usageRevenue: 0,
    maxRevenue: PLAN_REVENUE_LIMITS[plan],
    apiKey: ''
  };
}

/* ---------------- programs ---------------- */

export function mapProgram(p: ApiProgram): Program {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? '',
    redirectUrl: p.redirect_url ?? '',
    status: p.status === 'paused' ? 'Paused' : 'Active',
    linksCount: p.counts?.links ?? 0,
    clicksCount: 0, // overlaid from /stats where available
    signupsCount: p.counts?.signups ?? 0,
    paidCount: p.counts?.conversions ?? 0,
    revenueAttributed: 0, // overlaid from /stats where available
    createdAt: formatDate(p.created_at),
    clawbackDays: 14,
    defaultReward: ''
  };
}

export function referralUrl(code: string, redirectUrl: string): string {
  return `${API_BASE}/r/${code}?to=${encodeURIComponent(redirectUrl || '')}`;
}

/* ---------------- rules ---------------- */

function actionAmountDisplay(a: ApiRuleAction): string {
  switch (a.type) {
    case 'credit':
    case 'cash':
      return centsToDisplay(a.amount_cents ?? 0);
    case 'discount_percent':
      return `$${a.percent ?? 0}`;
    case 'feature_unlock':
    case 'trial_extension':
      return a.description ?? '—';
    case 'webhook':
      return '—';
    default:
      return '—';
  }
}

function mapActionTypeToDisplay(t: ApiRuleAction['type']): RewardRule['rewardType'] {
  switch (t) {
    case 'credit':
      return 'Account credit';
    case 'discount_percent':
      return 'Coupon';
    case 'cash':
      return 'Cash payout';
    case 'webhook':
      return 'Webhook';
    case 'feature_unlock':
    case 'trial_extension':
      return 'Feature unlock';
    default:
      return 'Account credit';
  }
}

function mapTriggerToDisplay(
  t: ApiRule['trigger']
): RewardRule['trigger'] {
  switch (t) {
    case 'referee.signup':
    case 'referee.retained_days':
      return 'signup';
    case 'referee.first_payment':
    case 'referee.upgraded':
      return 'payment';
    default:
      return 'signup';
  }
}

function mapConditionsToDisplay(conditions: unknown): string[] {
  if (!conditions) return [];
  if (Array.isArray(conditions)) {
    return conditions
      .map((c) => {
        if (typeof c === 'string') return c;
        if (c && typeof c === 'object') {
          const o = c as Record<string, unknown>;
          const label = o.label ?? o.text ?? o.description ?? o.value;
          return typeof label === 'string' ? label : JSON.stringify(c);
        }
        return String(c);
      })
      .filter(Boolean);
  }
  if (typeof conditions === 'string') return [conditions];
  return [];
}

export function mapRule(r: ApiRule): RewardRule {
  const referrerAction =
    r.actions?.find((a) => a.recipient === 'referrer') ?? r.actions?.[0];
  const refereeAction = r.actions?.find((a) => a.recipient === 'referee');
  const primary = referrerAction;
  return {
    id: r.id,
    programId: r.program_id,
    name: r.name,
    trigger: mapTriggerToDisplay(r.trigger),
    whoGetsRewarded: referrerAction && refereeAction ? 'both' : 'referrer',
    rewardType: primary ? mapActionTypeToDisplay(primary.type) : 'Account credit',
    referrerAmount: referrerAction ? actionAmountDisplay(referrerAction) : '$0',
    refereeAmount: refereeAction ? actionAmountDisplay(refereeAction) : '$0',
    delayDays: r.trigger_config?.delay_days ?? 0,
    clawbackDays: r.clawback_days ?? 0,
    conditions: mapConditionsToDisplay(r.conditions),
    status: r.active ? 'active' : 'inactive'
  };
}

/** Build the backend actions array from the dashboard rule form fields. */
export function buildRuleActions(opts: {
  whoGetsRewarded: 'both' | 'referrer';
  rewardType: RewardRule['rewardType'];
  referrerAmount: string;
  refereeAmount: string;
  webhookUrl?: string;
  description?: string;
}): ApiRuleAction[] {
  const recipients: Array<'referrer' | 'referee'> =
    opts.whoGetsRewarded === 'both' ? ['referrer', 'referee'] : ['referrer'];
  return recipients.map((recipient) => {
    const amountStr = recipient === 'referrer' ? opts.referrerAmount : opts.refereeAmount;
    switch (opts.rewardType) {
      case 'Account credit':
        return { recipient, type: 'credit' as const, amount_cents: parseDollarsToCents(amountStr) };
      case 'Coupon':
        return {
          recipient,
          type: 'discount_percent' as const,
          percent: parseNumber(amountStr),
          amount_cents: 0
        };
      case 'Cash payout':
        return { recipient, type: 'cash' as const, amount_cents: parseDollarsToCents(amountStr) };
      case 'Webhook':
        return { recipient, type: 'webhook' as const, url: opts.webhookUrl || undefined };
      case 'Feature unlock':
        return {
          recipient,
          type: 'feature_unlock' as const,
          description: opts.description || 'Feature unlock reward'
        };
      default:
        return { recipient, type: 'credit' as const, amount_cents: parseDollarsToCents(amountStr) };
    }
  });
}

export function autoRuleName(opts: {
  whoGetsRewarded: 'both' | 'referrer';
  rewardType: RewardRule['rewardType'];
  trigger: 'signup' | 'payment';
}): string {
  const side = opts.whoGetsRewarded === 'both' ? 'Double-sided' : 'Referrer-only';
  const when = opts.trigger === 'payment' ? 'first payment' : 'signup';
  return `${side} ${opts.rewardType.toLowerCase()} on ${when}`;
}

/* ---------------- links ---------------- */

export function mapLink(l: ApiLink, redirectUrl: string): ReferralLink {
  return {
    id: l.id,
    code: l.code,
    url: referralUrl(l.code, redirectUrl),
    userId: l.referrer_customer_id,
    email: l.referrer_customer_id,
    programId: l.program_id,
    clicks: l.counts?.clicks ?? 0,
    signups: l.counts?.signups ?? 0,
    paid: l.counts?.paid ?? 0,
    createdAt: formatDate(l.created_at),
    status: 'Active',
    campaign: l.label ?? undefined,
    journey: []
  };
}

const JOURNEY_TYPE_MAP: Record<ApiJourneyEvent['type'], JourneyEvent['type']> = {
  link_created: 'link_created',
  click: 'click',
  signup: 'signup',
  payment: 'payment',
  reward_issued: 'reward_issued',
  clawback: 'clawback'
};

export function mapJourneyEvent(e: ApiJourneyEvent): JourneyEvent {
  return {
    id: e.id,
    type: JOURNEY_TYPE_MAP[e.type] ?? 'click',
    timestamp: relativeTime(e.at),
    label: e.label
  };
}

/* ---------------- rewards ---------------- */

function mapRewardType(t: string): RewardItem['type'] {
  switch (t) {
    case 'credit':
      return 'Credit';
    case 'discount_percent':
      return 'Coupon';
    case 'cash':
      return 'Cash';
    case 'webhook':
      return 'Webhook';
    default:
      return 'Credit';
  }
}

function mapRewardStatus(s: string): RewardItem['status'] {
  switch (s) {
    case 'pending':
      return 'Pending';
    case 'issued':
      return 'Issued';
    case 'cancelled':
      return 'Clawed back';
    case 'failed':
      return 'Pending';
    default:
      return 'Pending';
  }
}

export function mapReward(r: ApiReward): RewardItem {
  const status = mapRewardStatus(r.status);
  let issueDate: string;
  let clawbackReason: string | undefined;
  if (status === 'Issued') {
    issueDate = `Issued ${formatDate(r.issued_at ?? r.created_at)}`;
  } else if (status === 'Clawed back') {
    issueDate = '';
    clawbackReason = (r.error as string) || 'Clawed back';
  } else if (r.status === 'failed') {
    issueDate = (r.error as string) || 'Failed — will retry';
  } else {
    issueDate = r.issue_at ? `Issues ${relativeTime(r.issue_at)}` : 'Scheduled';
  }
  return {
    id: r.id,
    rewardCode: r.id,
    referrer: r.recipient_customer_id,
    type: mapRewardType(r.type),
    amount: Math.round((r.amount_cents / 100) * 100) / 100,
    triggerEvent: r.reward_rules?.name ?? mapRewardType(r.type),
    status,
    issueDate,
    clawbackReason
  };
}

/* ---------------- api keys / members / activity ---------------- */

export function mapApiKey(k: ApiKeyRecord): ApiKeyItem {
  return {
    id: k.id,
    name: k.name,
    prefix: k.key_prefix,
    createdAt: formatDate(k.created_at),
    lastUsed: k.last_used_at ? relativeTime(k.last_used_at) : 'Never'
  };
}

function mapMemberRole(role: string): TeamMember['role'] {
  switch (String(role).toLowerCase()) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    default:
      return 'Viewer';
  }
}

export function mapMember(m: ApiMember): TeamMember {
  return {
    id: m.id,
    email: m.email,
    role: mapMemberRole(m.role),
    joinedAt: formatDate(m.created_at)
  };
}

export function mapOwnerToMember(owner: { email: string; role: string; status: string }): TeamMember {
  return {
    id: 'owner',
    email: owner.email,
    role: 'Owner',
    joinedAt: '—'
  };
}

function mapActivityType(t: ApiActivityItem['type']): NotificationItem['type'] {
  switch (t) {
    case 'reward_issued':
      return 'reward';
    case 'clawback':
      return 'clawback';
    default:
      return 'system';
  }
}

export function mapActivityToNotification(a: ApiActivityItem, index: number): NotificationItem {
  return {
    id: `${a.type}-${a.at}-${index}`,
    title: a.text,
    description: '',
    time: relativeTime(a.at),
    read: false,
    type: mapActivityType(a.type)
  };
}

export interface ActivityFeedItem {
  id: string;
  text: string;
  time: string;
  type: string;
}

export function mapActivityToFeed(a: ApiActivityItem, index: number): ActivityFeedItem {
  const type =
    a.type === 'reward_issued'
      ? 'reward'
      : a.type === 'clawback'
        ? 'clawback'
        : a.type === 'conversion'
          ? 'conversion'
          : 'signup';
  return {
    id: `${a.type}-${a.at}-${index}`,
    text: a.text,
    time: relativeTime(a.at),
    type
  };
}
