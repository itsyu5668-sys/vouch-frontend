import React, { useState, useEffect, useCallback } from 'react';
import {
  ScreenMode,
  DashboardTab,
  WorkspaceState,
  Program
} from './types';
import { supabase } from './lib/supabase';
import {
  setToken,
  getToken,
  getMe,
  listPrograms,
  createProgram,
  patchProgram,
  getProgramStats
} from './lib/api';
import { mapWorkspace, mapProgram } from './lib/mappers';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { HowItWorks } from './components/HowItWorks';
import { FeaturesGrid } from './components/FeaturesGrid';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { DocsModal } from './components/DocsModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { AuthScreens } from './components/Auth/AuthScreens';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { DashboardShell } from './components/Dashboard/DashboardShell';

const emptyWorkspace: WorkspaceState = {
  name: '',
  website: '',
  signupUrl: '',
  contactEmail: '',
  isTestMode: false,
  plan: 'Free',
  usageRevenue: 0,
  maxRevenue: 500,
  apiKey: ''
};

export default function App() {
  const [screen, setScreen] = useState<ScreenMode>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [docsOpen, setDocsOpen] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  // App-wide persistent state (loaded from the API after auth)
  const [workspace, setWorkspace] = useState<WorkspaceState>(emptyWorkspace);
  const [programs, setPrograms] = useState<Program[]>([]);

  const updateWorkspace = useCallback((updates: Partial<WorkspaceState>) => {
    setWorkspace((prev) => ({ ...prev, ...updates }));
  }, []);

  /** Fetch workspace + programs from the API and store them locally.
   *  Returns the mapped programs for routing decisions. */
  const refreshWorkspace = useCallback(async (): Promise<Program[]> => {
    const me = await getMe();
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email ?? '';
    const ws = mapWorkspace(me.workspace, email);

    const { programs: apiPrograms } = await listPrograms();
    const mapped = apiPrograms.map(mapProgram);

    // Usage revenue = sum of attributed MRR across programs
    try {
      const statsList = await Promise.all(
        mapped.map((p) => getProgramStats(p.id).catch(() => null))
      );
      const usageCents = statsList.reduce(
        (acc, s) => acc + (s?.attributed_mrr_cents ?? 0),
        0
      );
      ws.usageRevenue = Math.round(usageCents / 100);
    } catch {
      // usage stays 0 if stats fail
    }

    setWorkspace(ws);
    setPrograms(mapped);
    return mapped;
  }, []);

  // Restore session on mount and subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setToken(session.access_token);
          setAuthed(true);
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            try {
              const progs = await refreshWorkspace();
              // Don't yank the user off the verify screen mid-signup
              setScreen((prev) =>
                prev === 'verify' ? prev : progs.length > 0 ? 'dashboard' : 'onboarding'
              );
            } catch {
              // Token invalid or backend unreachable — force sign in
              setToken(null);
              setAuthed(false);
            } finally {
              setBootLoading(false);
            }
          }
        } else {
          setToken(null);
          setAuthed(false);
          setBootLoading(false);
          if (event === 'SIGNED_OUT') {
            setScreen('landing');
            setPrograms([]);
            setWorkspace(emptyWorkspace);
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [refreshWorkspace]);

  // Route guard: dashboard requires a session
  useEffect(() => {
    if (!bootLoading && screen === 'dashboard' && !authed && !getToken()) {
      setScreen('signin');
    }
  }, [bootLoading, screen, authed]);

  const handleNavigate = (newScreen: ScreenMode) => {
    setScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setToken(null);
      setAuthed(false);
      setPrograms([]);
      setWorkspace(emptyWorkspace);
      handleNavigate('landing');
    }
  };

  /* ---------------- Program CRUD (API-backed) ---------------- */

  const handleAddProgram = useCallback(
    async (data: { name: string; slug?: string; description?: string; redirect_url?: string }) => {
      const { program } = await createProgram(data);
      const mapped = mapProgram(program);
      setPrograms((prev) => [mapped, ...prev]);
      return mapped;
    },
    []
  );

  const handleUpdateProgram = useCallback(
    async (
      id: string,
      data: { name?: string; description?: string; redirect_url?: string; status?: 'active' | 'paused' }
    ) => {
      const { program } = await patchProgram(id, data);
      const mapped = mapProgram(program);
      // Preserve live-overlaid stats fields already in state
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? { ...mapped, clicksCount: p.clicksCount, revenueAttributed: p.revenueAttributed } : p))
      );
    },
    []
  );

  const handleArchiveProgram = useCallback(async (id: string) => {
    await patchProgram(id, { status: 'archived' });
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleToggleProgramStatus = useCallback(
    async (id: string) => {
      const current = programs.find((p) => p.id === id);
      const next = current?.status === 'Active' ? 'paused' : 'active';
      const { program } = await patchProgram(id, { status: next });
      const mapped = mapProgram(program);
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? { ...mapped, clicksCount: p.clicksCount, revenueAttributed: p.revenueAttributed } : p))
      );
    },
    [programs]
  );

  if (bootLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-[22px] font-bold tracking-tight text-[#070709] mb-2">Vouch</div>
          <div className="text-[13px] text-[#60606c]">Loading your workspace…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#070709] font-sans selection:bg-[#d7e6f5]">
      {/* 1. MARKETING LANDING PAGE */}
      {screen === 'landing' && (
        <div className="flex flex-col min-h-screen">
          <Navbar
            currentScreen={screen}
            onNavigate={handleNavigate}
            onOpenDocs={() => setDocsOpen(true)}
          />

          <main className="flex-1">
            <LandingHero onNavigate={handleNavigate} />
            <HowItWorks onOpenDocs={() => setDocsOpen(true)} />
            <FeaturesGrid />
            <Pricing onNavigate={handleNavigate} />
            <FAQ />
            <FinalCTA onNavigate={handleNavigate} />
          </main>

          <Footer
            onNavigate={handleNavigate}
            onOpenDocs={() => setDocsOpen(true)}
          />
        </div>
      )}

      {/* 2. STANDALONE PRIVACY POLICY */}
      {screen === 'privacy' && (
        <PrivacyPolicy onNavigate={handleNavigate} />
      )}

      {/* 3. STANDALONE TERMS OF SERVICE */}
      {screen === 'terms' && (
        <TermsOfService onNavigate={handleNavigate} />
      )}

      {/* 4. AUTHENTICATION SCREENS (Sign up, Sign in, Reset password, Verify email) */}
      {(screen === 'signup' || screen === 'signin' || screen === 'reset' || screen === 'verify') && (
        <AuthScreens
          currentScreen={screen}
          onNavigate={handleNavigate}
          workspace={workspace}
          onUpdateWorkspace={updateWorkspace}
        />
      )}

      {/* 5. ONBOARDING 5-STEP WIZARD */}
      {screen === 'onboarding' && (
        <OnboardingWizard
          workspace={workspace}
          onUpdateWorkspace={updateWorkspace}
          onComplete={(targetTab) => {
            if (targetTab) setDashboardTab(targetTab);
            // Refresh so the freshly created program shows up immediately
            refreshWorkspace().catch(() => undefined);
            setScreen('dashboard');
          }}
          onNavigate={handleNavigate}
        />
      )}

      {/* 6. FOUNDER DASHBOARD (7 TABS) */}
      {screen === 'dashboard' && (
        <DashboardShell
          currentTab={dashboardTab}
          onSelectTab={setDashboardTab}
          onNavigate={handleNavigate}
          workspace={workspace}
          onUpdateWorkspace={updateWorkspace}
          programs={programs}
          onAddProgram={handleAddProgram}
          onUpdateProgram={handleUpdateProgram}
          onArchiveProgram={handleArchiveProgram}
          onToggleProgramStatus={handleToggleProgramStatus}
          onSignOut={handleSignOut}
          onOpenDocs={() => setDocsOpen(true)}
        />
      )}

      {/* Interactive Docs Dialog */}
      <DocsModal isOpen={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
