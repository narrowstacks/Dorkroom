/* ------------------------------------------------------------------ *\
   useDimensionCalculations.ts
   -------------------------------------------------------------
   Hook for paper size, aspect ratio, and orientation calculations
   -------------------------------------------------------------
   Exports:
     - useDimensionCalculations: Dimension and orientation logic
\* ------------------------------------------------------------------ */

import { useMemo } from 'react';
import { PAPER_SIZE_MAP, ASPECT_RATIO_MAP, EASEL_SIZES } from '@/constants/border';
import type {
  BorderCalculatorState,
  PaperEntry,
  RatioEntry,
  OrientedDimensions,
  MinBorderData,
} from './types';

const MAX_EASEL_DIMENSION = EASEL_SIZES.reduce((m, e) => Math.max(m, e.width, e.height), 0);

export const useDimensionCalculations = (state: BorderCalculatorState) => {
  // Paper size calculations
  const paperEntry = useMemo((): PaperEntry => {
    if (state.paperSize === 'custom') {
      return {
        w: state.lastValidCustomPaperWidth,
        h: state.lastValidCustomPaperHeight,
        custom: true,
      };
    }
    
    // Use O(1) lookup instead of linear search
    const p = PAPER_SIZE_MAP[state.paperSize];
    if (!p) {
      console.warn(`Unknown paper size: ${state.paperSize}`);
      return { w: 8, h: 10, custom: false }; // fallback to 8x10
    }
    return { w: p.width, h: p.height, custom: false };
  }, [state.paperSize, state.lastValidCustomPaperWidth, state.lastValidCustomPaperHeight]);

  // Paper size warning
  const paperSizeWarning = useMemo(() => {
    return paperEntry.custom &&
      (paperEntry.w > MAX_EASEL_DIMENSION || paperEntry.h > MAX_EASEL_DIMENSION)
        ? `Custom paper (${paperEntry.w}×${paperEntry.h}) exceeds largest standard easel (20×24").`
        : null;
  }, [paperEntry]);

  // Aspect ratio calculations
  const ratioEntry = useMemo((): RatioEntry => {
    if (state.aspectRatio === 'custom') {
      return {
        w: state.lastValidCustomAspectWidth,
        h: state.lastValidCustomAspectHeight,
      };
    }
    
    // Use O(1) lookup instead of linear search
    const r = ASPECT_RATIO_MAP[state.aspectRatio];
    if (!r) {
      console.warn(`Unknown aspect ratio: ${state.aspectRatio}`);
      return { w: 3, h: 2 }; // fallback to 3:2
    }
    return { w: r.width || 1, h: r.height || 1 };
  }, [state.aspectRatio, state.lastValidCustomAspectWidth, state.lastValidCustomAspectHeight]);

  // Oriented dimensions (apply landscape and ratio flipping)
  const orientedDimensions = useMemo((): OrientedDimensions => {
    const orientedPaper = state.isLandscape
      ? { w: paperEntry.h, h: paperEntry.w }
      : { w: paperEntry.w, h: paperEntry.h };

    const orientedRatio = state.isRatioFlipped
      ? { w: ratioEntry.h, h: ratioEntry.w }
      : { w: ratioEntry.w, h: ratioEntry.h };

    return { orientedPaper, orientedRatio };
  }, [paperEntry, ratioEntry, state.isLandscape, state.isRatioFlipped]);

  // Minimum border validation
  const minBorderData = useMemo((): MinBorderData => {
    const { orientedPaper } = orientedDimensions;
    const maxBorder = Math.min(orientedPaper.w, orientedPaper.h) / 2;
    let minBorder = state.minBorder;
    let minBorderWarning: string | null = null;
    let lastValid = state.lastValidMinBorder;

    if (minBorder >= maxBorder && maxBorder > 0) {
      minBorderWarning = `Minimum border too large; using ${state.lastValidMinBorder}.`;
      minBorder = state.lastValidMinBorder;
    } else if (minBorder < 0) {
      minBorderWarning = `Border cannot be negative; using ${state.lastValidMinBorder}.`;
      minBorder = state.lastValidMinBorder;
    } else {
      lastValid = minBorder;
    }

    return { minBorder, minBorderWarning, lastValid };
  }, [orientedDimensions, state.minBorder, state.lastValidMinBorder]);

  return {
    paperEntry,
    paperSizeWarning,
    ratioEntry,
    orientedDimensions,
    minBorderData,
  };
}; 