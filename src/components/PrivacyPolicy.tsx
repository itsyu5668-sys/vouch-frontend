import React from 'react';
import { ScreenMode } from '../types';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (screen: ScreenMode) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
        <div className="max-w-[800px] mx-auto px-6 h-18 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="text-[20px] font-bold tracking-tight text-[#070709]"
          >
            Vouch
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#60606c] hover:text-[#070709] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-6 py-16 md:py-24">
        <div className="mb-12 pb-8 border-b border-slate-100">
          <h1 className="text-[36px] sm:text-[44px] font-bold text-[#070709] tracking-[-0.04em] mb-2">
            Privacy Policy — Vouch
          </h1>
          <p className="text-[14px] text-[#8b8b8b] italic">
            Last updated: October 15, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-[#60606c] space-y-8 text-[15px] leading-[1.7]">
          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              1. What we collect.
            </h2>
            <p>
              We collect the minimum needed to run the service: your name, email, and password (hashed) when you create an account; your product and billing details when you subscribe; and referral event data (clicks, signups, conversions) generated through your integration. We log IP addresses and user agents on referral clicks for fraud prevention.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              2. What we don't collect.
            </h2>
            <p>
              We don't sell your data. We don't sell your users' data. We don't run ads against any of it.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              3. How we use data.
            </h2>
            <p>
              Account data runs your workspace and billing. Referral event data powers your dashboard, attribution, and reward issuance. Fraud signals (IP, device patterns) are used only to detect abuse. We may email you about your account, billing, and important product changes — never marketing you didn't ask for.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              4. Subprocessors.
            </h2>
            <p>
              We rely on a small set of infrastructure providers: Supabase (database), Render (hosting), and Stripe (payments). Each processes data only as needed to provide their service, under their own data processing terms.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              5. Cookies.
            </h2>
            <p>
              We set a first-party cookie on referral redirects to attribute signups. In the dashboard we use strictly necessary cookies for login sessions. No third-party tracking cookies, ever.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              6. Data retention.
            </h2>
            <p>
              Account data is kept while your workspace is active and for 30 days after deletion. Referral event data is kept while your workspace is active; you can request export or deletion at any time. Backups expire within 90 days.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              7. Your rights.
            </h2>
            <p>
              You can access, correct, export, or delete your data by emailing{' '}
              <a href="mailto:privacy@vouch.link" className="text-[#2597d0] underline">
                privacy@vouch.link
              </a>
              . We respond within 30 days. If you're in the EU or UK, you also have the right to lodge a complaint with your supervisory authority.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              8. Security.
            </h2>
            <p>
              Data is encrypted in transit and at rest. API keys are stored hashed. Access to production systems is limited to the founding team. No system is perfect — if we discover a breach affecting your data, we'll notify you within 72 hours.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              9. Changes.
            </h2>
            <p>
              We'll email you about material changes to this policy at least 14 days before they take effect. Continued use after that means you accept the changes.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              10. Contact.
            </h2>
            <p>
              <a href="mailto:privacy@vouch.link" className="text-[#2597d0]">
                privacy@vouch.link
              </a>
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100">
          <button
            onClick={() => onNavigate('landing')}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515]"
          >
            Return to home
          </button>
        </div>
      </div>
    </div>
  );
};
