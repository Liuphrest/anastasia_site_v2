import React, { useRef, useState, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';

const SCALE = 2;
const PIVOT = { x: 50, y: 50 };
const CANVAS_EXTRA_BOTTOM = 120;

// SVG-дуга для секции #about: накладывается поверх всей секции и отвечает за декоративную линию
// Координаты точек заданы в нормализованной системе 0..100 относительно размеров секции
const BezierArc = ({ className = '' }) => {
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

  const [points, setPoints] = useState(defaultPoints);
  const [dragId, setDragId] = useState(null);
  const [debugEnabled, setDebugEnabled] = useState(false);

  const showDebug = debugEnabled;
  const lastPointerRef = useRef(null);
  const [markerY, setMarkerY] = useState(null);
  const [markerLabel, setMarkerLabel] = useState('marker');

  useEffect(() => {
    const handleKey = (event) => {
      const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';
      if (event.ctrlKey && event.shiftKey && key === 'd') {
        setDebugEnabled((prev) => !prev);
      }
      if (event.ctrlKey && event.shiftKey && key === 'm') {
        if (lastPointerRef.current) {
          setMarkerY(lastPointerRef.current.y);
          setMarkerLabel('pointer');
        }
      }
      if (event.ctrlKey && event.shiftKey && (key === 'k' || key === 'backspace')) {
        setMarkerY(null);
        setMarkerLabel('marker');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__ANASTASIA_ARC_DEBUG__ != null) {
      setDebugEnabled(Boolean(window.__ANASTASIA_ARC_DEBUG__));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const api = (value, label) => {
      if (value == null || value === '') {
        setMarkerY(null);
        setMarkerLabel('marker');
        return;
      }
      let numeric = value;
      let resolvedLabel = label;
      if (typeof value === 'object') {
        numeric = value.y ?? value.value ?? value.pos ?? value;
        resolvedLabel = value.label ?? value.name ?? label;
      }
      if (typeof numeric === 'string') numeric = parseFloat(numeric);
      if (Number.isFinite(numeric)) {
        setMarkerY(numeric);
        setMarkerLabel(resolvedLabel ? String(resolvedLabel) : 'marker');
      }
    };
    window.setBezierArcMarker = api;
    return () => {
      if (window.setBezierArcMarker === api) {
        delete window.setBezierArcMarker;
      }
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && debugEnabled) {
      console.info('[BezierArc] Debug overlay enabled. Toggle with Ctrl+Shift+D or set window.__ANASTASIA_ARC_DEBUG__ = true');
    }
  }, [debugEnabled]);

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

  const clientToViewBox = useCallback(
    (clientX, clientY) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const inv = svg.getScreenCTM().inverse();
      const sp = pt.matrixTransform(inv);
      const preX = (sp.x - PIVOT.x) / SCALE + PIVOT.x;
      const preY = (sp.y - PIVOT.y) / SCALE + PIVOT.y;
      return {
        x: Math.max(0, Math.min(100, preX)),
        y: Math.max(0, Math.min(100, preY)),
      };
    },
    []
  );

  const onPointerDown = useCallback(
    (id) => (event) => {
      event.preventDefault();
      if (showDebug) {
        const mapped = clientToViewBox(event.clientX, event.clientY);
        if (mapped) {
          lastPointerRef.current = mapped;
          if (event.altKey) {
            setMarkerY(mapped.y);
            setMarkerLabel(event.metaKey ? 'marker(meta)' : 'marker');
            return;
          }
        }
      }
      setDragId(id);
    },
    [clientToViewBox, showDebug]
  );

  const onPointerMove = useCallback(
    (event) => {
      if (!showDebug && !dragId) return;
      const mapped = clientToViewBox(event.clientX, event.clientY);
      if (!mapped) return;
      lastPointerRef.current = mapped;
      if (dragId) {
        setPoints((prev) => ({ ...prev, [dragId]: mapped }));
      }
    },
    [clientToViewBox, dragId, showDebug]
  );

  const endDrag = useCallback(() => setDragId(null), []);

  const copyAll = useCallback(async () => {
    const payload = {
      coordSpace: 'normalized-0-100-in-About-section',
      scale: SCALE,
      pivot: PIVOT,
      points,
      pathD,
      segments: {
        seg1: { P0: points.p0, C1: points.c1a, C2: points.c2a, P19: points.p19 },
        seg2: { P19: points.p19, C1: points.c1b, C2: points.c2b, P3: points.p3 },
      },
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    } catch {
      /* ignore clipboard errors */
    }
  }, [pathD, points]);

  const importFromPrompt = useCallback(() => {
    const raw = window.prompt('Вставьте JSON с точками (keys: p0,c1a,c2a,p19,c1b,c2b,p3)');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.points) setPoints((prev) => ({ ...prev, ...parsed.points }));
    } catch {
      /* ignore parse errors */
    }
  }, []);

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

  const debugPanelStyle = useMemo(() => ({
    position: 'absolute',
    top: 12,
    right: 12,
    width: 220,
    maxHeight: 200,
    overflowY: 'auto',
    background: 'rgba(15, 23, 42, 0.92)',
    color: '#e5e7eb',
    borderRadius: 10,
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.35)',
    padding: '8px 10px',
    fontSize: 11,
    lineHeight: 1.4,
    pointerEvents: 'auto',
    zIndex: 2147483647,
  }), []);

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
    pointerEvents: showDebug ? 'auto' : 'none',
    zIndex: showDebug ? 2147483647 : 0,
  };

  const svgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: layoutWidth,
    height: layoutHeight,
    overflow: 'visible',
    pointerEvents: showDebug ? 'auto' : 'none',
  };

  const containerClassName = ['absolute', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={containerStyle}
      onMouseMove={showDebug ? onPointerMove : undefined}
      onMouseUp={showDebug ? endDrag : undefined}
      onMouseLeave={showDebug ? endDrag : undefined}
      onDoubleClick={(event) => {
        if (!showDebug) return;
        const mapped = clientToViewBox(event.clientX, event.clientY);
        if (!mapped) return;
        const label = event.shiftKey ? prompt('marker label', markerLabel) : markerLabel;
        setMarkerY(mapped.y);
        setMarkerLabel(label || 'marker');
      }}
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
          <mask id="startFadeMask">
            <rect x="-50" y="-50" width="200" height="200" fill="url(#startMaskLG)" />
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

          {showDebug && (
            <g style={{ pointerEvents: 'all', cursor: dragId ? 'grabbing' : 'default' }}>
              <rect x={0} y={0} width={100} height={100} fill="none" stroke="#34d399" strokeWidth="0.28" strokeDasharray="3 2" opacity="0.85" />
              <line x1={0} y1={startFadeAnchor.y} x2={100} y2={startFadeAnchor.y} stroke="#60a5fa" strokeWidth="0.3" strokeDasharray="4 2" opacity="0.8" />
              <line x1={0} y1={endFadeAnchor.y} x2={100} y2={endFadeAnchor.y} stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="4 2" opacity="0.8" />
              <line x1={0} y1={points.p19.y} x2={100} y2={points.p19.y} stroke="#f97316" strokeWidth="0.35" strokeDasharray="2 2" opacity="0.9" />
              <line x1={0} y1={points.p3.y} x2={100} y2={points.p3.y} stroke="#ef4444" strokeWidth="0.35" strokeDasharray="2 2" opacity="0.9" />
              <text x={2} y={startFadeAnchor.y - 1.5} fontSize="2.6" fill="#60a5fa">startFade</text>
              <text x={2} y={endFadeAnchor.y - 1.5} fontSize="2.6" fill="#f59e0b">endFade</text>
              <text x={2} y={points.p19.y + 2.5} fontSize="2.6" fill="#f97316">p19</text>
              <text x={2} y={points.p3.y + 2.5} fontSize="2.6" fill="#ef4444">p3</text>
              {markerY !== null && (
                <>
                  <line x1={0} y1={markerY} x2={100} y2={markerY} stroke="#a855f7" strokeWidth="0.35" strokeDasharray="1.5 1.5" opacity="0.95" />
                  <text x={52} y={markerY - 1.5} fontSize="2.6" fill="#a855f7">{`${markerLabel} ${markerY.toFixed(2)}`}</text>
                </>
              )}
              <g opacity="0.2">
                {Array.from({ length: 11 }).map((_, i) => (
                  <g key={`grid-${i}`}>
                    <line x1={i * 10} y1={0} x2={i * 10} y2={100} stroke="#fff" strokeWidth="0.1" />
                    <line x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="#fff" strokeWidth="0.1" />
                    <text x={i * 10 + 0.5} y={2} fontSize="2" fill="#fff">{i * 10}</text>
                    <text x={0.5} y={i * 10 + 2} fontSize="2" fill="#fff">{i * 10}</text>
                  </g>
                ))}
              </g>

              <g stroke="#40a9ff" strokeWidth="0.3" opacity="0.7">
                <line x1={points.p0.x} y1={points.p0.y} x2={points.c1a.x} y2={points.c1a.y} />
                <line x1={points.p19.x} y1={points.p19.y} x2={points.c2a.x} y2={points.c2a.y} />
                <line x1={points.p19.x} y1={points.p19.y} x2={points.c1b.x} y2={points.c1b.y} />
                <line x1={points.p3.x} y1={points.p3.y} x2={points.c2b.x} y2={points.c2b.y} />
              </g>

              {[
                ['p0', '#ff4d4f'],
                ['c1a', '#40a9ff'],
                ['c2a', '#40a9ff'],
                ['p19', '#ff4d4f'],
                ['c1b', '#40a9ff'],
                ['c2b', '#40a9ff'],
                ['p3', '#ff4d4f'],
              ].map(([id, color]) => (
                <g key={id} onMouseDown={onPointerDown(id)} style={{ cursor: 'grab' }}>
                  <circle cx={points[id].x} cy={points[id].y} r="1.8" fill={color} stroke="#000" strokeWidth="0.2" />
                  <text
                    x={points[id].x + 2.2}
                    y={points[id].y - 1.2}
                    fontSize="2.2"
                    fill="#fff"
                    stroke="#000"
                    strokeWidth="0.05"
                  >
                    {`${id}(${points[id].x.toFixed(2)},${points[id].y.toFixed(2)})`}
                  </text>
                </g>
              ))}

            </g>
          )}
        </g>
      </svg>
      {showDebug && (
        <>
          <div
            style={{
              position: 'absolute',
              top: layoutHeight,
              left: 0,
              width: layoutWidth,
              height: 1,
              background: 'rgba(96, 165, 250, 0.7)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: layoutHeight + CANVAS_EXTRA_BOTTOM,
              left: 0,
              width: layoutWidth,
              height: 1,
              background: 'rgba(248, 113, 113, 0.7)',
              pointerEvents: 'none',
            }}
          />
          <div style={debugPanelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ fontSize: 12 }}>BezierArc debug</strong>
              <span style={{ fontSize: 10, opacity: 0.7 }}>Ctrl+Shift+D</span>
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
              <span>layout: {Math.round(layoutWidth)} x {Math.round(layoutHeight)}</span>
              <span>extraBottom: {CANVAS_EXTRA_BOTTOM}px</span>
              <span>p19.y -> c1b.y: {points.p19.y.toFixed(2)} → {points.c1b.y.toFixed(2)} ({(points.c1b.y - points.p19.y).toFixed(2)})</span>
              <span>p3.y: {points.p3.y.toFixed(2)}</span>
              <span>startFade: {startFadeOffset}</span>
              <span>endFade: {endFadeOffset}</span>
              <span>control Y extents: {controlExtents.minY} ... {controlExtents.maxY}</span>
              <span>marker: {markerY !== null ? `${markerLabel} (${markerY.toFixed(2)})` : 'none'}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.25)', margin: '6px 0 4px' }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={copyAll} style={{ flex: '1 1 70px', padding: '4px 6px' }}>Copy</button>
              <button onClick={() => setPoints(defaultPoints)} style={{ flex: '1 1 70px', padding: '4px 6px' }}>Reset</button>
              <button onClick={importFromPrompt} style={{ flex: '1 1 100%', padding: '4px 6px' }}>Import</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BezierArc;
