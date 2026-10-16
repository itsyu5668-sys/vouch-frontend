import React from 'react';
import { ScreenMode } from '../types';
import { Check } from 'lucide-react';

interface PricingProps {
  onNavigate: (screen: ScreenMode) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      revenueLimit: 'Up to $500/mo referral revenue',
      features: [
        '1 referral program',
        '500 tracked clicks/mo',
        'Community support',
        'Standard cookie attribution'
      ],
      cta: 'Start free',
      popular: false,
      buttonStyle: 'secondary'
    },
    {
      name: 'Launch',
      price: '$19',
      period: '/mo',
      revenueLimit: 'Up to $3,000/mo referral revenue',
      features: [
        '3 referral programs',
        '10,000 tracked clicks/mo',
        'Clawback protection',
        'Email support'
      ],
      cta: 'Start now',
      popular: false,
      buttonStyle: 'secondary'
    },
    {
      name: 'Growth',
      price: '$59',
      period: '/mo',
      revenueLimit: 'Up to $15,000/mo referral revenue',
      features: [
        'Unlimited programs',
        '100,000 tracked clicks/mo',
        'Fraud controls & velocity limits',
        'Priority support',
        'Stripe auto-clawbacks'
      ],
      cta: 'Start now',
      popular: true,
      buttonStyle: 'primary'
    },
    {
      name: 'Pro',
      price: '$149',
      period: '/mo',
      revenueLimit: 'Up to $50,000/mo referral revenue',
      features: [
        'Everything in Growth',
        'Unlimited tracked clicks',
        'Dedicated Slack channel',
        'Custom contracts & SLAs'
      ],
      cta: 'Talk to us',
      popular: false,
      buttonStyle: 'ghost',
      isContact: true
    }
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-white border-b border-[#070709]/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h2 className="text-[32px] sm:text-[44px] font-semibold text-[#070709] tracking-[-0.04em] leading-[1.1] mb-4">
            Pricing that scales with your referrals.
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#60606c] leading-[1.5] tracking-[-0.01em]">
            You pay based on monthly referral-attributed revenue. If referrals aren't making you money, we're free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-[18px] p-7 flex flex-col justify-between transition-all ${
                tier.popular
                  ? 'bg-white border-2 border-[#070709] shadow-atmospheric relative'
                  : 'bg-white border border-[#bebecc]/60 shadow-sm hover:border-[#8b8b8b]'
              }`}
            >
              <div>
                {tier.popular && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#070709] text-white text-[11px] font-semibold tracking-wider uppercase">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className="text-[18px] font-bold text-[#070709] tracking-tight">
                  {tier.name}
                </h3>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-[38px] font-bold text-[#070709] tracking-[-0.04em] tabular-nums">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-[14px] text-[#60606c] font-medium">
                      {tier.period}
                    </span>
                  )}
                </div>

                <p className="text-[13px] font-medium text-[#2597d0] mb-6 min-h-[38px] flex items-center">
                  {tier.revenueLimit}
                </p>

                <div className="pt-5 border-t border-slate-100 space-y-3 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-[13px] text-[#60606c]">
                      <Check className="w-4 h-4 text-[#2597d0] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {tier.isContact ? (
                  <a
                    href="mailto:founders@vouch.link?subject=Vouch Pro Inquiry"
                    className="w-full block text-center py-2.5 px-4 text-[14px] font-medium text-[#070709] rounded-full border border-[#bebecc] hover:border-[#070709] transition-all"
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <button
                    onClick={() => onNavigate('signup')}
                    className={`w-full py-2.5 px-4 text-[14px] font-medium rounded-full transition-all ${
                      tier.buttonStyle === 'primary'
                        ? 'bg-[#070709] text-white shadow-pill hover:bg-[#151515]'
                        : 'text-[#070709] border border-[#bebecc] hover:border-[#070709]'
                    }`}
                  >
                    {tier.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[14px] text-[#60606c] tracking-[-0.01em]">
          Over $50K/mo in referral revenue?{' '}
          <a
            href="mailto:scale@vouch.link"
            className="text-[#070709] font-medium underline underline-offset-4 hover:text-[#2597d0] transition-colors"
          >
            Email us for Scale pricing.
          </a>
        </p>
      </div>
    </section>
  );
};
