import React, { useState } from 'react';
import { ScreenMode, WorkspaceState } from '../../types';
import { supabase } from '../../lib/supabase';
import { setToken } from '../../lib/api';
import { Check, ShieldCheck, ArrowLeft, Mail, AlertCircle } from 'lucide-react';

interface AuthScreensProps {
  currentScreen: ScreenMode;
  onNavigate: (screen: ScreenMode) => void;
  workspace: WorkspaceState;
  onUpdateWorkspace: (updates: Partial<WorkspaceState>) => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({
  currentScreen,
  onNavigate,
  workspace,
  onUpdateWorkspace
}) => {
  // Sign up state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [productName, setProductName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Sign in state
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  // Verify email state
  const [verifyExpired, setVerifyExpired] = useState(false);
  const [verifyResent, setVerifyResent] = useState(false);

  // Google OAuth loading simulation
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Shared submitting state for email/password forms
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signinError, setSigninError] = useState('');

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setSignupError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setSignupError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { data: { product_name: productName || 'My SaaS Product' } }
      });
      if (error) throw error;
      if (data.session) {
        // Email confirmation disabled — session is live immediately.
        setToken(data.session.access_token);
        onUpdateWorkspace({
          contactEmail: signupEmail,
          name: productName || 'My SaaS Product'
        });
      }
      onNavigate('verify');
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setGoogleError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // On success the browser redirects to Google; the session (and routing)
      // is handled by the auth-state subscription in App when we return.
    } catch (err) {
      setGoogleError(
        err instanceof Error ? err.message : 'Google sign-in failed. Please try again.'
      );
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSigninError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword
      });
      if (error) throw error;
      if (data.session) {
        setToken(data.session.access_token);
        onUpdateWorkspace({ contactEmail: signinEmail });
        // Routing to dashboard/onboarding is handled by the auth subscription in App.
      }
    } catch (err) {
      setSigninError(
        err instanceof Error ? err.message : 'Sign in failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsSubmitting(true);
    setResetError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setResetError(
        err instanceof Error ? err.message : 'Could not send a reset link. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Column: Interactive Auth Form */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-12 py-8 lg:py-12 max-w-xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('landing')}
            className="text-[22px] font-bold tracking-tight text-[#070709] hover:opacity-85 transition-opacity"
          >
            Vouch
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs font-medium text-[#60606c] hover:text-[#070709] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to website
          </button>
        </div>

        {/* Dynamic Form Area */}
        <div className="my-auto py-6">
          {/* 1. SIGN UP SCREEN */}
          {currentScreen === 'signup' && (
            <div>
              <div className="mb-8">
                <h1 className="text-[32px] font-bold text-[#070709] tracking-[-0.04em] mb-2">
                  Create your workspace
                </h1>
                <p className="text-[14px] text-[#60606c]">
                  Free up to $500 in referral revenue. No credit card required.
                </p>
              </div>

              {signupError && (
                <div className="mb-6 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {signupError}
                </div>
              )}

              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#070709] mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@yourcompany.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#bebecc] focus:border-[#070709] focus:outline-none text-[14px] text-[#070709] transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-medium text-[#070709]">
                      Password
                    </label>
                    <span className="text-[11px] text-[#8b8b8b]">8+ characters</span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#bebecc] focus:border-[#070709] focus:outline-none text-[14px] text-[#070709] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#070709] mb-1.5">
                    Product name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tiny Analytics"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#bebecc] focus:border-[#070709] focus:outline-none text-[14px] text-[#070709] transition-all"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-[#60606c] select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#bebecc] text-[#070709] focus:ring-0"
                    />
                    <span>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('terms')}
                        className="text-[#070709] underline hover:text-[#2597d0]"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('privacy')}
                        className="text-[#070709] underline hover:text-[#2597d0]"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 text-[14px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Creating workspace…' : 'Create workspace'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[12px] text-[#8b8b8b]">or</span>
              </div>

              {googleError && (
                <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {googleError}
                </div>
              )}

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 text-[14px] font-medium text-[#070709] bg-white border border-[#bebecc] rounded-full hover:border-[#070709] flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="mt-8 text-center text-[13px] text-[#60606c]">
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('signin')}
                  className="text-[#070709] font-medium underline underline-offset-2 hover:text-[#2597d0]"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* 2. SIGN IN SCREEN */}
          {currentScreen === 'signin' && (
            <div>
              <div className="mb-8">
                <h1 className="text-[32px] font-bold text-[#070709] tracking-[-0.04em] mb-2">
                  Welcome back
                </h1>
                <p className="text-[14px] text-[#60606c]">
                  Sign in to your Vouch workspace to manage referrals.
                </p>
              </div>

              {signinError && (
                <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {signinError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#070709] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@yourcompany.com"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#bebecc] focus:border-[#070709] focus:outline-none text-[14px] text-[#070709] transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-medium text-[#070709]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate('reset')}
                      className="text-[12px] text-[#60606c] hover:text-[#070709] underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#bebecc] focus:border-[#070709] focus:outline-none text-[14px] text-[#070709] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 text-[14px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[12px] text-[#8b8b8b]">or</span>
              </div>

              {googleError && (
                <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {googleError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 text-[14px] font-medium text-[#070709] bg-white border border-[#bebecc] rounded-full hover:border-[#070709] flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="mt-8 text-center text-[13px] text-[#60606c]">
                New here?{' '}
                <button
                  onClick={() => onNavigate('signup')}
                  className="text-[#070709] font-medium underline underline-offset-2 hover:text-[#2597d0]"
                >
                  Create a workspace
                </button>
              </div>
            </div>
          )}

          {/* 3. FORGOT PASSWORD SCREEN */}
          {currentScreen === 'reset' && (
            <div>
              <div className="mb-8">
                <h1 className="text-[32px] font-bold text-[#070709] tracking-[-0.04em] mb-2">
                  Reset your password
                </h1>
                <p className="text-[14px] text-[#60606c]">
                  Enter the email you signed up with and we'll send you a reset link.
                </p>
              </div>

              {resetError && (
                <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {resetError}
                </div>
              )}

              {resetSent ? (
                <div className="p-6 rounded-[18px] bg-[#f5f5f5] border border-black/[0.04] space-y-4">
                  <div className="w-10 h-10 rounded-full bg-[#d7e6f5]/40 flex items-center justify-center text-[#2597d0]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#070709]">
                    Check your inbox
                  </h3>
                  <p className="text-[14px] text-[#60606c] leading-relaxed">
                    If an account exists for that email, a reset link is on its way.
                  </p>
                  <button
                    onClick={() => onNavigate('signin')}
                    className="w-full mt-2 py-3 px-4 text-[14px] font-medium text-[#070709] rounded-full border border-[#bebecc] hover:border-[#070709]"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#070709] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@yourcompany.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#bebecc] focus:border-[#070709] focus:outline-none text-[14px] text-[#070709] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 text-[14px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] active:scale-[0.99] transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? 'Sending…' : 'Send reset link'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('signin')}
                      className="text-[13px] text-[#60606c] hover:text-[#070709] underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 4. VERIFY EMAIL SCREEN */}
          {currentScreen === 'verify' && (
            <div className="p-8 rounded-[24px] bg-[#f5f5f5] border border-black/[0.04] space-y-5">
              {!verifyExpired ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#d7e6f5]/50 flex items-center justify-center text-[#2597d0]">
                    <Check className="w-6 h-6" />
                  </div>
                  <h1 className="text-[26px] font-bold text-[#070709] tracking-tight">
                    Email verified.
                  </h1>
                  <p className="text-[15px] text-[#60606c] leading-relaxed">
                    Let's set up your first referral program.
                  </p>
                  <button
                    onClick={() => onNavigate('onboarding')}
                    className="w-full py-3.5 px-4 text-[14px] font-medium text-white bg-[#070709] rounded-full shadow-pill hover:bg-[#151515] active:scale-[0.99] transition-all"
                  >
                    Continue
                  </button>
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => setVerifyExpired(true)}
                      className="text-[11px] text-[#8b8b8b] hover:text-[#60606c] underline"
                    >
                      (Simulate expired link)
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h1 className="text-[26px] font-bold text-[#070709] tracking-tight">
                    This link expired.
                  </h1>
                  <p className="text-[15px] text-[#60606c]">
                    {verifyResent ? 'A new verification email was sent to your inbox!' : 'Security links expire after 24 hours.'}
                  </p>
                  <button
                    onClick={() => {
                      setVerifyResent(true);
                      setTimeout(() => setVerifyExpired(false), 1200);
                    }}
                    className="w-full py-3.5 px-4 text-[14px] font-medium text-[#070709] rounded-full border border-[#bebecc] hover:border-[#070709] transition-all"
                  >
                    Resend verification email
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quiet footer */}
        <div className="text-[12px] text-[#8b8b8b] text-center pt-6">
          © 2026 Vouch. Pure monochrome infrastructure.
        </div>
      </div>

      {/* Right Column: High-Intent Split Pitch Panel */}
      <div className="hidden lg:flex flex-1 sky-gradient-bg p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-white/90 block mb-6">
            DROPBOX-STYLE REFERRALS FOR MICRO-SAAS
          </span>

          <h2 className="text-[44px] font-bold text-white tracking-[-0.04em] leading-[1.05] mb-8">
            Turn your users into your growth team.
          </h2>

          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-white tracking-tight">
                  Unique referral link per user
                </h3>
                <p className="text-[14px] text-white/85 leading-snug mt-1">
                  First-party cookies guarantee attribution without ad-blocker interference.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-white tracking-tight">
                  Click-to-paid tracking
                </h3>
                <p className="text-[14px] text-white/85 leading-snug mt-1">
                  Know exactly which users generate genuine revenue, not just vanity clicks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-white tracking-tight">
                  Automatic Stripe rewards
                </h3>
                <p className="text-[14px] text-white/85 leading-snug mt-1">
                  Rewards issue when invoices clear, with automatic clawback if customers churn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div className="relative z-10 pt-12 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            Zero setup fees · 14-day clawback window
          </span>
          <span className="font-mono text-[11px]">Vouch v1.0</span>
        </div>
      </div>
    </div>
  );
};
