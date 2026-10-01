import React from 'react';
import { Sparkles, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';
import { UserRole } from '../types/security';
import { AuthUser } from '../services/authService';

export type ActiveTab = 'landing' | 'dashboard' | 'quiz' | 'results' | 'simulator' | 'comparison' | 'mentor' | 'explorer' | 'security';

export const TAB_ROUTES: { tab: ActiveTab; label: string; href: string }[] = [
  { tab: 'landing', label: 'Home', href: '#/' },
  { tab: 'quiz', label: 'Assessment', href: '#/assessment' },
  { tab: 'results', label: 'My results', href: '#/results' },
  { tab: 'explorer', label: 'Explore careers', href: '#/explore' },
  { tab: 'mentor', label: 'AI Studio', href: '#/ai-studio' },
  { tab: 'simulator', label: 'What-If', href: '#/what-if' },
  { tab: 'dashboard', label: 'Dashboard', href: '#/dashboard' },
  { tab: 'security', label: 'Security', href: '#/security' }
];

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasCompletedQuiz: boolean;
  onOpenOpenRouterModal: () => void;
  openRouterConnected: boolean;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  mfaActive: boolean;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasCompletedQuiz,
  onOpenOpenRouterModal,
  openRouterConnected,
  isDarkTheme,
  onToggleTheme,
  currentRole,
  onRoleChange,
  mfaActive,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const handleNavClick = (tab: ActiveTab, href: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.location.hash !== href) {
      window.location.hash = href;
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-medium)',
      padding: '10px 0',
      transition: 'background var(--transition-normal)'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap'
      }}>
        
        {/* Brand Logo matching Screenshot 1: ✱ CAREERCOMPASS */}
        <a 
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('landing', '#/');
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer', 
            flexShrink: 0,
            textDecoration: 'none'
          }}
        >
          <span style={{ 
            color: '#eb5e34', 
            fontSize: '1.45rem', 
            fontWeight: 900, 
            lineHeight: 1, 
            display: 'inline-block',
            transform: 'translateY(-1px)' 
          }}>
            ✱
          </span>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: 900, 
            fontSize: '1.18rem', 
            letterSpacing: '-0.02em', 
            color: 'var(--text-highlight)',
            textTransform: 'uppercase'
          }}>
            CAREERCOMPASS
          </span>
        </a>

        {/* All Navigation Tabs: Clearly visible in both light & dark mode with individual links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          background: isDarkTheme ? 'var(--bg-card)' : '#ffffff',
          padding: '3px 4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-medium)',
          boxShadow: isDarkTheme ? '0 2px 8px rgba(0,0,0,0.4)' : '1px 1px 0px rgba(20, 20, 20, 0.08)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {TAB_ROUTES.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <a
                key={item.tab}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.tab, item.href);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: isActive ? (isDarkTheme ? 'var(--accent-terracotta)' : '#141414') : 'transparent',
                  color: isActive ? '#ffffff' : (item.tab === 'mentor' ? 'var(--accent-terracotta)' : (isDarkTheme ? '#f5efe6' : '#141414')),
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)'
                }}
                title={`Navigate to ${item.label} (${item.href})`}
              >
                {item.tab === 'mentor' && (
                  <Sparkles size={11} style={{ color: isActive ? '#ffffff' : 'var(--accent-terracotta)' }} />
                )}
                <span>{item.label}</span>
                {item.tab === 'quiz' && hasCompletedQuiz && (
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-terracotta)' }} />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Controls: Prominent TAKE ASSESSMENT CTA + User Profile + Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          
          {/* Prominent Screenshot 1 CTA: TAKE ASSESSMENT ↗ */}
          <a
            href="#/assessment"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('quiz', '#/assessment');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: '#141414',
              color: '#ffffff',
              border: '1px solid #141414',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #eb5e34',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
            title="Take the 12-question diagnostic assessment (#/assessment)"
          >
            <span>TAKE ASSESSMENT</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 900 }}>↗</span>
          </a>

          {/* User Authentication Pill / Login Button */}
          {currentUser && currentUser.id !== 'usr-guest-00' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                onClick={() => handleNavClick(currentUser.role === 'student' ? 'dashboard' : 'security', currentUser.role === 'student' ? '#/dashboard' : '#/security')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: currentUser.role === 'admin' 
                    ? 'rgba(124, 58, 237, 0.08)' 
                    : currentUser.role === 'advisor'
                    ? 'rgba(5, 150, 105, 0.08)'
                    : 'var(--bg-secondary)',
                  border: currentUser.role === 'admin'
                    ? '1px solid rgba(124, 58, 237, 0.35)'
                    : currentUser.role === 'advisor'
                    ? '1px solid rgba(5, 150, 105, 0.35)'
                    : '1px solid var(--border-medium)',
                  cursor: 'pointer',
                  fontSize: '0.78rem'
                }}
                title={`Signed in as ${currentUser.name} (${currentUser.role.toUpperCase()}). Click to manage.`}
              >
                <User size={13} style={{ 
                  color: currentUser.role === 'admin' 
                    ? 'var(--accent-violet)' 
                    : currentUser.role === 'advisor'
                    ? 'var(--accent-emerald)'
                    : 'var(--accent-cyan)'
                }} />
                <span style={{ fontWeight: 700, color: 'var(--text-highlight)' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className={`badge ${
                  currentUser.role === 'admin' ? 'badge-rose' : currentUser.role === 'advisor' ? 'badge-emerald' : 'badge-slate'
                }`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                  {currentUser.role}
                </span>
                {currentUser.mfaEnabled && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} title="MFA Enabled" />
                )}
              </div>

              <button
                onClick={onLogout}
                className="btn-icon"
                style={{ width: '32px', height: '32px' }}
                title="Sign Out of Session"
              >
                <LogOut size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                gap: '5px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <LogIn size={12} />
              <span>Sign In</span>
            </button>
          )}

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkTheme ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: 'var(--accent-indigo)' }} />}
          </button>
        </div>

      </div>
    </header>
  );
};
