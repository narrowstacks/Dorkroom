import { EASEL_SIZES, BLADE_THICKNESS } from '@/constants/border';

// Base paper size for blade thickness calculation (20x24)
const BASE_PAPER_AREA = 20 * 24;

export const calculateBladeThickness = (paperWidth: number, paperHeight: number): number => {
  const paperArea = paperWidth * paperHeight;
  // Avoid division by zero or negative areas
  if (paperArea <= 0) return BLADE_THICKNESS;
  const scaleFactor = BASE_PAPER_AREA / paperArea;
  // Cap the maximum scale factor to avoid too thick blades
  const cappedScale = Math.min(scaleFactor, 2);
  return Math.round(BLADE_THICKNESS * cappedScale);
};

export const findCenteringOffsets = (paperWidth: number, paperHeight: number, isLandscape: boolean): { easelSize: { width: number, height: number }, isNonStandardPaperSize: boolean } => {
  const orientedPaperWidth = isLandscape ? paperHeight : paperWidth;
  const orientedPaperHeight = isLandscape ? paperWidth : paperHeight;

  let bestFitEasel = null;
  let minAreaDiff = Infinity;
  let useFlippedEasel = false; // Track if the easel needs to be flipped relative to paper orientation

  // Sort easels by area to find the smallest fitting one first
  const sortedEasels = [...EASEL_SIZES].sort((a, b) => (a.width * a.height) - (b.width * b.height));

  // Find the smallest easel that fits the *oriented* paper
  for (const easel of sortedEasels) {
    const fitsCurrentOrientation = easel.width >= orientedPaperWidth && easel.height >= orientedPaperHeight;
    const fitsFlippedOrientation = easel.width >= orientedPaperHeight && easel.height >= orientedPaperWidth;

    if (fitsCurrentOrientation || fitsFlippedOrientation) {
      const areaDiff = (easel.width * easel.height) - (orientedPaperWidth * orientedPaperHeight);
      if (bestFitEasel === null || areaDiff < minAreaDiff) {
        bestFitEasel = easel;
        minAreaDiff = areaDiff;
        // Determine if the fitted easel needs to be flipped relative to the paper's orientation
        // If it fits the current orientation, no flip needed.
        // If it only fits the flipped orientation, flip needed.
        useFlippedEasel = !fitsCurrentOrientation && fitsFlippedOrientation;
        // Since they are sorted, the first one we find is the smallest fitting
        break;
      }
    }
  }

  // If no fitting easel found
  if (!bestFitEasel) {
    return {
      // Use paper dims as effective easel size, oriented correctly
      easelSize: { width: orientedPaperWidth, height: orientedPaperHeight },
      isNonStandardPaperSize: true
    };
  }

  // Determine the effective slot dimensions (Ws_x, Ws_y) based on easel orientation
  const Ws_x = useFlippedEasel ? bestFitEasel.height : bestFitEasel.width;
  const Ws_y = useFlippedEasel ? bestFitEasel.width : bestFitEasel.height;

  // Determine if the *original* paper size is standard relative to easels.
  let isOriginalPaperStandard = false;
  for (const easel of EASEL_SIZES) {
    if ((easel.width === paperWidth && easel.height === paperHeight) ||
        (easel.width === paperHeight && easel.height === paperWidth)) {
      isOriginalPaperStandard = true;
      break;
    }
  }
  const isPaperSizeNonStandard = !isOriginalPaperStandard;

  return {
    // Return the *oriented* slot dimensions
    easelSize: { width: Ws_x, height: Ws_y },
    isNonStandardPaperSize: isPaperSizeNonStandard
  };
}

// TODO: Consider replacing the brute-force loop with a binary search for performance.
export const calculateOptimalMinBorder = (
  paperWidth: number,
  paperHeight: number,
  ratioWidth: number,
  ratioHeight: number,
  currentMinBorder: number
): number => {
  // Calculate the print size that would fit with the current minimum border
  const availableWidth = paperWidth - 2 * currentMinBorder;
  const availableHeight = paperHeight - 2 * currentMinBorder;
  if (availableWidth <= 0 || availableHeight <= 0 || ratioHeight === 0) return currentMinBorder; // Avoid invalid calcs

  const printRatio = ratioWidth / ratioHeight;

  let printWidth: number;
  let printHeight: number;

  if (availableWidth / availableHeight > printRatio) {
    // Height limited
    printHeight = availableHeight;
    printWidth = availableHeight * printRatio;
  } else {
    // Width limited
    printWidth = availableWidth;
    printHeight = availableWidth / printRatio;
  }

  // Calculate the borders that would result in blade positions divisible by 0.25
  // Note: The original calculation for targetBladePositions seemed complex and
  // might not be the most direct way. The core idea is to adjust minBorder slightly
  // and find the one that minimizes the remainder when blade positions are divided by 0.25.
  // This loop directly tests minBorder values.

  let optimalMinBorder = currentMinBorder;
  let bestScore = Infinity;

  // Try different minimum border values around the current value
  // Loop from currentMinBorder - 0.5 to currentMinBorder + 0.5 in 0.01 steps
  const startTest = Math.max(0.01, currentMinBorder - 0.5); // Ensure positive test border
  const endTest = currentMinBorder + 0.5;

  for (let testMinBorder = startTest; testMinBorder <= endTest; testMinBorder += 0.01) {
    const testAvailableWidth = paperWidth - 2 * testMinBorder;
    const testAvailableHeight = paperHeight - 2 * testMinBorder;

    if (testAvailableWidth <= 0 || testAvailableHeight <= 0) continue; // Skip invalid sizes

    let testPrintWidth: number;
    let testPrintHeight: number;

    if (testAvailableWidth / testAvailableHeight > printRatio) {
      testPrintHeight = testAvailableHeight;
      testPrintWidth = testAvailableHeight * printRatio;
    } else {
      testPrintWidth = testAvailableWidth;
      testPrintHeight = testAvailableWidth / printRatio;
    }

    // Calculate *border sizes* for this testMinBorder
    const testLeftBorder = (paperWidth - testPrintWidth) / 2;
    const testRightBorder = (paperWidth - testPrintWidth) / 2; // Centered initially
    const testTopBorder = (paperHeight - testPrintHeight) / 2;
    const testBottomBorder = (paperHeight - testPrintHeight) / 2; // Centered initially

    // Calculate blade *positions* based on these borders
    // We assume centering initially for optimizing the minBorder itself. Offsets are applied later.
    // Blade Position = Border Size
    const testBladePositions = [
        testLeftBorder,
        testRightBorder,
        testTopBorder,
        testBottomBorder
    ];


    // Calculate how close each blade position is to being divisible by 0.25
    let score = 0;
    for (let k = 0; k < testBladePositions.length; k++) {
        const pos = testBladePositions[k];
        const remainder = pos % 0.25;
         // Penalize remainders further from 0 or 0.25
        score += Math.min(remainder, 0.25 - remainder);
    }


    if (score < bestScore) {
      bestScore = score;
      optimalMinBorder = testMinBorder;
    }
  }

  // Return the optimal border rounded to two decimal places
  return Number(optimalMinBorder.toFixed(2));
}; 