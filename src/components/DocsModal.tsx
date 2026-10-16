import React, { useState } from 'react';
import { X, Copy, Check, Terminal, BookOpen, Key, Webhook, Cpu } from 'lucide-react';
import { API_BASE } from '../lib/api';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'quickstart' | 'endpoints' | 'webhooks'>('quickstart');

  if (!isOpen) return null;

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const snippetGenerate = `// 1. Generate a unique referral link for user
const res = await fetch('${API_BASE}/v1/referral-links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer vouch_••••',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    program_id: 'YOUR_PROGRAM_ID',
    referrer_customer_id: 'user_123',
    label: 'settings-page'
  })
});
const { link } = await res.json();`;

  const snippetAttribute = `// 2. Attribute a signup when referee registers
await fetch('${API_BASE}/v1/attributions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer vouch_••••',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    program_id: 'YOUR_PROGRAM_ID',
    referral_code: req.cookies.vouch_ref,
    referred_customer_id: 'user_456'
  })
});`;

  const snippetCurl = `curl -X POST ${API_BASE}/v1/referral-links \\
  -H "Authorization: Bearer vouch_••••" \\
  -H "Content-Type: application/json" \\
  -d '{"program_id": "YOUR_PROGRAM_ID", "referrer_customer_id": "user_123"}'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] max-w-[800px] w-full max-h-[90vh] flex flex-col shadow-2xl border border-black/[0.06] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-[18px] font-bold text-[#070709] tracking-tight">
              Vouch API Reference
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#60606c]">
              v1.0.4
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#60606c] hover:bg-[#f5f5f5] hover:text-[#070709] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subnav tabs */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-6 text-[13px] font-medium shrink-0 bg-[#f5f5f5]/50">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'quickstart'
                ? 'border-[#070709] text-[#070709] font-semibold'
                : 'border-transparent text-[#60606c] hover:text-[#070709]'
            }`}
          >
            Quickstart (4 Lines)
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'endpoints'
                ? 'border-[#070709] text-[#070709] font-semibold'
                : 'border-transparent text-[#60606c] hover:text-[#070709]'
            }`}
          >
            REST Endpoints
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'webhooks'
                ? 'border-[#070709] text-[#070709] font-semibold'
                : 'border-transparent text-[#60606c] hover:text-[#070709]'
            }`}
          >
            Stripe Webhooks
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#60606c] text-[14px] leading-relaxed">
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-bold text-[#070709] mb-1">
                  1. Generate link per customer
                </h3>
                <p className="text-[13px] text-[#60606c] mb-3">
                  Call this when rendering the user's settings, dashboard, or referral widget.
                </p>
                <div className="relative bg-[#070709] text-slate-100 rounded-[14px] p-4 font-mono text-[12px] overflow-x-auto">
                  <pre>{snippetGenerate}</pre>
                  <button
                    onClick={() => copyCode(snippetGenerate, 1)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#070709] mb-1">
                  2. Attribute on signup
                </h3>
                <p className="text-[13px] text-[#60606c] mb-3">
                  The client script sets a 60-day first-party cookie named <code className="bg-[#f5f5f5] px-1 rounded text-[#070709]">vouch_ref</code>. Pass this to attribute signups.
                </p>
                <div className="relative bg-[#070709] text-slate-100 rounded-[14px] p-4 font-mono text-[12px] overflow-x-auto">
                  <pre>{snippetAttribute}</pre>
                  <button
                    onClick={() => copyCode(snippetAttribute, 2)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="border border-slate-100 rounded-[14px] p-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">POST</span>
                  <span className="text-[#070709] font-medium">/v1/referral-links</span>
                </div>
                <p className="text-xs text-[#60606c]">Creates or retrieves an existing referral code for a specific user ID.</p>
              </div>

              <div className="border border-slate-100 rounded-[14px] p-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">POST</span>
                  <span className="text-[#070709] font-medium">/v1/attributions</span>
                </div>
                <p className="text-xs text-[#60606c]">Links a new referee signup or payment event to the original referrer code.</p>
              </div>

              <div className="border border-slate-100 rounded-[14px] p-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">GET</span>
                  <span className="text-[#070709] font-medium">/v1/referral-links/:code</span>
                </div>
                <p className="text-xs text-[#60606c]">Fetches attribution metrics, click count, and conversion journey for a code.</p>
              </div>

              <div className="relative bg-[#070709] text-slate-100 rounded-[14px] p-4 font-mono text-[12px] overflow-x-auto mt-4">
                <pre>{snippetCurl}</pre>
                <button
                  onClick={() => copyCode(snippetCurl, 3)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#60606c]">
                Connect Stripe webhooks directly in your dashboard or add <code className="bg-[#f5f5f5] px-1 rounded text-[#070709]">{`${API_BASE}/v1/webhooks/stripe`}</code> to your Stripe dashboard.
              </p>
              <div className="bg-[#f5f5f5] rounded-[14px] p-4 space-y-2 text-xs">
                <div className="font-semibold text-[#070709]">Supported Events:</div>
                <ul className="list-disc list-inside space-y-1 text-[#60606c]">
                  <li><code className="text-[#070709]">invoice.paid</code> — Triggers reward issuance or pending queue</li>
                  <li><code className="text-[#070709]">charge.refunded</code> — Triggers automated reward clawback</li>
                  <li><code className="text-[#070709]">customer.subscription.deleted</code> — Cancels pending payouts inside clawback window</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-[#f5f5f5]/60 flex items-center justify-between text-xs text-[#8b8b8b]">
          <span>Need custom webhooks or Paddle support? Reach out in Slack.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-[#070709] rounded-full hover:bg-[#151515]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
