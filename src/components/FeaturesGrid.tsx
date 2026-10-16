import React from 'react';
import {
  Link2,
  TrendingUp,
  Gift,
  ShieldAlert,
  Fingerprint,
  BarChart3
} from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      title: 'Unique links per user',
      description: "Every customer gets their own trackable link in one API call. First-party cookies, so ad blockers don't eat your attributions.",
      icon: Link2,
      badge: 'First-party attribution'
    },
    {
      title: 'Click-to-paid tracking',
      description: 'Follow the full journey: click, signup, first payment. Know exactly which referrers drive revenue, not just traffic.',
      icon: TrendingUp,
      badge: 'Full-funnel metrics'
    },
    {
      title: 'Automatic rewards',
      description: 'Cash, account credit, coupons, plan upgrades, or your own webhook — whatever fits how you make money. Issued when the conversion is real, not on some spreadsheet. No manual payouts.',
      icon: Gift,
      badge: 'Zero manual payouts'
    },
    {
      title: 'Clawback protection',
      description: 'If a referred customer cancels inside your clawback window, pending rewards are cancelled automatically. You never pay for churned users.',
      icon: ShieldAlert,
      badge: 'Churn safe'
    },
    {
      title: 'Fraud controls',
      description: 'Duplicate-click filtering, self-referral detection, and velocity limits are on by default. Cheaters get filtered before they cost you money.',
      icon: Fingerprint,
      badge: 'Active heuristics'
    },
    {
      title: 'Founder dashboard',
      description: 'Programs, rules, links, rewards, and revenue attribution in one place. The numbers you need for your next build-in-public post.',
      icon: BarChart3,
      badge: 'Real-time telemetry'
    }
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-[#f5f5f5] border-b border-[#070709]/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h2 className="text-[32px] sm:text-[44px] font-semibold text-[#070709] tracking-[-0.04em] leading-[1.1] mb-4">
            Everything a referral program needs. Nothing it doesn't.
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#60606c] leading-[1.5] tracking-[-0.01em]">
            Purpose-built infrastructure for indie hackers and micro-SaaS builders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-[18px] p-8 md:p-10 border border-black/[0.04] shadow-atmospheric hover:translate-y-[-2px] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-[10px] bg-[#d7e6f5]/40 flex items-center justify-center text-[#2597d0]">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-[12px] font-medium text-[#60606c]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-[20px] font-semibold text-[#070709] tracking-tight mb-3">
                    {feat.title}
                  </h3>

                  <p className="text-[15px] text-[#60606c] leading-[1.5] tracking-[-0.01em]">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
