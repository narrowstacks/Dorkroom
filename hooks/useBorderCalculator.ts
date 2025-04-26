import { useState, useMemo, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { BorderCalculation } from '@/types/border';
import { ASPECT_RATIOS, PAPER_SIZES, EASEL_SIZES, BLADE_THICKNESS } from '@/constants/border';

// Base paper size for blade thickness calculation (20x24)
const BASE_PAPER_AREA = 20 * 24;

const calculateBladeThickness = (paperWidth: number, paperHeight: number): number => {
  const paperArea = paperWidth * paperHeight;
  const scaleFactor = BASE_PAPER_AREA / paperArea;
  // Cap the maximum scale factor to avoid too thick blades
  const cappedScale = Math.min(scaleFactor, 2);
  return Math.round(BLADE_THICKNESS * cappedScale);
};

const calculateOptimalMinBorder = (
  paperWidth: number,
  paperHeight: number,
  ratioWidth: number,
  ratioHeight: number,
  currentMinBorder: number
): number => {
  // Calculate the print size that would fit with the current minimum border
  const availableWidth = paperWidth - 2 * currentMinBorder;
  const availableHeight = paperHeight - 2 * currentMinBorder;
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
  const targetBladePositions = [
    printWidth + (paperWidth - printWidth) / 2, // Left blade
    printWidth - (paperWidth - printWidth) / 2, // Right blade
    printHeight + (paperHeight - printHeight) / 2, // Top blade
    printHeight - (paperHeight - printHeight) / 2, // Bottom blade
  ];

  // Find the minimum border that makes all blade positions divisible by 0.25
  let optimalMinBorder = currentMinBorder;
  let bestScore = Infinity;

  // Try different minimum border values around the current value
  for (let i = -0.5; i <= 0.5; i += 0.01) {
    const testMinBorder = currentMinBorder + i;
    if (testMinBorder <= 0) continue;

    const testAvailableWidth = paperWidth - 2 * testMinBorder;
    const testAvailableHeight = paperHeight - 2 * testMinBorder;

    let testPrintWidth: number;
    let testPrintHeight: number;

    if (testAvailableWidth / testAvailableHeight > printRatio) {
      testPrintHeight = testAvailableHeight;
      testPrintWidth = testAvailableHeight * printRatio;
    } else {
      testPrintWidth = testAvailableWidth;
      testPrintHeight = testAvailableWidth / printRatio;
    }

    const testBladePositions = [
      testPrintWidth + (paperWidth - testPrintWidth) / 2,
      testPrintWidth - (paperWidth - testPrintWidth) / 2,
      testPrintHeight + (paperHeight - testPrintHeight) / 2,
      testPrintHeight - (paperHeight - testPrintHeight) / 2,
    ];

    // Calculate how close each blade position is to being divisible by 0.25
    const score = testBladePositions.reduce((sum, pos) => {
      const remainder = pos % 0.25;
      return sum + Math.min(remainder, 0.25 - remainder);
    }, 0);

    if (score < bestScore) {
      bestScore = score;
      optimalMinBorder = testMinBorder;
    }
  }

  return Number(optimalMinBorder.toFixed(2));
};

export const useBorderCalculator = () => {
  // Form state
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [paperSize, setPaperSize] = useState(PAPER_SIZES[3].value);
  const [customAspectWidth, setCustomAspectWidth] = useState("");
  const [customAspectHeight, setCustomAspectHeight] = useState("");
  const [customPaperWidth, setCustomPaperWidth] = useState("");
  const [customPaperHeight, setCustomPaperHeight] = useState("");
  const [minBorder, setMinBorder] = useState("0.5");
  const [enableOffset, setEnableOffset] = useState(false);
  const [ignoreMinBorder, setIgnoreMinBorder] = useState(false);
  const [horizontalOffset, setHorizontalOffset] = useState("0");
  const [verticalOffset, setVerticalOffset] = useState("0");
  const [showBlades, setShowBlades] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [isRatioFlipped, setIsRatioFlipped] = useState(false);
  const [offsetWarning, setOffsetWarning] = useState<string | null>(null);
  const [bladeWarning, setBladeWarning] = useState<string | null>(null);
  const [clampedHorizontalOffset, setClampedHorizontalOffset] = useState(0);
  const [clampedVerticalOffset, setClampedVerticalOffset] = useState(0);
  const [lastValidMinBorder, setLastValidMinBorder] = useState("0.5");
  const [minBorderWarning, setMinBorderWarning] = useState<string | null>(null);
  // Image state & functions
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  // Effect to set initial orientation based on paper size type
  useEffect(() => {
    console.log(`Paper size changed to: ${paperSize}. Adjusting orientation.`);
    if (paperSize === 'custom') {
      // When switching to custom, default to portrait initially
      console.log("Setting initial orientation for custom to portrait (isLandscape=false)");
      setIsLandscape(false);
    } else {
      // When switching to a standard size, default to landscape
      console.log("Setting initial orientation for standard size to landscape (isLandscape=true)");
      setIsLandscape(true);
    }
    // Reset ratio flip when paper size changes, as orientation might reset
    setIsRatioFlipped(false);
  }, [paperSize]);

  // Function to reset all values to defaults
  const resetToDefaults = () => {
    setAspectRatio(ASPECT_RATIOS[0].value);
    setPaperSize(PAPER_SIZES[3].value);
    setCustomAspectWidth("");
    setCustomAspectHeight("");
    setCustomPaperWidth("13");
    setCustomPaperHeight("10");
    setMinBorder("0.5");
    setEnableOffset(false);
    setIgnoreMinBorder(false);
    setHorizontalOffset("0");
    setVerticalOffset("0");
    setShowBlades(false);
    setIsLandscape(true);
    setIsRatioFlipped(false);
    setLastValidMinBorder("0.5");
    setOffsetWarning(null);
    setBladeWarning(null);
    setMinBorderWarning(null);
  };

  // Calculate dimensions and borders
  const calculation = useMemo<BorderCalculation>(() => {
    console.log("--- Calculation Start ---");
    console.log("Inputs:", { paperSize, customPaperWidth, customPaperHeight, aspectRatio, customAspectWidth, customAspectHeight, minBorder, isLandscape, isRatioFlipped, enableOffset, ignoreMinBorder, horizontalOffset, verticalOffset });

    let paperWidth: number;
    let paperHeight: number;
    let ratioWidth: number;
    let ratioHeight: number;

    // Get paper dimensions
    if (paperSize === "custom") {
      paperWidth = parseFloat(customPaperWidth) || 0;
      paperHeight = parseFloat(customPaperHeight) || 0;
    } else {
      const selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize);
      paperWidth = selectedPaper?.width ?? 0;
      paperHeight = selectedPaper?.height ?? 0;
    }
    console.log("Parsed Paper Dimensions:", { paperWidth, paperHeight });

    // Get aspect ratio dimensions
    if (aspectRatio === "custom") {
      ratioWidth = parseFloat(customAspectWidth) || 0;
      ratioHeight = parseFloat(customAspectHeight) || 0;
    } else {
      const selectedRatio = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
      ratioWidth = selectedRatio?.width ?? 0;
      ratioHeight = selectedRatio?.height ?? 0;
    }
     console.log("Parsed Ratio Dimensions:", { ratioWidth, ratioHeight });

    // Create oriented dimensions based on isLandscape state.
    const orientedPaperWidth = isLandscape ? paperHeight : paperWidth; // Wp_x or Wp_y depending on isLandscape
    const orientedPaperHeight = isLandscape ? paperWidth : paperHeight; // Wp_y or Wp_x depending on isLandscape
    console.log("Orientation State:", { isLandscape });
    console.log("Oriented Paper Dimensions (Wp):", { orientedPaperWidth, orientedPaperHeight });


    // Apply ratio flip
    const orientedRatioWidth = isRatioFlipped ? ratioHeight : ratioWidth;
    const orientedRatioHeight = isRatioFlipped ? ratioWidth : ratioHeight;
    console.log("Ratio Flip State:", { isRatioFlipped });
    console.log("Oriented Ratio Dimensions:", { orientedRatioWidth, orientedRatioHeight });

    // Calculate print size to fit within paper with minimum borders
    let minBorderValue = parseFloat(minBorder) || 0;
    const maxPossibleBorder = Math.min(
      orientedPaperWidth / 2,
      orientedPaperHeight / 2
    );

    // Validate minimum border value
    if (minBorderValue >= maxPossibleBorder) {
      setMinBorderWarning(
        `Minimum border value would result in zero/negative image size. Using ${lastValidMinBorder} instead.`
      );
      minBorderValue = parseFloat(lastValidMinBorder) || 0;
    } else {
      setLastValidMinBorder(minBorder);
      setMinBorderWarning(null);
    }

    // Apply user offsets if enabled
    let horizontalOffsetValue = enableOffset ? parseFloat(horizontalOffset) || 0 : 0;
    let verticalOffsetValue = enableOffset ? parseFloat(verticalOffset) || 0 : 0;

    const availableWidth = orientedPaperWidth - 2 * minBorderValue;
    const availableHeight = orientedPaperHeight - 2 * minBorderValue;
    const printRatio = orientedRatioHeight === 0 ? 0 : orientedRatioWidth / orientedRatioHeight;


    let printWidth: number;  // I_x or I_y
    let printHeight: number; // I_y or I_x

    // Handle case where printRatio is 0 or dimensions are invalid
    if (printRatio === 0 || availableWidth <= 0 || availableHeight <= 0) {
        printWidth = 0;
        printHeight = 0;
    } else if (availableWidth / availableHeight > printRatio) {
      // Height limited
      printHeight = availableHeight;
      printWidth = availableHeight * printRatio;
    } else {
      // Width limited
      printWidth = availableWidth;
      printHeight = availableWidth / printRatio;
    }
    console.log("Calculated Print Dimensions (I):", { printWidth, printHeight });

    // Calculate maximum allowed offsets
    const maxHorizontalOffset = ignoreMinBorder
      ? (orientedPaperWidth - printWidth) / 2
      : Math.min(
          (orientedPaperWidth - printWidth) / 2 - minBorderValue,
          (orientedPaperWidth - printWidth) / 2
        );

    const maxVerticalOffset = ignoreMinBorder
      ? (orientedPaperHeight - printHeight) / 2
      : Math.min(
          (orientedPaperHeight - printHeight) / 2 - minBorderValue,
          (orientedPaperHeight - printHeight) / 2
        );

    // Clamp offset values within allowed range
    horizontalOffsetValue = Math.max(
      -maxHorizontalOffset,
      Math.min(maxHorizontalOffset, horizontalOffsetValue)
    );
    verticalOffsetValue = Math.max(
      -maxVerticalOffset,
      Math.min(maxVerticalOffset, verticalOffsetValue)
    );

    // Update clamped values in state
    setClampedHorizontalOffset(horizontalOffsetValue);
    setClampedVerticalOffset(verticalOffsetValue);

    // Set warning message if offsets were clamped
    const originalHorizontal = parseFloat(horizontalOffset) || 0;
    const originalVertical = parseFloat(verticalOffset) || 0;

    if (
      originalHorizontal !== horizontalOffsetValue ||
      originalVertical !== verticalOffsetValue
    ) {
      setOffsetWarning(
        ignoreMinBorder
          ? "Offset values have been adjusted to keep print within paper edges"
          : "Offset values have been adjusted to maintain minimum borders and stay within paper bounds"
      );
    } else {
      setOffsetWarning(null);
    }

    // Calculate borders (B1, B2)
    const rightBorder = (orientedPaperWidth - printWidth) / 2 + horizontalOffsetValue; // B2_x (far) or B1_y (near)
    const leftBorder = (orientedPaperWidth - printWidth) / 2 - horizontalOffsetValue;  // B1_x (near) or B2_y (far)
    const topBorder = (orientedPaperHeight - printHeight) / 2 + verticalOffsetValue;   // B2_y (far) or B1_x (near)
    const bottomBorder = (orientedPaperHeight - printHeight) / 2 - verticalOffsetValue;// B1_y (near) or B2_x (far)
    console.log("Calculated Borders (B):", { leftBorder, rightBorder, topBorder, bottomBorder });

    // Calculate preview scaling
    const PREVIEW_HEIGHT = 300; // Fixed preview height in pixels

    // Calculate percentages for positioning elements
    const printWidthPercent = (printWidth / orientedPaperWidth) * 100;
    const printHeightPercent = (printHeight / orientedPaperHeight) * 100;
    const leftBorderPercent = (leftBorder / orientedPaperWidth) * 100;
    const topBorderPercent = (topBorder / orientedPaperHeight) * 100;
    const rightBorderPercent = (rightBorder / orientedPaperWidth) * 100;
    const bottomBorderPercent = (bottomBorder / orientedPaperHeight) * 100;

    // Get Easel Slot size (Ws) and non-standard flag
    const easelInfo = findCenteringOffsets(paperWidth, paperHeight, isLandscape);
    const { easelSize, isNonStandardPaperSize } = easelInfo;
    const Ws_x = easelSize.width;
    const Ws_y = easelSize.height;
    console.log("Easel Info (Ws):", { Ws_x, Ws_y, isNonStandardPaperSize });

    // Define variables based on the example formulas
    const Wp_x = orientedPaperWidth;
    const Wp_y = orientedPaperHeight;
    const B1_x = leftBorder;    // Near horizontal
    const B2_x = rightBorder;   // Far horizontal
    const B1_y = bottomBorder;  // Near vertical
    const B2_y = topBorder;     // Far vertical
    const I_x = printWidth;
    const I_y = printHeight;

    // Calculate paper shift (sp)
    const sp_x = isNonStandardPaperSize ? (Wp_x - Ws_x) / 2 : 0; // Paper shift only applied if non-standard
    const sp_y = isNonStandardPaperSize ? (Wp_y - Ws_y) / 2 : 0; // Use consistent (Wp - Ws) / 2 formula
    console.log("Calculated Paper Shift (sp):", { sp_x, sp_y });

    // Calculate border-induced offset (sb)
    const sb_x = (B2_x - B1_x) / 2; // (= horizontalOffsetValue)
    const sb_y = (B2_y - B1_y) / 2; // (= verticalOffsetValue)
    console.log("Calculated Border Shift (sb):", { sb_x, sb_y });

    // Calculate total centre shift (s)
    const s_x = sp_x + sb_x;
    const s_y = sp_y + sb_y;
    console.log("Calculated Total Shift (s):", { s_x, s_y });

    // Calculate blade scale readings (R1, R2)
    const leftBladeReading = I_x - 2 * s_x;   // R1_x
    const rightBladeReading = I_x + 2 * s_x;  // R2_x
    const topBladeReading = I_y - 2 * s_y; // R1_y
    const bottomBladeReading = I_y + 2 * s_y;    // R2_y
    console.log("Calculated Blade Readings (R):", { leftBladeReading, rightBladeReading, topBladeReading, bottomBladeReading });


    // Calculate blade thickness for preview (visual only)
    const bladeThickness = calculateBladeThickness(orientedPaperWidth, orientedPaperHeight);

    // Blade position warnings (based on readings)
    let warningMessage = "";
    const readings = [leftBladeReading, rightBladeReading, topBladeReading, bottomBladeReading];
    if (readings.some(r => Math.abs(r) < 3)) {
      warningMessage = "Most easels don't have markings below 3 in!";
    }
    if (readings.some(r => r < 0)) {
      warningMessage = warningMessage + (warningMessage ? "\n" : "") + "Negative blade reading detected! Set blade to the positive value on the scale and use the opposite blade mechanism.";
    }
    setBladeWarning(warningMessage || null);

    // Result object matching BorderCalculation type
    const result: BorderCalculation = {
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      printWidth,
      printHeight,
      paperWidth: orientedPaperWidth,
      paperHeight: orientedPaperHeight,
      previewScale: PREVIEW_HEIGHT / Math.max(orientedPaperWidth, orientedPaperHeight), // simplified scale calc
      previewHeight: PREVIEW_HEIGHT,
      previewWidth: PREVIEW_HEIGHT * (orientedPaperWidth / orientedPaperHeight),
      printWidthPercent,
      printHeightPercent,
      leftBorderPercent,
      topBorderPercent,
      rightBorderPercent,
      bottomBorderPercent,
      // New Blade Readings
      leftBladeReading,
      rightBladeReading,
      topBladeReading,
      bottomBladeReading,
      bladeThickness,
      // Easel information
      isNonStandardPaperSize,
      easelSize
    };
    console.log("Final Calculation Result:", result);
    console.log("--- Calculation End ---");

    return result;
  }, [
    paperSize,
    customPaperWidth,
    customPaperHeight,
    aspectRatio,
    customAspectWidth,
    customAspectHeight,
    minBorder,
    horizontalOffset,
    verticalOffset,
    isLandscape,
    isRatioFlipped,
    enableOffset,
    ignoreMinBorder,
    lastValidMinBorder,
  ]);

  // Preview scaling
  const previewScale = useMemo(() => {
    if (!calculation) return 1;
    const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
    // Maximum allowable preview dimensions
    const maxWidth = Math.min(windowWidth - 32, 400);
    const maxHeight = Math.min(windowHeight - 32, 400);
    // Use calculated oriented paper dimensions
    const { paperWidth, paperHeight } = calculation;
    // Scale to fit within both maxWidth and maxHeight
    return Math.min(
      maxWidth / (paperWidth || 1),
      maxHeight / (paperHeight || 1)
    );
  }, [calculation]);

  return {
    // State
    aspectRatio,
    setAspectRatio,
    paperSize,
    setPaperSize,
    customAspectWidth,
    setCustomAspectWidth,
    customAspectHeight,
    setCustomAspectHeight,
    customPaperWidth,
    setCustomPaperWidth,
    customPaperHeight,
    setCustomPaperHeight,
    minBorder,
    setMinBorder,
    enableOffset,
    setEnableOffset,
    ignoreMinBorder,
    setIgnoreMinBorder,
    horizontalOffset,
    setHorizontalOffset,
    verticalOffset,
    setVerticalOffset,
    showBlades,
    setShowBlades,
    isLandscape,
    setIsLandscape,
    isRatioFlipped,
    setIsRatioFlipped,
    offsetWarning,
    bladeWarning,
    minBorderWarning,
    clampedHorizontalOffset,
    clampedVerticalOffset,
    // Image state & functions
    selectedImageUri,
    imageDimensions,
    isCropping,
    cropOffset,
    cropScale,
    imageLayout,
    // Calculations
    calculation,
    previewScale,
    // Functions
    calculateOptimalMinBorder: () => {
      if (!calculation) return;
      const optimalBorder = calculateOptimalMinBorder(
        calculation.paperWidth,
        calculation.paperHeight,
        calculation.printWidth,
        calculation.printHeight,
        parseFloat(minBorder) || 0
      );
      setMinBorder(optimalBorder.toString());
    },
    resetToDefaults,
  };
};

// New function to calculate centering offsets within the easel
function findCenteringOffsets(paperWidth: number, paperHeight: number, isLandscape: boolean) {
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

export default useBorderCalculator; 

