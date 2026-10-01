import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroLanding } from './components/HeroLanding';
import { QuizAssessment } from './components/QuizAssessment';
import { CareerProfileResults } from './components/CareerProfileResults';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { CareerComparisonTable } from './components/CareerComparisonTable';
import { AICareerMentor, AISuiteTab } from './components/AICareerMentor';
import { CareerExplorer } from './components/CareerExplorer';
import { CareerDetailModal } from './components/CareerDetailModal';
import { OpenRouterModal } from './components/OpenRouterModal';
import { SecurityConsole } from './components/SecurityConsole';
import { DimensionScores, Career, MatchBreakdown, MarketRegion } from './types';
import { UserRole } from './types/security';
import { DEFAULT_USER_SCORES, calculateCareerMatch, generateMatchBreakdown } from './utils/scoringEngine';
import { CAREERS_DATA } from './data/careersData';
import { MentorService } from './services/mentorService';
import { SecurityService } from './services/securityService';
import { LaborMarketService } from './utils/laborMarketService';
import { AuthService, AuthUser } from './services/authService';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';
import { StudentDashboard } from './components/StudentDashboard';
import { Compass, Sparkles, Heart } from 'lucide-react';

const GUEST_STUDENT: AuthUser = {
  id: 'usr-guest-00',
  email: 'explorer@careercompass.ai',
  name: 'Alex Rivera (Guest Explorer)',
  role: 'student',
  mfaEnabled: false
};

const ROUTE_MAP: Record<string, ActiveTab> = {
  '': 'landing',
  '/': 'landing',
  '#': 'landing',
  '#/': 'landing',
  '#/home': 'landing',
  '#/assessment': 'quiz',
  '#/quiz': 'quiz',
  '#/results': 'results',
  '#/my-results': 'results',
  '#/explore': 'explorer',
  '#/explorer': 'explorer',
  '#/ai-studio': 'mentor',
  '#/mentor': 'mentor',
  '#/what-if': 'simulator',
  '#/simulator': 'simulator',
  '#/dashboard': 'dashboard',
  '#/security': 'security',
  '#/comparison': 'comparison'
};

const TAB_TO_ROUTE: Record<ActiveTab, string> = {
  landing: '#/',
  quiz: '#/assessment',
  results: '#/results',
  explorer: '#/explore',
  mentor: '#/ai-studio',
  simulator: '#/what-if',
  dashboard: '#/dashboard',
  security: '#/security',
  comparison: '#/comparison'
};

const getInitialTab = (): ActiveTab => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.toLowerCase().trim();
    if (ROUTE_MAP[hash]) return ROUTE_MAP[hash];
  }
  return 'landing';
};

export const App: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);
  const [aiSuiteSubTab, setAiSuiteSubTab] = useState<AISuiteTab>('mentor');
  const [userScores, setUserScores] = useState<DimensionScores>(DEFAULT_USER_SCORES);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState<boolean>(false);
  const [selectedCareerForModal, setSelectedCareerForModal] = useState<Career | null>(null);
  const [selectedCareerIdForComparison, setSelectedCareerIdForComparison] = useState<string>('fullstack-engineer');
  const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState<boolean>(false);
  const [openRouterConnected, setOpenRouterConnected] = useState<boolean>(false);

  // Auth & Session state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');
  const [authModalDemoRole, setAuthModalDemoRole] = useState<'student' | 'advisor' | 'admin' | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('comprehensive');

  const setActiveTab = (tab: ActiveTab) => {
    // Unauthenticated users cannot access full platform tools/results/quiz without sign in or sign up
    if (!currentUser && tab !== 'landing') {
      setAuthModalInitialTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetHash = TAB_TO_ROUTE[tab] || '#/';
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().trim();
      if (ROUTE_MAP[hash]) {
        const targetTab = ROUTE_MAP[hash];
        if (!currentUser && targetTab !== 'landing') {
          setActiveTabState('landing');
          setAuthModalInitialTab('login');
          setIsAuthModalOpen(true);
        } else {
          setActiveTabState(targetTab);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);
  
  const [currentRole, setCurrentRole] = useState<UserRole>(() => AuthService.getCurrentUser()?.role || SecurityService.getRole());
  const [mfaActive, setMfaActive] = useState<boolean>(() => AuthService.getCurrentUser()?.mfaEnabled || SecurityService.getMFAConfig().isEnabled);
  const [activeRegion, setActiveRegion] = useState<MarketRegion>(LaborMarketService.getActiveRegion());
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('careercompass_theme') === 'dark';
    }
    return false; // Default to Light theme as requested!
  });

  useEffect(() => {
    setOpenRouterConnected(MentorService.hasApiKey());
  }, []);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('careercompass_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('careercompass_theme', 'light');
    }
  }, [isDarkTheme]);

  const handleToggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  // Compute matches for userScores
  const topMatches: MatchBreakdown[] = useMemo(() => {
    return CAREERS_DATA.map(career => {
      const score = calculateCareerMatch(career, userScores);
      return generateMatchBreakdown(career, userScores, score);
    }).sort((a, b) => b.score - a.score);
  }, [userScores]);

  const handleRoleChange = (role: UserRole) => {
    SecurityService.setRole(role);
    setCurrentRole(role);
  };

  const handleMfaToggle = (enabled: boolean) => {
    SecurityService.toggleMFA(enabled);
    setMfaActive(enabled);
  };

  const handleRegionChange = (region: MarketRegion) => {
    LaborMarketService.setActiveRegion(region);
    setActiveRegion(region);
  };

  const handleLoadStudentProfile = (scores: DimensionScores, studentName: string) => {
    setUserScores(scores);
    setHasCompletedQuiz(true);
    // Student profile loaded dynamically
  };

  const handleCompleteQuiz = (newScores: DimensionScores) => {
    setUserScores(newScores);
    setHasCompletedQuiz(true);
    setActiveTab('results');
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setMfaActive(user.mfaEnabled);
    SecurityService.setRole(user.role);
    setIsAuthModalOpen(false);
    if (user.role === 'student') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('security');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setCurrentRole('student');
    SecurityService.setRole('student');
    setActiveTab('landing');
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalInitialTab(tab);
    setAuthModalDemoRole(null);
    setIsAuthModalOpen(true);
  };

  const handleSelectDemoRole = (role: 'student' | 'advisor' | 'admin') => {
    setAuthModalInitialTab('login');
    setAuthModalDemoRole(role);
    setIsAuthModalOpen(true);
  };

  const handleFooterTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleSelectCareerForComparison = (careerId: string) => {
    setSelectedCareerIdForComparison(careerId);
    setActiveTab('comparison');
  };

  const handleOpenCareerModal = (career: Career) => {
    setSelectedCareerForModal(career);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Ambient background glows */}
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCompletedQuiz={hasCompletedQuiz}
        onOpenOpenRouterModal={() => setIsOpenRouterModalOpen(true)}
        openRouterConnected={openRouterConnected}
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleToggleTheme}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        mfaActive={mfaActive}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuth('login')}
        onLogout={handleLogout}
      />

      {/* Main Content Area - Gated by Authentication */}
      <main className="app-container" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {!currentUser && activeTab !== 'landing' ? (
          <AuthGateway
            onSelectDemo={handleSelectDemoRole}
            onOpenLogin={() => handleOpenAuth('login')}
            onOpenRegister={() => handleOpenAuth('register')}
          />
        ) : (
          <>
            {activeTab === 'landing' && (
              <HeroLanding
                onStartQuiz={() => setActiveTab('quiz')}
                setActiveTab={setActiveTab}
                hasCompletedQuiz={hasCompletedQuiz}
                onOpenAiStudio={(subTab) => {
                  if (subTab) setAiSuiteSubTab(subTab);
                  setActiveTab('mentor');
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              <StudentDashboard
                user={currentUser || GUEST_STUDENT}
                topMatches={topMatches}
                userScores={userScores}
                hasCompletedQuiz={hasCompletedQuiz}
                setActiveTab={setActiveTab}
                onOpenCareerModal={handleOpenCareerModal}
                onStartTrack={(trackId) => {
                  setSelectedTrackId(trackId);
                  setActiveTab('quiz');
                }}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizAssessment
                onCompleteQuiz={handleCompleteQuiz}
                onCancel={() => setActiveTab(currentUser?.role === 'student' ? 'dashboard' : 'landing')}
                initialTrackId={selectedTrackId}
                onSelectTrack={setSelectedTrackId}
              />
            )}

            {activeTab === 'results' && (
              <CareerProfileResults
                topMatches={topMatches}
                userScores={userScores}
                setActiveTab={setActiveTab}
                onSelectCareerForComparison={handleSelectCareerForComparison}
                onOpenCareerModal={handleOpenCareerModal}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'simulator' && (
              <WhatIfSimulator
                baselineMatches={topMatches}
                setActiveTab={setActiveTab}
                onSelectCareerForComparison={handleSelectCareerForComparison}
                onOpenCareerModal={handleOpenCareerModal}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'comparison' && (
              <CareerComparisonTable
                baselineMatches={topMatches}
                setActiveTab={setActiveTab}
                onOpenCareerModal={handleOpenCareerModal}
                selectedCareerIdForComparison={selectedCareerIdForComparison}
              />
            )}

            {activeTab === 'mentor' && (
              <AICareerMentor
                userScores={userScores}
                topMatches={topMatches}
                selectedCareer={selectedCareerForModal || topMatches[0]?.career}
                openRouterConnected={openRouterConnected}
                onOpenOpenRouterModal={() => setIsOpenRouterModalOpen(true)}
                activeRegion={activeRegion}
                onApplyScores={(scores) => {
                  setUserScores(scores);
                  setHasCompletedQuiz(true);
                }}
                onNavigateToResults={() => setActiveTab('results')}
                initialSubTab={aiSuiteSubTab}
              />
            )}

            {activeTab === 'explorer' && (
              <CareerExplorer
                userScores={userScores}
                baselineMatches={topMatches}
                setActiveTab={setActiveTab}
                onSelectCareerForComparison={handleSelectCareerForComparison}
                onOpenCareerModal={handleOpenCareerModal}
              />
            )}

            {activeTab === 'security' && (
              <SecurityConsole
                currentRole={currentRole}
                currentUser={currentUser}
                onRoleChange={handleRoleChange}
                mfaActive={mfaActive}
                onMfaToggle={handleMfaToggle}
                onLoadStudentProfile={handleLoadStudentProfile}
                onOpenAuthModal={() => handleOpenAuth('login')}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CareerDetailModal
        career={selectedCareerForModal}
        userScores={userScores}
        onClose={() => setSelectedCareerForModal(null)}
        setActiveTab={setActiveTab}
        onSelectForComparison={handleSelectCareerForComparison}
      />

      <OpenRouterModal
        isOpen={isOpenRouterModalOpen}
        onClose={() => setIsOpenRouterModalOpen(false)}
        onKeySaved={() => setOpenRouterConnected(MentorService.hasApiKey())}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authModalInitialTab}
        initialDemoRole={authModalDemoRole}
      />

      {/* Swiss Neo-Brutalist Technical Footer matching Screenshot 3 */}
      <footer style={{
        borderTop: '1px solid var(--border-medium)',
        background: 'var(--bg-card)',
        padding: '36px 0 40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="app-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* Brand & Slogan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
              <span style={{ color: '#eb5e34', fontSize: '1.35rem', fontWeight: 900, lineHeight: 1 }}>✱</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-highlight)', textTransform: 'uppercase' }}>
                CAREERCOMPASS
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.35, margin: 0 }}>
              Discover your path.<br />Build your future.
            </p>
          </div>

          {/* Navigation Page Links */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <a href="#/" onClick={(e) => { e.preventDefault(); setActiveTab('landing'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</a>
            <a href="#/assessment" onClick={(e) => { e.preventDefault(); setActiveTab('quiz'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Assessment</a>
            <a href="#/results" onClick={(e) => { e.preventDefault(); setActiveTab('results'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>My Results</a>
            <a href="#/explore" onClick={(e) => { e.preventDefault(); setActiveTab('explorer'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Explore</a>
            <a href="#/ai-studio" onClick={(e) => { e.preventDefault(); setActiveTab('mentor'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Studio</a>
            <a href="#/what-if" onClick={(e) => { e.preventDefault(); setActiveTab('simulator'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>What-If</a>
            <a href="#/dashboard" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dashboard</a>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.86rem', color: 'var(--text-highlight)', fontWeight: 600 }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              GitHub ↗
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              LinkedIn ↗
            </a>
            <a href="#/security" onClick={(e) => { e.preventDefault(); setActiveTab('security'); }} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Security & RBAC ↗
            </a>
          </div>

          {/* Copyright */}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>© 2026 CareerCompass • Made for curious minds</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
