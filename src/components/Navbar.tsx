import React, { useState } from 'react';
import { ScreenMode } from '../types';

interface NavbarProps {
  currentScreen: ScreenMode;
  onNavigate: (screen: ScreenMode) => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate, onOpenDocs }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (currentScreen !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#070709]/5 transition-all">
      <div className="max-w-[1200px] mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark only - just "Vouch", nothing else! */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-[22px] font-bold tracking-[-0.04em] text-[#070709] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 flex items-center"
        >
          Vouch
        </button>

        {/* Zone 2: Clean text nav links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#070709]">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#2597d0] transition-colors whitespace-nowrap"
          >
            How it works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-[#2597d0] transition-colors whitespace-nowrap"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="hover:text-[#2597d0] transition-colors whitespace-nowrap"
          >
            Pricing
          </button>
          <button
            onClick={onOpenDocs}
            className="hover:text-[#2597d0] transition-colors whitespace-nowrap"
          >
            Docs
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('signin')}
            className="px-5 py-2.5 text-[14px] font-medium text-[#070709] rounded-full border border-[#bebecc] hover:border-[#070709] transition-all whitespace-nowrap"
          >
            Sign in
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="px-6 py-2.5 text-[14px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap"
          >
            Start free
          </button>
        </div>
      </div>

      {/* Mobile Drawer if needed */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium">
          <button onClick={() => scrollToSection('how-it-works')} className="text-left py-1 text-slate-800">
            How it works
          </button>
          <button onClick={() => scrollToSection('features')} className="text-left py-1 text-slate-800">
            Features
          </button>
          <button onClick={() => scrollToSection('pricing')} className="text-left py-1 text-slate-800">
            Pricing
          </button>
          <button onClick={onOpenDocs} className="text-left py-1 text-slate-800">
            Docs
          </button>
        </div>
      )}
    </header>
  );
};
