import { useEffect, useRef, useState } from 'react';

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
  const [progressMap, setProgressMap] = useState(() => {
    const init = {};
    Object.keys(config || {}).forEach((k) => (init[k] = 0));
    return init;
  });

  const rafRef = useRef(null);

  useEffect(() => {
    const ids = Object.keys(config || {});
    if (ids.length === 0) return;

    const compute = () => {
      const vh = window.innerHeight || 1;
      const viewportCenter = vh / 2 + centerOffsetPx;
      const thresholdPx = Math.max(1, vh * thresholdVh);
      const next = {};

      for (const id of ids) {
        const conf = config[id] || {};
        let p = 0;

        const pick = (sel) => (sel ? document.querySelector(sel) : null);

        // 1) Range by container (top/bottom)
        const container = pick(conf.rangeContainer);
        const startEl = pick(conf.start);
        const endEl = pick(conf.end);

        if (container || (startEl && endEl)) {
          let startY, endY;
          if (container) {
            const r = container.getBoundingClientRect();
            startY = r.top; // start at container top edge
            endY = r.bottom; // end at container bottom edge
          } else {
            const rs = startEl.getBoundingClientRect();
            const re = endEl.getBoundingClientRect();
            startY = rs.top + rs.height / 2; // centers of explicit markers
            endY = re.top + re.height / 2;
          }
          // Ensure correct ordering
          if (endY < startY) [startY, endY] = [endY, startY];

          // Inflate visual window by a fraction of viewport height
          const inflatePx = Math.max(0, vh * inflateVh);
          startY -= inflatePx;
          endY += inflatePx;

          const span = Math.max(1, endY - startY);
          // Phase within range [0..1]
          const s = Math.min(1, Math.max(0, (viewportCenter - startY) / span));
          // Triangular progress around center with soft edges
          const half = span / 2 + rangePaddingPx; // soften edges a bit
          const center = (startY + endY) / 2;
          const d = Math.abs(viewportCenter - center);
          p = Math.min(1, Math.max(0, 1 - d / half));
          next[id] = { progress: p, phase: s };
          continue;
        } else {
          // 2) Fallback to single anchor + viewport threshold
          const anchorSel = conf.selector || `#${id}`;
          const el = pick(anchorSel) || document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const anchorCenter = rect.top + rect.height / 2;
            const d = anchorCenter - viewportCenter;
            p = Math.min(1, Math.max(0, 1 - Math.abs(d) / thresholdPx));
            // Map to synthetic phase around anchor: [-threshold..+threshold] -> [0..1]
            const s = Math.min(1, Math.max(0, (viewportCenter - (anchorCenter - thresholdPx)) / (2 * thresholdPx)));
            next[id] = { progress: p, phase: s };
            continue;
          }
        }
        next[id] = { progress: 0, phase: 0 };
      }

      setProgressMap((prev) => {
        let changed = false;
        for (const k of ids) {
          const a = prev[k] || { progress: 0, phase: 0 };
          const b = next[k];
          if (!a || a.progress !== b.progress || a.phase !== b.phase) { changed = true; break; }
        }
        return changed ? next : prev;
      });
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(compute);
    };
    const onResize = () => compute();

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [config, thresholdVh, rangePaddingPx]);

  return progressMap;
};

export default useSectionProgress;
