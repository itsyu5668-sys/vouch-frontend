export type ScreenMode =
  | 'landing'
  | 'privacy'
  | 'terms'
  | 'signin'
  | 'signup'
  | 'reset'
  | 'verify'
  | 'onboarding'
  | 'dashboard';

export type DashboardTab =
  | 'overview'
  | 'programs'
  | 'rules'
  | 'links'
  | 'rewards'
  | 'api'
  | 'settings';

export interface Program {
  id: string;
  name: string;
  slug: string;
  description?: string;
  redirectUrl: string;
  status: 'Active' | 'Paused';
  linksCount: number;
  clicksCount: number;
  signupsCount: number;
  paidCount: number;
  revenueAttributed: number;
  createdAt: string;
  clawbackDays: number;
  defaultReward: string;
}

export interface RewardRule {
  id: string;
  programId: string;
  name: string;
  trigger: 'signup' | 'payment';
  whoGetsRewarded: 'both' | 'referrer';
  rewardType: 'Account credit' | 'Coupon' | 'Cash payout' | 'Webhook' | 'Feature unlock';
  referrerAmount: string;
  refereeAmount: string;
  delayDays: number;
  clawbackDays: number;
  conditions: string[];
  status: 'active' | 'inactive';
}

export interface JourneyEvent {
  id: string;
  type: 'click' | 'signup' | 'payment' | 'reward_issued' | 'clawback' | 'link_created';
  timestamp: string;
  label: string;
  details?: string;
}

export interface ReferralLink {
  id: string;
  code: string;
  url: string;
  userId: string;
  email: string;
  programId: string;
  clicks: number;
  signups: number;
  paid: number;
  createdAt: string;
  status: 'Active' | 'Deactivated';
  campaign?: string;
  journey: JourneyEvent[];
}

export interface RewardItem {
  id: string;
  rewardCode: string;
  referrer: string;
  type: 'Credit' | 'Coupon' | 'Cash' | 'Webhook';
  amount: number;
  triggerEvent: string;
  status: 'Pending' | 'Issued' | 'Clawed back';
  issueDate: string;
  clawbackReason?: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  fullKey?: string;
  createdAt: string;
  lastUsed: string;
}

export interface WebhookEventItem {
  id: string;
  eventType: string;
  receivedAt: string;
  status: 'Processed' | 'Failed';
  payloadSummary: string;
}

export interface TeamMember {
  id: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Viewer';
  joinedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'reward' | 'clawback' | 'limit' | 'system';
}

export interface WorkspaceState {
  name: string;
  website: string;
  signupUrl: string;
  contactEmail: string;
  isTestMode: boolean;
  plan: 'Free' | 'Launch' | 'Growth' | 'Pro';
  usageRevenue: number;
  maxRevenue: number;
  apiKey: string;
}
