import { useEffect, useMemo, useRef, useState } from 'react';

// Scroll proximity progress per section:
// - If a range is provided (container or start+end), compute triangular progress across that range:
//   starts filling at range start, peaks (1.0) at range center, empties towards range end.
// - If only an anchor is provided, fall back to viewport-based threshold around the anchor.
// Config per id can contain:
//   { rangeContainer?: string, start?: string, end?: string, selector?: string }
// Options: { thresholdVh?: number, rangePaddingPx?: number }
export const useSectionProgress = (
  config,
  { thresholdVh = 0.5, rangePaddingPx = 48, centerOffsetPx = 20, inflateVh = 0 } = {}
) => {
  const ids = useMemo(() => Object.keys(config || {}), [config]);

  const [progressMap, setProgressMap] = useState(() => {
    const init = {};
    ids.forEach((k) => {
      init[k] = { progress: 0, phase: 0 };
    });
    return init;
  });

  useEffect(() => {
    setProgressMap((prev) => {
      const next = { ...prev };
      let changed = false;
      ids.forEach((id) => {
        if (!next[id]) {
          next[id] = { progress: 0, phase: 0 };
          changed = true;
        }
      });
      Object.keys(next).forEach((key) => {
        if (!ids.includes(key)) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [ids]);

  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || ids.length === 0) {
      return undefined;
    }

    const compute = () => {
      const vh = window.innerHeight || 1;
      const viewportCenter = vh / 2 + centerOffsetPx;
      const thresholdPx = Math.max(1, vh * thresholdVh);
      const next = {};

      for (const id of ids) {
        const conf = (config && config[id]) || {};
        let p = 0;

        const pick = (sel) => (sel ? document.querySelector(sel) : null);

        const container = pick(conf.rangeContainer);
        const startEl = pick(conf.start);
        const endEl = pick(conf.end);

        if (container || (startEl && endEl)) {
          let startY;
          let endY;
          if (container) {
            const r = container.getBoundingClientRect();
            startY = r.top;
            endY = r.bottom;
          } else {
            const rs = startEl.getBoundingClientRect();
            const re = endEl.getBoundingClientRect();
            startY = rs.top + rs.height / 2;
            endY = re.top + re.height / 2;
          }
          if (endY < startY) [startY, endY] = [endY, startY];

          const inflatePx = Math.max(0, vh * inflateVh);
          startY -= inflatePx;
          endY += inflatePx;

          const span = Math.max(1, endY - startY);
          const s = Math.min(1, Math.max(0, (viewportCenter - startY) / span));
          const half = span / 2 + rangePaddingPx;
          const center = (startY + endY) / 2;
          const d = Math.abs(viewportCenter - center);
          p = Math.min(1, Math.max(0, 1 - d / half));
          next[id] = { progress: p, phase: s };
          continue;
        }

        const anchorSel = conf.selector || `#${id}`;
        const el = pick(anchorSel) || document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const anchorCenter = rect.top + rect.height / 2;
          const d = anchorCenter - viewportCenter;
          p = Math.min(1, Math.max(0, 1 - Math.abs(d) / thresholdPx));
          const s = Math.min(
            1,
            Math.max(0, (viewportCenter - (anchorCenter - thresholdPx)) / (2 * thresholdPx))
          );
          next[id] = { progress: p, phase: s };
          continue;
        }

        next[id] = { progress: 0, phase: 0 };
      }

      setProgressMap((prev) => {
        let changed = false;
        for (const id of ids) {
          const a = prev[id] || { progress: 0, phase: 0 };
          const b = next[id];
          if (!a || a.progress !== b.progress || a.phase !== b.phase) {
            changed = true;
            break;
          }
        }
        return changed ? next : prev;
      });
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(compute);
      }
    };
    const onResize = () => compute();

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [config, ids, thresholdVh, rangePaddingPx, centerOffsetPx, inflateVh]);

  return progressMap;
};

export default useSectionProgress;
