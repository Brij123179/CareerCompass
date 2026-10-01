import React, { useState, useRef } from 'react';
import { 
  FileText, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, 
  Zap, BrainCircuit, RefreshCw, Copy, Check, ChevronRight, Award,
  UploadCloud, Image
} from 'lucide-react';
import { DimensionScores, Dimension } from '../types';
import { DIMENSION_LABELS } from '../utils/scoringEngine';
import { MentorService, ResumeScanResult } from '../services/mentorService';
import confetti from 'canvas-confetti';

interface AIResumeScannerProps {
  onApplyScores: (scores: DimensionScores) => void;
  onNavigateToResults?: () => void;
}

const PRESET_RESUMES = [
  {
    label: '🚀 Full-Stack Dev',
    name: 'Alex Rivera (Web & Cloud)',
    text: `Alex Rivera - Senior Full Stack Engineer
Summary: 4+ years of experience building scalable web applications with React, TypeScript, Node.js, and PostgreSQL. Passionate about distributed systems, microservices, and clean UI architecture.
Experience:
- Architected and deployed high-throughput REST and GraphQL APIs using Node.js and Redis, reducing p99 latency by 35%.
- Built responsive web interfaces with React, Next.js, and Tailwind CSS with strict accessibility (WCAG AA).
- Containerized services with Docker and set up automated CI/CD deployment pipelines on AWS ECS.
- Spearheaded team-wide migration to TypeScript and introduced automated end-to-end testing with Playwright.
Skills: TypeScript, JavaScript, React, Node.js, PostgreSQL, Redis, Docker, AWS, GraphQL, CI/CD, Git.`
  },
  {
    label: '🧠 Data & ML',
    name: 'Maya Lin (AI & Analytics)',
    text: `Maya Lin - Machine Learning & Data Scientist
Summary: Quantitative researcher and data engineer experienced in statistical modeling, predictive algorithms, and LLM fine-tuning with Python and PyTorch.
Experience:
- Designed and trained deep learning models for anomaly detection in telemetry data, achieving 94.2% precision.
- Engineered ETL data pipelines processing 15M+ daily events using Apache Spark and SQL on Google BigQuery.
- Built RAG (Retrieval-Augmented Generation) semantic search systems with vector embeddings and LangChain.
- Translated complex statistical discoveries into executive dashboards and actionable business strategies.
Skills: Python, PyTorch, Scikit-learn, SQL, BigQuery, Spark, Pandas, Data Visualization, LLMs, Git.`
  },
  {
    label: '🎨 UI/UX & Product',
    name: 'Jordan Taylor (Design & Strategy)',
    text: `Jordan Taylor - Product Designer & UI/UX Specialist
Summary: Product designer focused on user research, design systems, and rapid prototyping. Bridges visual aesthetics with deep human-centered usability.
Experience:
- Led end-to-end design of flagship mobile app with 250k+ active users, conducting 40+ moderated usability interviews.
- Created and maintained a unified Figma design system adopted across 5 product engineering squads.
- Collaborated closely with frontend engineers to ensure pixel-perfect CSS implementation and fluid micro-animations.
- Increased user onboarding completion rate by 28% through iterative wireframing and A/B test validation.
Skills: Figma, Design Systems, User Research, Wireframing, Prototyping, Usability Testing, CSS/HTML, Product Strategy.`
  },
  {
    label: '💼 Career Switcher',
    name: 'David Kim (Finance to Cloud)',
    text: `David Kim - Technical Operations & Aspiring Cloud Architect
Summary: Analytical business professional with 5 years in financial operations, pivoting into cloud infrastructure, cybersecurity, and DevOps.
Experience:
- Managed multi-million dollar operational risk budgets, analyzing system reliability vulnerabilities and compliance metrics.
- Completed AWS Certified Solutions Architect Associate; built automated infrastructure-as-code scripts with Terraform.
- Scripted data extraction and reconciliation tasks using Python and Bash, eliminating 15 hours of manual reporting weekly.
- Strong stakeholder leadership, cross-functional communication, and strategic project management skills.
Skills: AWS, Terraform, Python, Bash, Linux, Security Compliance, Financial Analysis, Risk Modeling, Agile.`
  }
];

export const AIResumeScanner: React.FC<AIResumeScannerProps> = ({
  onApplyScores,
  onNavigateToResults
}) => {
  const [resumeText, setResumeText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<ResumeScanResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Url = reader.result as string;
        const scanData = await MentorService.scanResumeWithVision(base64Url);
        setResult(scanData);
        setResumeText(`[Document Uploaded: ${file.name}]\n\nCandidate Superpower: ${scanData.superpower}\n\nKey Skills Detected: ${scanData.detectedSkills.join(', ')}\n\nProfile Summary: ${scanData.summary}`);
      } catch (err) {
        console.error('Vision scan error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!resumeText.trim()) return;
    setIsScanning(true);
    try {
      const scanData = await MentorService.scanResumeProfile(resumeText);
      setResult(scanData);
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onApplyScores(result.dimensionScores);
    if (onNavigateToResults) {
      onNavigateToResults();
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = `Candidate Superpower: ${result.superpower}\nTop Career Fits:\n${result.topCareerMatches.map(m => `- ${m.title} (${m.score}%): ${m.reason}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{
      padding: '32px',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-glow)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={12} />
              AI Instant Profiler • USP
            </span>
            <span className="badge badge-emerald">
              9-Dimension Automated Extraction
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            AI Resume & Bio Scanner
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '6px 0 0', maxWidth: '680px' }}>
            Skip answering 45 manual questions. Paste your resume, LinkedIn summary, or bio below—our AI extracts your 9 cognitive dimensions and predicts your top career fits in under 5 seconds.
          </p>
        </div>

        {/* Live Status Badge */}
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
          <span>AI Dimension Engine Active</span>
        </div>
      </div>

      {/* Preset Pickers */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
          Load Sample Candidate Profile (1-Click Preview):
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_RESUMES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setResumeText(preset.text);
                setResult(null);
              }}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-indigo)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text, LinkedIn 'About' summary, GitHub profile bio, or project description here..."
          rows={7}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            transition: 'border-color var(--transition-fast)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-indigo)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-medium)'}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          fontSize: '0.76rem',
          color: 'var(--text-muted)'
        }}>
          <span>{resumeText.length} characters</span>
          <span>Zero-Trust: No personal data is stored outside your local session.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: result ? '28px' : '0' }}>
        <button
          onClick={handleScan}
          disabled={isScanning || !resumeText.trim()}
          className="btn-primary"
          style={{
            padding: '12px 28px',
            fontSize: '0.95rem',
            gap: '8px',
            opacity: isScanning || !resumeText.trim() ? 0.6 : 1,
            cursor: isScanning || !resumeText.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isScanning ? (
            <>
              <RefreshCw size={16} className="spin-animation" />
              <span>Analyzing Dimensions with AI...</span>
            </>
          ) : (
            <>
              <BrainCircuit size={17} />
              <span>Extract 9 Dimensions with AI</span>
            </>
          )}
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="btn-secondary"
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            gap: '8px',
            cursor: isScanning ? 'not-allowed' : 'pointer'
          }}
          title="Upload resume image or screenshot to analyze with Vision AI"
        >
          <UploadCloud size={16} />
          <span>Upload Image / Screenshot (Vision AI)</span>
        </button>

        {resumeText && (
          <button
            onClick={() => {
              setResumeText('');
              setResult(null);
            }}
            className="btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.88rem' }}
          >
            Clear Text
          </button>
        )}
      </div>

      {/* AI Extraction Results Display */}
      {result && (
        <div style={{
          marginTop: '28px',
          paddingTop: '28px',
          borderTop: '1px solid var(--border-medium)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Top Banner: Superpower & Opportunity */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Zap size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Candidate Superpower
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-highlight)', margin: 0, lineHeight: 1.5 }}>
                {result.superpower}
              </p>
            </div>

            <div style={{
              background: 'rgba(217, 119, 6, 0.08)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Strategic Growth Gap
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-highlight)', margin: 0, lineHeight: 1.5 }}>
                {result.growthOpportunity}
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Executive Assessment Synthesis
            </span>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
              {result.summary}
            </p>
          </div>

          {/* 9 Dimensions Grid */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-highlight)' }}>
                Extracted Cognitive Scores (Calibrated / 45)
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Mathematically projected into scoring engine
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              {(Object.keys(result.dimensionScores) as Dimension[]).map((dim) => {
                const score = result.dimensionScores[dim];
                const pct = Math.round((score / 45) * 100);
                return (
                  <div key={dim} style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {DIMENSION_LABELS[dim].split('&')[0].trim()}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                        {score}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/45</span>
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div style={{ height: '6px', background: 'var(--border-medium)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: pct >= 80 ? 'var(--accent-emerald)' : pct >= 65 ? 'var(--accent-indigo)' : 'var(--accent-amber)',
                        borderRadius: '3px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 3 Career Predictions */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-highlight)', display: 'block', marginBottom: '14px' }}>
              Top 3 AI Predicted Career Alignments
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {result.topCareerMatches.map((career, idx) => (
                <div key={idx} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                        {career.title}
                      </span>
                      <span className="badge badge-emerald" style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                        {career.score}% Match
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {career.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Skills */}
          {result.detectedSkills.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                Detected Core Skills
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.detectedSkills.map((sk, idx) => (
                  <span key={idx} className="badge badge-slate" style={{ fontSize: '0.78rem', padding: '3px 10px' }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Apply Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px'
          }}>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-highlight)', display: 'block' }}>
                Ready to explore your personalized results?
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Apply these 9 dimensions to unlock your full Career Profile, Interactive What-If Simulator, and curated Roadmaps.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopySummary}
                className="btn-secondary"
                style={{ padding: '10px 16px', fontSize: '0.84rem', gap: '6px' }}
                title="Copy assessment summary to clipboard"
              >
                {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={handleApply}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.94rem', gap: '8px' }}
              >
                <Sparkles size={16} />
                <span>Apply to My Profile & View Results</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
