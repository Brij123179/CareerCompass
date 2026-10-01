import React, { useState } from 'react';
import { 
  Send, Sparkles, Copy, Check, Briefcase, Building2, 
  FileText, MessageSquare, Award, RefreshCw, ChevronRight, Zap
} from 'lucide-react';
import { DimensionScores } from '../types';
import { MentorService, CoverLetterResult } from '../services/mentorService';
import { FormattedAiResponse } from './FormattedAiResponse';

interface AICoverLetterGeneratorProps {
  userScores: DimensionScores;
  defaultCareerTitle?: string;
}

const PRESET_COMPANIES = [
  { name: 'Stripe', style: 'Infrastructure & Payment APIs' },
  { name: 'Google Cloud', style: 'Distributed Systems & AI Scale' },
  { name: 'Datadog', style: 'Observability & Cloud Reliability' },
  { name: 'Anthropic', style: 'AI Safety & Large Scale Inference' },
  { name: 'Series-B Startup', style: 'Fast Shipping & Product Ownership' }
];

export const AICoverLetterGenerator: React.FC<AICoverLetterGeneratorProps> = ({
  userScores,
  defaultCareerTitle = 'Full Stack Engineer'
}) => {
  const [company, setCompany] = useState<string>('Stripe');
  const [targetRole, setTargetRole] = useState<string>(defaultCareerTitle);
  const [jobSnippet, setJobSnippet] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [activeTab, setActiveTab] = useState<'pitch' | 'coverLetter'>('pitch');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!company.trim() || !targetRole.trim()) return;
    setIsGenerating(true);
    try {
      const data = await MentorService.generateCoverLetter(targetRole, company, userScores, jobSnippet);
      setResult(data);
    } catch (e) {
      console.error('Error generating cover letter:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="glass-panel" style={{
      padding: '32px',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-glow)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={12} />
              AI Recruiter Pitch & Cover Letter • USP
            </span>
            <span className="badge badge-indigo">
              High-Conversion Framing
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            AI Recruiter Pitch & Cover Letter Generator
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '6px 0 0', maxWidth: '680px' }}>
            Generates high-impact cold outreach messages and tailored cover letters that highlight your genuine dimensional strengths—cutting through recruiter noise without sounding generic.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid var(--border-glow)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          color: 'var(--accent-indigo)',
          fontWeight: 600
        }}>
          <Zap size={14} />
          <span>AI Recruiter Engine Active</span>
        </div>
      </div>

      {/* Target Inputs Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Company Input */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Target Company / Organization
          </label>
          <div style={{ position: 'relative' }}>
            <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, Datadog..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
          {/* Quick company pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {PRESET_COMPANIES.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCompany(c.name)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  color: company === c.name ? 'var(--accent-indigo)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: company === c.name ? 700 : 500,
                  textDecoration: 'underline'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Target Role Input */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Target Role Title
          </label>
          <div style={{ position: 'relative' }}>
            <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer, Cloud Architect..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Optional Job Snippet */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          Optional Job Description Context or Key Requirements:
        </label>
        <textarea
          value={jobSnippet}
          onChange={(e) => setJobSnippet(e.target.value)}
          placeholder="Paste key bullet points from the job posting (e.g. 'Must have experience with high-concurrency systems, TypeScript, and Docker')..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none'
          }}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !company.trim() || !targetRole.trim()}
        className="btn-primary"
        style={{
          padding: '12px 28px',
          fontSize: '0.92rem',
          gap: '8px',
          opacity: isGenerating ? 0.7 : 1,
          marginBottom: result ? '28px' : '0'
        }}
      >
        {isGenerating ? (
          <>
            <RefreshCw size={16} className="spin-animation" />
            <span>Crafting Bespoke Recruiter Pitch...</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Generate Pitch & Cover Letter with AI</span>
          </>
        )}
      </button>

      {/* Output Presentation */}
      {result && (
        <div style={{
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-medium)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Key Selling Highlights */}
          {result.keyHighlights.length > 0 && (
            <div style={{
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                ⭐ Core Architectural Talking Points for Interviews
              </span>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.keyHighlights.map((hl, i) => (
                  <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {hl}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '10px',
            marginBottom: '18px'
          }}>
            <button
              onClick={() => setActiveTab('pitch')}
              style={{
                background: activeTab === 'pitch' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
                color: activeTab === 'pitch' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <MessageSquare size={14} />
              <span>Direct Recruiter DM / LinkedIn InMail (120 Words)</span>
            </button>

            <button
              onClick={() => setActiveTab('coverLetter')}
              style={{
                background: activeTab === 'coverLetter' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
                color: activeTab === 'coverLetter' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <FileText size={14} />
              <span>Full Bespoke Cover Letter</span>
            </button>
          </div>

          {/* Content Area */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => copyToClipboard(activeTab === 'pitch' ? result.recruiterPitch : result.coverLetter, activeTab)}
              className="btn-secondary"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                gap: '6px'
              }}
              title="Copy to clipboard"
            >
              {copiedType === activeTab ? (
                <>
                  <Check size={14} style={{ color: 'var(--accent-emerald)' }} />
                  <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Content</span>
                </>
              )}
            </button>

            {activeTab === 'pitch' ? (
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
                  Recruiter Outreach Script (Optimized for 80%+ Open Rates):
                </span>
                <div style={{ maxWidth: '90%' }}>
                  <FormattedAiResponse content={result.recruiterPitch} />
                </div>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
                  Tailored Cover Letter for {targetRole} at {company}:
                </span>
                <div style={{ maxWidth: '95%' }}>
                  <FormattedAiResponse content={result.coverLetter} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
