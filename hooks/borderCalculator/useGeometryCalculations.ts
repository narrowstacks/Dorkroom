/* ------------------------------------------------------------------ *\
   useGeometryCalculations.ts
   -------------------------------------------------------------
   Hook for geometry calculations: print size, borders, blade readings
   -------------------------------------------------------------
   Exports:
     - useGeometryCalculations: All geometry-related calculations
\* ------------------------------------------------------------------ */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { EASEL_SIZE_MAP } from '@/constants/border';
import {
  calculateBladeThickness,
  findCenteringOffsets,
  computePrintSize,
  clampOffsets,
  bordersFromGaps,
  bladeReadings,
} from '@/utils/borderCalculations';
import type {
  BorderCalculatorState,
  OrientedDimensions,
  MinBorderData,
  PaperEntry,
  PrintSize,
  OffsetData,
  Borders,
  EaselData,
  PaperShift,
  BladeData,
} from './types';

export const useGeometryCalculations = (
  state: BorderCalculatorState,
  orientedDimensions: OrientedDimensions,
  minBorderData: MinBorderData,
  paperEntry: PaperEntry,
  paperSizeWarning: string | null
) => {
  const { width: winW, height: winH } = useWindowDimensions();

  // Preview scale calculation
  const previewScale = useMemo(() => {
    const { w, h } = orientedDimensions.orientedPaper;
    if (!w || !h) return 1;
    const maxW = Math.min(winW * 0.9, 400);
    const maxH = Math.min(winH * 0.5, 400);
    return Math.min(maxW / w, maxH / h);
  }, [orientedDimensions.orientedPaper, winW, winH]);

  // Print size calculation
  const printSize = useMemo((): PrintSize => {
    const { orientedPaper, orientedRatio } = orientedDimensions;
    const { minBorder } = minBorderData;

    return computePrintSize(
      orientedPaper.w,
      orientedPaper.h,
      orientedRatio.w,
      orientedRatio.h,
      minBorder,
    );
  }, [orientedDimensions, minBorderData]);

  // Offset calculations
  const offsetData = useMemo((): OffsetData => {
    const { orientedPaper } = orientedDimensions;
    const { minBorder } = minBorderData;
    const { printW, printH } = printSize;

    return clampOffsets(
      orientedPaper.w,
      orientedPaper.h,
      printW,
      printH,
      minBorder,
      state.enableOffset ? state.horizontalOffset : 0,
      state.enableOffset ? state.verticalOffset : 0,
      state.ignoreMinBorder,
    );
  }, [orientedDimensions, minBorderData, printSize, state.enableOffset, state.horizontalOffset, state.verticalOffset, state.ignoreMinBorder]);

  // Border calculations
  const borders = useMemo((): Borders => {
    const { halfW, halfH, h: offH, v: offV } = offsetData;
    return bordersFromGaps(halfW, halfH, offH, offV);
  }, [offsetData]);

  // Easel fitting calculations
  const easelData = useMemo((): EaselData => {
    return findCenteringOffsets(
      paperEntry.w,
      paperEntry.h,
      state.isLandscape,
    );
  }, [paperEntry, state.isLandscape]);

  // Paper shift calculations
  const paperShift = useMemo((): PaperShift => {
    const { orientedPaper } = orientedDimensions;
    const { effectiveSlot, isNonStandardPaperSize } = easelData;

    const spX = isNonStandardPaperSize
      ? (orientedPaper.w - effectiveSlot.width) / 2
      : 0;
    const spY = isNonStandardPaperSize
      ? (orientedPaper.h - effectiveSlot.height) / 2
      : 0;

    return { spX, spY };
  }, [orientedDimensions, easelData]);

  // Blade readings and warnings
  const bladeData = useMemo((): BladeData => {
    const { printW, printH } = printSize;
    const { h: offH, v: offV } = offsetData;
    const { spX, spY } = paperShift;

    const blades = bladeReadings(
      printW,
      printH,
      spX + offH,
      spY + offV,
    );

    let bladeWarning: string | null = null;
    const values = Object.values(blades);
    if (values.some(v => v < 0))
      bladeWarning = 'Negative blade reading – use opposite side of scale.';
    if (values.some(v => Math.abs(v) < 3 && v !== 0))
      bladeWarning = (bladeWarning ? bladeWarning + '\n' : '') +
        'Many easels have no markings below about 3 in.';

    return { blades, bladeWarning };
  }, [printSize, offsetData, paperShift]);

  // Final calculation assembly
  const calculation = useMemo(() => {
    const { orientedPaper } = orientedDimensions;
    const { printW, printH } = printSize;
    const { h: offH, v: offV, warning: offsetWarning } = offsetData;
    const { easelSize, isNonStandardPaperSize } = easelData;
    const { blades, bladeWarning } = bladeData;

    return {
      leftBorder: borders.left,
      rightBorder: borders.right,
      topBorder: borders.top,
      bottomBorder: borders.bottom,

      printWidth: printW,
      printHeight: printH,
      paperWidth: orientedPaper.w,
      paperHeight: orientedPaper.h,

      printWidthPercent: orientedPaper.w ? (printW / orientedPaper.w) * 100 : 0,
      printHeightPercent: orientedPaper.h ? (printH / orientedPaper.h) * 100 : 0,
      leftBorderPercent: orientedPaper.w ? (borders.left / orientedPaper.w) * 100 : 0,
      rightBorderPercent: orientedPaper.w ? (borders.right / orientedPaper.w) * 100 : 0,
      topBorderPercent: orientedPaper.h ? (borders.top / orientedPaper.h) * 100 : 0,
      bottomBorderPercent: orientedPaper.h ? (borders.bottom / orientedPaper.h) * 100 : 0,

      leftBladeReading: blades.left,
      rightBladeReading: blades.right,
      topBladeReading: blades.top,
      bottomBladeReading: blades.bottom,
      bladeThickness: calculateBladeThickness(orientedPaper.w, orientedPaper.h),

      isNonStandardPaperSize: isNonStandardPaperSize && !paperSizeWarning,

      easelSize,
      easelSizeLabel:
        (EASEL_SIZE_MAP[`${easelSize.width}×${easelSize.height}`]?.label) ??
        `${easelSize.width}×${easelSize.height}`,

      // Additional calculation data for warnings and offsets
      offsetWarning,
      bladeWarning,
      minBorderWarning: minBorderData.minBorder !== state.minBorder
        ? minBorderData.minBorderWarning
        : null,
      paperSizeWarning,
      lastValidMinBorder: minBorderData.lastValid,
      clampedHorizontalOffset: offH,
      clampedVerticalOffset: offV,

      previewScale,
      previewWidth: orientedPaper.w * previewScale,
      previewHeight: orientedPaper.h * previewScale,
    };
  }, [
    orientedDimensions,
    printSize,
    offsetData,
    easelData,
    bladeData,
    borders,
    minBorderData,
    paperSizeWarning,
    previewScale,
    state.minBorder,
  ]);

  return {
    calculation,
    previewScale,
  };
}; 