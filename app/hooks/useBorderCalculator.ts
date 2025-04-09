import { useState, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { BorderCalculation } from '../types/border';
import { ASPECT_RATIOS, PAPER_SIZES, EASEL_SIZES } from '../constants/border';

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
    const minBorderValue = parseFloat(minBorder) || 0;
    
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
    const leftBladePos = printWidth + leftBorder - rightBorder + easelWidthOffset;
    const rightBladePos = printWidth - leftBorder + rightBorder - easelWidthOffset;
    const topBladePos = printHeight + topBorder - bottomBorder + easelHeightOffset;
    const bottomBladePos = printHeight - topBorder + bottomBorder - easelHeightOffset;

    // Check if any blade position is under 2 inches
    if (leftBladePos < 2 || rightBladePos < 2 || topBladePos < 2 || bottomBladePos < 2) {
      setBladeWarning("Warning: Most easels do not have markings below 2 inches!");
    } else {
      setBladeWarning(null);
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
    clampedHorizontalOffset,
    clampedVerticalOffset,
    // Calculations
    calculation,
    previewScale,
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

