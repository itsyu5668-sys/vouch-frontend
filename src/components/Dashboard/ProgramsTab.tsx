import React, { useState, useEffect } from 'react';
import { Program, RewardRule, ReferralLink } from '../../types';
import { getProgramStats, listRules, listLinks } from '../../lib/api';
import { mapRule, mapLink } from '../../lib/mappers';
import {
  Plus,
  MoreVertical,
  Check,
  Pause,
  Play,
  ArrowRight,
  ExternalLink,
  Archive,
  Edit2,
  X,
  Layers,
  AlertCircle
} from 'lucide-react';

interface ProgramsTabProps {
  programs: Program[];
  onAddProgram: (data: {
    name: string;
    slug?: string;
    description?: string;
    redirect_url?: string;
  }) => Promise<Program>;
  onUpdateProgram: (
    id: string,
    data: { name?: string; description?: string; redirect_url?: string; status?: 'active' | 'paused' }
  ) => Promise<void>;
  onArchiveProgram: (id: string) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
}

interface ProgramStats {
  clicks: number;
  revenue: number;
}

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
    <AlertCircle className="w-4 h-4 shrink-0" />
    {message}
  </div>
);

export const ProgramsTab: React.FC<ProgramsTabProps> = ({
  programs,
  onAddProgram,
  onUpdateProgram,
  onArchiveProgram,
  onToggleStatus
}) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programDetailTab, setProgramDetailTab] = useState<'rules' | 'links' | 'settings'>('rules');

  // New program form state
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRedirect, setNewRedirect] = useState('');
  const [newStatus, setNewStatus] = useState<'Active' | 'Paused'>('Active');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Live stats overlay (clicks + revenue come from /stats)
  const [statsMap, setStatsMap] = useState<Record<string, ProgramStats>>({});

  // Detail modal live data
  const [detailRules, setDetailRules] = useState<RewardRule[]>([]);
  const [detailLinks, setDetailLinks] = useState<ReferralLink[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const entries = await Promise.all(
        programs.map(async (p) => {
          try {
            const s = await getProgramStats(p.id);
            return [p.id, { clicks: s.clicks ?? 0, revenue: Math.round((s.attributed_mrr_cents ?? 0) / 100) }] as const;
          } catch {
            return [p.id, { clicks: 0, revenue: 0 }] as const;
          }
        })
      );
      if (!cancelled) setStatsMap(Object.fromEntries(entries));
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [programs]);

  // Load rules + links when a program detail modal opens
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!selectedProgram) {
        setDetailRules([]);
        setDetailLinks([]);
        return;
      }
      setDetailLoading(true);
      try {
        const [{ rules }, { links }] = await Promise.all([
          listRules(selectedProgram.id).catch(() => ({ rules: [] })),
          listLinks(selectedProgram.id).catch(() => ({ links: [] }))
        ]);
        if (cancelled) return;
        setDetailRules(rules.map(mapRule));
        setDetailLinks(links.map((l) => mapLink(l, selectedProgram.redirectUrl)));
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedProgram]);

  const statsFor = (p: Program): ProgramStats =>
    statsMap[p.id] ?? { clicks: p.clicksCount, revenue: p.revenueAttributed };

  const handleOpenNewModal = (progToEdit?: Program) => {
    if (progToEdit) {
      setEditingProgram(progToEdit);
      setNewName(progToEdit.name);
      setNewSlug(progToEdit.slug);
      setNewDesc(progToEdit.description || '');
      setNewRedirect(progToEdit.redirectUrl);
      setNewStatus(progToEdit.status);
    } else {
      setEditingProgram(null);
      setNewName('');
      setNewSlug('');
      setNewDesc('');
      setNewRedirect('');
      setNewStatus('Active');
    }
    setModalError('');
    setShowNewModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const slug = newSlug || newName.toLowerCase().replace(/\s+/g, '-');
      if (editingProgram) {
        await onUpdateProgram(editingProgram.id, {
          name: newName,
          description: newDesc,
          redirect_url: newRedirect,
          status: newStatus === 'Active' ? 'active' : 'paused'
        });
        if (selectedProgram?.id === editingProgram.id) {
          setSelectedProgram({ ...selectedProgram, name: newName, slug, description: newDesc, redirectUrl: newRedirect, status: newStatus });
        }
      } else {
        const created = await onAddProgram({
          name: newName,
          slug,
          description: newDesc,
          redirect_url: newRedirect
        });
        if (newStatus === 'Paused') {
          await onToggleStatus(created.id);
        }
      }
      setShowNewModal(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Could not save the program.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    setBusyId(id);
    setActionError('');
    try {
      await onToggleStatus(id);
      setSelectedProgram((prev) =>
        prev && prev.id === id
          ? { ...prev, status: prev.status === 'Active' ? 'Paused' : 'Active' }
          : prev
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update the program.');
    } finally {
      setBusyId(null);
    }
  };

  const handleArchive = async (id: string) => {
    setBusyId(id);
    setActionError('');
    try {
      await onArchiveProgram(id);
      setSelectedProgram(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not archive the program.');
    } finally {
      setBusyId(null);
    }
  };

  // If no programs exist, show designated empty state
  if (programs.length === 0) {
    return (
      <div className="bg-white rounded-[18px] p-12 text-center border border-[#bebecc]/40 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-[#d7e6f5]/40 text-[#2597d0] flex items-center justify-center mx-auto mb-4">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-[20px] font-bold text-[#070709] mb-1">No programs yet.</h3>
        <p className="text-[14px] text-[#60606c] mb-6">
          Create your first referral program — it takes five minutes.
        </p>
        <button
          onClick={() => handleOpenNewModal()}
          className="px-6 py-2.5 text-[14px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515]"
        >
          New program
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#070709] tracking-tight">
            Programs
          </h2>
          <p className="text-[13px] text-[#60606c]">
            Manage your referral campaigns, custom rewards, and attribution rules.
          </p>
        </div>

        <button
          onClick={() => handleOpenNewModal()}
          className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> New program
        </button>
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      {/* Program List */}
      <div className="grid grid-cols-1 gap-4">
        {programs.map((program) => {
          const stats = statsFor(program);
          return (
          <div
            key={program.id}
            className="bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm hover:border-[#2597d0]/40 transition-all cursor-pointer"
            onClick={() => setSelectedProgram(program)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h3 className="text-[17px] font-bold text-[#070709] tracking-tight">
                  {program.name}
                </h3>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    program.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {program.status}
                </span>
                <span className="text-[12px] font-mono text-[#8b8b8b]">
                  /{program.slug}
                </span>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleToggle(program.id)}
                  disabled={busyId === program.id}
                  className="px-3 py-1.5 rounded-full border border-[#bebecc] text-xs font-medium text-[#60606c] hover:text-[#070709] hover:border-[#070709] flex items-center gap-1 transition-all disabled:opacity-60"
                >
                  {program.status === 'Active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {busyId === program.id ? '…' : program.status === 'Active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => handleOpenNewModal(program)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#60606c]"
                  title="Edit program"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metrics grid for this program */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 text-xs">
              <div>
                <span className="text-[#8b8b8b] block mb-0.5">Links</span>
                <span className="text-[16px] font-bold text-[#070709] tabular-nums">
                  {program.linksCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#8b8b8b] block mb-0.5">Clicks</span>
                <span className="text-[16px] font-bold text-[#070709] tabular-nums">
                  {stats.clicks.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#8b8b8b] block mb-0.5">Signups</span>
                <span className="text-[16px] font-bold text-[#070709] tabular-nums">
                  {program.signupsCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#8b8b8b] block mb-0.5">Paid</span>
                <span className="text-[16px] font-bold text-[#070709] tabular-nums">
                  {program.paidCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#8b8b8b] block mb-0.5">Revenue</span>
                <span className="text-[16px] font-bold text-[#2597d0] tabular-nums">
                  ${stats.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Program Detail Modal/Drawer */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-black/[0.04] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <h3 className="text-[20px] font-bold text-[#070709] tracking-tight">
                  {selectedProgram.name}
                </h3>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedProgram.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedProgram.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenNewModal(selectedProgram);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium border border-[#bebecc] rounded-full hover:border-[#070709]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(selectedProgram.id)}
                  disabled={busyId === selectedProgram.id}
                  className="px-3.5 py-1.5 text-xs font-medium border border-[#bebecc] rounded-full hover:border-[#070709] disabled:opacity-60"
                >
                  {selectedProgram.status === 'Active' ? 'Pause program' : 'Resume program'}
                </button>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Program Scoped 5 Stats Strip */}
            <div className="grid grid-cols-5 gap-2 p-5 bg-[#f5f5f5]/60 border-b border-slate-100 text-xs shrink-0">
              <div>
                <span className="text-[#8b8b8b]">Links</span>
                <div className="text-[16px] font-bold text-[#070709]">{selectedProgram.linksCount}</div>
              </div>
              <div>
                <span className="text-[#8b8b8b]">Clicks</span>
                <div className="text-[16px] font-bold text-[#070709]">{statsFor(selectedProgram).clicks}</div>
              </div>
              <div>
                <span className="text-[#8b8b8b]">Signups</span>
                <div className="text-[16px] font-bold text-[#070709]">{selectedProgram.signupsCount}</div>
              </div>
              <div>
                <span className="text-[#8b8b8b]">Paid</span>
                <div className="text-[16px] font-bold text-[#070709]">{selectedProgram.paidCount}</div>
              </div>
              <div>
                <span className="text-[#8b8b8b]">Attributed ARR</span>
                <div className="text-[16px] font-bold text-[#2597d0]">${statsFor(selectedProgram).revenue.toLocaleString()}</div>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="px-6 border-b border-slate-100 flex items-center gap-6 text-[13px] font-medium shrink-0 bg-white">
              {(['rules', 'links', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProgramDetailTab(tab)}
                  className={`py-3 capitalize border-b-2 transition-all ${
                    programDetailTab === tab
                      ? 'border-[#070709] text-[#070709] font-bold'
                      : 'border-transparent text-[#60606c] hover:text-[#070709]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sub-tab content */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              {detailLoading ? (
                <div className="text-xs text-[#8b8b8b] text-center py-6">Loading…</div>
              ) : (
                <>
                  {programDetailTab === 'rules' && (
                    <div className="space-y-3">
                      <div className="text-xs text-[#60606c]">Active reward rules for this program:</div>
                      {detailRules.length === 0 && (
                        <div className="text-xs text-[#8b8b8b]">No rules yet for this program.</div>
                      )}
                      {detailRules.map((r) => (
                        <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-[#f5f5f5]/50 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-[#070709]">{r.name}</div>
                            <div className="text-xs text-[#60606c] mt-0.5">
                              Referrer gets {r.referrerAmount}, friend gets {r.refereeAmount} · {r.clawbackDays}-day clawback
                            </div>
                          </div>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {programDetailTab === 'links' && (
                    <div className="space-y-3">
                      <div className="text-xs text-[#60606c]">Referral links assigned to this program:</div>
                      {detailLinks.length === 0 && (
                        <div className="text-xs text-[#8b8b8b]">No links yet for this program.</div>
                      )}
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                        {detailLinks.map((l) => (
                          <div key={l.id} className="p-3 flex items-center justify-between bg-white">
                            <div>
                              <span className="font-mono font-bold text-[#070709]">{l.code}</span>
                              <span className="text-[#8b8b8b] ml-2">({l.email})</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-600">
                              <span>{l.clicks} clicks</span>
                              <span>{l.paid} paid</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {programDetailTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#070709] mb-1">Default Redirect URL</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedProgram.redirectUrl}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#070709] mb-1">Clawback Window</label>
                    <div className="text-xs text-[#60606c]">{selectedProgram.clawbackDays} days (auto-cancelled on churn)</div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs flex items-center justify-between">
                      <div>
                        <strong className="text-red-800 font-semibold block">Archive this program</strong>
                        <span className="text-red-700">Existing referral links will stop tracking new signups.</span>
                      </div>
                      <button
                        onClick={() => handleArchive(selectedProgram.id)}
                        disabled={busyId === selectedProgram.id}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
                      >
                        {busyId === selectedProgram.id ? 'Archiving…' : 'Archive'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New / Edit Program Dialog */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#070709]">
                {editingProgram ? 'Edit program' : 'New referral program'}
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4">
                <ErrorBanner message={modalError} />
              </div>
            )}

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#070709] mb-1">Program name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Customer Referrals"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!editingProgram) {
                      setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#bebecc] text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#070709] mb-1">Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. standard-referrals"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#bebecc] font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#070709] mb-1">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief note about who this program targets..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#bebecc] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#070709] mb-1">Default redirect URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://yourproduct.com/pricing"
                  value={newRedirect}
                  onChange={(e) => setNewRedirect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#bebecc] text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#60606c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#070709] rounded-full disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editingProgram ? 'Save changes' : 'Create program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
