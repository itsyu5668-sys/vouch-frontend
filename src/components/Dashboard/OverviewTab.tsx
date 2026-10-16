import React, { useState, useEffect } from 'react';
import {
  Program,
  DashboardTab,
  WorkspaceState
} from '../../types';
import { SelectDropdown } from '../ui/SelectDropdown';
import {
  getProgramStats,
  getTimeseries,
  getActivity,
  listLinks,
  listRules
} from '../../lib/api';
import {
  mapLink,
  mapActivityToFeed,
  mapRule,
  ActivityFeedItem,
  formatDate
} from '../../lib/mappers';
import {
  TrendingUp,
  Users,
  DollarSign,
  Gift,
  MousePointerClick,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface OverviewTabProps {
  workspace: WorkspaceState;
  programs: Program[];
  onNavigateTab: (tab: DashboardTab) => void;
}

interface KpiData {
  clicks: number;
  signups: number;
  conversions: number;
  rewardsIssuedCents: number;
  attributedMrrCents: number;
}

interface ChartPoint {
  label: string;
  clicks: number;
  signups: number;
  paid: number;
}

interface TopReferrerRow {
  rank: number;
  user: string;
  clicks: number;
  signups: number;
  paid: number;
  revenue: string;
}

const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-4 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
    <AlertCircle className="w-4 h-4 shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="font-semibold underline hover:no-underline shrink-0">
        Retry
      </button>
    )}
  </div>
);

export const OverviewTab: React.FC<OverviewTabProps> = ({
  workspace,
  programs,
  onNavigateTab
}) => {
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedSeries, setSelectedSeries] = useState<'all' | 'clicks' | 'signups' | 'paid'>('all');
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpis, setKpis] = useState<KpiData>({ clicks: 0, signups: 0, conversions: 0, rewardsIssuedCents: 0, attributedMrrCents: 0 });
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [sparkClicks, setSparkClicks] = useState<number[]>([0]);
  const [topReferrers, setTopReferrers] = useState<TopReferrerRow[]>([]);
  const [activity, setActivity] = useState<ActivityFeedItem[]>([]);
  const [checklist, setChecklist] = useState({ programs: false, rules: false, links: false, clicks: false });
  const [reloadKey, setReloadKey] = useState(0);

  const days = chartRange === '7d' ? 7 : chartRange === '30d' ? 30 : 90;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const selected = selectedProgramId === 'all'
          ? programs
          : programs.filter((p) => p.id === selectedProgramId);
        if (selected.length === 0) {
          if (!cancelled) {
            setKpis({ clicks: 0, signups: 0, conversions: 0, rewardsIssuedCents: 0, attributedMrrCents: 0 });
            setChartPoints([]);
            setTopReferrers([]);
            setActivity([]);
            setChecklist({ programs: programs.length > 0, rules: false, links: false, clicks: false });
            setLoading(false);
          }
          return;
        }

        const [statsList, seriesList, activityList, linksList, rulesList] = await Promise.all([
          Promise.all(selected.map((p) => getProgramStats(p.id).catch(() => null))),
          Promise.all(selected.map((p) => getTimeseries(p.id, days).catch(() => ({ series: [] })))),
          Promise.all(selected.map((p) => getActivity(p.id).catch(() => ({ activity: [] })))),
          Promise.all(
            selected.map(async (p) => {
              try {
                const { links } = await listLinks(p.id);
                return links.map((l) => mapLink(l, p.redirectUrl));
              } catch {
                return [];
              }
            })
          ),
          Promise.all(
            selected.map(async (p) => {
              try {
                const { rules } = await listRules(p.id);
                return rules.map(mapRule);
              } catch {
                return [];
              }
            })
          )
        ]);
        if (cancelled) return;

        // KPIs: sum across selected programs
        const total: KpiData = { clicks: 0, signups: 0, conversions: 0, rewardsIssuedCents: 0, attributedMrrCents: 0 };
        for (const s of statsList) {
          if (!s) continue;
          total.clicks += s.clicks ?? 0;
          total.signups += s.signups ?? 0;
          total.conversions += s.conversions ?? 0;
          total.rewardsIssuedCents += s.rewards_issued_cents ?? 0;
          total.attributedMrrCents += s.attributed_mrr_cents ?? 0;
        }
        setKpis(total);

        // Chart: aggregate series by date across programs
        const byDate = new Map<string, { clicks: number; signups: number; paid: number }>();
        for (const { series } of seriesList) {
          for (const pt of series) {
            const cur = byDate.get(pt.date) ?? { clicks: 0, signups: 0, paid: 0 };
            cur.clicks += pt.clicks;
            cur.signups += pt.signups;
            cur.paid += pt.conversions;
            byDate.set(pt.date, cur);
          }
        }
        const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        const points: ChartPoint[] = sorted.map(([date, v]) => ({
          label: formatDate(date),
          clicks: v.clicks,
          signups: v.signups,
          paid: v.paid
        }));
        setChartPoints(points);
        setSparkClicks(points.length > 0 ? points.map((p) => p.clicks) : [0]);

        // Top referrers: links sorted by paid desc
        const allLinks = linksList.flat();
        const top = [...allLinks]
          .sort((a, b) => b.paid - a.paid)
          .slice(0, 10)
          .map((l, i) => ({
            rank: i + 1,
            user: l.userId,
            clicks: l.clicks,
            signups: l.signups,
            paid: l.paid,
            revenue: '—'
          }));
        setTopReferrers(top);

        // Recent activity: merged + sorted desc
        const feed = activityList
          .flatMap((r) => r.activity)
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
          .slice(0, 12)
          .map((a, i) => mapActivityToFeed(a, i));
        setActivity(feed);

        setChecklist({
          programs: programs.length > 0,
          rules: rulesList.flat().length > 0,
          links: allLinks.length > 0,
          clicks: total.clicks > 0
        });
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load overview data.');
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [programs, selectedProgramId, days, reloadKey]);

  // Sparkline generator helper
  const renderSparkline = (points: number[], color: string) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const path = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1 || 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const maxVal = Math.max(1, ...chartPoints.map((p) => p.clicks));

  const kpiCards = [
    { label: 'Total clicks', value: kpis.clicks.toLocaleString() },
    { label: 'Referred signups', value: kpis.signups.toLocaleString() },
    { label: 'Paid conversions', value: kpis.conversions.toLocaleString() },
    { label: 'Rewards issued', value: `$${Math.round(kpis.rewardsIssuedCents / 100).toLocaleString()}` },
    { label: 'Attributed revenue', value: `$${Math.round(kpis.attributedMrrCents / 100).toLocaleString()}` }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Program filter */}
      {programs.length > 1 && (
        <div className="flex items-center justify-end">
          <SelectDropdown
            value={selectedProgramId}
            onChange={setSelectedProgramId}
            options={[
              { value: 'all', label: `All programs (${programs.length})` },
              ...programs.map((p) => ({ value: p.id, label: p.name }))
            ]}
          />
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {loading ? (
        <div className="bg-white rounded-[18px] p-12 text-center border border-[#bebecc]/40">
          <div className="text-[14px] text-[#60606c]">Loading overview…</div>
        </div>
      ) : (
        <>
          {/* 1. GETTING STARTED CHECKLIST (Dismissible) */}
          {!checklistDismissed && (
            <div className="bg-[#f5f5f5] rounded-[18px] p-6 border border-black/[0.04] relative">
              <button
                onClick={() => setChecklistDismissed(true)}
                className="absolute top-4 right-4 text-[#8b8b8b] hover:text-[#070709] transition-colors p-1"
                title="Dismiss checklist"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#2597d0]" />
                <h3 className="text-[15px] font-bold text-[#070709] tracking-tight">
                  Getting-started checklist
                </h3>
              </div>
              <p className="text-[13px] text-[#60606c] mb-4">
                Complete these four quick steps to maximize conversion across your user base.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Create a program', done: checklist.programs, tab: 'programs' as DashboardTab },
                  { label: 'Add a reward rule', done: checklist.rules, tab: 'rules' as DashboardTab },
                  { label: 'Generate your first link', done: checklist.links, tab: 'links' as DashboardTab },
                  { label: 'Record a test click', done: checklist.clicks, tab: 'api' as DashboardTab }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateTab(item.tab)}
                    className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-[#bebecc]/40 hover:border-[#070709] text-left transition-all"
                  >
                    <div className="flex items-center gap-2 text-[13px] font-medium text-[#070709]">
                      <CheckCircle2
                        className={`w-4 h-4 ${item.done ? 'text-[#2597d0]' : 'text-slate-300'}`}
                      />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8b8b8b]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. KPI CARDS ROW (5 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-[18px] p-5 border border-[#bebecc]/40 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-[12px] text-[#60606c] font-medium mb-1">{card.label}</div>
                  <div className="text-[26px] font-bold text-[#070709] tracking-tight tabular-nums">
                    {card.value}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  {renderSparkline(sparkClicks, '#2597d0')}
                </div>
              </div>
            ))}
          </div>

          {/* 3. CHART: REFERRALS OVER TIME */}
          <div className="bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
                  Referrals over time
                </h3>
                <p className="text-[12px] text-[#60606c]">
                  Interactive breakdown of clicks, signups, and paid customer attributions
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Series Toggle */}
                <div className="flex items-center gap-1 bg-[#f5f5f5] p-1 rounded-full text-xs">
                  {(['all', 'clicks', 'signups', 'paid'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeries(s)}
                      className={`px-3 py-1 rounded-full capitalize transition-all ${
                        selectedSeries === s
                          ? 'bg-white text-[#070709] font-semibold shadow-sm'
                          : 'text-[#60606c] hover:text-[#070709]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-1 bg-[#f5f5f5] p-1 rounded-full text-xs">
                  {(['7d', '30d', '90d'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-2.5 py-1 rounded-full transition-all ${
                        chartRange === r
                          ? 'bg-[#070709] text-white font-medium'
                          : 'text-[#60606c] hover:text-[#070709]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {chartPoints.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#8b8b8b]">
                No referral data in this range yet.
              </div>
            ) : (
              <>
                {/* Visual Bar / Line Visualization */}
                <div className="h-48 flex items-end gap-3 sm:gap-6 pt-4 border-b border-slate-100">
                  {chartPoints.map((p, idx) => {
                    const clickH = (p.clicks / maxVal) * 100;
                    const signupH = ((p.signups * 3.5) / maxVal) * 100;
                    const paidH = ((p.paid * 20) / maxVal) * 100;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#070709] text-white text-[11px] rounded-lg py-1 px-2 pointer-events-none whitespace-nowrap z-10 font-mono">
                          Clicks: {p.clicks} · Signups: {p.signups} · Paid: {p.paid}
                        </div>

                        <div className="w-full flex items-end justify-center gap-1 h-36">
                          {(selectedSeries === 'all' || selectedSeries === 'clicks') && (
                            <div
                              style={{ height: `${Math.max(clickH, 6)}%` }}
                              className="w-3 sm:w-4 rounded-t-sm bg-[#d7e6f5] group-hover:bg-[#9abfda] transition-all"
                            />
                          )}
                          {(selectedSeries === 'all' || selectedSeries === 'signups') && (
                            <div
                              style={{ height: `${Math.max(signupH, 8)}%` }}
                              className="w-3 sm:w-4 rounded-t-sm bg-[#779bc1] group-hover:bg-[#5f87b0] transition-all"
                            />
                          )}
                          {(selectedSeries === 'all' || selectedSeries === 'paid') && (
                            <div
                              style={{ height: `${Math.max(paidH, 10)}%` }}
                              className="w-3 sm:w-4 rounded-t-sm bg-[#2597d0] group-hover:bg-[#1d7fad] transition-all"
                            />
                          )}
                        </div>

                        <span className="text-[11px] text-[#8b8b8b] font-medium">
                          {p.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-5 mt-4 text-xs text-[#60606c]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#d7e6f5]" />
                    <span>Clicks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#779bc1]" />
                    <span>Signups</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#2597d0]" />
                    <span>Paid conversions</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 4. TWO-COLUMN SPLIT: TOP REFERRERS & RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Referrers Table */}
            <div className="lg:col-span-7 bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
                    Top referrers
                  </h3>
                  <button
                    onClick={() => onNavigateTab('links')}
                    className="text-xs font-medium text-[#2597d0] hover:underline"
                  >
                    View all
                  </button>
                </div>

                {topReferrers.length === 0 ? (
                  <div className="py-10 text-center text-[13px] text-[#8b8b8b]">
                    No referrers yet — generate a link to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#8b8b8b] font-medium text-[11px] uppercase tracking-wider">
                          <th className="pb-2.5">Rank</th>
                          <th className="pb-2.5">Referrer</th>
                          <th className="pb-2.5 text-right">Clicks</th>
                          <th className="pb-2.5 text-right">Signups</th>
                          <th className="pb-2.5 text-right">Paid</th>
                          <th className="pb-2.5 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topReferrers.map((row) => (
                          <tr key={row.rank} className="hover:bg-[#f5f5f5]/60 transition-colors">
                            <td className="py-3 font-mono text-[#8b8b8b]">#{row.rank}</td>
                            <td className="py-3 font-medium text-[#070709] max-w-[180px] truncate">
                              {row.user}
                            </td>
                            <td className="py-3 text-right tabular-nums text-[#60606c]">{row.clicks}</td>
                            <td className="py-3 text-right tabular-nums text-[#60606c]">{row.signups}</td>
                            <td className="py-3 text-right tabular-nums font-semibold text-[#070709]">{row.paid}</td>
                            <td className="py-3 text-right tabular-nums font-semibold text-[#2597d0]">{row.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="lg:col-span-5 bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
                  Recent activity
                </h3>
                <span className="text-[11px] text-[#8b8b8b] font-medium">Live feed</span>
              </div>

              {activity.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-[#8b8b8b]">
                  No activity yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-[13px]">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          item.type === 'reward'
                            ? 'bg-[#2597d0]'
                            : item.type === 'clawback'
                            ? 'bg-amber-500'
                            : 'bg-[#070709]'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-[#070709] font-medium leading-snug">
                          {item.text}
                        </p>
                        <span className="text-[11px] text-[#8b8b8b] mt-0.5 block">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
