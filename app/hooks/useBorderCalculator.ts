import { useState, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { BorderCalculation } from '../types/border';
import { ASPECT_RATIOS, PAPER_SIZES, EASEL_SIZES, BLADE_THICKNESS } from '../constants/border';
import { calculateBladeThickness } from './commonFunctions';

// Base paper size for blade thickness calculation (20x24)
const BASE_PAPER_AREA = 20 * 24;

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

  // Function to reset all values to defaults
  const resetToDefaults = () => {
    setAspectRatio(ASPECT_RATIOS[0].value);
    setPaperSize(PAPER_SIZES[3].value);
    setCustomAspectWidth("");
    setCustomAspectHeight("");
    setCustomPaperWidth("");
    setCustomPaperHeight("");
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

    // Get aspect ratio dimensions
    if (aspectRatio === "custom") {
      ratioWidth = parseFloat(customAspectWidth) || 0;
      ratioHeight = parseFloat(customAspectHeight) || 0;
    } else {
      const selectedRatio = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
      ratioWidth = selectedRatio?.width ?? 0;
      ratioHeight = selectedRatio?.height ?? 0;
    }

    // Create oriented dimensions based on orientation setting instead of swapping original values
    const orientedPaperWidth = isLandscape ? paperHeight : paperWidth;
    const orientedPaperHeight = isLandscape ? paperWidth : paperHeight;

    // Apply ratio flip
    const orientedRatioWidth = isRatioFlipped ? ratioHeight : ratioWidth;
    const orientedRatioHeight = isRatioFlipped ? ratioWidth : ratioHeight;

    // Calculate print size to fit within paper with minimum borders
    let minBorderValue = parseFloat(minBorder) || 0;
    const maxPossibleBorder = Math.min(
      orientedPaperWidth / 2,
      orientedPaperHeight / 2
    );

    // Validate minimum border value
    if (minBorderValue >= maxPossibleBorder) {
      // Use last valid value and show warning
      setMinBorderWarning(
        `Minimum border value would result in zero/negative image size. Using ${lastValidMinBorder} instead.`
      );
      // Use last valid value for calculations
      minBorderValue = parseFloat(lastValidMinBorder) || 0;
    } else {
      // Update last valid value and clear warning
      setLastValidMinBorder(minBorder);
      setMinBorderWarning(null);
    }

    // Apply user offsets if enabled
    let horizontalOffsetValue = enableOffset ? parseFloat(horizontalOffset) || 0 : 0;
    let verticalOffsetValue = enableOffset ? parseFloat(verticalOffset) || 0 : 0;

    const availableWidth = orientedPaperWidth - 2 * minBorderValue;
    const availableHeight = orientedPaperHeight - 2 * minBorderValue;
    const printRatio = orientedRatioWidth / orientedRatioHeight;

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

    // Calculate maximum allowed offsets
    // If ignoreMinBorder is true, we only consider paper edge restrictions
    // Otherwise, we also enforce the minimum border value
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

    // Calculate borders
    const leftBorder = (orientedPaperWidth - printWidth) / 2 + horizontalOffsetValue;
    const rightBorder = (orientedPaperWidth - printWidth) / 2 - horizontalOffsetValue;
    const topBorder = (orientedPaperHeight - printHeight) / 2 + verticalOffsetValue;
    const bottomBorder = (orientedPaperHeight - printHeight) / 2 - verticalOffsetValue;

    // Calculate preview scaling
    const { width: windowWidth } = Dimensions.get("window");
    const PREVIEW_HEIGHT = 300; // Fixed preview height in pixels
    const previewScale = PREVIEW_HEIGHT / Math.max(orientedPaperWidth, orientedPaperHeight);
    const previewWidth = PREVIEW_HEIGHT * (orientedPaperWidth / orientedPaperHeight);
    
    // Calculate percentages for positioning elements
    const printWidthPercent = (printWidth / orientedPaperWidth) * 100;
    const printHeightPercent = (printHeight / orientedPaperHeight) * 100;
    const leftBorderPercent = (leftBorder / orientedPaperWidth) * 100;
    const topBorderPercent = (topBorder / orientedPaperHeight) * 100;
    const rightBorderPercent = (rightBorder / orientedPaperWidth) * 100;
    const bottomBorderPercent = (bottomBorder / orientedPaperHeight) * 100;
    
    // Find the appropriate easel size for the paper
    // Use oriented dimensions for easel size calculation
    const currentEaselSize = findNextBiggestEaselSize(paperWidth, paperHeight);
  
    // find the difference between the current easel size and the paper size
    const easelWidthDifference = currentEaselSize.width - paperWidth;
    const easelHeightDifference = currentEaselSize.height - paperHeight;

    console.log(`Current easel size: ${currentEaselSize.width}x${currentEaselSize.height}`);

    // Return 0 if the difference is 0 or negative, otherwise return the difference
    const easelWidth = easelWidthDifference <= 0 ? 0 : easelWidthDifference;
    const easelHeight = easelHeightDifference <= 0 ? 0 : easelHeightDifference;

    console.log(`Easel width difference: ${easelWidthDifference}`);
    console.log(`Easel height difference: ${easelHeightDifference}`);

    // Get the offset and make sure it's positive
    const easelWidthOffset = Math.abs(easelWidthDifference);
    const easelHeightOffset = Math.abs(easelHeightDifference);

    console.log(`Easel width offset: ${easelWidthOffset}`);
    console.log(`Easel height offset: ${easelHeightOffset}`);

    // Calculate blade positions
    const bladeThickness = calculateBladeThickness(orientedPaperWidth, orientedPaperHeight, BASE_PAPER_AREA, BLADE_THICKNESS);
    const leftBladePos = printWidth + leftBorder - rightBorder + easelWidthOffset;
    const rightBladePos = printWidth - leftBorder + rightBorder - easelWidthOffset;
    const topBladePos = printHeight + topBorder - bottomBorder + easelHeightOffset;
    const bottomBladePos = printHeight - topBorder + bottomBorder - easelHeightOffset;

    // Create warning message for blade positions
    let warningMessage = "";
        // Check if any blade position is under 2 inches
    if (Math.abs(leftBladePos) < 3 || Math.abs(rightBladePos) < 3 || Math.abs(topBladePos) < 3 || Math.abs(bottomBladePos) < 3) {
      warningMessage = "Most easels don't have markings below 3 in!";
    }
    // Check if any blade position is negative
    if (leftBladePos < 0 || rightBladePos < 0 || topBladePos < 0 || bottomBladePos < 0) {
      warningMessage = warningMessage + "\n" + "Negative blade position detected! \nFor negative values, set your blade to the markings of the opposite blade.";
    }

    if (warningMessage === "") {
      setBladeWarning(null);
    } else {
      setBladeWarning(warningMessage);
    }

    return {
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      printWidth,
      printHeight,
      paperWidth: orientedPaperWidth,
      paperHeight: orientedPaperHeight,
      previewScale,
      previewHeight: PREVIEW_HEIGHT,
      previewWidth,
      printWidthPercent,
      printHeightPercent,
      leftBorderPercent,
      topBorderPercent,
      rightBorderPercent,
      bottomBorderPercent,
      leftBladePos,
      rightBladePos,
      topBladePos,
      bottomBladePos,
      bladeThickness,
      // Add easel information
      isNonStandardSize: easelWidthDifference > 0 || easelHeightDifference > 0,
      easelSize: {
        width: currentEaselSize?.width ?? 0,
        height: currentEaselSize?.height ?? 0
      }
    };
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
  ]);

  // Preview scaling
  const previewScale = useMemo(() => {
    if (!calculation) return 1;
    const { width } = Dimensions.get("window");
    const maxPreviewWidth = Math.min(width - 32, 400);
    const selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize);
    
    // Use the orientation to determine the width for scaling
    let paperWidth;
    if (paperSize === "custom") {
      paperWidth = isLandscape
        ? parseFloat(customPaperHeight) || 0
        : parseFloat(customPaperWidth) || 0;
    } else {
      paperWidth = isLandscape
        ? selectedPaper?.height ?? 0
        : selectedPaper?.width ?? 0;
    }
    
    return maxPreviewWidth / (paperWidth || 1);
  }, [paperSize, customPaperWidth, customPaperHeight, isLandscape, calculation]);

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

function findNextBiggestEaselSize(paperWidth: number, paperHeight: number) {
  console.log(`Finding easel size for paper: ${paperWidth}x${paperHeight}`);
  
  // Find easel sizes that match either orientation of the paper
  const closestEaselSize = EASEL_SIZES.find((easel) => 
    // Normal orientation
    (easel.width >= paperWidth && easel.height >= paperHeight) ||
    // Flipped orientation
    (easel.width >= paperHeight && easel.height >= paperWidth)
  );
  
  console.log(`Closest easel size found:`, closestEaselSize);
  
  // Check for exact match in either orientation
  if ((closestEaselSize?.width === paperWidth && closestEaselSize?.height === paperHeight) ||
      (closestEaselSize?.width === paperHeight && closestEaselSize?.height === paperWidth)) {
    console.log(`Exact match found, returning zeros`);
    // For exact matches, return the actual paper dimensions
    return {
      width: paperWidth,
      height: paperHeight
    };
  }
  
  // Otherwise return the easel dimensions
  const result = {
    width: closestEaselSize?.width ?? 0,
    height: closestEaselSize?.height ?? 0
  };
  
  console.log(`Returning easel dimensions:`, result);
  return result;
}

export default useBorderCalculator; 

