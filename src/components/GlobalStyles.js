import React from 'react';

const GlobalStyles = () => (
  <style>{`
    @font-face {
      font-family: 'BrandFont';
      src: url('/fonts/ShadowsIntoLight-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'CTAFont';
      src: url('/fonts/Kanit-MediumItalic.ttf') format('truetype');
      font-weight: 500;
      font-style: italic;
      font-display: swap;
    }
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap');
    .font-manrope { font-family: 'Manrope', sans-serif; }
    ::selection { background-color: #A78BFA; color: #121212; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0B0D17; }
    ::-webkit-scrollbar-thumb { background: #A78BFA; border-radius: 10px; }
    html, body { overscroll-behavior: none; }

    /* STARRY NIGHT BACKGROUND */
    .starry-bg {
      background: linear-gradient(135deg, #0B0D17 0%, #1a1b3a 25%, #2a2d5f 50%, #1a1b3a 75%, #0B0D17 100%);
      position: relative;
      overflow: hidden;
    }

    /* Псевдо-слои оставляем очень мягкими и ОЧЕНЬ медленными, чтобы не перебивать канвас */
    .starry-bg::before,
    .starry-bg::after {
      opacity: 0.15;
      z-index: 0;
    }
    .starry-bg::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(2px 2px at 20px 30px, #fff, transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.9), transparent),
        radial-gradient(1px 1px at 130px 80px, #fff, transparent),
        radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 200px 90px, rgba(255,255,255,0.8), transparent),
        radial-gradient(2px 2px at 240px 50px, #fff, transparent),
        radial-gradient(1px 1px at 280px 20px, rgba(255,255,255,0.9), transparent),
        radial-gradient(1px 1px at 320px 100px, rgba(255,255,255,0.7), transparent),
        radial-gradient(2px 2px at 360px 60px, #fff, transparent);
      background-repeat: repeat;
      background-size: 400px 200px;
      animation: sparkle 160s ease-in-out infinite alternate;
      pointer-events: none;
    }

    .starry-bg::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(1px 1px at 60px 15px, rgba(167, 139, 250, 0.8), transparent),
        radial-gradient(1px 1px at 180px 45px, rgba(45, 212, 191, 0.6), transparent),
        radial-gradient(2px 2px at 300px 25px, rgba(167, 139, 250, 0.7), transparent),
        radial-gradient(1px 1px at 80px 85px, rgba(45, 212, 191, 0.8), transparent),
        radial-gradient(1px 1px at 250px 75px, rgba(167, 139, 250, 0.6), transparent);
      background-repeat: repeat;
      background-size: 350px 180px;
      animation: sparkle-color 200s ease-in-out infinite alternate;
      pointer-events: none;
    }

    @keyframes sparkle {
      0% { opacity: 0.1; transform: translateY(0px) rotate(0deg); }
      50% { opacity: 0.2; transform: translateY(-6px) rotate(6deg); }
      100% { opacity: 0.15; transform: translateY(0px) rotate(12deg); }
    }

    @keyframes sparkle-color {
      0% { opacity: 0.08; transform: translateX(0px) scale(1); }
      50% { opacity: 0.18; transform: translateX(-3px) scale(1.04); }
      100% { opacity: 0.1; transform: translateX(0px) scale(1); }
    }

    /* Канвас со звёздами — под всем контентом */
    .starry-canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
      will-change: transform;
    }

    .text-glow {
      text-shadow: 0 0 10px rgba(229, 229, 229, 0.3), 0 0 25px rgba(167, 139, 250, 0.2);
    }

    .gradient-text {
      background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #2dd4bf 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradient-shift 4s ease-in-out infinite alternate;
    }
    .cta-gradient-text {
      background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #ef4444, #8b5cf6, #60a5fa);
      background-size: 300% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradient-pan 8s ease-in-out infinite;
    }
    .cta-button {
      position: relative;
      border-radius: 9999px;
      background: radial-gradient(120% 100% at 50% 15%, rgba(168,160,190,0.18), rgba(70,50,100,0.08) 45%, rgba(11,13,23,0.6) 75%);
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 0 16px rgba(76,29,149,0.25), 0 0 6px rgba(76,29,149,0.15);
      backdrop-filter: blur(4px);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -6px 14px rgba(76,29,149,0.18), 0 0 16px rgba(76,29,149,0.25), 0 0 6px rgba(76,29,149,0.15);
    }
    .hero-gradient-text {
      background: linear-gradient(90deg, #5ca9ff 0%, #b879f5 20%, #f05a93 50%, #f54444 75%, #a43aff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .font-cta { font-family: 'CTAFont', Manrope, sans-serif; }
    .cta-button::before {
      content: '';
      position: absolute;
      inset: -28px -40px;
      border-radius: 9999px;
      background: radial-gradient(70% 60% at 50% 50%, rgba(76,29,149,0.05) 0%, rgba(76,29,149,0.12) 40%, rgba(76,29,149,0.18) 60%, rgba(11,13,23,0) 85%);
      filter: blur(26px);
      z-index: -1;
      opacity: .35;
      transition: opacity .2s ease;
    }
    .cta-button:hover::before { opacity: 1; }
    @keyframes gradient-pan {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .name-glow {
color: #2dd4bf;
text-shadow:
  0 0 5px #2dd4bf,
  0 0 10px #2dd4bf,
  0 0 15px #2dd4bf,
  0 0 20px #2dd4bf;
animation: pulse-glow 2s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
0% {
  text-shadow:
    0 0 5px #2dd4bf,
    0 0 10px #2dd4bf,
    0 0 15px #2dd4bf,
    0 0 20px #2dd4bf;
}
100% {
  text-shadow:
    0 0 8px #2dd4bf,
    0 0 16px #2dd4bf,
    0 0 24px #2dd4bf,
    0 0 32px #2dd4bf;
}
}
    @keyframes gradient-shift {
      0% { filter: hue-rotate(0deg) brightness(1); }
      100% { filter: hue-rotate(20deg) brightness(1.2); }
    }

    .aurora {
        background-position: center;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        transition: opacity 0.8s ease-in-out;
    }
    .aurora-purple {
        background-image: radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124, 58, 237, 0.15), transparent);
    }
    .aurora-cyan {
        background-image: radial-gradient(ellipse 80% 50% at 50% 50%, rgba(45, 212, 191, 0.15), transparent);
    }
  `}</style>
);

export default GlobalStyles;
