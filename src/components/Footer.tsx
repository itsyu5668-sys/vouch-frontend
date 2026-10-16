import React from 'react';
import { ScreenMode } from '../types';

interface FooterProps {
  onNavigate: (screen: ScreenMode) => void;
  onOpenDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDocs }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-white py-16 md:py-20 text-[#60606c] text-[14px]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-[20px] font-bold tracking-[-0.04em] text-[#070709] block mb-3">
              Vouch
            </span>
            <p className="text-[13px] text-[#8b8b8b] leading-relaxed max-w-[200px]">
              Referral infrastructure for indie hackers and micro-SaaS builders.
            </p>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#070709] mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-[#070709] transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pricing')} className="hover:text-[#070709] transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-[#070709] transition-colors">
                  Docs
                </button>
              </li>
              <li>
                <span className="text-[#8b8b8b] cursor-default">Changelog</span>
              </li>
              <li>
                <span className="text-[#8b8b8b] cursor-default flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Status
                </span>
              </li>
            </ul>
          </div>

          {/* Company Col */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#070709] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-[#8b8b8b] cursor-default">About</span>
              </li>
              <li>
                <span className="text-[#8b8b8b] cursor-default">Blog</span>
              </li>
              <li>
                <a href="mailto:founders@vouch.link" className="hover:text-[#070709] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#070709] transition-colors"
                >
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Col */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#070709] mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onOpenDocs} className="hover:text-[#070709] transition-colors">
                  API reference
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-[#070709] transition-colors">
                  Integration guides
                </button>
              </li>
              <li>
                <span className="text-[#8b8b8b] cursor-default">Help center</span>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#070709] mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-[#070709] transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#070709] transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#8b8b8b]">
          <div>© 2026 Vouch. All rights reserved.</div>
          <div>Built in public — follow along on X.</div>
        </div>
      </div>
    </footer>
  );
};
