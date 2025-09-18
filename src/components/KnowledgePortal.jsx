import React from 'react';
import LetterVortexNew from './LetterVortexNew';

const KnowledgePortal = ({ profileImage }) => (
  <div className="relative w-full max-w-sm h-96 overflow-visible flex items-center justify-center">
    {/* Photo + frame container (natural aspect image) */}
    <div className="relative z-20 p-3 md:p-4" style={{ transform: 'translateY(-10%)' }}>
      <div className="relative">
        {/* Background radial glow behind the photo (disabled) */}
        {false && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              transform: 'scale(1.3)',
              background: `
                radial-gradient(
                  circle at center,
                  transparent 35%,
                  rgba(55, 65, 81, 0.1) 40%,
                  rgba(55, 65, 81, 0.2) 45%,
                  rgba(55, 65, 81, 0.3) 50%,
                  rgba(55, 65, 81, 0.4) 55%,
                  rgba(55, 65, 81, 0.5) 60%,
                  rgba(31, 41, 55, 0.6) 65%,
                  rgba(31, 41, 55, 0.7) 70%,
                  rgba(17, 24, 39, 0.8) 80%,
                  rgba(17, 24, 39, 0.9) 90%,
                  transparent 100%
                )
              `,
              filter: 'blur(8px)',
              opacity: 0.8,
              zIndex: 0
            }}
          />
        )}

        {/* Natural-aspect photo with bottom fade mask */}
        <img
          src={profileImage}
          alt=""
          className="relative block w-full h-auto object-contain"
          style={{
            zIndex: 1,
            maskImage: 'radial-gradient(circle at center, black 0%, black 45%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, black 45%, transparent 85%)',
            maskSize: 'cover',
            WebkitMaskSize: 'cover',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center bottom',
            WebkitMaskPosition: 'center bottom',
            boxShadow: '0px 4px 10px rgba(5, 5, 25, 0.1), 0px 8px 24px rgba(5, 5, 25, 0.08), 0px 16px 48px rgba(5, 5, 25, 0.06)'
          }}
        />

        {/* Decorative image frame overlay (scale 1.7) - disabled
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
          <img
            src="/images/frame.png"
            alt=""
            className="w-full h-full object-contain pointer-events-none"
            style={{ transform: 'scale(1.7)', filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.5))' }}
          />
        </div>
        */}

        {/* Top radial vignette (disabled) */}
        {false && (
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              zIndex: 3,
              background: `
                radial-gradient(
                  circle at center,
                  transparent 55%,
                  rgba(17, 24, 39, 0.05) 60%,
                  rgba(17, 24, 39, 0.1) 65%,
                  rgba(17, 24, 39, 0.15) 70%,
                  rgba(17, 24, 39, 0.2) 75%,
                  rgba(17, 24, 39, 0.25) 80%,
                  rgba(17, 24, 39, 0.3) 85%,
                  rgba(17, 24, 39, 0.35) 90%,
                  rgba(17, 24, 39, 0.4) 95%,
                  rgba(17, 24, 39, 0.45) 100%
                )
              `,
              mixBlendMode: 'multiply'
            }}
          />
        )}
      </div>
    </div>

    {/* Soft radial background glow behind everything (disabled) */}
    {false && (
      <div className="absolute inset-0 -z-10 opacity-30" style={{
        background: 'radial-gradient(ellipse 85% 92% at center, rgba(124, 58, 237, 0.12) 0%, rgba(45, 212, 191, 0.08) 35%, transparent 78%)',
        borderRadius: '9999px'
      }} />
    )}

    {/* Letter vortex behind photo */}
    <LetterVortexNew ringRadii={[1, 1.25, 1.45]} />
  </div>
);

export default KnowledgePortal;
