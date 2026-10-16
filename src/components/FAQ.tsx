import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do my users need to install anything?',
      a: "No. They share a link. That's the whole integration on their side."
    },
    {
      q: 'What if someone tries to game the system?',
      a: 'Duplicate clicks are filtered, self-referrals are blocked, and velocity limits flag suspicious patterns automatically.'
    },
    {
      q: 'When do rewards actually go out?',
      a: 'When the conversion is real — not on signup. Stripe users: when the first invoice clears. Everyone else: N days after signup, or when you tell our API the money landed. You choose the trigger; you only pay for real users.'
    },
    {
      q: 'What happens if a referred customer cancels?',
      a: 'If they cancel inside your clawback window, any pending reward is cancelled. Issued rewards are flagged for review.'
    },
    {
      q: 'Can I migrate from my homegrown referral hack?',
      a: 'Yes. Import existing referral links and attributions through the API, and history carries over.'
    },
    {
      q: 'Do you take a cut of my rewards?',
      a: 'No. Reward money goes straight from you to your users through Stripe. We only charge the subscription.'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-24 md:py-32 bg-[#f5f5f5] border-b border-[#070709]/5">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[32px] sm:text-[44px] font-semibold text-[#070709] tracking-[-0.04em] leading-[1.1]">
            Questions founders actually ask.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-[16px] border border-black/[0.04] shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-[16px] text-[#070709] hover:text-[#2597d0] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8b8b8b] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#2597d0]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[15px] text-[#60606c] leading-[1.6] border-t border-slate-50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
