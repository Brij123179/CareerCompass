import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, Scale, SlidersHorizontal, BookOpen, ArrowRight, DollarSign, Clock, Code, Users, Bookmark, BookmarkCheck, Check, TrendingUp } from 'lucide-react';
import { Career, CareerCategory, MatchBreakdown, DimensionScores } from '../types';
import { CAREERS_DATA } from '../data/careersData';
import { calculateCareerMatch } from '../utils/scoringEngine';
import { LaborMarketService } from '../utils/laborMarketService';
import { ActiveTab } from './Navbar';

interface CareerExplorerProps {
  userScores: DimensionScores;
  baselineMatches: MatchBreakdown[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCareerForComparison: (careerId: string) => void;
  onOpenCareerModal: (career: Career) => void;
}

const CATEGORIES: ('All' | CareerCategory)[] = [
  'All',
  'Engineering',
  'Data & AI',
  'Design',
  'Business & Strategy',
  'Security & Cloud'
];

export const CareerExplorer: React.FC<CareerExplorerProps> = ({
  userScores,
  setActiveTab,
  onSelectCareerForComparison,
  onOpenCareerModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | CareerCategory>('All');
  const [codingFilter, setCodingFilter] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');
  const [minMatch, setMinMatch] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'duration' | 'alpha'>('match');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Compute live match score dynamically for each career based on userScores
  const careersWithScore = useMemo(() => {
    return CAREERS_DATA.map(career => {
      const matchScore = calculateCareerMatch(career, userScores);
      return {
        career,
        matchScore
      };
    });
  }, [userScores]);

  const toggleBookmark = (careerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(careerId) ? prev.filter(id => id !== careerId) : [...prev, careerId]
    );
  };

  // Filter and sort
  const filteredCareers = useMemo(() => {
    return careersWithScore.filter(item => {
      // Category filter
      if (selectedCategory !== 'All' && item.career.category !== selectedCategory) {
        return false;
      }

      // Coding filter
      if (codingFilter !== 'All' && item.career.comparison.codingLevel !== codingFilter) {
        return false;
      }

      // Minimum match filter
      if (item.matchScore < minMatch) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.career.title.toLowerCase().includes(q);
        const matchesCategory = item.career.category.toLowerCase().includes(q);
        const matchesTagline = item.career.tagline.toLowerCase().includes(q);
        const matchesSkills = item.career.skillsRequired.some(s => s.toLowerCase().includes(q));
        const matchesTools = item.career.comparison.topTools.some(t => t.toLowerCase().includes(q));
        const matchesRoles = item.career.comparison.typicalRoles.some(r => r.toLowerCase().includes(q));

        if (!matchesTitle && !matchesCategory && !matchesTagline && !matchesSkills && !matchesTools && !matchesRoles) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore;
      }
      if (sortBy === 'salary') {
        const numA = parseInt(a.career.comparison.avgSalary.replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(b.career.comparison.avgSalary.replace(/[^0-9]/g, '')) || 0;
        return numB - numA;
      }
      if (sortBy === 'duration') {
        return a.career.comparison.duration.localeCompare(b.career.comparison.duration);
      }
      return a.career.title.localeCompare(b.career.title);
    });
  }, [careersWithScore, selectedCategory, codingFilter, minMatch, searchQuery, sortBy]);

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '30px',
        marginBottom: '26px',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(145deg, rgba(5, 150, 105, 0.08) 0%, rgba(2, 132, 199, 0.06) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={13} />
                Searchable & Filterable Library
              </span>
              <span className="badge badge-cyan">
                Live Match Compatibility
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', marginBottom: '8px' }}>Career Explorer</h1>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '750px' }}>
              Browse the curated catalog of high-impact technology careers across 5 disciplines with live compatibility indicators calibrated to your personal assessment profile.
            </p>
          </div>

          {bookmarkedIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-indigo">
                {bookmarkedIds.length} Bookmarked
              </span>
              <button
                onClick={() => {
                  onSelectCareerForComparison(bookmarkedIds[0]);
                  setActiveTab('comparison');
                }}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                <Scale size={13} />
                <span>Compare Bookmarked</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'All'
              ? CAREERS_DATA.length
              : CAREERS_DATA.filter(c => c.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>{cat}</span>
                <span style={{
                  fontSize: '0.68rem',
                  background: isSelected ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Secondary Filters Row: Search, Coding, Min Match, Sort */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Live Search Bar */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title, skill (e.g. PyTorch, React, SQL), or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Coding Demand Filter */}
          <select
            value={codingFilter}
            onChange={(e) => setCodingFilter(e.target.value as any)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">All Coding Levels</option>
            <option value="High">High Coding Intensity</option>
            <option value="Moderate">Moderate Coding</option>
            <option value="Low">Low / Foundational Coding</option>
          </select>

          {/* Minimum Match Filter */}
          <select
            value={minMatch}
            onChange={(e) => setMinMatch(parseInt(e.target.value))}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="0">All Match Scores</option>
            <option value="80">Match ≥ 80%</option>
            <option value="85">Match ≥ 85%</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="match">Highest Match %</option>
            <option value="salary">Highest Salary</option>
            <option value="duration">Learning Duration</option>
            <option value="alpha">Alphabetical (A - Z)</option>
          </select>
        </div>

      </div>

      {/* Results Count Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredCareers.length}</strong> matching career pathways
        </span>
        {(searchQuery || codingFilter !== 'All' || minMatch > 0 || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setCodingFilter('All');
              setMinMatch(0);
              setSelectedCategory('All');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Career Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '22px'
      }}>
        {filteredCareers.map(({ career, matchScore }) => {
          const isBookmarked = bookmarkedIds.includes(career.id);
          return (
            <div
              key={career.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-normal)',
                position: 'relative'
              }}
            >
              <div>
                {/* Header: Category + Match Pill + Bookmark Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                      {career.category}
                    </span>
                    <button
                      onClick={(e) => toggleBookmark(career.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isBookmarked ? 'var(--accent-indigo)' : 'var(--text-muted)',
                        padding: '2px'
                      }}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Career'}
                    >
                      {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                  </div>
                  
                  {/* Match Indicator Pill */}
                  <div className={`match-score-pill ${matchScore >= 85 ? 'match-high' : 'match-med'}`}>
                    <Sparkles size={12} />
                    <span>{matchScore}% Match</span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '6px', color: 'var(--text-highlight)' }}>
                  {career.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
                  {career.tagline}
                </p>

                {/* Key Skills Tags */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {career.skillsRequired.slice(0, 3).map((sk, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.74rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Info Grid with Dynamic Regional Salary Calibration */}
                {(() => {
                  const localized = LaborMarketService.getLocalizedSalary(career.comparison.avgSalary);
                  const market = LaborMarketService.getCategoryHiringIndex(career.category);
                  return (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      background: 'var(--bg-secondary)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '18px',
                      fontSize: '0.78rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Dynamic Market Salary:</span>
                        <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.88rem' }}>{localized.formatted}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Hiring Demand:</span>
                        <strong style={{ color: 'var(--accent-indigo)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <TrendingUp size={12} />
                          {market.growthRate} ({market.demand})
                        </strong>
                      </div>
                      <div style={{ marginTop: '2px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Coding Level:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{career.comparison.codingLevel}</span>
                      </div>
                      <div style={{ marginTop: '2px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Time to Competence:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{career.comparison.duration}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onOpenCareerModal(career)}
                  className="btn-primary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '9px 12px' }}
                >
                  <BookOpen size={13} />
                  <span>Roadmap</span>
                </button>

                <button
                  onClick={() => {
                    onSelectCareerForComparison(career.id);
                    setActiveTab('comparison');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '9px 12px' }}
                  title="Compare in Matrix"
                >
                  <Scale size={13} />
                </button>

                <button
                  onClick={() => setActiveTab('simulator')}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '9px 12px' }}
                  title="Simulate Skills"
                >
                  <SlidersHorizontal size={13} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
