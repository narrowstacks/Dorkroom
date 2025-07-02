/* ------------------------------------------------------------------ *\
   borderCalculations.worker.ts
   -------------------------------------------------------------
   Web Worker for offloading heavy border calculations
   Improves main thread performance by running calculations in background
\* ------------------------------------------------------------------ */

// Import the calculation utilities
import {
  calculateBladeThickness,
  findCenteringOffsets,
  computePrintSize,
  clampOffsets,
  bordersFromGaps,
  bladeReadings,
} from "../utils/borderCalculations";

export interface WorkerInput {
  orientedDimensions: {
    orientedPaper: { w: number; h: number };
    orientedRatio: { w: number; h: number };
  };
  minBorderData: {
    minBorder: number;
    minBorderWarning: string | null;
    lastValid: number;
  };
  paperEntry: { w: number; h: number; custom: boolean };
  paperSizeWarning: string | null;
  state: {
    enableOffset: boolean;
    horizontalOffset: number;
    verticalOffset: number;
    ignoreMinBorder: boolean;
    isLandscape: boolean;
  };
  previewScale: number;
}

export interface WorkerOutput {
  leftBorder: number;
  rightBorder: number;
  topBorder: number;
  bottomBorder: number;
  printWidth: number;
  printHeight: number;
  paperWidth: number;
  paperHeight: number;
  printWidthPercent: number;
  printHeightPercent: number;
  leftBorderPercent: number;
  rightBorderPercent: number;
  topBorderPercent: number;
  bottomBorderPercent: number;
  leftBladeReading: number;
  rightBladeReading: number;
  topBladeReading: number;
  bottomBladeReading: number;
  bladeThickness: number;
  isNonStandardPaperSize: boolean;
  easelSize: { width: number; height: number };
  easelSizeLabel: string;
  offsetWarning: string | null;
  bladeWarning: string | null;
  minBorderWarning: string | null;
  paperSizeWarning: string | null;
  lastValidMinBorder: number;
  clampedHorizontalOffset: number;
  clampedVerticalOffset: number;
  previewScale: number;
  previewWidth: number;
  previewHeight: number;
}

// Helper function to perform all calculations
function performCalculations(input: WorkerInput): WorkerOutput {
  const {
    orientedDimensions,
    minBorderData,
    paperEntry,
    paperSizeWarning,
    state,
    previewScale,
  } = input;

  const { orientedPaper, orientedRatio } = orientedDimensions;
  const { minBorder } = minBorderData;

  // Step 1: Print size calculation
  const { printW, printH } = computePrintSize(
    orientedPaper.w,
    orientedPaper.h,
    orientedRatio.w,
    orientedRatio.h,
    minBorder,
  );

  // Step 2: Offset calculations
  const {
    h: offH,
    v: offV,
    halfW,
    halfH,
    warning: offsetWarning,
  } = clampOffsets(
    orientedPaper.w,
    orientedPaper.h,
    printW,
    printH,
    minBorder,
    state.enableOffset ? state.horizontalOffset : 0,
    state.enableOffset ? state.verticalOffset : 0,
    state.ignoreMinBorder,
  );

  // Step 3: Border calculations
  const borders = bordersFromGaps(halfW, halfH, offH, offV);

  // Step 4: Easel fitting calculations
  const { easelSize, effectiveSlot, isNonStandardPaperSize } =
    findCenteringOffsets(paperEntry.w, paperEntry.h, state.isLandscape);

  // Step 5: Paper shift calculations
  const spX = isNonStandardPaperSize
    ? (orientedPaper.w - effectiveSlot.width) / 2
    : 0;
  const spY = isNonStandardPaperSize
    ? (orientedPaper.h - effectiveSlot.height) / 2
    : 0;

  // Step 6: Blade readings and warnings
  const blades = bladeReadings(printW, printH, spX + offH, spY + offV);

  let bladeWarning: string | null = null;
  const values = Object.values(blades);
  if (values.some((v) => v < 0))
    bladeWarning = "Negative blade reading – use opposite side of scale.";
  if (values.some((v) => Math.abs(v) < 3 && v !== 0))
    bladeWarning =
      (bladeWarning ? bladeWarning + "\n" : "") +
      "Many easels have no markings below about 3 in.";

  // Step 7: Build final result
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
    leftBorderPercent: orientedPaper.w
      ? (borders.left / orientedPaper.w) * 100
      : 0,
    rightBorderPercent: orientedPaper.w
      ? (borders.right / orientedPaper.w) * 100
      : 0,
    topBorderPercent: orientedPaper.h
      ? (borders.top / orientedPaper.h) * 100
      : 0,
    bottomBorderPercent: orientedPaper.h
      ? (borders.bottom / orientedPaper.h) * 100
      : 0,

    leftBladeReading: blades.left,
    rightBladeReading: blades.right,
    topBladeReading: blades.top,
    bottomBladeReading: blades.bottom,
    bladeThickness: calculateBladeThickness(orientedPaper.w, orientedPaper.h),

    isNonStandardPaperSize: isNonStandardPaperSize && !paperSizeWarning,

    easelSize,
    easelSizeLabel: `${easelSize.width}×${easelSize.height}`,

    offsetWarning,
    bladeWarning,
    minBorderWarning:
      minBorderData.minBorder !== minBorder
        ? minBorderData.minBorderWarning
        : null,
    paperSizeWarning: paperSizeWarning,
    lastValidMinBorder: minBorderData.lastValid,
    clampedHorizontalOffset: offH,
    clampedVerticalOffset: offV,

    previewScale,
    previewWidth: orientedPaper.w * previewScale,
    previewHeight: orientedPaper.h * previewScale,
  };
}

// Web Worker message handler
self.onmessage = function (e: MessageEvent<WorkerInput>) {
  try {
    const result = performCalculations(e.data);
    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// For module exports in non-worker environments
export { performCalculations };
