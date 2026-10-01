import React, { useState, useRef } from 'react';

interface CompassGraphicProps {
  score?: number;
  careerTitle?: string;
  category?: string;
  angle?: number;
  interactive3D?: boolean;
}

export const CompassGraphic: React.FC<CompassGraphicProps> = ({
  score = 88,
  careerTitle = 'AI/ML Engineer',
  category = 'Engineering',
  angle = 38, // Points towards North-East exactly matching screenshot
  interactive3D = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, currentAngle: angle, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive3D || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 3D tilt calculation (-12deg to +12deg)
    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 12;

    // Angle of cursor relative to center of compass
    const rad = Math.atan2(x - centerX, centerY - y);
    const cursorDeg = Math.round((rad * (180 / Math.PI) + 360) % 360);

    setTilt({
      rotateX: rotX,
      rotateY: rotY,
      currentAngle: cursorDeg,
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      currentAngle: angle,
      isHovered: false
    });
  };

  const displayAngle = tilt.isHovered ? tilt.currentAngle : angle;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        aspectRatio: '1 / 1',
        perspective: '1000px',
        cursor: 'crosshair',
        userSelect: 'none'
      }}
    >
      {/* 3D Tilted Wrap */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: tilt.isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Top Question Indicator */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '36px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.78rem',
          color: '#141414',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transform: 'translateZ(15px)'
        }}>
          <span>12 questions</span>
          <span style={{ fontSize: '0.7rem' }}>\</span>
        </div>

        {/* Live Degree Readout (when hovered) */}
        {tilt.isHovered && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '36px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.74rem',
            color: '#eb5e34',
            fontWeight: 700,
            transform: 'translateZ(15px)'
          }}>
            BEARING: {String(displayAngle).padStart(3, '0')}°
          </div>
        )}

        {/* Floating Technical Dimension Callouts with 3D Depth */}
        {/* TECH 01 */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '-10px',
          border: '1px solid #141414',
          background: '#ffffff',
          padding: '3px 8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#141414',
          zIndex: 4,
          boxShadow: '1.5px 1.5px 0px #141414',
          transform: 'translateZ(26px)',
          transition: 'all 0.2s ease'
        }}>
          TECH <span style={{ color: '#eb5e34' }}>01</span>
        </div>

        {/* DATA 02 */}
        <div style={{
          position: 'absolute',
          top: '22%',
          right: '-12px',
          border: '1px solid #141414',
          background: '#ffffff',
          padding: '3px 8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#141414',
          zIndex: 4,
          boxShadow: '1.5px 1.5px 0px #141414',
          transform: 'translateZ(26px)',
          transition: 'all 0.2s ease'
        }}>
          DATA <span style={{ color: '#eb5e34' }}>02</span>
        </div>

        {/* DESIGN 03 */}
        <div style={{
          position: 'absolute',
          bottom: '22%',
          left: '-8px',
          border: '1px solid #141414',
          background: '#ffffff',
          padding: '3px 8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#141414',
          zIndex: 4,
          boxShadow: '1.5px 1.5px 0px #141414',
          transform: 'translateZ(26px)',
          transition: 'all 0.2s ease'
        }}>
          DESIGN <span style={{ color: '#eb5e34' }}>03</span>
        </div>

        {/* IMPACT 04 */}
        <div style={{
          position: 'absolute',
          bottom: '12%',
          right: '-14px',
          border: '1px solid #141414',
          background: '#ffffff',
          padding: '3px 8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#141414',
          zIndex: 4,
          boxShadow: '1.5px 1.5px 0px #141414',
          transform: 'translateZ(26px)',
          transition: 'all 0.2s ease'
        }}>
          IMPACT <span style={{ color: '#eb5e34' }}>04</span>
        </div>

        {/* Dashed connector line across center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          right: '20px',
          borderTop: '1px dashed rgba(20, 20, 20, 0.35)',
          pointerEvents: 'none',
          transform: 'translateZ(5px)'
        }} />

        {/* Main SVG Compass */}
        <svg
          viewBox="0 0 340 340"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(3px 5px 0px rgba(20, 20, 20, 0.16))',
            transform: 'translateZ(10px)'
          }}
        >
          {/* Outer Circular Rim */}
          <circle
            cx="170"
            cy="170"
            r="154"
            fill="#f4be43"
            stroke="#141414"
            strokeWidth="1.5"
          />

          {/* Concentric Inner Ring 1 */}
          <circle
            cx="170"
            cy="170"
            r="126"
            fill="none"
            stroke="#141414"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />

          {/* Concentric Inner Ring 2 */}
          <circle
            cx="170"
            cy="170"
            r="92"
            fill="none"
            stroke="#141414"
            strokeWidth="0.8"
          />

          {/* Concentric Inner Ring 3 */}
          <circle
            cx="170"
            cy="170"
            r="58"
            fill="none"
            stroke="#141414"
            strokeWidth="0.6"
          />

          {/* Cardinal Directions (N, E, S, W) */}
          <text
            x="170"
            y="42"
            textAnchor="middle"
            fill="#141414"
            fontFamily="Space Mono, monospace"
            fontSize="11"
            fontWeight="700"
          >
            N
          </text>

          <text
            x="302"
            y="174"
            textAnchor="middle"
            fill="#141414"
            fontFamily="Space Mono, monospace"
            fontSize="11"
            fontWeight="700"
          >
            E
          </text>

          <text
            x="170"
            y="306"
            textAnchor="middle"
            fill="#141414"
            fontFamily="Space Mono, monospace"
            fontSize="11"
            fontWeight="700"
          >
            S
          </text>

          <text
            x="38"
            y="174"
            textAnchor="middle"
            fill="#141414"
            fontFamily="Space Mono, monospace"
            fontSize="11"
            fontWeight="700"
          >
            W
          </text>

          {/* Needle Group with dynamic angle rotation */}
          <g
            transform={`rotate(${displayAngle} 170 170)`}
            style={{ 
              transition: tilt.isHovered ? 'transform 0.12s ease-out' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' 
            }}
          >
            {/* North Needle Point (Terracotta Orange) */}
            <polygon
              points="170,54 163,170 177,170"
              fill="#eb5e34"
              stroke="#141414"
              strokeWidth="1.2"
            />

            {/* South Needle Point (Dark Charcoal) */}
            <polygon
              points="170,240 165,170 175,170"
              fill="#262626"
              stroke="#141414"
              strokeWidth="0.8"
            />
          </g>

          {/* Center Hub ("cc") */}
          <circle
            cx="170"
            cy="170"
            r="24"
            fill="#141414"
            stroke="#141414"
            strokeWidth="1.5"
          />
          <text
            x="170"
            y="174"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontFamily="Space Mono, monospace"
            fontSize="10"
            fontWeight="800"
            letterSpacing="0.05em"
          >
            cc
          </text>
        </svg>

        {/* Lat/Long Coordinates Footer */}
        <div style={{
          position: 'absolute',
          bottom: '-22px',
          right: '30px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.7rem',
          color: '#78716c',
          letterSpacing: '0.04em',
          transform: 'translateZ(15px)'
        }}>
          N / 51.5072° W / 0.1276°
        </div>

      </div>
    </div>
  );
};
