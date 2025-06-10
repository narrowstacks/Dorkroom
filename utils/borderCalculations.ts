/* ------------------------------------------------------------------ *\
   Pure geometry helpers
\* ------------------------------------------------------------------ */

import { EASEL_SIZES, BLADE_THICKNESS } from '@/constants/border';

export type Size = { width: number; height: number };

/* ---------- constants ------------------------------------------- */

const BASE_PAPER_AREA = 20 * 24;
const STEP            = 0.01;
const SEARCH_SPAN     = 0.5;
const SNAP            = 0.25;
const EPS             = 1e-9;

/* ---------- helpers --------------------------------------------- */

export const orient = (w: number, h: number, landscape: boolean): Size =>
  landscape ? { width: h, height: w } : { width: w, height: h };

const isExactMatch = (paper: Size) =>
  EASEL_SIZES.some(
    e =>
      (e.width === paper.width && e.height === paper.height) ||
      (e.width === paper.height && e.height === paper.width),
  );

/* ---------- memoised centring ----------------------------------- */

// Pre-sort EASEL_SIZES by area for optimal performance
const SORTED_EASEL_SIZES = [...EASEL_SIZES]
  .sort((a, b) => a.width * a.height - b.width * b.height);

// Memoization with size limit for better memory management
const MAX_MEMO_SIZE = 100;
const fitMemo = new Map<string, ReturnType<typeof computeFit>>();

function computeFit(paperW: number, paperH: number, landscape: boolean) {
  const paper = orient(paperW, paperH, landscape);

  const best = SORTED_EASEL_SIZES.find(
    e =>
      (e.width >= paper.width && e.height >= paper.height) ||
      (e.height >= paper.width && e.width >= paper.height),
  );

  if (!best) {
    return {
      easelSize: paper,
      effectiveSlot: paper,
      isNonStandardPaperSize: !isExactMatch({ width: paperW, height: paperH }),
    };
  }

  const slot =
    best.width >= paper.width && best.height >= paper.height
      ? { width: best.width, height: best.height }
      : { width: best.height, height: best.width };

  return {
    easelSize: { width: best.width, height: best.height },
    effectiveSlot: slot,
    isNonStandardPaperSize: !isExactMatch({ width: paperW, height: paperH }),
  };
}

export const findCenteringOffsets = (
  paperW: number,
  paperH: number,
  landscape: boolean,
) => {
  const key = `${paperW}×${paperH}:${landscape}`;
  let v = fitMemo.get(key);
  if (!v) {
    v = computeFit(paperW, paperH, landscape);
    
    // Clear oldest entries if memo gets too large
    if (fitMemo.size >= MAX_MEMO_SIZE) {
      const firstKey = fitMemo.keys().next().value;
      if (firstKey) {
        fitMemo.delete(firstKey);
      }
    }
    
    fitMemo.set(key, v);
  }
  return v;
};

/* ---------- blade thickness ------------------------------------- */

export const calculateBladeThickness = (paperW: number, paperH: number) => {
  if (paperW <= 0 || paperH <= 0) return BLADE_THICKNESS;

  const area  = paperW * paperH;
  const scale = Math.min(BASE_PAPER_AREA / Math.max(area, EPS), 2);
  return Math.round(BLADE_THICKNESS * scale);
};

/* ---------- internal snap‑score helper -------------------------- */

const snapScore = (b: number) => {
  const r = b % SNAP;
  return Math.min(r, SNAP - r);
};

/* ---------- minimum‑border optimiser ---------------------------- */

const computeBorders = (
  paperW: number,
  paperH: number,
  ratio: number,
  mb: number,
) => {
  const availW = paperW - 2 * mb;
  const availH = paperH - 2 * mb;
  if (availW <= 0 || availH <= 0) return null;

  const [printW, printH] =
    availW / availH > ratio
      ? [availH * ratio, availH]
      : [availW, availW / ratio];

  const bW = (paperW - printW) / 2;
  const bH = (paperH - printH) / 2;

  return [bW, bW, bH, bH] as const;
};

export const calculateOptimalMinBorder = (
  paperW: number,
  paperH: number,
  ratioW: number,
  ratioH: number,
  start: number,
) => {
  if (ratioH === 0) return start;
  const ratio = ratioW / ratioH;

  const lo = Math.max(0.01, start - SEARCH_SPAN);
  const hi = start + SEARCH_SPAN;

  let best = start;
  let bestScore = Infinity;

  for (let mb = lo; mb <= hi; mb += STEP) {
    const b = computeBorders(paperW, paperH, ratio, mb);
    if (!b) continue;
    const score = b.reduce((s, v) => s + snapScore(v), 0);
    if (score < bestScore - EPS) {
      bestScore = score;
      best = mb;
      if (bestScore === 0) break; // perfect snap
    }
  }

  return +best.toFixed(2);
};

/* ---------- other helpers (unchanged) --------------------------- */

export const computePrintSize = (
  w: number,
  h: number,
  rw: number,
  rh: number,
  mb: number,
) => {
  const availW = w - 2 * mb;
  const availH = h - 2 * mb;
  if (availW <= 0 || availH <= 0 || rh === 0) return { printW: 0, printH: 0 };

  const ratio = rw / rh;
  return availW / availH > ratio
    ? { printW: availH * ratio, printH: availH }
    : { printW: availW, printH: availW / ratio };
};

export const clampOffsets = (
  paperW: number,
  paperH: number,
  printW: number,
  printH: number,
  mb: number,
  offH: number,
  offV: number,
  ignoreMB: boolean,
) => {
  const halfW = (paperW - printW) / 2;
  const halfH = (paperH - printH) / 2;
  const maxH = ignoreMB ? halfW : Math.min(halfW - mb, halfW);
  const maxV = ignoreMB ? halfH : Math.min(halfH - mb, halfH);

  const h = Math.max(-maxH, Math.min(maxH, offH));
  const v = Math.max(-maxV, Math.min(maxV, offV));

  let warning: string | null = null;
  if (h !== offH || v !== offV)
    warning = ignoreMB
      ? 'Offset adjusted to keep print on paper.'
      : 'Offset adjusted to honour min‑border.';

  return { h, v, halfW, halfH, warning };
};

export const bordersFromGaps = (
  halfW: number,
  halfH: number,
  h: number,
  v: number,
) => ({
  left: halfW - h,
  right: halfW + h,
  bottom: halfH - v,
  top: halfH + v,
});

export const bladeReadings = (
  printW: number,
  printH: number,
  sX: number,
  sY: number,
) => ({
  left: printW - 2 * sX,
  right: printW + 2 * sX,
  top: printH - 2 * sY,
  bottom: printH + 2 * sY,
});