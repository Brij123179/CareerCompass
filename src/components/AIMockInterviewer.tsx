import React, { useState } from 'react';
import { 
  Sparkles, Terminal, CheckCircle2, AlertTriangle, ArrowRight, 
  RotateCcw, Send, HelpCircle, Award, MessageSquareCode, ShieldAlert
} from 'lucide-react';
import { Career } from '../types';
import { MentorService, InterviewChallenge, InterviewEvaluation } from '../services/mentorService';
import { FormattedAiResponse } from './FormattedAiResponse';

interface AIMockInterviewerProps {
  career: Career;
}

export const AIMockInterviewer: React.FC<AIMockInterviewerProps> = ({ career }) => {
  const [difficulty, setDifficulty] = useState<'Mid-Level' | 'Senior' | 'Staff/Lead'>('Senior');
  const [challenge, setChallenge] = useState<InterviewChallenge | null>(null);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setEvaluation(null);
    setCandidateAnswer('');
    try {
      const q = await MentorService.generateTechnicalInterviewQuestion(career.title, difficulty);
      setChallenge(q);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertSampleAnswer = () => {
    if (challenge?.sampleAnswer) {
      setCandidateAnswer(challenge.sampleAnswer);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!challenge || !candidateAnswer.trim()) return;
    setIsGrading(true);
    try {
      const evalData = await MentorService.gradeTechnicalInterviewAnswer(
        challenge.question,
        candidateAnswer,
        career.title
      );
      setEvaluation(evalData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-glow)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Terminal size={12} />
              Live AI Interview Simulator
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Target: {career.title}
            </span>
          </div>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--text-highlight)', fontWeight: 700 }}>
            Real-Time System Design & Architecture Screen
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Face unscripted scenarios generated dynamically by LLM and receive Google/Meta-grade scoring.
          </p>
        </div>

        {/* Difficulty Selector & Generator Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            {(['Mid-Level', 'Senior', 'Staff/Lead'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: difficulty === diff ? 'var(--accent-indigo)' : 'transparent',
                  color: difficulty === diff ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: difficulty === diff ? 600 : 400
                }}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateChallenge}
            disabled={isGenerating}
            className="btn-primary"
            style={{ fontSize: '0.84rem', padding: '8px 16px' }}
          >
            {isGenerating ? (
              <>
                <RotateCcw size={14} className="spinner" />
                <span>Synthesizing Challenge...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{challenge ? 'Next Question' : 'Start Mock Screen'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Challenge View */}
      {!challenge && !isGenerating && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-medium)'
        }}>
          <MessageSquareCode size={36} style={{ color: 'var(--accent-cyan)', margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1.1rem', color: 'var(--text-highlight)', marginBottom: '6px' }}>
            No Active Technical Challenge
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px' }}>
            Click <strong>"Start Mock Screen"</strong> to generate a live, unscripted systems problem tailored to <strong>{career.title}</strong>.
          </p>
          <button
            onClick={handleGenerateChallenge}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.86rem' }}
          >
            <Sparkles size={15} />
            <span>Generate Live Scenario</span>
          </button>
        </div>
      )}

      {challenge && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Question Box */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--accent-cyan)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                {challenge.difficulty} Architectural Problem
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Scenario ID: #{challenge.id.slice(-6)}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px', fontStyle: 'italic' }}>
              "{challenge.scenario}"
            </p>

            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-highlight)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
              {challenge.question}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Target Concepts:
              </span>
              {challenge.keyRequirements.map((req, idx) => (
                <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                  {req}
                </span>
              ))}
            </div>
          </div>

          {/* Answer Input */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
                Your Architectural Answer:
              </label>
              <button
                onClick={handleInsertSampleAnswer}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                title="Autofill with staff-level reference answer"
              >
                Insert Staff-Level Demo Answer
              </button>
            </div>

            <textarea
              rows={4}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Outline your architecture, caching layers, concurrency handling, and failure mitigation strategies..."
              className="input-luxury"
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                padding: '14px',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              onClick={handleSubmitAnswer}
              disabled={isGrading || !candidateAnswer.trim()}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.88rem' }}
            >
              {isGrading ? (
                <>
                  <RotateCcw size={15} className="spinner" />
                  <span>Evaluating with AI Bar Raiser...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit to AI Interviewer</span>
                </>
              )}
            </button>
          </div>

          {/* Evaluation Results */}
          {evaluation && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              padding: '22px',
              border: '1px solid var(--border-medium)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={24} style={{ color: 'var(--accent-indigo)' }} />
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-highlight)', margin: 0 }}>
                      Interview Grade: <span className="text-gradient">{evaluation.grade}</span>
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Assessed against Google/Meta technical rubric
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: 800, color: evaluation.score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-indigo)', lineHeight: 1 }}>
                    {evaluation.score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                </div>
              </div>

              {/* Feedback paragraph */}
              <div style={{ marginBottom: '16px' }}>
                <FormattedAiResponse content={evaluation.detailedFeedback} />
              </div>

              {/* Strengths & Blindspots */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    <CheckCircle2 size={15} />
                    <span>Architectural Strengths</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {evaluation.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    <AlertTriangle size={15} />
                    <span>Missing Considerations / Blind Spots</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {evaluation.blindSpots.map((blind, i) => (
                      <li key={i}>{blind}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Follow-up question */}
              {evaluation.followUpQuestion && (
                <div style={{
                  background: 'rgba(79, 70, 229, 0.06)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--accent-indigo)'
                }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-indigo)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                    🎙️ Follow-Up Interview Question:
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-highlight)', margin: 0 }}>
                    "{evaluation.followUpQuestion}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
