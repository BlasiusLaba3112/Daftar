import React from 'react';

interface EmblemLogoProps {
  customUrl?: string;
  className?: string;
  size?: number;
}

export const EmblemLogo: React.FC<EmblemLogoProps> = ({
  customUrl,
  className = '',
  size = 72
}) => {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt="Logo Instansi"
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`object-contain ${className}`}
      />
    );
  }

  // Official-looking vector emblem of Kabupaten Sikka / Bhakti Husada
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A" />
          <stop offset="0.5" stopColor="#0D9488" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>
      </defs>

      {/* Outer Golden Shield Border */}
      <path
        d="M60 4 C95 4 114 18 114 44 C114 88 60 124 60 124 C60 124 6 88 6 44 C6 18 25 4 60 4 Z"
        fill="url(#goldGrad)"
        stroke="#78350F"
        strokeWidth="2.5"
      />

      {/* Inner Shield Body */}
      <path
        d="M60 10 C90 10 106 22 106 46 C106 82 60 115 60 115 C60 115 14 82 14 46 C14 22 30 10 60 10 Z"
        fill="#047857"
        stroke="#FBBF24"
        strokeWidth="2"
      />

      {/* Sky / Sea Divider */}
      <path
        d="M16 52 C35 50 85 50 104 52 C104 78 60 113 60 113 C60 113 16 78 16 52 Z"
        fill="#0284C7"
      />

      {/* Golden Rising Sun */}
      <circle cx="60" cy="50" r="16" fill="url(#sunGrad)" />
      <path d="M60 28 L60 36 M44 34 L50 40 M76 34 L70 40 M38 50 L46 50 M82 50 L74 50" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />

      {/* Traditional Sikka Boat / Perahu Layar */}
      <path
        d="M32 72 Q60 84 88 72 Q60 77 32 72 Z"
        fill="#92400E"
        stroke="#FEF3C7"
        strokeWidth="1.2"
      />
      {/* Sail */}
      <path d="M60 44 L60 72 L78 68 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
      <line x1="60" y1="42" x2="60" y2="72" stroke="#451A03" strokeWidth="2" />

      {/* Rice & Cotton Laurels */}
      {/* Rice left */}
      <path
        d="M26 42 Q20 62 34 88"
        stroke="#F59E0B"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cotton right */}
      <path
        d="M94 42 Q100 62 86 88"
        stroke="#E2E8F0"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Star at Top */}
      <polygon
        points="60,14 63,22 72,22 65,27 68,36 60,30 52,36 55,27 48,22 57,22"
        fill="#FDE047"
        stroke="#B45309"
        strokeWidth="0.8"
      />

      {/* Red-White Ribbon at bottom */}
      <path
        d="M24 94 Q60 106 96 94 L92 104 Q60 114 28 104 Z"
        fill="#DC2626"
        stroke="#7F1D1D"
        strokeWidth="1"
      />
      <path
        d="M26 100 Q60 110 94 100 L93 104 Q60 114 27 104 Z"
        fill="#FFFFFF"
      />
      <text
        x="60"
        y="101"
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="bold"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        SIKKA
      </text>
    </svg>
  );
};
