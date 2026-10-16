import React from 'react';
import { ScreenMode } from '../types';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (screen: ScreenMode) => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
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
            Terms of Service — Vouch
          </h1>
          <p className="text-[14px] text-[#8b8b8b] italic">
            Last updated: October 15, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-[#60606c] space-y-8 text-[15px] leading-[1.7]">
          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              1. The service.
            </h2>
            <p>
              Vouch provides referral tracking, attribution, and reward automation through an API and dashboard. You integrate it into your product; we handle links, tracking, and payouts per the rules you configure.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              2. Accounts.
            </h2>
            <p>
              You must be at least 18 and provide accurate information. You're responsible for your API keys — treat them like passwords. Don't share your login; one account per person, workspaces can add teammates on paid plans.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              3. Acceptable use.
            </h2>
            <p>
              Don't use the service to track anything other than your own product's referrals. Don't attempt to game attribution, scrape other workspaces' data, or interfere with the service. We may suspend accounts engaged in fraud, spam, or abuse, with or without warning depending on severity.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              4. Plans and billing.
            </h2>
            <p>
              Free workspaces stay free within the plan limits. Paid plans bill monthly in advance through Stripe. If you exceed your plan's referral-revenue threshold, we'll notify you and move you to the matching tier on your next cycle — no surprise charges mid-cycle. Cancel anytime; you keep access until the end of the billing period.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              5. Rewards are your money.
            </h2>
            <p>
              Rewards are paid from your Stripe account to your users. We automate the mechanics, but the funds, the tax treatment, and compliance with local incentive and sweepstakes laws are your responsibility. Get advice if you're unsure — we're infrastructure, not lawyers.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              6. Uptime and support.
            </h2>
            <p>
              We target 99.9% monthly uptime for the tracking API. Planned maintenance is announced in advance. Support is community-based on Free, email on Launch, priority email on Growth, and a dedicated Slack channel on Pro.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              7. Termination.
            </h2>
            <p>
              Either side can terminate with 30 days' notice. We can terminate immediately for fraud, abuse, or non-payment after notice. On termination you can export your referral data within 30 days, then it's deleted per the Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              8. Liability.
            </h2>
            <p>
              The service is provided "as is." To the maximum extent allowed by law, our total liability is limited to what you paid us in the 12 months before the claim. We're not liable for lost referral revenue, misconfigured reward rules, or actions your users take.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              9. Changes.
            </h2>
            <p>
              We'll email you about material changes at least 14 days before they take effect.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              10. Governing law.
            </h2>
            <p>
              These terms are governed by the laws of the State of Delaware, USA, excluding conflict-of-law rules.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#070709] mb-2 tracking-tight">
              11. Contact.
            </h2>
            <p>
              <a href="mailto:legal@vouch.link" className="text-[#2597d0]">
                legal@vouch.link
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
