import React, { useState } from 'react';
import { 
  Sparkles, FileText, CheckCircle2, AlertTriangle, ArrowRight, 
  RotateCcw, Send, Briefcase, Zap, ShieldCheck, ChevronRight
} from 'lucide-react';
import { DimensionScores, Career } from '../types';
import { MentorService, JobAnalysisResult } from '../services/mentorService';
import { FormattedAiResponse } from './FormattedAiResponse';

interface AIJobMatcherProps {
  career: Career;
  userScores: DimensionScores;
}

const SAMPLE_JOBS = [
  {
    title: 'Senior Backend Engineer @ Stripe',
    company: 'Stripe',
    text: `About the Role:
We are looking for a Senior Backend Engineer to join our Core Payment Rails infrastructure team.
Requirements:
- 4+ years of production experience building high-throughput, low-latency distributed systems.
- Deep expertise in relational data modeling, query optimization, and distributed caching (Redis).
- Proven track record with idempotency, optimistic locking, and event-driven architectures (Kafka).
- Strong commitment to zero-trust security, RFC 6238 TOTP authentication, and API contract design.`
  },
  {
    title: 'Applied AI / ML Systems Engineer @ Anthropic',
    company: 'Anthropic',
    text: `About the Role:
Join our Applied AI Systems team to scale inference pipelines and context retrieval architectures.
Requirements:
- Strong foundations in Python, PyTorch/TensorFlow, and vector similarity search (HNSW, FAISS).
- Experience building production RAG pipelines, quantization (FP8, INT4), and streaming APIs.
- Deep understanding of model evaluation metrics, hallucination benchmarks, and alignment guardrails.
- Excellent algorithmic problem-solving instincts and asynchronous concurrency management.`
  },
  {
    title: 'Cloud Infrastructure & SRE Specialist @ Datadog',
    company: 'Datadog',
    text: `About the Role:
We are hiring an SRE / Cloud Platform Engineer to manage multi-region Kubernetes clusters.
Requirements:
- Deep experience with Kubernetes Operator patterns, Helm charts, and Terraform IaC.
- Expertise in distributed telemetry: Prometheus metrics, OpenTelemetry traces, and eBPF probes.
- Proven ability to troubleshoot cascading network partitions, DNS storms, and kernel bottlenecks.
- Background in high-availability systems with 99.999% SLA uptime guarantees.`
  }
];

export const AIJobMatcher: React.FC<AIJobMatcherProps> = ({ career, userScores }) => {
  const [jobText, setJobText] = useState(SAMPLE_JOBS[0].text);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JobAnalysisResult | null>(null);

  const handleSelectPreset = (index: number) => {
    setSelectedPreset(index);
    setJobText(SAMPLE_JOBS[index].text);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await MentorService.analyzeJobDescription(jobText, career.title, userScores);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-glow)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={12} />
              Live AI Powered
            </span>
          </div>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--text-highlight)', fontWeight: 700 }}>
            Real-Time Job Description & Resume Matcher
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Paste any real-world job posting to calculate your exact semantic fit and discover high-priority missing skills.
          </p>
        </div>

        {/* Sample job buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SAMPLE_JOBS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(idx)}
              className="btn-secondary"
              style={{
                fontSize: '0.74rem',
                padding: '6px 12px',
                borderColor: selectedPreset === idx ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                background: selectedPreset === idx ? 'rgba(79, 70, 229, 0.12)' : 'var(--bg-secondary)'
              }}
            >
              {sample.company}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div style={{ marginBottom: '16px' }}>
        <textarea
          rows={5}
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste full job description requirements here..."
          className="input-luxury"
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            padding: '14px',
            borderRadius: 'var(--radius-md)'
          }}
        />
      </div>

      {/* Action button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Candidate Profile: <strong>{career.title}</strong> • 9 Dimensions Loaded
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !jobText.trim()}
          className="btn-primary"
          style={{ padding: '10px 22px', fontSize: '0.88rem' }}
        >
          {isAnalyzing ? (
            <>
              <RotateCcw size={15} className="spinner" />
              <span>Analyzing Semantic Fit with AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Evaluate Match with Live AI</span>
            </>
          )}
        </button>
      </div>

      {/* Result Cards */}
      {result && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '22px',
          border: '1px solid var(--border-medium)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Top Score Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                AI Evaluator Verdict
              </span>
              <h4 style={{ fontSize: '1.2rem', color: 'var(--text-highlight)', margin: '2px 0 0 0' }}>
                {result.verdict}
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: result.matchPercentage >= 75 ? 'var(--accent-emerald)' : 'var(--accent-indigo)', lineHeight: 1 }}>
                  {result.matchPercentage}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Semantic Match</div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.84rem' }}>
                <CheckCircle2 size={16} />
                <span>Verified Strengths You Possess</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.matchedSkills.map((skill, idx) => (
                  <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.84rem' }}>
                <AlertTriangle size={16} />
                <span>Critical Missing Gaps to Bridge</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.missingSkills.map((skill, idx) => (
                  <span key={idx} className="badge badge-rose" style={{ fontSize: '0.74rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tactical 14-Day Bridge Plan */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--accent-terracotta)',
            border: '1px solid var(--border-medium)'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-terracotta)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              🎯 AI 14-Day Tactical Bridge Plan:
            </div>
            <FormattedAiResponse content={result.bridgingPlan} />
          </div>
        </div>
      )}
    </div>
  );
};
