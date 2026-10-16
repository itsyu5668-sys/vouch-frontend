import React, { useState, useEffect } from 'react';
import { Program, RewardRule } from '../../types';
import { SelectDropdown } from '../ui/SelectDropdown';
import { listRules, createRule, patchRule, deleteRule, ApiRule } from '../../lib/api';
import { mapRule, buildRuleActions, autoRuleName } from '../../lib/mappers';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  Layers,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';

interface RewardRulesTabProps {
  programs: Program[];
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

export const RewardRulesTab: React.FC<RewardRulesTabProps> = ({ programs }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RewardRule | null>(null);

  const [rules, setRules] = useState<RewardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Form State
  const [targetProgramId, setTargetProgramId] = useState(programs[0]?.id || '');
  const [ruleName, setRuleName] = useState('');
  const [trigger, setTrigger] = useState<'signup' | 'payment'>('payment');
  const [whoGetsRewarded, setWhoGetsRewarded] = useState<'both' | 'referrer'>('both');
  const [rewardType, setRewardType] = useState<'Account credit' | 'Coupon' | 'Cash payout' | 'Webhook' | 'Feature unlock'>('Account credit');
  const [referrerAmount, setReferrerAmount] = useState('20');
  const [refereeAmount, setRefereeAmount] = useState('20');
  const [delayDays, setDelayDays] = useState(14);
  const [clawbackDays, setClawbackDays] = useState(14);
  const [conditionInput, setConditionInput] = useState('');
  const [conditions, setConditions] = useState<string[]>(['Minimum invoice amount $19']);

  const fetchRules = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        programs.map(async (p) => {
          try {
            const { rules } = await listRules(p.id);
            return rules.map(mapRule);
          } catch {
            return [];
          }
        })
      );
      setRules(results.flat());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load reward rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs]);

  const filteredRules = selectedProgramId === 'all'
    ? rules
    : rules.filter((r) => r.programId === selectedProgramId);

  const handleOpenModal = (ruleToEdit?: RewardRule) => {
    if (ruleToEdit) {
      setEditingRule(ruleToEdit);
      setTargetProgramId(ruleToEdit.programId);
      setRuleName(ruleToEdit.name);
      setTrigger(ruleToEdit.trigger);
      setWhoGetsRewarded(ruleToEdit.whoGetsRewarded);
      setRewardType(ruleToEdit.rewardType);
      setReferrerAmount(ruleToEdit.referrerAmount.replace(/[^0-9.]/g, '') || '20');
      setRefereeAmount(ruleToEdit.refereeAmount.replace(/[^0-9.]/g, '') || '20');
      setDelayDays(ruleToEdit.delayDays);
      setClawbackDays(ruleToEdit.clawbackDays);
      setConditions(ruleToEdit.conditions || []);
    } else {
      setEditingRule(null);
      setTargetProgramId(programs[0]?.id || '');
      setRuleName('');
      setTrigger('payment');
      setWhoGetsRewarded('both');
      setRewardType('Account credit');
      setReferrerAmount('20');
      setRefereeAmount('20');
      setDelayDays(14);
      setClawbackDays(14);
      setConditions(['Minimum invoice amount $19']);
    }
    setModalError('');
    setShowModal(true);
  };

  const handleAddCondition = () => {
    if (conditionInput.trim()) {
      setConditions([...conditions, conditionInput.trim()]);
      setConditionInput('');
    }
  };

  const handleRemoveCondition = (idx: number) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedName = ruleName.trim() || autoRuleName({ whoGetsRewarded, rewardType, trigger });
    setSaving(true);
    setModalError('');
    try {
      const backendTrigger: ApiRule['trigger'] =
        trigger === 'payment' ? 'referee.first_payment' : 'referee.signup';
      const actions = buildRuleActions({
        whoGetsRewarded,
        rewardType,
        referrerAmount,
        refereeAmount
      });
      if (editingRule) {
        await patchRule(editingRule.programId, editingRule.id, {
          name: generatedName,
          trigger: backendTrigger,
          trigger_config: { delay_days: delayDays },
          conditions,
          actions,
          clawback_days: clawbackDays
        });
      } else {
        if (!targetProgramId) throw new Error('Select a program for this rule.');
        await createRule(targetProgramId, {
          name: generatedName,
          trigger: backendTrigger,
          trigger_config: { delay_days: delayDays },
          conditions,
          actions,
          clawback_days: clawbackDays
        });
      }
      setShowModal(false);
      await fetchRules();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Could not save the rule.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: RewardRule) => {
    setBusyId(rule.id);
    try {
      await patchRule(rule.programId, rule.id, { active: rule.status !== 'active' });
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the rule.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (rule: RewardRule) => {
    setBusyId(rule.id);
    try {
      await deleteRule(rule.programId, rule.id);
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the rule.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[18px] p-12 text-center border border-[#bebecc]/40">
        <div className="text-[14px] text-[#60606c]">Loading reward rules…</div>
      </div>
    );
  }

  if (rules.length === 0 && !error) {
    return (
      <div className="bg-white rounded-[18px] p-12 text-center border border-[#bebecc]/40 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-[#d7e6f5]/40 text-[#2597d0] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-[20px] font-bold text-[#070709] mb-1">No rules yet.</h3>
        <p className="text-[14px] text-[#60606c] mb-6">
          Rules decide who gets rewarded and when.
        </p>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2.5 text-[14px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515]"
        >
          New rule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Selector & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#070709] tracking-tight">
            Reward Rules
          </h2>
          <p className="text-[13px] text-[#60606c]">
            Automated logic governing reward types, verification delays, and clawback windows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SelectDropdown
            value={selectedProgramId}
            onChange={setSelectedProgramId}
            options={[
              { value: 'all', label: `All programs (${rules.length} rules)` },
              ...programs.map((p) => ({
                value: p.id,
                label: p.name
              }))
            ]}
          />

          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> New rule
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => void fetchRules()} />}

      {/* Rule Cards List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const prog = programs.find((p) => p.id === rule.programId);
          return (
            <div
              key={rule.id}
              className="bg-white rounded-[18px] p-6 border border-[#bebecc]/40 shadow-sm hover:border-[#2597d0]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-[16px] font-bold text-[#070709] tracking-tight">
                    {rule.name}
                  </h3>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      rule.trigger === 'payment'
                        ? 'bg-[#d7e6f5]/60 text-[#2597d0]'
                        : 'bg-slate-100 text-[#60606c]'
                    }`}
                  >
                    {rule.trigger === 'payment' ? 'On first payment' : 'On signup'}
                  </span>
                  {prog && (
                    <span className="text-[12px] text-[#8b8b8b]">
                      · {prog.name}
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-[#60606c]">
                  Referrer gets {rule.referrerAmount} {rule.rewardType.toLowerCase()}
                  {rule.whoGetsRewarded === 'both' ? `, referee gets ${rule.refereeAmount} credit` : ''} · issued after payment clears · {rule.clawbackDays}-day clawback
                </p>

                {rule.conditions && rule.conditions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#8b8b8b]">
                    <span>Conditions:</span>
                    {rule.conditions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#f5f5f5] rounded-md text-[#070709] font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Toggle & Actions */}
              <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => handleToggle(rule)}
                  disabled={busyId === rule.id}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all disabled:opacity-60 ${
                    rule.status === 'active'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-100 text-slate-500'
                  }`}
                >
                  {rule.status === 'active' ? 'Active' : 'Off'}
                </button>

                <button
                  onClick={() => handleOpenModal(rule)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#60606c]"
                  title="Edit rule"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(rule)}
                  disabled={busyId === rule.id}
                  className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 disabled:opacity-60"
                  title="Delete rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New / Edit Rule Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-[#070709]">
                {editingRule ? 'Edit reward rule' : 'New reward rule'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4">
                <ErrorBanner message={modalError} />
              </div>
            )}

            <form onSubmit={handleSaveRule} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-[#070709] mb-1">Target program</label>
                <SelectDropdown
                  value={targetProgramId}
                  onChange={setTargetProgramId}
                  options={programs.map((p) => ({ value: p.id, label: p.name }))}
                  className="w-full"
                  buttonClassName="w-full justify-between rounded-lg py-2.5 px-3 text-xs"
                  menuClassName="w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#070709] mb-1">
                  Rule name <span className="font-normal text-[#8b8b8b]">(optional — auto-generated if blank)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Double-sided credit on first payment"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#bebecc] text-sm"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block font-semibold text-[#070709] mb-2">Trigger</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${
                      trigger === 'payment' ? 'border-[#070709] bg-[#f5f5f5]' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="trigger"
                      checked={trigger === 'payment'}
                      onChange={() => setTrigger('payment')}
                    />
                    <span>Referee's first payment clears</span>
                  </label>
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${
                      trigger === 'signup' ? 'border-[#070709] bg-[#f5f5f5]' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="trigger"
                      checked={trigger === 'signup'}
                      onChange={() => setTrigger('signup')}
                    />
                    <span>Referee signs up</span>
                  </label>
                </div>
              </div>

              {/* Who gets rewarded */}
              <div>
                <label className="block font-semibold text-[#070709] mb-2">Who gets rewarded</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${
                      whoGetsRewarded === 'both' ? 'border-[#070709] bg-[#f5f5f5]' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="who"
                      checked={whoGetsRewarded === 'both'}
                      onChange={() => setWhoGetsRewarded('both')}
                    />
                    <span>Both sides</span>
                  </label>
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${
                      whoGetsRewarded === 'referrer' ? 'border-[#070709] bg-[#f5f5f5]' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="who"
                      checked={whoGetsRewarded === 'referrer'}
                      onChange={() => setWhoGetsRewarded('referrer')}
                    />
                    <span>Referrer only</span>
                  </label>
                </div>
              </div>

              {/* Reward Type */}
              <div>
                <label className="block font-semibold text-[#070709] mb-2">Reward type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Account credit', 'Coupon', 'Cash payout'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRewardType(t)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        rewardType === t ? 'border-[#070709] bg-[#070709] text-white font-medium' : 'border-slate-200 text-[#60606c]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#070709] mb-1">
                    Referrer reward {rewardType === 'Coupon' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    value={referrerAmount}
                    onChange={(e) => setReferrerAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#bebecc] text-sm"
                  />
                </div>
                {whoGetsRewarded === 'both' && (
                  <div>
                    <label className="block font-semibold text-[#070709] mb-1">
                      Friend reward {rewardType === 'Coupon' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      value={refereeAmount}
                      onChange={(e) => setRefereeAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#bebecc] text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Delay & Clawback */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#070709] mb-1">Delay before issuing</label>
                  <SelectDropdown
                    value={String(delayDays)}
                    onChange={(val) => setDelayDays(Number(val))}
                    options={[
                      { value: '0', label: 'Immediately' },
                      { value: '1', label: '1 day' },
                      { value: '7', label: '7 days' },
                      { value: '14', label: '14 days (safest)' }
                    ]}
                    className="w-full"
                    buttonClassName="w-full justify-between rounded-lg py-2 px-3 text-xs"
                    menuClassName="w-full"
                  />
                  <span className="text-[10px] text-[#8b8b8b] mt-1 block">
                    Safest against churn-and-grab abuse.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#070709] mb-1">Clawback window</label>
                  <SelectDropdown
                    value={String(clawbackDays)}
                    onChange={(val) => setClawbackDays(Number(val))}
                    options={[
                      { value: '7', label: '7 days' },
                      { value: '14', label: '14 days' },
                      { value: '30', label: '30 days' },
                      { value: '60', label: '60 days' },
                      { value: '0', label: 'None' }
                    ]}
                    className="w-full"
                    buttonClassName="w-full justify-between rounded-lg py-2 px-3 text-xs"
                    menuClassName="w-full"
                  />
                </div>
              </div>

              {/* Optional conditions */}
              <div>
                <label className="block font-semibold text-[#070709] mb-1">Conditions (optional)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    placeholder="e.g. Minimum invoice amount $19"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#bebecc] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
                {conditions.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-slate-50 rounded mb-1">
                    <span>{c}</span>
                    <button type="button" onClick={() => handleRemoveCondition(i)} className="text-slate-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#60606c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#070709] rounded-full shadow-pill disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
