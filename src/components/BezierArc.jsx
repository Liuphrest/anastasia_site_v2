import React, { useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';

const SCALE = 2;
const PIVOT = { x: 50, y: 50 };
const CANVAS_EXTRA_BOTTOM = 120;

const BezierArc = React.memo(({ className = '' }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [layout, setLayout] = useState(null);

  useLayoutEffect(() => {
    const computeLayout = () => {
      const containerEl = containerRef.current;
      const sectionEl = document.getElementById('about');
      const offsetParent = containerEl?.offsetParent;
      if (!containerEl || !sectionEl || !offsetParent) return;

      const parentRect = offsetParent.getBoundingClientRect();
      const sectionRect = sectionEl.getBoundingClientRect();

      setLayout({
        width: sectionRect.width,
        height: sectionRect.height,
        top: sectionRect.top - parentRect.top,
        left: sectionRect.left - parentRect.left,
      });
    };

    computeLayout();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => computeLayout())
      : null;

    const sectionEl = document.getElementById('about');
    if (resizeObserver && sectionEl) resizeObserver.observe(sectionEl);
    if (resizeObserver && containerRef.current?.offsetParent) {
      resizeObserver.observe(containerRef.current.offsetParent);
    }

    window.addEventListener('resize', computeLayout);
    return () => {
      window.removeEventListener('resize', computeLayout);
      resizeObserver?.disconnect();
    };
  }, []);

  const defaultPoints = useMemo(() => ({
    p0:   { x: 79.03604888916016,  y: 46.82574653625488 },
    c1a:  { x: 72.06112670898438,  y: 51.096208572387695 },
    c2a:  { x: 80.72100067138672,  y: 61.16230010986328 },
    p19:  { x: 70.53291320800781,  y: 63.6788215637207 },
    c1b:  { x: 50.94043731689453,  y: 67.41547775268555 },
    c2b:  { x: 23.1974915266037,  y: 40.089599609375 },
    p3:   { x: 24.686519652605057, y: 62.43326950073242 },
  }), []);

  const [points] = useState(defaultPoints);

  const startFadeAnchor = useMemo(
    () => ({
      x: points.p0.x + (points.p19.x - points.p0.x) * 0.4,
      y: points.p0.y + (points.p19.y - points.p0.y) * 0.4,
    }),
    [points.p0.x, points.p0.y, points.p19.x, points.p19.y]
  );

  const endFadeAnchor = useMemo(
    () => ({
      x: (points.p19.x + points.p3.x) / 2,
      y: (points.p19.y + points.p3.y) / 2,
    }),
    [points.p19.x, points.p19.y, points.p3.x, points.p3.y]
  );

  const { startFadeOffset, endFadeOffset } = useMemo(() => {
    const total = Math.hypot(points.p3.x - points.p0.x, points.p3.y - points.p0.y) || 1;
    const clamp = (value) => Math.min(0.99, Math.max(0.01, value));
    const startRatio = clamp(Math.hypot(startFadeAnchor.x - points.p0.x, startFadeAnchor.y - points.p0.y) / total);
    const endRatio = clamp(Math.hypot(endFadeAnchor.x - points.p0.x, endFadeAnchor.y - points.p0.y) / total);

    return {
      startFadeOffset: `${(startRatio * 100).toFixed(2)}%`,
      endFadeOffset: `${(endRatio * 100).toFixed(2)}%`,
    };
  }, [points, startFadeAnchor, endFadeAnchor]);

  const createPathFromPoints = useCallback(
    (pp) =>
      `M ${pp.p0.x},${pp.p0.y} C ${pp.c1a.x},${pp.c1a.y} ${pp.c2a.x},${pp.c2a.y} ${pp.p19.x},${pp.p19.y} ` +
      `C ${pp.c1b.x},${pp.c1b.y} ${pp.c2b.x},${pp.c2b.y} ${pp.p3.x},${pp.p3.y}`,
    []
  );

  const pathD = useMemo(() => createPathFromPoints(points), [createPathFromPoints, points]);

  const controlExtents = useMemo(() => {
    const ys = [points.p0.y, points.c1a.y, points.c2a.y, points.p19.y, points.c1b.y, points.c2b.y, points.p3.y];
    return {
      minY: Math.min(...ys).toFixed(2),
      maxY: Math.max(...ys).toFixed(2),
    };
  }, [points]);

  const seamY = parseFloat(controlExtents.maxY);
  const glowPadding = 12;
  const floorGlowEnd = Math.min(120, seamY + glowPadding);
  const floorGlowHeight = Math.max(0, floorGlowEnd - seamY);

  const hasLayout = Boolean(layout);
  const layoutWidth = hasLayout ? layout.width : 0;
  const layoutHeight = hasLayout ? layout.height : 0;
  const layoutTop = hasLayout ? layout.top : 0;
  const layoutLeft = hasLayout ? layout.left : 0;

  const containerStyle = {
    position: 'absolute',
    top: layoutTop,
    left: layoutLeft,
    width: layoutWidth,
    height: layoutHeight + CANVAS_EXTRA_BOTTOM,
    overflow: 'visible',
    pointerEvents: 'none',
    zIndex: 0,
  };

  const svgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: layoutWidth,
    height: layoutHeight,
    overflow: 'visible',
    pointerEvents: 'none',
  };

  const containerClassName = ['absolute', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={containerStyle}
    >
      <svg
        ref={svgRef}
        viewBox="-50 -50 200 200"
        preserveAspectRatio="none"
        className="absolute inset-0"
        style={svgStyle}
      >
                <defs>
          <filter id="softGlow" filterUnits="userSpaceOnUse" x="-80" y="-80" width="280" height="280">
            <feGaussianBlur stdDeviation="2.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softEdgeBlur" filterUnits="userSpaceOnUse" x="-80" y="-80" width="280" height="280">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="blurEdge" />
            <feMerge>
              <feMergeNode in="blurEdge" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="arcGlowGradient" gradientUnits="userSpaceOnUse"
            x1={points.p0.x}
            y1={points.p0.y}
            x2={points.p3.x}
            y2={points.p3.y}>
            <stop offset="0%" stopColor="#FFD977" stopOpacity="0" />
            <stop offset={startFadeOffset} stopColor="#FFD977" stopOpacity="0.42" />
            <stop offset={endFadeOffset} stopColor="#FFD977" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#FFD977" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="arcStrokeGradient" gradientUnits="userSpaceOnUse"
            x1={points.p0.x}
            y1={points.p0.y}
            x2={points.p3.x}
            y2={points.p3.y}>
            <stop offset="0%" stopColor="#FFB871" stopOpacity="0" />
            <stop offset={startFadeOffset} stopColor="#FFB871" stopOpacity="1" />
            <stop offset={endFadeOffset} stopColor="#FFB871" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFB871" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="startMaskLG" gradientUnits="userSpaceOnUse"
            x1={points.p0.x}
            y1={points.p0.y}
            x2={startFadeAnchor.x}
            y2={startFadeAnchor.y}>
            <stop offset="0%" stopColor="#000" stopOpacity="1" />
            <stop offset="35%" stopColor="#444" stopOpacity="1" />
            <stop offset="70%" stopColor="#bbb" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="startFadeMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            <rect x="-200" y="-200" width="400" height="400" fill="url(#startMaskLG)" />
          </mask>
          <linearGradient id="endGradient" gradientUnits="userSpaceOnUse"
            x1={endFadeAnchor.x}
            y1={endFadeAnchor.y}
            x2={points.p3.x}
            y2={points.p3.y}>
            <stop offset="0%" stopColor="#FFEFD9" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FFF5E8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFF5E8" stopOpacity="0" />
          </linearGradient>
          {floorGlowHeight > 0 && (
            <linearGradient
              id="arcFloorGradient"
              gradientUnits="userSpaceOnUse"
              x1={50}
              y1={seamY}
              x2={50}
              y2={floorGlowEnd}
            >
              <stop offset="0%" stopColor="#FFD977" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#FFD977" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFD977" stopOpacity="0" />
            </linearGradient>
          )}
        </defs>
        <g transform={`translate(${PIVOT.x} ${PIVOT.y}) scale(${SCALE}) translate(${-PIVOT.x} ${-PIVOT.y})`}>
          <path
            d={pathD}
            stroke="url(#arcGlowGradient)"
            strokeWidth="7.2"
            fill="none"
            filter="url(#softGlow)"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            mask="url(#startFadeMask)"
          />
          <path
            d={pathD}
            stroke="url(#arcStrokeGradient)"
            strokeWidth="4.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            mask="url(#startFadeMask)"
            filter="url(#softEdgeBlur)"
          />
          <path
            d={pathD}
            stroke="url(#endGradient)"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            mask="url(#startFadeMask)"
            filter="url(#softEdgeBlur)"
          />
        </g>
      </svg>
    </div>
  );
});

export default BezierArc;








