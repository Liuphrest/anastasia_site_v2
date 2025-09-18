import React from 'react';
import LetterVortexNew from './LetterVortexNew';

const KnowledgePortal = React.memo(({ profileImage }) => (
  <div className="relative w-full max-w-sm h-96 overflow-visible flex items-center justify-center">
    {/* Photo container */}
    <div className="relative z-20 p-3 md:p-4" style={{ transform: 'translateY(-10%)' }}>
      <div className="relative">
        {/* Natural-aspect photo with bottom fade mask */}
        <img
          src={profileImage}
          alt="Profile"
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
      </div>
    </div>

    {/* Letter vortex behind photo */}
    <LetterVortexNew ringRadii={[1, 1.25, 1.45]} />
  </div>
));

export default KnowledgePortal;