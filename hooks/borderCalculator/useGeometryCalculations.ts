/* ------------------------------------------------------------------ *\
   useGeometryCalculations.ts
   -------------------------------------------------------------
   Hook for geometry calculations: print size, borders, blade readings
   -------------------------------------------------------------
   Exports:
     - useGeometryCalculations: All geometry-related calculations
\* ------------------------------------------------------------------ */

import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { EASEL_SIZE_MAP } from "@/constants/border";
import {
  calculateBladeThickness,
  findCenteringOffsets,
  computePrintSize,
  clampOffsets,
  bordersFromGaps,
  bladeReadings,
} from "@/utils/borderCalculations";
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
} from "./types";

export const useGeometryCalculations = (
  state: BorderCalculatorState,
  orientedDimensions: OrientedDimensions,
  minBorderData: MinBorderData,
  paperEntry: PaperEntry,
  paperSizeWarning: string | null,
) => {
  const { width: winW, height: winH } = useWindowDimensions();

  // Optimized preview scale calculation with better caching
  const previewScale = useMemo(() => {
    const { w, h } = orientedDimensions.orientedPaper;
    if (!w || !h) return 1;

    // Use more efficient calculations
    const maxW = winW > 444 ? 400 : winW * 0.9; // Avoid Math.min for common case
    const maxH = winH > 800 ? 400 : winH * 0.5;

    const scaleW = maxW / w;
    const scaleH = maxH / h;

    return scaleW < scaleH ? scaleW : scaleH; // More efficient than Math.min
  }, [orientedDimensions.orientedPaper, winW, winH]);

  // Optimized print size calculation with simpler memoization
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
  }, [
    orientedDimensions,
    minBorderData,
    printSize,
    state.enableOffset,
    state.horizontalOffset,
    state.verticalOffset,
    state.ignoreMinBorder,
  ]);

  // Optimized border calculations without heavy caching overhead
  const borders = useMemo((): Borders => {
    const { halfW, halfH, h: offH, v: offV } = offsetData;
    return bordersFromGaps(halfW, halfH, offH, offV);
  }, [offsetData]);

  // Easel fitting calculations
  const easelData = useMemo((): EaselData => {
    return findCenteringOffsets(paperEntry.w, paperEntry.h, state.isLandscape);
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

    const blades = bladeReadings(printW, printH, spX + offH, spY + offV);

    let bladeWarning: string | null = null;
    const values = Object.values(blades);
    if (values.some((v) => v < 0))
      bladeWarning = "Negative blade reading – use opposite side of scale.";
    if (values.some((v) => Math.abs(v) < 3 && v !== 0))
      bladeWarning =
        (bladeWarning ? bladeWarning + "\n" : "") +
        "Many easels have no markings below about 3 in.";

    return { blades, bladeWarning };
  }, [printSize, offsetData, paperShift]);

  // Optimized final calculation assembly with reduced overhead
  const calculation = useMemo(() => {
    const { orientedPaper } = orientedDimensions;
    const { printW, printH } = printSize;
    const { h: offH, v: offV, warning: offsetWarning } = offsetData;
    const { easelSize, isNonStandardPaperSize } = easelData;
    const { blades, bladeWarning } = bladeData;

    // Cache paper dimensions to avoid repeated property access
    const paperW = orientedPaper.w;
    const paperH = orientedPaper.h;
    const invPaperW = paperW ? 100 / paperW : 0; // Pre-calculate inverse for efficiency
    const invPaperH = paperH ? 100 / paperH : 0;

    // Calculate preview dimensions once
    const previewW = paperW * previewScale;
    const previewH = paperH * previewScale;

    return {
      leftBorder: borders.left,
      rightBorder: borders.right,
      topBorder: borders.top,
      bottomBorder: borders.bottom,

      printWidth: printW,
      printHeight: printH,
      paperWidth: paperW,
      paperHeight: paperH,

      printWidthPercent: printW * invPaperW,
      printHeightPercent: printH * invPaperH,
      leftBorderPercent: borders.left * invPaperW,
      rightBorderPercent: borders.right * invPaperW,
      topBorderPercent: borders.top * invPaperH,
      bottomBorderPercent: borders.bottom * invPaperH,

      leftBladeReading: blades.left,
      rightBladeReading: blades.right,
      topBladeReading: blades.top,
      bottomBladeReading: blades.bottom,
      bladeThickness: calculateBladeThickness(paperW, paperH),

      isNonStandardPaperSize: isNonStandardPaperSize && !paperSizeWarning,

      easelSize,
      easelSizeLabel:
        EASEL_SIZE_MAP[`${easelSize.width}×${easelSize.height}`]?.label ??
        `${easelSize.width}×${easelSize.height}`,

      // Additional calculation data for warnings and offsets
      offsetWarning,
      bladeWarning,
      minBorderWarning:
        minBorderData.minBorder !== state.minBorder
          ? minBorderData.minBorderWarning
          : null,
      paperSizeWarning,
      lastValidMinBorder: minBorderData.lastValid,
      clampedHorizontalOffset: offH,
      clampedVerticalOffset: offV,

      previewScale,
      previewWidth: previewW,
      previewHeight: previewH,
    };
  }, [
    bladeData,
    easelData,
    offsetData,
    orientedDimensions,
    printSize,
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
