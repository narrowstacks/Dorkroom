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
  const [horizontalOffset, setHorizontalOffset] = useState("0");
  const [verticalOffset, setVerticalOffset] = useState("0");
  const [showBlades, setShowBlades] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [isRatioFlipped, setIsRatioFlipped] = useState(false);
  const [offsetWarning, setOffsetWarning] = useState<string | null>(null);
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

    // Apply orientation
    if (isLandscape) {
      [paperWidth, paperHeight] = [paperHeight, paperWidth];
    }

    // Apply ratio flip
    if (isRatioFlipped) {
      [ratioWidth, ratioHeight] = [ratioHeight, ratioWidth];
    }

    // Calculate print size to fit within paper with minimum borders
    const minBorderValue = parseFloat(minBorder) || 0;
    
    // Apply user offsets if enabled
    let horizontalOffsetValue = enableOffset ? parseFloat(horizontalOffset) || 0 : 0;
    let verticalOffsetValue = enableOffset ? parseFloat(verticalOffset) || 0 : 0;

    const availableWidth = paperWidth - 2 * minBorderValue;
    const availableHeight = paperHeight - 2 * minBorderValue;
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

    // Calculate maximum allowed offsets to maintain minimum borders
    const maxHorizontalOffset = Math.min(
      (paperWidth - printWidth) / 2 - minBorderValue,
      (paperWidth - printWidth) / 2
    );
    const maxVerticalOffset = Math.min(
      (paperHeight - printHeight) / 2 - minBorderValue,
      (paperHeight - printHeight) / 2
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
        "Offset values have been adjusted to maintain minimum borders and stay within paper bounds"
      );
    } else {
      setOffsetWarning(null);
    }

    // Calculate borders
    const leftBorder = (paperWidth - printWidth) / 2 + horizontalOffsetValue;
    const rightBorder = (paperWidth - printWidth) / 2 - horizontalOffsetValue;
    const topBorder = (paperHeight - printHeight) / 2 + verticalOffsetValue;
    const bottomBorder = (paperHeight - printHeight) / 2 - verticalOffsetValue;

    // Calculate preview scaling
    const { width: windowWidth } = Dimensions.get("window");
    const PREVIEW_HEIGHT = 300; // Fixed preview height in pixels
    const previewScale = PREVIEW_HEIGHT / Math.max(paperWidth, paperHeight);
    const previewWidth = PREVIEW_HEIGHT * (paperWidth / paperHeight);
    
    // Calculate percentages for positioning elements
    const printWidthPercent = (printWidth / paperWidth) * 100;
    const printHeightPercent = (printHeight / paperHeight) * 100;
    const leftBorderPercent = (leftBorder / paperWidth) * 100;
    const topBorderPercent = (topBorder / paperHeight) * 100;
    const rightBorderPercent = (rightBorder / paperWidth) * 100;
    const bottomBorderPercent = (bottomBorder / paperHeight) * 100;
    
    // Calculate blade positions
    const leftBladePos = printWidth + leftBorder - rightBorder;
    const rightBladePos = printWidth - leftBorder + rightBorder;
    const topBladePos = printHeight + topBorder - bottomBorder;
    const bottomBladePos = printHeight - topBorder + bottomBorder;

    return {
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      printWidth,
      printHeight,
      paperWidth,
      paperHeight,
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
      bottomBladePos
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
  ]);

  // Preview scaling
  const previewScale = useMemo(() => {
    if (!calculation) return 1;
    const { width } = Dimensions.get("window");
    const maxPreviewWidth = Math.min(width - 32, 400);
    const selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize);
    const paperWidth = isLandscape
      ? selectedPaper?.height ?? (parseFloat(customPaperHeight) || 0)
      : selectedPaper?.width ?? (parseFloat(customPaperWidth) || 0);
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
    clampedHorizontalOffset,
    clampedVerticalOffset,
    // Calculations
    calculation,
    previewScale,
  };
};

export default useBorderCalculator; 