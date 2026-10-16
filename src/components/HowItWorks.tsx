import React from 'react';
import { Layers, Code2, Sparkles, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenDocs: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenDocs }) => {
  const steps = [
    {
      number: '01',
      title: 'Create a program',
      description: 'Name your product, pick double-sided or one-sided rewards, set the payout. Takes five minutes in the dashboard.',
      icon: Layers,
      tag: 'Dashboard setup'
    },
    {
      number: '02',
      title: 'Drop in four lines of code',
      description: 'Generate a link per user, fire one call on signup. Our snippet handles cookies, attribution, and redirects.',
      icon: Code2,
      tag: 'SDK or REST API'
    },
    {
      number: '03',
      title: 'Get paid customers on autopilot',
      description: 'We track every click to paid conversion, issue rewards when the invoice clears, and claw them back if the customer churns.',
      icon: Sparkles,
      tag: 'Zero maintenance'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white border-b border-[#070709]/5">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Heading Block */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h2 className="text-[32px] sm:text-[44px] font-semibold text-[#070709] tracking-[-0.04em] leading-[1.1] mb-4">
            Live in an afternoon, not a quarter.
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#60606c] leading-[1.5] tracking-[-0.01em]">
            No growth team required. No referral agency. Just an API.
          </p>
        </div>

        {/* Three Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-[18px] p-8 md:p-10 border border-[#bebecc]/40 shadow-atmospheric hover:border-[#2597d0]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[32px] font-bold text-[#2597d0] tracking-[-0.04em] font-mono">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#d7e6f5]/40 flex items-center justify-center text-[#2597d0]">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                  </div>

                  <h3 className="text-[20px] font-semibold text-[#070709] tracking-tight mb-3">
                    {step.title}
                  </h3>

                  <p className="text-[15px] text-[#60606c] leading-[1.5] tracking-[-0.01em]">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs text-[#8b8b8b] font-medium">
                  {step.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Read the docs button */}
        <div className="text-center">
          <button
            onClick={onOpenDocs}
            className="inline-flex items-center gap-2 px-7 py-3 text-[14px] font-medium text-[#070709] rounded-full border border-[#bebecc] hover:border-[#070709] hover:bg-[#f5f5f5] transition-all"
          >
            Read the docs
            <ArrowRight className="w-4 h-4 text-[#2597d0]" />
          </button>
        </div>
      </div>
    </section>
  );
};
