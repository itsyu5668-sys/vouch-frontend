import React, { useState } from 'react';
import { ScreenMode } from '../types';
import { Play, Pause, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface LandingHeroProps {
  onNavigate: (screen: ScreenMode) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [attributionStep, setAttributionStep] = useState(2); // 0: click, 1: signup, 2: paid

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden sky-gradient-bg pt-20 pb-28 md:pt-28 md:pb-36 border-b border-[#070709]/5">
      {/* Background subtle light diffuser */}
      <div className="absolute inset-0 bg-radial-at-t from-white/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 text-center">
        {/* Eyebrow text */}
        <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-white/95 mb-5 select-none">
          REFERRAL INFRASTRUCTURE FOR MICRO-SAAS
        </p>

        {/* Headline */}
        <h1 className="text-[46px] sm:text-[64px] lg:text-[80px] font-semibold text-white tracking-[-0.04em] leading-[0.92] max-w-4xl mx-auto mb-7">
          Turn your users into your growth team.
        </h1>

        {/* Subheadline */}
        <p className="text-[16px] sm:text-[18px] text-white/90 leading-[1.49] tracking-[-0.01em] max-w-[580px] mx-auto mb-9">
          Give every customer a unique referral link. We track click to paid conversion and pay out rewards automatically. You write four lines of code.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
          <button
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto px-8 py-3.5 text-[15px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap"
          >
            Start free
          </button>
          <button
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto px-8 py-3.5 text-[15px] font-medium text-[#070709] bg-white/90 hover:bg-white rounded-full border border-white/40 shadow-sm transition-all whitespace-nowrap"
          >
            See how it works
          </button>
        </div>

        {/* Reassurance text */}
        <p className="text-[13px] text-white/85 tracking-[-0.01em] mb-16">
          Free up to $500 in referral revenue. No credit card required.
        </p>

        {/* Hero visual: Product UI card floating on atmospheric shadow */}
        <div className="relative max-w-[960px] mx-auto">
          {/* Main Dashboard Preview Mockup Card */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-atmospheric border border-black/[0.04] text-left">
            {/* Dashboard Labeled Boxes Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: KPI Metric Boxes */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#f5f5f5] rounded-[16px] p-4 border border-black/[0.02]">
                    <div className="text-[11px] uppercase tracking-wider text-[#60606c] font-medium mb-1">
                      Clicks
                    </div>
                    <div className="text-[24px] font-bold text-[#070709] tracking-tight tabular-nums">
                      12,400
                    </div>
                    <div className="text-[11px] text-[#2597d0] mt-1 font-medium">
                      +14% this month
                    </div>
                  </div>

                  <div className="bg-[#f5f5f5] rounded-[16px] p-4 border border-black/[0.02]">
                    <div className="text-[11px] uppercase tracking-wider text-[#60606c] font-medium mb-1">
                      Signups
                    </div>
                    <div className="text-[24px] font-bold text-[#070709] tracking-tight tabular-nums">
                      3,180
                    </div>
                    <div className="text-[11px] text-[#2597d0] mt-1 font-medium">
                      25.6% conversion
                    </div>
                  </div>

                  <div className="bg-[#f5f5f5] rounded-[16px] p-4 border border-black/[0.02]">
                    <div className="text-[11px] uppercase tracking-wider text-[#60606c] font-medium mb-1">
                      Attributed ARR
                    </div>
                    <div className="text-[24px] font-bold text-[#070709] tracking-tight tabular-nums">
                      $86,400
                    </div>
                    <div className="text-[11px] text-[#2597d0] mt-1 font-medium">
                      Automatic Stripe
                    </div>
                  </div>
                </div>

                {/* Live Attribution Journey Mock Box */}
                <div className="bg-white rounded-[18px] p-5 border border-[#bebecc]/40 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-semibold text-[#070709] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2597d0]" />
                      Real-time Attribution Stream
                    </span>
                    <span className="text-[11px] text-[#8b8b8b] font-mono">
                      REF_CODE: RF-8X2K
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#60606c] pt-2">
                    <div
                      onClick={() => setAttributionStep(0)}
                      className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg transition-all ${
                        attributionStep >= 0 ? 'text-[#070709] font-medium' : 'text-slate-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        attributionStep >= 0 ? 'bg-[#2597d0] text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        1
                      </div>
                      <span>Link Click</span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-[#2597d0]" />

                    <div
                      onClick={() => setAttributionStep(1)}
                      className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg transition-all ${
                        attributionStep >= 1 ? 'text-[#070709] font-medium' : 'text-slate-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        attributionStep >= 1 ? 'bg-[#2597d0] text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        2
                      </div>
                      <span>Signup</span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-[#2597d0]" />

                    <div
                      onClick={() => setAttributionStep(2)}
                      className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg transition-all ${
                        attributionStep >= 2 ? 'text-[#070709] font-medium' : 'text-slate-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        attributionStep >= 2 ? 'bg-[#2597d0] text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        3
                      </div>
                      <span>$20 Reward Issued</span>
                    </div>
                  </div>

                  {/* Waveform-style audio/activity visualizer in Surgical Blue */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-7 h-7 rounded-full bg-[#2597d0] text-white flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
                      title="Simulate Event Audio Cue"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <div className="flex-1 flex items-center gap-1 h-6">
                      {[18, 32, 14, 45, 60, 28, 40, 75, 50, 65, 30, 20, 55, 80, 42, 60, 35, 70, 48, 25, 38, 52, 30].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isPlayingAudio ? 'bg-[#2597d0] animate-pulse' : 'bg-[#d7e6f5]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-[#8b8b8b] shrink-0">
                      Webhook 200 OK
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Letters Style Reference Before/After Cards */}
              <div className="lg:col-span-5 relative flex items-center justify-center p-3">
                <div className="relative w-full max-w-[340px]">
                  {/* "Before" Card - Handwritten messy penmanship */}
                  <div className="bg-[#f5f5f5] rounded-[18px] p-5 border border-[#bebecc] rotate-[-3deg] shadow-sm mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b]">
                        Before Vouch
                      </span>
                      <span className="text-[11px] text-red-500 font-medium">
                        Manual & Broken
                      </span>
                    </div>
                    <p className="font-handwritten text-[22px] leading-[1.15] text-[#151515]">
                      "Hey Sarah, Dave signed up via your tweet. Can we credit him 20%? Need to check Stripe & Notion manually..."
                    </p>
                    <div className="mt-3 text-[11px] text-[#8b8b8b] italic">
                      Lost attribution · 4 hrs/week wasted
                    </div>
                  </div>

                  {/* "After" Card - Clean Vouch Automation */}
                  <div className="bg-white rounded-[18px] p-5 border border-[#2597d0]/30 shadow-subtle-sky rotate-[2deg]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d7e6f5]/40 border border-[#2597d0]/20 text-[10px] font-semibold text-[#070709]">
                        <Check className="w-3 h-3 text-[#2597d0]" />
                        With Vouch
                      </div>
                      <span className="text-[11px] text-[#2597d0] font-mono font-medium">
                        Autopilot
                      </span>
                    </div>
                    <p className="text-[14px] font-medium text-[#070709] leading-snug">
                      Attribution verified for <span className="font-mono text-[#2597d0]">user_4821</span>. $20 credit issued on invoice clearance with 14-day clawback guard.
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#60606c]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2597d0]" />
                        Fraud filter passed
                      </span>
                      <span className="font-mono text-[10px]">0 ms latency</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
