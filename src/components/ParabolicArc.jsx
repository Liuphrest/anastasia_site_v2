import React from 'react';

const ParabolicArc = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 1, overflow: 'visible' }}
      >
        {/* Градиент для затухания дуги */}
        <defs>
          <linearGradient id="arcGradient" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(254, 215, 170, 0)" />
            <stop offset="2%" stopColor="rgba(254, 215, 170, 1)" />
            <stop offset="15%" stopColor="rgba(254, 215, 170, 1)" />
            <stop offset="40%" stopColor="rgba(254, 215, 170, 1)" />
            <stop offset="100%" stopColor="rgba(254, 215, 170, 0)" />
          </linearGradient>
        </defs>

        {/* Параболическая дуга по точкам из GraphML */}
        <g transform="rotate(-10 600 300)">
          <path
            d="M 842 135 C 820 150 800 160 811 230 C 822 300 700 280 363 195 C 250 150 200 165 187 171 C 174 177 180 190 188 216 C 196 242 170 235 145 221"
            stroke="url(#arcGradient)"
            strokeWidth="6"
            fill="none"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};

export default ParabolicArc;