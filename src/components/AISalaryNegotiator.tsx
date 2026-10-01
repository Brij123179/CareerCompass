import React, { useState } from 'react';
import { 
  DollarSign, Sparkles, TrendingUp, ShieldCheck, Copy, Check, 
  MessageSquare, HelpCircle, ArrowUpRight, Zap, RefreshCw, ChevronRight, Globe
} from 'lucide-react';
import { DimensionScores, MarketRegion } from '../types';
import { MentorService, SalaryNegotiationResult } from '../services/mentorService';
import { LaborMarketService, REGIONAL_MARKETS } from '../utils/laborMarketService';
import { FormattedAiResponse } from './FormattedAiResponse';

interface AISalaryNegotiatorProps {
  userScores: DimensionScores;
  activeRegion: MarketRegion;
  defaultCareerTitle?: string;
}

export const AISalaryNegotiator: React.FC<AISalaryNegotiatorProps> = ({
  userScores,
  activeRegion,
  defaultCareerTitle = 'Full Stack Engineer'
}) => {
  const [careerTitle, setCareerTitle] = useState<string>(defaultCareerTitle);
  const [currentOffer, setCurrentOffer] = useState<string>('$130,000 / yr base');
  const [selectedRegion, setSelectedRegion] = useState<MarketRegion>(activeRegion);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<SalaryNegotiationResult | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!careerTitle.trim() || !currentOffer.trim()) return;
    setIsGenerating(true);
    try {
      const regionName = REGIONAL_MARKETS[selectedRegion]?.label || 'US Tier-1 Metro ($)';
      const data = await MentorService.generateSalaryNegotiationStrategy(
        careerTitle,
        currentOffer,
        regionName,
        userScores
      );
      setResult(data);
    } catch (e) {
      console.error('Error in salary negotiation:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.emailScript);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
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
            <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={12} />
              AI Compensation Strategist • USP
            </span>
            <span className="badge badge-indigo">
              Data-Driven Negotiation Battlecards
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            AI Salary & Offer Negotiation Coach
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '6px 0 0', maxWidth: '680px' }}>
            Turn your dimensional assessment scores and market labor data into maximum leverage. Generate custom counter-offer battlecards, scripts, and equity advice to negotiate $15k-$40k higher.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(5, 150, 105, 0.08)',
          border: '1px solid rgba(5, 150, 105, 0.25)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          color: 'var(--accent-emerald)',
          fontWeight: 700
        }}>
          <DollarSign size={14} />
          <span>Regional Calibrator: {REGIONAL_MARKETS[selectedRegion]?.label.split(' ')[0]}</span>
        </div>
      </div>

      {/* Input Parameters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Career Role */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Target Career Role
          </label>
          <input
            type="text"
            value={careerTitle}
            onChange={(e) => setCareerTitle(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Current Initial Offer */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Current Offer (Base + Equity/Bonus)
          </label>
          <input
            type="text"
            value={currentOffer}
            onChange={(e) => setCurrentOffer(e.target.value)}
            placeholder="e.g. $130,000 / yr base"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Geographic Region */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Market Region
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as MarketRegion)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 34px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="us-tier1">North America Tier 1 ($ USD)</option>
              <option value="us-tier2">North America Regional ($ USD)</option>
              <option value="europe">Europe / UK (€ / £)</option>
              <option value="apac">Asia-Pacific (₹ / S$ / AU$)</option>
              <option value="global-remote">Global Distributed / Remote</option>
            </select>
            <Globe size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-indigo)' }} />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !careerTitle.trim() || !currentOffer.trim()}
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
            <span>Calculating Regional Leverage & Strategy...</span>
          </>
        ) : (
          <>
            <TrendingUp size={16} />
            <span>Generate Negotiation Strategy with AI</span>
          </>
        )}
      </button>

      {/* Results Presentation */}
      {result && (
        <div style={{
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-medium)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Target Counter Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)',
              border: '1px solid rgba(5, 150, 105, 0.35)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recommended Counter-Offer Target
              </span>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-highlight)', margin: '4px 0' }}>
                {result.recommendedCounterOffer}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Target Market Band: {result.marketPercentile}
              </span>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                Equity & Vesting Strategy
              </span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                {result.equityAdvice}
              </p>
            </div>
          </div>

          {/* Key Leverage Points */}
          {result.leveragePoints.length > 0 && (
            <div style={{
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                🛡️ Your Candidate Negotiation Leverage Battlecard
              </span>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.leveragePoints.map((pt, i) => (
                  <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verbal Talking Points */}
          {result.verbalTalkingPoints.length > 0 && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-highlight)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
                🗣️ Live Phone Negotiation Talking Points:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.verbalTalkingPoints.map((point, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    fontStyle: 'italic'
                  }}>
                    "{point}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Word-for-Word Counter Email Script */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              onClick={handleCopyEmail}
              className="btn-secondary"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                gap: '6px'
              }}
              title="Copy email template"
            >
              {copiedEmail ? (
                <>
                  <Check size={14} style={{ color: 'var(--accent-emerald)' }} />
                  <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Email Script</span>
                </>
              )}
            </button>

            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
              📧 Word-for-Word Counter-Offer Email Script:
            </span>
            <div style={{ maxWidth: '92%' }}>
              <FormattedAiResponse content={result.emailScript} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
