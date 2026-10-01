import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowRight, Sparkles, BrainCircuit, Compass, CheckCircle2, FileText, Mic, 
  Mail, DollarSign, Target, SlidersHorizontal, Flame, Trophy, Award, 
  RotateCcw, User, TrendingUp, Layers, Zap, Star, ShieldCheck, Heart,
  BarChart3, ChevronRight
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { AISuiteTab } from './AICareerMentor';
import { CompassGraphic } from './CompassGraphic';
import { calculateDynamicGamification } from '../utils/dynamicCalculationEngine';

interface HeroLandingProps {
  onStartQuiz: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  hasCompletedQuiz: boolean;
  onOpenAiStudio?: (tab?: AISuiteTab) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartQuiz,
  setActiveTab,
  hasCompletedQuiz,
  onOpenAiStudio
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [mentorQuery, setMentorQuery] = useState('');
  const [activeTrack, setActiveTrack] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const showcaseRef = useRef<HTMLDivElement>(null);
  const gamification = useMemo(() => calculateDynamicGamification(), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showcaseRef.current) return;
    const rect = showcaseRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleOpenAiTab = (subTab: AISuiteTab) => {
    if (onOpenAiStudio) {
      onOpenAiStudio(subTab);
    } else {
      setActiveTab('mentor');
    }
  };

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOpenAiStudio) {
      onOpenAiStudio('mentor');
    } else {
      setActiveTab('mentor');
    }
  };

  // Popular Career Assessment Tracks (from Reference UI "Popular Game 🔥")
  const POPULAR_TRACKS = [
    {
      id: 'tech-01',
      title: 'Full-Stack Systems Architect',
      category: 'Technology',
      diamonds: 50,
      xp: 120,
      description: 'Explore web distributed systems, cloud microservices, and reactive frontend architectures.',
      level: 'Mid to Senior',
      difficulty: 'High Match',
      accentColor: '#eb5e34',
      badge: 'POPULAR 🔥'
    },
    {
      id: 'ai-02',
      title: 'AI/ML & Agent Systems',
      category: 'AI & Data',
      diamonds: 65,
      xp: 150,
      description: 'Train models, construct LLM workflows, and orchestrate automated reasoning pipelines.',
      level: 'Advanced',
      difficulty: 'Trending 🔥',
      accentColor: '#141414',
      badge: 'NEW TRACK ⚡'
    },
    {
      id: 'data-03',
      title: 'Data Platform Engineer',
      category: 'Data Science',
      diamonds: 45,
      xp: 110,
      description: 'Find the signal in noisy real-time streams and design enterprise data warehouses.',
      level: 'Mid-Level',
      difficulty: 'Solid Match',
      accentColor: '#f4be43',
      badge: 'HIGH DEMAND 📈'
    },
    {
      id: 'design-04',
      title: 'Design Systems & UI Engineer',
      category: 'Design & UX',
      diamonds: 40,
      xp: 95,
      description: 'Bridge high-fidelity ergonomics, micro-interactions, and accessible typography systems.',
      level: 'Creative Tech',
      difficulty: 'High Match',
      accentColor: '#0284c7',
      badge: 'TOP CREATIVE ✨'
    }
  ];

  // Pathfinder Leaderboard entries (from Reference UI "Leaderboard 🔥")
  const LEADERBOARD_USERS = [
    { rank: 1, name: 'Emma Ema', diamonds: 888, points: '1,420 XP', medal: '🥇', avatarBg: '#fef08a', role: 'AI Systems' },
    { rank: 2, name: 'Sophia Cba', diamonds: 880, points: '1,380 XP', medal: '🥈', avatarBg: '#fed7aa', role: 'Full-Stack' },
    { rank: 3, name: 'Andrew T.', diamonds: 808, points: '1,290 XP', medal: '🥉', avatarBg: '#bbf7d0', role: 'Data Eng' },
    { rank: 4, name: 'Bayu aji sadewa', diamonds: 760, points: '1,120 XP', medal: '#4', avatarBg: '#e2e8f0', role: 'Security' },
    { rank: 5, name: 'Olivia Ava', diamonds: 740, points: '1,050 XP', medal: '#5', avatarBg: '#fbcfe8', role: 'UI/UX' }
  ];

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '90px' }}>
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH GAMIFIED REWARD BAR & 3D INTERACTIVE COMPASS */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        alignItems: 'center',
        gap: '40px',
        paddingTop: '16px',
        paddingBottom: '32px'
      }}>
        {/* Left Column: Editorial Headline & Gamified Stats */}
        <div>
          {/* Reference Gamified Pill Bar (Diamond counter, XP, Streak) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            <div className="diamond-pill" title="Career Discovery Diamonds">
              <span style={{ fontSize: '0.95rem' }}>💎</span>
              <span>{gamification.diamonds} Diamonds</span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: 'var(--accent-terracotta)',
              boxShadow: '1.5px 1.5px 0px var(--border-medium)'
            }}>
              <Flame size={14} style={{ color: 'var(--accent-terracotta)' }} />
              <span>{gamification.streakDays}-Day Streak</span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              fontSize: '0.74rem',
              color: 'var(--accent-indigo)'
            }}>
              <span>Lvl {gamification.level}: {gamification.levelTitle}</span>
            </div>
          </div>

          {/* Editorial Headline */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6.5vw, 4.6rem)',
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text-highlight)',
            marginBottom: '22px'
          }}>
            Discover your path.<br />
            <span style={{ color: 'var(--accent-terracotta)' }}>Build your future.</span>
          </h1>

          <p style={{
            fontSize: '1.08rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            maxWidth: '520px',
            marginBottom: '32px'
          }}>
            Explore where your genuine problem-solving instincts, engineering intuition, and cognitive traits align best. Powered by an interactive 3D compass, live AI technical mock interviews, and instant resume scanning.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onStartQuiz}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 26px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--text-highlight)',
                color: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.88rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px var(--accent-terracotta)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Trophy size={16} style={{ color: 'var(--accent-ochre)' }} />
              <span>{hasCompletedQuiz ? 'Retake Assessment' : 'Take Assessment'}</span>
              <span style={{ fontSize: '1rem' }}>↗</span>
            </button>

            <button
              onClick={() => handleOpenAiTab('resumeScan')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '2px 2px 0px var(--border-medium)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Sparkles size={16} style={{ color: 'var(--accent-terracotta)' }} />
              <span>AI Resume Scan (10s)</span>
            </button>

            {hasCompletedQuiz && (
              <button
                onClick={() => setActiveTab('results')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-full)',
                  background: '#ffffff',
                  color: '#eb5e34',
                  border: '1px solid #eb5e34',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #eb5e34'
                }}
              >
                <Compass size={16} />
                <span>My Results Dossier</span>
                <span>↗</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive 3D Vector Compass */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CompassGraphic angle={38} interactive3D={true} />
        </div>
      </div>

      {/* Hairline Divider */}
      <div style={{ borderBottom: '1px solid var(--border-medium)', width: '100%', margin: '40px 0 54px' }} />

      {/* ========================================================================= */}
      {/* 2. 3D SCROLLING PERSPECTIVE SHOWCASE (Directly Inspired by Reference UI) */}
      {/* ========================================================================= */}
      <div 
        ref={showcaseRef}
        onMouseMove={handleMouseMove}
        style={{ marginBottom: '64px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-terracotta)',
              marginBottom: '6px'
            }}>
              02 / 3D PERSPECTIVE SHOWCASE
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              lineHeight: 1.1,
              fontWeight: 800,
              color: 'var(--text-highlight)',
              margin: 0
            }}>
              Interactive Learning & Discovery Suite
            </h2>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}>
            HOVER & SCROLL TO TILT IN 3D
          </div>
        </div>

        {/* 3D Perspective Stage Container */}
        <div 
          className="perspective-stage"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '24px',
            padding: '20px 8px 30px'
          }}
        >
          {/* 3D Card 1: Technology Diagnostic Card (matching Left Card in reference) */}
          <div 
            className="card-3d-left"
            onClick={onStartQuiz}
            style={{
              background: '#eb5e34',
              borderRadius: '24px',
              padding: '28px 24px',
              color: '#ffffff',
              border: '2px solid #141414',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '440px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top row: Pill badge + Heart */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
              <span style={{
                background: '#141414',
                color: '#ffffff',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Technology
              </span>

              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '1px 1px 0px #141414'
              }}>
                <Heart size={18} color="#eb5e34" fill="#eb5e34" />
              </div>
            </div>

            {/* Middle Content: Title & Tagline */}
            <div style={{ marginTop: '30px', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🏆</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#141414' }}>
                  Diagnostic Track 01
                </span>
              </div>

              <h3 style={{
                fontSize: '2.1rem',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '14px',
                letterSpacing: '-0.02em'
              }}>
                Technology
              </h3>

              <p style={{
                fontSize: '0.92rem',
                color: '#ffffff',
                opacity: 0.95,
                lineHeight: 1.5,
                marginBottom: '20px'
              }}>
                Explore the world of technology with the 12-question diagnostic and see if you have what it takes to go from a novice to a tech master!
              </p>
            </div>

            {/* Bottom: XP Reward Pill & CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
              paddingTop: '16px'
            }}>
              <div style={{
                background: 'rgba(20, 20, 20, 0.25)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>💎 50 Diamonds</span>
                <span>• +120 XP</span>
              </div>

              <div style={{
                background: '#141414',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Play Now</span>
                <span>↗</span>
              </div>
            </div>
          </div>

          {/* 3D Card 2: Play To Gain Knowledge (Center Card in reference) */}
          <div 
            className="card-3d-center"
            onClick={() => handleOpenAiTab('mentor')}
            style={{
              background: '#f5efe6',
              borderRadius: '24px',
              padding: '28px 24px',
              color: '#141414',
              border: '2px solid #141414',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '440px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.25rem' }}>✨</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  AI Career Studio
                </span>
              </div>

              <div className="diamond-pill" style={{ background: '#ffffff' }}>
                <span>💎 80 XP</span>
              </div>
            </div>

            {/* Collage Feature Box */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #141414',
              borderRadius: '16px',
              padding: '20px',
              margin: '20px 0',
              boxShadow: '2px 2px 0px #141414'
            }}>
              <h3 style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#141414',
                lineHeight: 1.15,
                marginBottom: '10px'
              }}>
                Play To Gain Your Knowledge
              </h3>
              <p style={{
                fontSize: '0.88rem',
                color: '#4a453e',
                lineHeight: 1.5,
                margin: 0
              }}>
                Tackle unscripted engineering challenges, practice live AI mock interviews, or paste your resume for 10-second cognitive dimension calibration.
              </p>
            </div>

            {/* Bottom Button */}
            <div>
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#141414',
                  color: '#ffffff',
                  border: '1px solid #141414',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '2px 2px 0px #eb5e34'
                }}
              >
                <span>Get Started with AI</span>
                <span>↗</span>
              </button>
            </div>
          </div>

          {/* 3D Card 3: Pathfinder Leaderboard (Right Card in reference) */}
          <div 
            className="card-3d-right"
            onClick={() => setActiveTab('dashboard')}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px 24px',
              color: '#141414',
              border: '2px solid #141414',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '440px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem' }}>
                  Leaderboard
                </span>
                <span style={{ fontSize: '1.1rem' }}>🔥</span>
              </div>

              <div className="diamond-pill">
                <span>💎 20</span>
              </div>
            </div>

            {/* Top 3 Podium Avatars (Matching Reference Mockup!) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '14px',
              margin: '18px 0'
            }}>
              {/* #2 Rank: Sophia Cba */}
              <div className="avatar-podium">
                <div className="avatar-circle" style={{ background: '#fed7aa', width: '56px', height: '56px' }}>
                  <span style={{ fontSize: '1.3rem' }}>👩‍💻</span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: '#141414',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  marginTop: '-8px',
                  zIndex: 2
                }}>
                  ②
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '4px' }}>Sophia</span>
                <span style={{ fontSize: '0.68rem', color: '#78716c' }}>880 💎</span>
              </div>

              {/* #1 Rank: Emma Ema (Prominent in center) */}
              <div className="avatar-podium" style={{ transform: 'translateY(-10px)' }}>
                <div className="avatar-circle" style={{ background: '#fef08a', width: '70px', height: '70px', border: '2.5px solid #141414' }}>
                  <span style={{ fontSize: '1.6rem' }}>👩‍🔬</span>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  background: '#f4be43',
                  color: '#141414',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  marginTop: '-10px',
                  zIndex: 2,
                  border: '1px solid #141414'
                }}>
                  ①
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 900, marginTop: '4px' }}>Emma Ema</span>
                <span style={{ fontSize: '0.72rem', color: '#eb5e34', fontWeight: 800 }}>888 💎</span>
              </div>

              {/* #3 Rank: Andrew */}
              <div className="avatar-podium">
                <div className="avatar-circle" style={{ background: '#bbf7d0', width: '56px', height: '56px' }}>
                  <span style={{ fontSize: '1.3rem' }}>🧑‍💻</span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: '#141414',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  marginTop: '-8px',
                  zIndex: 2
                }}>
                  ③
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '4px' }}>Andrew</span>
                <span style={{ fontSize: '0.68rem', color: '#78716c' }}>808 💎</span>
              </div>
            </div>

            {/* List Row: Next rank */}
            <div style={{
              background: '#f5efe6',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #141414',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: '#78716c' }}>#4</span>
                <span style={{ fontWeight: 700 }}>Bayu aji sadewa</span>
              </div>
              <span style={{ fontWeight: 800, color: '#141414' }}>760 💎</span>
            </div>

            {/* Bottom Link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#eb5e34'
            }}>
              <span>View Full Community Standings</span>
              <span>↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hairline Divider */}
      <div style={{ borderBottom: '1px solid var(--border-medium)', width: '100%', margin: '40px 0 54px' }} />

      {/* ========================================================================= */}
      {/* 3. POPULAR TRACKS (Gamified Pathways Matching Reference "Popular Game 🔥") */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-terracotta)',
              marginBottom: '6px'
            }}>
              03 / POPULAR TRACKS 🔥
            </div>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-highlight)',
              margin: 0
            }}>
              Calibrate Your Tech Trajectory
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-indigo">4 Tracks Active</span>
            <span className="badge badge-emerald">Deterministic Weights</span>
          </div>
        </div>

        {/* 4 Specialized Pathway Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {POPULAR_TRACKS.map((trk, i) => (
            <div
              key={trk.id}
              onClick={onStartQuiz}
              className="glass-panel-interactive"
              style={{
                padding: '24px',
                border: '1px solid var(--border-medium)',
                boxShadow: '2px 2px 0px var(--border-medium)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="mono-label" style={{ color: 'var(--accent-terracotta)', fontSize: '0.7rem' }}>
                  {trk.badge}
                </span>
                <span className="diamond-pill" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                  💎 {trk.diamonds}
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-highlight)' }}>
                {trk.title}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {trk.description}
              </p>

              <div style={{
                borderTop: '1px solid var(--border-medium)',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono, monospace)'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Level: {trk.level}</span>
                <span style={{ fontWeight: 800, color: 'var(--text-highlight)' }}>Start Quiz ↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hairline Divider */}
      <div style={{ borderBottom: '1px solid var(--border-medium)', width: '100%', margin: '40px 0 54px' }} />

      {/* ========================================================================= */}
      {/* 4. THE 6 AI CAREER INTELLIGENCE SUITE TOOLS (USP SHOWCASE) */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'left', marginBottom: '28px' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-terracotta)',
            marginBottom: '6px'
          }}>
            04 / FULL AI CAREER STUDIO
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 800, color: 'var(--text-highlight)', margin: 0 }}>
            Six End-to-End AI Superpowers
          </h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            No gated barriers. From candidate discovery to interview prep and salary negotiation battlecards.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: AI Resume Scanner */}
          <div 
            onClick={() => handleOpenAiTab('resumeScan')}
            className="glass-panel-interactive"
            style={{ padding: '26px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', background: '#141414', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <FileText size={20} />
              </div>
              <span className="mono-label" style={{ color: '#eb5e34', fontSize: '0.68rem' }}>USP • 10-SEC PROFILER</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>AI Resume & Bio Scanner</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Skip manual questions. Paste your resume or LinkedIn bio—our AI parses your 9 cognitive dimensions and computes top career matches instantly.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eb5e34', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Scan Resume With AI</span>
              <span>↗</span>
            </div>
          </div>

          {/* Card 2: Live AI Mock Interviewer */}
          <div 
            onClick={() => handleOpenAiTab('interviewer')}
            className="glass-panel-interactive"
            style={{ padding: '26px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', background: '#141414', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <Mic size={20} />
              </div>
              <span className="mono-label" style={{ color: '#059669', fontSize: '0.68rem' }}>USP • REAL-TIME GRADER</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Live AI Technical Interviewer</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Tackle unscripted engineering challenges across Mid, Senior, and Staff levels. Receive rigorous AI evaluation, blind spot analysis, and follow-ups.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Launch Mock Interview</span>
              <span>↗</span>
            </div>
          </div>

          {/* Card 3: AI Recruiter Pitch */}
          <div 
            onClick={() => handleOpenAiTab('coverLetter')}
            className="glass-panel-interactive"
            style={{ padding: '26px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', background: '#141414', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <Mail size={20} />
              </div>
              <span className="mono-label" style={{ color: '#0284c7', fontSize: '0.68rem' }}>USP • 80%+ RESPONSE RATE</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Recruiter Pitch & Cover Letter</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Generate tailored cold outreach DMs and custom cover letters that showcase your genuine cognitive strengths for target firms like Stripe and Google.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Generate Recruiter Pitch</span>
              <span>↗</span>
            </div>
          </div>

          {/* Card 4: AI Salary Coach */}
          <div 
            onClick={() => handleOpenAiTab('salary')}
            className="glass-panel-interactive"
            style={{ padding: '26px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', background: '#141414', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <DollarSign size={20} />
              </div>
              <span className="mono-label" style={{ color: '#eb5e34', fontSize: '0.68rem' }}>USP • +$15k-$40k GAIN</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>AI Salary Negotiation Coach</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Calibrate your market value across US, Europe, APAC, or Global Remote. Generate custom counter-offer battlecards and equity scripts.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eb5e34', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Build Negotiation Strategy</span>
              <span>↗</span>
            </div>
          </div>

          {/* Card 5: AI Job Matcher */}
          <div 
            onClick={() => handleOpenAiTab('jobMatcher')}
            className="glass-panel-interactive"
            style={{ padding: '26px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', background: '#141414', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <Target size={20} />
              </div>
              <span className="mono-label" style={{ color: '#eb5e34', fontSize: '0.68rem' }}>AI GAP BRIDGER</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Job Posting Matcher & Bridge</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Paste any real job posting. AI evaluates your cognitive fit, pinpoints critical gaps, and writes an actionable 14-day high-leverage bridging curriculum.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eb5e34', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Analyze Real Job Posting</span>
              <span>↗</span>
            </div>
          </div>

          {/* Card 6: What-If Simulator */}
          <div 
            onClick={() => setActiveTab('simulator')}
            className="glass-panel-interactive"
            style={{ padding: '26px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', background: '#141414', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <SlidersHorizontal size={20} />
              </div>
              <span className="mono-label" style={{ color: '#0284c7', fontSize: '0.68rem' }}>MATH OPTIMIZER</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>What-If Trajectory Simulator</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Adjust live skill sliders and watch career match compatibility recompute in real time. Features our new AI Trajectory Optimizer for max score ROI.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Launch Simulator</span>
              <span>↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hairline Divider */}
      <div style={{ borderBottom: '1px solid var(--border-medium)', width: '100%', margin: '40px 0 54px' }} />

      {/* ========================================================================= */}
      {/* 5. CAREER MENTOR DARK BOX (QUICK QUESTION PROMPT) */}
      {/* ========================================================================= */}
      <div style={{
        background: '#141414',
        border: '1px solid #141414',
        padding: 'clamp(28px, 5vw, 56px)',
        color: '#ffffff',
        borderRadius: '16px',
        boxShadow: '3px 3px 0px #eb5e34'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* Left Column */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#f4be43',
              marginBottom: '20px'
            }}>
              05 / CAREER MENTOR
            </div>

            <h2 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: '#ffffff',
              margin: 0
            }}>
              Bring a question.<br />
              <span style={{ color: '#f4be43' }}>Leave with a next step.</span>
            </h2>
          </div>

          {/* Right Column: Embedded Chat Interface */}
          <div>
            <div style={{
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '24px',
              background: 'rgba(20, 20, 20, 0.4)',
              borderRadius: '8px'
            }}>
              <div style={{
                background: '#262626',
                color: '#ffffff',
                padding: '14px 18px',
                borderRadius: '6px',
                fontSize: '0.88rem',
                lineHeight: 1.45,
                marginBottom: '24px'
              }}>
                I’m your local Career Mentor. Ask me what to learn, build or explore next.
              </div>

              <form onSubmit={handleMentorSubmit} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                paddingBottom: '8px'
              }}>
                <input
                  type="text"
                  value={mentorQuery}
                  onChange={(e) => setMentorQuery(e.target.value)}
                  placeholder="What should I learn first?"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    flex: 1,
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#f4be43',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#141414',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}
                  title="Ask AI Career Mentor"
                >
                  ↗
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
