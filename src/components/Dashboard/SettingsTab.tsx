import React, { useState, useEffect } from 'react';
import { WorkspaceState, TeamMember, Program } from '../../types';
import { SelectDropdown } from '../ui/SelectDropdown';
import {
  patchMe,
  deleteMe,
  getMembers,
  inviteMember,
  removeMember
} from '../../lib/api';
import {
  mapMember,
  mapOwnerToMember,
  formatDate,
  PLAN_PRICE_LABEL
} from '../../lib/mappers';
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  Download,
  Check,
  AlertTriangle,
  X,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface SettingsTabProps {
  workspace: WorkspaceState;
  programs: Program[];
  onUpdateWorkspace: (updates: Partial<WorkspaceState>) => void;
  onSignOut: () => void;
}

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
    <AlertCircle className="w-4 h-4 shrink-0" />
    {message}
  </div>
);

export const SettingsTab: React.FC<SettingsTabProps> = ({
  workspace,
  programs,
  onUpdateWorkspace,
  onSignOut
}) => {
  // Workspace Form
  const [name, setName] = useState(workspace.name);
  const [email, setEmail] = useState(workspace.contactEmail);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Upgrade Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Team
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Viewer'>('Admin');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Notifications state (persisted via notification_prefs)
  const [notifReward, setNotifReward] = useState(true);
  const [notifClawback, setNotifClawback] = useState(true);
  const [notifDigest, setNotifDigest] = useState(true);
  const [notifLimit, setNotifLimit] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);

  // Danger zone state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Keep form in sync if workspace loads after mount
  useEffect(() => {
    setName(workspace.name);
    setEmail(workspace.contactEmail);
  }, [workspace.name, workspace.contactEmail]);

  const fetchTeam = async () => {
    setTeamLoading(true);
    setTeamError('');
    try {
      const { members, owner } = await getMembers();
      setTeamMembers([mapOwnerToMember(owner), ...members.map(mapMember)]);
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Could not load team members.');
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    void fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const { workspace: ws } = await patchMe({ name });
      onUpdateWorkspace({ name: ws.name, contactEmail: email });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save the workspace.');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteError('');
    try {
      const { member } = await inviteMember(inviteEmail, inviteRole.toLowerCase() as 'admin' | 'viewer');
      setTeamMembers((prev) => [...prev, mapMember(member)]);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Could not send the invitation.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    setRemovingId(id);
    try {
      await removeMember(id);
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Could not remove the member.');
    } finally {
      setRemovingId(null);
    }
  };

  const persistNotifPrefs = async (prefs: {
    reward_issued: boolean;
    clawbacks: boolean;
    weekly_digest: boolean;
    limit_warnings: boolean;
  }) => {
    setNotifSaving(true);
    try {
      await patchMe({ notification_prefs: prefs });
    } catch {
      // non-fatal: keep local state
    } finally {
      setNotifSaving(false);
    }
  };

  const toggleNotif = (
    key: 'reward_issued' | 'clawbacks' | 'weekly_digest' | 'limit_warnings',
    current: boolean,
    setter: (v: boolean) => void
  ) => {
    const next = !current;
    setter(next);
    const prefs = {
      reward_issued: key === 'reward_issued' ? next : notifReward,
      clawbacks: key === 'clawbacks' ? next : notifClawback,
      weekly_digest: key === 'weekly_digest' ? next : notifDigest,
      limit_warnings: key === 'limit_warnings' ? next : notifLimit
    };
    void persistNotifPrefs(prefs);
  };

  const handleDeleteWorkspace = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMe(workspace.name);
      onSignOut();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete the workspace.');
    } finally {
      setDeleting(false);
    }
  };

  const usagePercent = Math.min(Math.round((workspace.usageRevenue / workspace.maxRevenue) * 100), 100);

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h2 className="text-[24px] font-bold text-[#070709] tracking-tight">
          Settings
        </h2>
        <p className="text-[13px] text-[#60606c]">
          Manage your workspace preferences, team access, billing plan, and notifications.
        </p>
      </div>

      {/* 1. WORKSPACE SETTINGS */}
      <section className="bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm space-y-4">
        <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
          Workspace
        </h3>

        {saveError && <ErrorBanner message={saveError} />}

        <form onSubmit={handleSaveWorkspace} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#070709] mb-1">Workspace name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bebecc] text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#070709] mb-1">Contact email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bebecc] text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-xs font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save workspace'}
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved successfully.
              </span>
            )}
          </div>
        </form>
      </section>

      {/* 2. PLAN & BILLING */}
      <section className="bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
              Plan & Billing
            </h3>
            <p className="text-xs text-[#60606c]">
              Billed monthly based on referral-attributed revenue.
            </p>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-[#070709] text-white text-xs font-semibold self-start sm:self-auto">
            {PLAN_PRICE_LABEL[workspace.plan]}
          </span>
        </div>

        {/* Usage Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-[#070709]">
              ${workspace.usageRevenue.toLocaleString()} of ${workspace.maxRevenue.toLocaleString()} referral revenue
            </span>
            <span className="text-[#60606c] tabular-nums">{usagePercent}% used</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#f5f5f5] overflow-hidden">
            <div
              style={{ width: `${usagePercent}%` }}
              className="h-full bg-[#2597d0] rounded-full transition-all"
            />
          </div>
          <p className="text-[11px] text-[#8b8b8b] mt-1.5">
            If you exceed ${workspace.maxRevenue.toLocaleString()}/mo, you will be seamlessly moved to the next tier at your next billing cycle with zero disruption.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-5 py-2 text-xs font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515]"
          >
            Upgrade plan
          </button>
          <div className="px-4 py-2 text-xs text-[#8b8b8b]">
            No invoices yet
          </div>
          <button
            onClick={() => alert('To cancel your plan, contact support@vouch.link. You will retain access until the end of your billing cycle.')}
            className="px-4 py-2 text-xs font-medium text-red-600 hover:text-red-700"
          >
            Cancel plan
          </button>
        </div>
      </section>

      {/* 3. TEAM */}
      <section className="bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
              Team Members
            </h3>
            <p className="text-xs text-[#60606c]">
              Teammates with access to your Vouch workspace.
            </p>
          </div>

          <button
            onClick={() => {
              setInviteError('');
              setShowInviteModal(true);
            }}
            className="px-4 py-2 text-xs font-medium text-[#070709] bg-white border border-[#bebecc] rounded-full hover:border-[#070709] flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite teammate
          </button>
        </div>

        {teamError && <ErrorBanner message={teamError} />}

        {teamLoading ? (
          <div className="text-xs text-[#8b8b8b] text-center py-6">Loading team…</div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-[#f5f5f5]/40 transition-colors">
                <div>
                  <span className="font-semibold text-[#070709] text-[13px]">{member.email}</span>
                  <span className="text-[#8b8b8b] ml-2 font-mono text-[11px]">Joined {member.joinedAt}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f5f5f5] text-[#070709] font-medium">
                    {member.role}
                  </span>
                  {member.role !== 'Owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removingId === member.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-60"
                      title="Remove member"
                    >
                      {removingId === member.id ? 'Removing…' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. NOTIFICATIONS */}
      <section className="bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
            Notifications
          </h3>
          {notifSaving && (
            <span className="text-[11px] text-[#8b8b8b]">Saving…</span>
          )}
        </div>

        <div className="space-y-3 text-xs text-[#60606c]">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifReward}
              onChange={() => toggleNotif('reward_issued', notifReward, setNotifReward)}
              className="rounded border-[#bebecc] text-[#070709] focus:ring-0"
            />
            <span className="text-[#070709]">Email me when a reward is issued</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifClawback}
              onChange={() => toggleNotif('clawbacks', notifClawback, setNotifClawback)}
              className="rounded border-[#bebecc] text-[#070709] focus:ring-0"
            />
            <span className="text-[#070709]">Email me on clawbacks</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifDigest}
              onChange={() => toggleNotif('weekly_digest', notifDigest, setNotifDigest)}
              className="rounded border-[#bebecc] text-[#070709] focus:ring-0"
            />
            <span className="text-[#070709]">Weekly referral digest</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifLimit}
              onChange={() => toggleNotif('limit_warnings', notifLimit, setNotifLimit)}
              className="rounded border-[#bebecc] text-[#070709] focus:ring-0"
            />
            <span className="text-[#070709]">Plan limit warnings</span>
          </label>
        </div>
      </section>

      {/* 5. DANGER ZONE */}
      <section className="bg-white rounded-[18px] p-6 border border-red-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-[16px] font-bold tracking-tight">
            Danger zone
          </h3>
        </div>

        <p className="text-xs text-[#60606c] leading-relaxed">
          This permanently deletes all programs, links, and history. Rewards already issued through Stripe are unaffected.
        </p>

        <div>
          <button
            onClick={() => {
              setDeleteConfirmationInput('');
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
          >
            Delete workspace
          </button>
        </div>
      </section>

      {/* Invite Teammate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#070709]">Invite teammate</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              {inviteError && <ErrorBanner message={inviteError} />}

              <div>
                <label className="block font-semibold text-[#070709] mb-1">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#bebecc] text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#070709] mb-1">Role</label>
                <SelectDropdown
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val as any)}
                  options={[
                    { value: 'Admin', label: 'Admin (Can manage programs, keys, rules)' },
                    { value: 'Viewer', label: 'Viewer (Read-only analytics)' }
                  ]}
                  className="w-full"
                  buttonClassName="w-full justify-between rounded-lg py-2.5 px-3 text-xs"
                  menuClassName="w-full"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs text-[#60606c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#070709] rounded-full shadow-pill disabled:opacity-60"
                >
                  {inviting ? 'Sending…' : 'Send invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-[18px] font-bold text-[#070709]">Upgrade Plan</h3>
              <button onClick={() => setShowUpgradeModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-[#60606c]">
              Select the tier that matches your current monthly referral revenue.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border-2 border-[#070709] bg-[#f5f5f5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#070709]">Pro — $149/mo</div>
                  <div className="text-[#60606c]">Up to $50,000/mo referral revenue · Dedicated Slack</div>
                </div>
                <a
                  href="mailto:support@vouch.link?subject=Plan%20upgrade%20request"
                  className="px-3.5 py-1.5 rounded-full bg-[#070709] text-white font-medium whitespace-nowrap"
                >
                  Email us to upgrade
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full py-2 text-xs font-medium text-[#60606c]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <h3 className="text-[18px] font-bold text-red-600">Delete Workspace Permanently</h3>
            <p className="text-xs text-[#60606c] leading-relaxed">
              This action cannot be undone. To confirm deletion, type the exact workspace name{' '}
              <strong className="text-[#070709] font-mono">{workspace.name}</strong> below:
            </p>

            {deleteError && <ErrorBanner message={deleteError} />}

            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder={workspace.name}
              className="w-full px-3.5 py-2.5 rounded-lg border border-red-300 text-sm font-mono"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#60606c]"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmationInput !== workspace.name || deleting}
                onClick={handleDeleteWorkspace}
                className={`px-5 py-2 text-xs font-semibold rounded-full text-white transition-all ${
                  deleteConfirmationInput === workspace.name
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                {deleting ? 'Deleting…' : 'I understand, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
