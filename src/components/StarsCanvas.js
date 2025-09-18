import React, { useRef, useEffect } from 'react';

const StarsCanvas = React.memo(function StarsCanvas({ count = 240 }) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const rafRef = useRef(null);
  const startedAt = useRef(performance.now());

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const makeStars = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const amount = Math.round(count * Math.min(1.2, Math.max(0.7, (w * h) / (1280 * 720))));
    const arr = new Array(amount).fill(0).map(() => {
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      const vx = x0 - cx;
      const vy = y0 - cy;
      const baseAngle = Math.atan2(vy, vx);
      const baseRadius = Math.hypot(vx, vy);
      const glowType = Math.random();
      let glowColor;

      if (glowType < 0.4) {
        // Белое мерцание (40%)
        glowColor = { r: 255, g: 255, b: 255 };
      } else if (glowType < 0.7) {
        // Голубой цвет (30%)
        glowColor = { r: 100, g: 200, b: 255 };
      } else {
        // Бирюзовый цвет (30%)
        glowColor = { r: 64, g: 224, b: 208 };
      }

      // Размер свечения - больше маленьких радиусов
      const glowSizeRand = Math.random();
      let glowMultiplier;
      if (glowSizeRand < 0.6) {
        // 60% - маленький радиус
        glowMultiplier = 4 + Math.random() * 3; // 4-7x
      } else if (glowSizeRand < 0.85) {
        // 25% - средний радиус
        glowMultiplier = 7 + Math.random() * 4; // 7-11x
      } else {
        // 15% - большой радиус
        glowMultiplier = 11 + Math.random() * 6; // 11-17x
      }

      // Мерцание только у 20% звёзд
      const shouldTwinkle = Math.random() < 0.2;

      return {
        baseAngle,
        baseRadius,
        r: 0.6 + Math.random() * 1.4,
        baseAlpha: 0.5 + Math.random() * 0.5,
        angVel: (0.005 + Math.random() * 0.02) * (Math.random() < 0.5 ? -1 : 1),
        wobbleAmp: 2 + Math.random() * 6,
        wobbleFreq: 0.2 + Math.random() * 0.7,
        wobblePhase: Math.random() * Math.PI * 2,
        pulseFreq: shouldTwinkle ? (0.5 + Math.random() * 0.8) : 0,
        pulsePhase: Math.random() * Math.PI * 2,
        personalSpin: (Math.random() * 0.015) * (Math.random() < 0.5 ? -1 : 1),
        tint: Math.random(),
        glowColor,
        glowMultiplier,
        shouldTwinkle,
      };
    });
    starsRef.current = arr;
  };

  useEffect(() => {
    resize();
    makeStars();
    const onResize = () => { resize(); makeStars(); };
    window.addEventListener('resize', onResize);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = (now) => {
      const t = (now - startedAt.current) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      const globalAngle = t * 0.003;
      for (const s of starsRef.current) {
        const angle = s.baseAngle + globalAngle + t * s.angVel + t * s.personalSpin;
        const wobble = s.wobbleAmp * Math.sin(t * s.wobbleFreq + s.wobblePhase);
        const r = Math.max(0, s.baseRadius + wobble);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        const pulse = s.shouldTwinkle ? (0.6 + 0.6 * Math.sin(t * s.pulseFreq + s.pulsePhase)) : 1;
        const haloR = (s.r * s.glowMultiplier) * pulse;

        const { r: gR, g: gG, b: gB } = s.glowColor;
        const g = ctx.createRadialGradient(x, y, 0, x, y, haloR);
        g.addColorStop(0, `rgba(${gR}, ${gG}, ${gB}, ${0.6 * s.baseAlpha * pulse})`);
        g.addColorStop(0.3, `rgba(${gR}, ${gG}, ${gB}, ${0.4 * s.baseAlpha * pulse})`);
        g.addColorStop(0.7, `rgba(${gR}, ${gG}, ${gB}, ${0.1 * s.baseAlpha * pulse})`);
        g.addColorStop(1, `rgba(${gR}, ${gG}, ${gB}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, 1.0 * s.baseAlpha * (0.95 + 0.25 * pulse))})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return <canvas className="starry-canvas" ref={canvasRef} />;
});

export default StarsCanvas;

