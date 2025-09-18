import React from 'react';

// Background 2D vortex canvas (particles)
const VortexBackgroundCanvas = ({ count = 300 }) => {
  const canvasRef = React.useRef(null);
  const starsRef = React.useRef([]);
  const startedAt = React.useRef(performance.now());

  const resize = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect?.width || 280));
    const h = Math.max(1, Math.floor(rect?.height || 280));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const makeStars = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const amount = Math.round(count);
    const arr = new Array(amount).fill(0).map(() => {
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      const vx = x0 - cx;
      const vy = y0 - cy;
      const baseAngle = Math.atan2(vy, vx);
      const baseRadius = Math.hypot(vx, vy);
      return {
        baseAngle,
        baseRadius,
        r: 0.9 + Math.random() * 1.6,
        baseAlpha: 0.65 + Math.random() * 0.35,
        angVel: (0.003 + Math.random() * 0.012) * (Math.random() < 0.5 ? -1 : 1),
        wobbleAmp: 1.6 + Math.random() * 3.5,
        wobbleFreq: 0.18 + Math.random() * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        pulseFreq: 0.35 + Math.random() * 0.6,
        pulsePhase: Math.random() * Math.PI * 2,
        personalSpin: (Math.random() * 0.01) * (Math.random() < 0.5 ? -1 : 1),
        tint: Math.random(),
      };
    });
    starsRef.current = arr;
  }, [count]);

  React.useEffect(() => {
    resize();
    makeStars();
    const onResize = () => { resize(); makeStars(); };
    window.addEventListener('resize', onResize);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let ro;
    if (canvas && canvas.parentElement && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => {
        resize();
        makeStars();
      });
      ro.observe(canvas.parentElement);
    }
    let rafId;
    const render = (now) => {
      const t = (now - startedAt.current) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      const globalAngle = t * 0.0015;
      for (const s of starsRef.current) {
        const angle = s.baseAngle + globalAngle + t * s.angVel + t * s.personalSpin;
        const wobble = s.wobbleAmp * Math.sin(t * s.wobbleFreq + s.wobblePhase);
        const r = Math.max(0, s.baseRadius + wobble);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const pulse = 0.6 + 0.4 * Math.sin(t * s.pulseFreq + s.pulsePhase);
        const c1 = `rgba(76,29,149,${0.18 * s.baseAlpha * pulse})`;
        const c2 = `rgba(124,58,237,${0.28 * s.baseAlpha * pulse})`;
        ctx.fillStyle = Math.random() < s.tint ? c2 : c1;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) try { ro.disconnect(); } catch {}
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [resize, makeStars]);

  return <canvas ref={canvasRef} className="w-full h-full block" style={{ background: 'transparent' }} />;
};

export default VortexBackgroundCanvas;

