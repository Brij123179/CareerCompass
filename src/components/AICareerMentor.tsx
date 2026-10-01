import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareCode, Send, Sparkles, Key, Bot, User, Trash2, Copy, Check, 
  ShieldCheck, ArrowRight, CornerDownLeft, Eye, EyeOff, FileText, Target, 
  Mic, Mail, DollarSign, BrainCircuit, RefreshCw, Zap, Compass, ChevronDown
} from 'lucide-react';
import { ChatMessage, MatchBreakdown, DimensionScores, Career, MarketRegion } from '../types';
import { MentorService } from '../services/mentorService';
import { CAREERS_DATA } from '../data/careersData';
import { AIResumeScanner } from './AIResumeScanner';
import { AIJobMatcher } from './AIJobMatcher';
import { AIMockInterviewer } from './AIMockInterviewer';
import { AICoverLetterGenerator } from './AICoverLetterGenerator';
import { AISalaryNegotiator } from './AISalaryNegotiator';
import { FormattedAiResponse } from './FormattedAiResponse';
import { LaborMarketService } from '../utils/laborMarketService';

export type AISuiteTab = 'mentor' | 'resumeScan' | 'jobMatcher' | 'interviewer' | 'coverLetter' | 'salary';

interface AICareerMentorProps {
  userScores: DimensionScores;
  topMatches: MatchBreakdown[];
  selectedCareer?: Career;
  openRouterConnected: boolean;
  onOpenOpenRouterModal: () => void;
  activeRegion?: MarketRegion;
  onApplyScores?: (scores: DimensionScores) => void;
  onNavigateToResults?: () => void;
  initialSubTab?: AISuiteTab;
}

const DEFAULT_PROMPT_CHIPS = [
  "What should I learn first?",
  "Which skills should I improve?",
  "What projects should I build?",
  "Is cybersecurity suitable for me?",
  "How much can I earn in this path?",
  "Can I switch into tech without a CS degree?"
];

export const AICareerMentor: React.FC<AICareerMentorProps> = ({
  userScores,
  topMatches,
  selectedCareer: initialSelectedCareer,
  openRouterConnected,
  onOpenOpenRouterModal,
  activeRegion = 'us-tier1',
  onApplyScores,
  onNavigateToResults,
  initialSubTab = 'mentor'
}) => {
  const topCareerMatch = topMatches[0]?.career || CAREERS_DATA[0];
  const [activeCareerId, setActiveCareerId] = useState<string>(initialSelectedCareer?.id || topCareerMatch.id);
  const selectedCareer = CAREERS_DATA.find(c => c.id === activeCareerId) || topCareerMatch;
  const matchScore = topMatches.find(m => m.career.id === selectedCareer.id)?.score || 88;

  const [activeSubTab, setActiveSubTab] = useState<AISuiteTab>(initialSubTab);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 **Welcome to CareerCompass AI Intelligence Studio!**\n\nI have analyzed your 9-dimensional assessment profile. Your top match is **${selectedCareer.title}** with **${matchScore}% compatibility**.\n\nPowered by advanced AI career intelligence, I can calculate your exact skill gaps, generate custom portfolio project milestones, or evaluate your fit for any tech role. Ask me anything or click a prompt chip below!`,
      timestamp: 'Just now',
      suggestions: [
        `What should I learn first for ${selectedCareer.title}?`,
        "Which skills should I improve?",
        "Generate a custom capstone project for my profile",
        "How can I negotiate a higher offer?"
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeSubTab === 'mentor') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeSubTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = `assistant-${Date.now() + 1}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, initialAssistantMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      // Build recent conversational context (last 6 messages)
      const recentHistory = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text
      }));

      const response = await MentorService.askMentorStream(
        text,
        {
          userScores,
          topMatches,
          selectedCareer
        },
        recentHistory,
        (_chunk, fullAccumulated) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId ? { ...m, text: fullAccumulated } : m
            )
          );
        }
      );

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, text: response.text, suggestions: response.suggestedFollowUps }
            : m
        )
      );
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, text: `Error processing request: ${err.message || 'Please try again.'}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Ready for your questions on **${selectedCareer.title}**!`,
        timestamp: 'Just now',
        suggestions: DEFAULT_PROMPT_CHIPS.slice(0, 4)
      }
    ]);
  };

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      
      {/* Studio Command Header */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        marginBottom: '24px',
        border: '1px solid var(--border-glow)',
        background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.08) 0%, rgba(14, 165, 233, 0.06) 50%, rgba(225, 29, 72, 0.05) 100%)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrainCircuit size={13} />
                AI Career Intelligence Studio
              </span>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={11} />
                Live AI • Zero-Trust Sanitized
              </span>
              <span className="badge badge-cyan">
                All-in-One AI Suite
              </span>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.03em' }}>
              AI Career Intelligence <span className="text-gradient">Studio</span>
            </h1>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '720px' }}>
              Experience all dimensions of tech career growth powered by state-of-the-art AI. From instant resume scanning and strategic mentoring to live mock interviews, recruiter pitch writing, and salary negotiation.
            </p>
          </div>

          {/* Quick Career Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            {/* Target Career Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Target Career Focus:
              </span>
              <select
                value={activeCareerId}
                onChange={(e) => setActiveCareerId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-highlight)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {CAREERS_DATA.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 6 Integrated AI Tools Tab Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '16px'
        }}>
          <button
            onClick={() => setActiveSubTab('mentor')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeSubTab === 'mentor' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
              color: activeSubTab === 'mentor' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'mentor' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <MessageSquareCode size={15} />
            <span>AI Strategic Mentor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('resumeScan')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeSubTab === 'resumeScan' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
              color: activeSubTab === 'resumeScan' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'resumeScan' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <FileText size={15} />
            <span>AI Resume Scanner (USP)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jobMatcher')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeSubTab === 'jobMatcher' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
              color: activeSubTab === 'jobMatcher' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'jobMatcher' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Target size={15} />
            <span>AI Job Matcher & Bridge</span>
          </button>

          <button
            onClick={() => setActiveSubTab('interviewer')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeSubTab === 'interviewer' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
              color: activeSubTab === 'interviewer' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'interviewer' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Mic size={15} />
            <span>Live AI Mock Interviewer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('coverLetter')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeSubTab === 'coverLetter' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
              color: activeSubTab === 'coverLetter' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'coverLetter' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Mail size={15} />
            <span>Recruiter Pitch & Cover Letter (USP)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('salary')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeSubTab === 'salary' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
              color: activeSubTab === 'salary' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'salary' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <DollarSign size={15} />
            <span>Salary Negotiation Coach (USP)</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: AI Resume Scanner */}
      {activeSubTab === 'resumeScan' && (
        <AIResumeScanner
          onApplyScores={(scores) => {
            if (onApplyScores) onApplyScores(scores);
          }}
          onNavigateToResults={onNavigateToResults}
        />
      )}

      {/* Subtab 2: AI Job Matcher */}
      {activeSubTab === 'jobMatcher' && (
        <AIJobMatcher
          career={selectedCareer}
          userScores={userScores}
        />
      )}

      {/* Subtab 3: Live AI Mock Interviewer */}
      {activeSubTab === 'interviewer' && (
        <AIMockInterviewer
          career={selectedCareer}
        />
      )}

      {/* Subtab 4: Recruiter Pitch & Cover Letter */}
      {activeSubTab === 'coverLetter' && (
        <AICoverLetterGenerator
          userScores={userScores}
          defaultCareerTitle={selectedCareer.title}
        />
      )}

      {/* Subtab 5: Salary Negotiation Coach */}
      {activeSubTab === 'salary' && (
        <AISalaryNegotiator
          userScores={userScores}
          activeRegion={activeRegion}
          defaultCareerTitle={selectedCareer.title}
        />
      )}

      {/* Subtab 6: Conversational Strategic Mentor (Default) */}
      {activeSubTab === 'mentor' && (
        <div className="glass-panel" style={{
          padding: '24px',
          border: '1px solid var(--border-medium)',
          minHeight: '620px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          
          {/* Active Context Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-indicator-dot" style={{ backgroundColor: '#10b981', color: '#10b981' }} />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Calibrated Context: <strong style={{ color: 'var(--text-highlight)' }}>{selectedCareer.title}</strong> ({matchScore}% match)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleClearChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {DEFAULT_PROMPT_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                  e.currentTarget.style.color = 'var(--text-highlight)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Sparkles size={11} style={{ color: 'var(--accent-indigo)' }} />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '480px',
            paddingRight: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start'
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(79, 70, 229, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-indigo)',
                      flexShrink: 0
                    }}>
                      <Bot size={16} />
                    </div>
                  )}

                  <div style={{ maxWidth: '85%' }}>
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isUser ? 'var(--gradient-brand)' : 'var(--bg-secondary)',
                      border: isUser ? 'none' : '1px solid var(--border-subtle)',
                      color: isUser ? '#ffffff' : 'var(--text-primary)',
                      boxShadow: isUser ? '0 4px 14px rgba(79, 70, 229, 0.25)' : 'var(--shadow-sm)'
                    }}>
                      {isUser ? (
                        <p style={{ lineHeight: 1.5, fontWeight: 500, fontSize: '0.9rem', margin: 0 }}>{msg.text}</p>
                      ) : msg.text ? (
                        <FormattedAiResponse 
                          content={msg.text} 
                          isStreaming={isLoading && idx === messages.length - 1} 
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.86rem', padding: '4px 0' }}>
                          <RefreshCw size={14} className="spin-animation" style={{ color: 'var(--accent-terracotta)' }} />
                          <span>Streaming intelligence from AI Engine...</span>
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: copiedId === msg.id ? 'var(--accent-emerald)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.7rem'
                          }}
                        >
                          {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>

                    {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug)}
                            style={{
                              fontSize: '0.72rem',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ArrowRight size={9} style={{ color: 'var(--accent-indigo)' }} />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-highlight)',
                      flexShrink: 0
                    }}>
                      <User size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(79, 70, 229, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-indigo)'
                }}>
                  <Bot size={16} />
                </div>
                <div style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={13} style={{ color: 'var(--accent-indigo)' }} />
                  <span>Formulating dynamic personalized career guidance with AI...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              placeholder={`Ask about ${selectedCareer.title}, roadmap milestones, salary, or technical stack...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="btn-primary"
              style={{
                padding: '0 20px',
                borderRadius: 'var(--radius-md)',
                opacity: !inputText.trim() || isLoading ? 0.5 : 1,
                cursor: !inputText.trim() || isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
