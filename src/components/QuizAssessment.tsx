import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Sparkles, HelpCircle, ArrowRight, 
  Zap, Code2, BarChart3, Palette, Compass, Cpu, LineChart, Users, ShieldAlert, 
  PieChart, Briefcase, Database, BrainCircuit, Presentation, HeartHandshake, 
  Lock, Scale, TrendingUp, Eye, Terminal, Binary, PenTool, Target, Layers, 
  Crown, Microscope, Bot, Cloud, Glasses, ShieldCheck, BookOpen, BadgeDollarSign, 
  LayoutDashboard, FileCode2, Gauge, Handshake, MousePointerClick, Workflow, 
  Smile, Rocket, FileSpreadsheet, Shapes, FileText, Clock, RotateCcw, Flame
} from 'lucide-react';
import { ASSESSMENT_TRACKS, AssessmentTrack, calculateTrackScores } from '../data/assessmentTracks';
import { DimensionScores } from '../types';
import { AIResumeScanner } from './AIResumeScanner';
import confetti from 'canvas-confetti';

interface QuizAssessmentProps {
  onCompleteQuiz: (scores: DimensionScores) => void;
  onCancel: () => void;
  initialTrackId?: string;
  onSelectTrack?: (trackId: string) => void;
}

// Icon helper for question options
const getOptionIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Code2': return <Code2 size={20} />;
    case 'BarChart3': return <BarChart3 size={20} />;
    case 'Palette': return <Palette size={20} />;
    case 'Compass': return <Compass size={20} />;
    case 'Cpu': return <Cpu size={20} />;
    case 'LineChart': return <LineChart size={20} />;
    case 'Users': return <Users size={20} />;
    case 'ShieldAlert': return <ShieldAlert size={20} />;
    case 'Sparkles': return <Sparkles size={20} />;
    case 'Zap': return <Zap size={20} />;
    case 'PieChart': return <PieChart size={20} />;
    case 'Briefcase': return <Briefcase size={20} />;
    case 'Database': return <Database size={20} />;
    case 'BrainCircuit': return <BrainCircuit size={20} />;
    case 'Presentation': return <Presentation size={20} />;
    case 'HeartHandshake': return <HeartHandshake size={20} />;
    case 'Lock': return <Lock size={20} />;
    case 'Scale': return <Scale size={20} />;
    case 'TrendingUp': return <TrendingUp size={20} />;
    case 'Eye': return <Eye size={20} />;
    case 'Terminal': return <Terminal size={20} />;
    case 'Binary': return <Binary size={20} />;
    case 'PenTool': return <PenTool size={20} />;
    case 'Target': return <Target size={20} />;
    case 'Layers': return <Layers size={20} />;
    case 'Crown': return <Crown size={20} />;
    case 'Microscope': return <Microscope size={20} />;
    case 'Bot': return <Bot size={20} />;
    case 'Cloud': return <Cloud size={20} />;
    case 'Glasses': return <Glasses size={20} />;
    case 'ShieldCheck': return <ShieldCheck size={20} />;
    case 'BookOpen': return <BookOpen size={20} />;
    case 'BadgeDollarSign': return <BadgeDollarSign size={20} />;
    case 'LayoutDashboard': return <LayoutDashboard size={20} />;
    case 'FileCode2': return <FileCode2 size={20} />;
    case 'Gauge': return <Gauge size={20} />;
    case 'Handshake': return <Handshake size={20} />;
    case 'MousePointerClick': return <MousePointerClick size={20} />;
    case 'Workflow': return <Workflow size={20} />;
    case 'Smile': return <Smile size={20} />;
    case 'Rocket': return <Rocket size={20} />;
    case 'FileSpreadsheet': return <FileSpreadsheet size={20} />;
    case 'Shapes': return <Shapes size={20} />;
    case 'FileText': return <FileText size={20} />;
    default: return <Sparkles size={20} />;
  }
};

const getTrackIcon = (trackId: string) => {
  switch (trackId) {
    case 'express':
      return <Zap size={18} style={{ color: 'var(--accent-cyan)' }} />;
    case 'swe-architecture':
      return <Code2 size={18} style={{ color: 'var(--accent-violet)' }} />;
    case 'ai-datascience':
      return <BrainCircuit size={18} style={{ color: 'var(--accent-emerald)' }} />;
    case 'comprehensive':
    default:
      return <Sparkles size={18} style={{ color: 'var(--accent-indigo)' }} />;
  }
};

export const QuizAssessment: React.FC<QuizAssessmentProps> = ({ 
  onCompleteQuiz, 
  onCancel,
  initialTrackId = 'comprehensive',
  onSelectTrack
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(initialTrackId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if initialTrackId changes externally
  useEffect(() => {
    if (initialTrackId && initialTrackId !== selectedTrackId) {
      setSelectedTrackId(initialTrackId);
      setCurrentIndex(0);
      setSelectedAnswers({});
    }
  }, [initialTrackId]);

  const currentTrack: AssessmentTrack = 
    ASSESSMENT_TRACKS.find(t => t.id === selectedTrackId) || ASSESSMENT_TRACKS[0];

  const questions = currentTrack.questions;
  const currentQuestion = questions[currentIndex] || questions[0];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = selectedAnswers[currentQuestion.id];

  const handleTrackSwitch = (trackId: string) => {
    if (trackId === selectedTrackId) return;
    setSelectedTrackId(trackId);
    setCurrentIndex(0);
    setSelectedAnswers({});
    if (onSelectTrack) {
      onSelectTrack(trackId);
    }
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishAssessment();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const finishAssessment = (answersToUse = selectedAnswers) => {
    setIsSubmitting(true);

    // Fire fireworks / confetti celebration
    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    setTimeout(() => {
      const calculatedScores = calculateTrackScores(currentTrack, answersToUse);
      onCompleteQuiz(calculatedScores);
      setIsSubmitting(false);
    }, 700);
  };

  // Demo auto-fill helper tailored to the active track
  const handleQuickDemoFill = (presetIndex: number = 0) => {
    const demoAnswers: Record<number, string> = {};
    questions.forEach(q => {
      const optionIndex = Math.min(presetIndex, q.options.length - 1);
      demoAnswers[q.id] = q.options[optionIndex].id;
    });
    setSelectedAnswers(demoAnswers);
    finishAssessment(demoAnswers);
  };

  // AI Instant Scanner toggle
  const [showResumeScanner, setShowResumeScanner] = useState<boolean>(false);

  return (
    <div style={{ maxWidth: '880px', margin: '20px auto 80px', padding: '0 16px' }}>
      
      {/* AI Resume Scanner Instant Option Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(5, 150, 105, 0.1) 100%)',
        border: '1px solid var(--border-glow)',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-indigo)' }} />
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-highlight)', display: 'block' }}>
              Want instant results without answering {questions.length} questions?
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Use our AI Resume Scanner to calibrate all 9 cognitive dimensions in 5 seconds.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowResumeScanner(!showResumeScanner)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.82rem', gap: '6px', borderRadius: 'var(--radius-full)' }}
        >
          <Zap size={14} />
          <span>{showResumeScanner ? 'Return to Questions' : '⚡ Try AI Resume Scanner'}</span>
        </button>
      </div>

      {/* Render AI Resume Scanner when toggled */}
      {showResumeScanner ? (
        <div style={{ marginBottom: '32px' }}>
          <AIResumeScanner
            onApplyScores={(scores) => {
              onCompleteQuiz(scores);
            }}
          />
        </div>
      ) : null}

      {/* Track Selection Switcher Header */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: '24px',
        border: '1px solid var(--border-medium)',
        background: 'var(--bg-glass)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>
              Diagnostic Tracks:
            </span>
            <span className={`badge ${currentTrack.badgeClass}`}>
              {currentTrack.badge}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Clock size={14} />
            <span>Estimated Duration: <strong>{currentTrack.duration}</strong></span>
          </div>
        </div>

        {/* 4 Track Pills Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px'
        }}>
          {ASSESSMENT_TRACKS.map(track => {
            const isActive = track.id === selectedTrackId;
            return (
              <button
                key={track.id}
                onClick={() => handleTrackSwitch(track.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? `1.5px solid ${track.color}` : '1px solid var(--border-subtle)',
                  background: isActive ? 'var(--bg-card)' : 'var(--bg-secondary)',
                  color: isActive ? 'var(--text-highlight)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? `0 0 12px ${track.color}25` : 'none'
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {getTrackIcon(track.id)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {track.title.split(' ')[0]} {track.title.split(' ')[1]}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {track.questionsCount} Questions • {track.duration.split(' ')[0]}m
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Track Details & Progress Card */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${currentTrack.badgeClass}`}>
                {currentQuestion.category}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target: {currentTrack.targetRole}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Question <span style={{ color: 'var(--text-highlight)', fontWeight: 700 }}>{currentIndex + 1}</span> of {questions.length}
            </h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: currentTrack.color }}>
              {progressPercent}% Complete
            </span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <button
                onClick={() => handleQuickDemoFill(0)}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
                title="Auto-fill with primary profile option"
              >
                Demo Fill: Primary
              </button>
              <button
                onClick={() => handleQuickDemoFill(1)}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
                title="Auto-fill with alternate profile option"
              >
                Demo Fill: Alternate
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: `linear-gradient(90deg, var(--accent-indigo) 0%, ${currentTrack.color} 100%)`,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-medium)', marginBottom: '24px' }}>
        
        {/* Scenario context */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: `3px solid ${currentTrack.color}`,
          padding: '12px 18px',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          marginBottom: '20px',
          color: 'var(--text-secondary)',
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <HelpCircle size={16} style={{ color: currentTrack.color, flexShrink: 0 }} />
          <span>{currentQuestion.scenario}</span>
        </div>

        {/* Question Title */}
        <h3 style={{ fontSize: '1.35rem', marginBottom: '24px', lineHeight: 1.4, color: 'var(--text-highlight)' }}>
          {currentQuestion.question}
        </h3>

        {/* 4 Options Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option) => {
            const isSelected = currentAnswer === option.id;
            return (
              <div
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-card)',
                  border: isSelected ? `2px solid ${currentTrack.color}` : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? `0 0 16px ${currentTrack.color}30` : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--bg-card)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }
                }}
              >
                {/* Radio selection circle / Check */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: isSelected ? `2px solid ${currentTrack.color}` : '2px solid var(--border-medium)',
                  backgroundColor: isSelected ? currentTrack.color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}>
                  {isSelected && <CheckCircle2 size={15} color="#ffffff" />}
                </div>

                {/* Option Icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: isSelected ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? currentTrack.color : 'var(--text-secondary)',
                  flexShrink: 0
                }}>
                  {getOptionIcon(option.icon)}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '0.94rem',
                    color: isSelected ? 'var(--text-highlight)' : 'var(--text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    lineHeight: 1.45
                  }}>
                    {option.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <button
          onClick={currentIndex === 0 ? onCancel : handlePrev}
          className="btn-secondary"
          style={{ padding: '12px 22px' }}
        >
          <ChevronLeft size={18} />
          <span>{currentIndex === 0 ? 'Cancel Assessment' : 'Previous Question'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!currentAnswer || isSubmitting}
          className="btn-primary"
          style={{
            padding: '12px 30px',
            opacity: !currentAnswer ? 0.45 : 1,
            cursor: !currentAnswer ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? (
            <span>Computing Deterministic Profile...</span>
          ) : isLastQuestion ? (
            <>
              <span>Submit & View Results</span>
              <Sparkles size={18} />
            </>
          ) : (
            <>
              <span>Next Question</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
