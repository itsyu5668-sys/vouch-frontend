import React from 'react';
import { ScreenMode } from '../types';

interface FinalCTAProps {
  onNavigate: (screen: ScreenMode) => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onNavigate }) => {
  return (
    <section className="py-24 md:py-32 bg-white border-b border-[#070709]/5">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-[34px] sm:text-[48px] font-semibold text-[#070709] tracking-[-0.04em] leading-[1.05] max-w-2xl mx-auto mb-4">
          Your next 100 customers are already using your product.
        </h2>
        <p className="text-[17px] sm:text-[19px] text-[#60606c] tracking-[-0.01em] mb-8">
          Give them a reason to tell someone.
        </p>

        <div className="mb-4">
          <button
            onClick={() => onNavigate('signup')}
            className="px-9 py-4 text-[15px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Start free
          </button>
        </div>

        <p className="text-[13px] text-[#8b8b8b] tracking-[-0.01em]">
          Free up to $500 in referral revenue. No credit card required.
        </p>
      </div>
    </section>
  );
};
