import { useState, useMemo } from "react";

interface BorderCalculation {
  paperWidth: number;
  paperHeight: number;
  printWidth: number;
  printHeight: number;
  leftBorder: number;
  rightBorder: number;
  topBorder: number;
  bottomBorder: number;
}

export function useBorderCalculator() {
  const [aspectRatio, setAspectRatio] = useState("3/2");
  const [paperSize, setPaperSize] = useState("8x10");
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

  const calculation = useMemo<BorderCalculation | null>(() => {
    // Get paper dimensions
    let paperWidth = 0;
    let paperHeight = 0;
    if (paperSize === "custom") {
      paperWidth = parseFloat(customPaperWidth) || 0;
      paperHeight = parseFloat(customPaperHeight) || 0;
    } else {
      const [w, h] = paperSize.split("x").map(Number);
      paperWidth = w;
      paperHeight = h;
    }

    // Get aspect ratio
    let aspectWidth = 0;
    let aspectHeight = 0;
    if (aspectRatio === "custom") {
      aspectWidth = parseFloat(customAspectWidth) || 0;
      aspectHeight = parseFloat(customAspectHeight) || 0;
    } else {
      const [w, h] = aspectRatio.split("/").map(Number);
      aspectWidth = w;
      aspectHeight = h;
    }

    if (!paperWidth || !paperHeight || !aspectWidth || !aspectHeight) {
      return null;
    }

    // Apply orientation
    if (isLandscape) {
      [paperWidth, paperHeight] = [paperHeight, paperWidth];
    }

    // Apply ratio flip
    if (isRatioFlipped) {
      [aspectWidth, aspectHeight] = [aspectHeight, aspectWidth];
    }

    // Calculate print size to fit within paper with minimum borders
    const minBorderValue = parseFloat(minBorder) || 0;
    const maxPrintWidth = paperWidth - 2 * minBorderValue;
    const maxPrintHeight = paperHeight - 2 * minBorderValue;
    const paperAspectRatio = maxPrintWidth / maxPrintHeight;
    const imageAspectRatio = aspectWidth / aspectHeight;

    let printWidth: number;
    let printHeight: number;

    if (imageAspectRatio > paperAspectRatio) {
      // Image is wider than paper
      printWidth = maxPrintWidth;
      printHeight = printWidth / imageAspectRatio;
    } else {
      // Image is taller than paper
      printHeight = maxPrintHeight;
      printWidth = printHeight * imageAspectRatio;
    }

    // Calculate borders
    const rawHorizontalBorder = (paperWidth - printWidth) / 2;
    const rawVerticalBorder = (paperHeight - printHeight) / 2;

    // Apply offsets if enabled
    let leftBorder = rawHorizontalBorder;
    let rightBorder = rawHorizontalBorder;
    let topBorder = rawVerticalBorder;
    let bottomBorder = rawVerticalBorder;

    if (enableOffset) {
      const hOffset = parseFloat(horizontalOffset) || 0;
      const vOffset = parseFloat(verticalOffset) || 0;

      leftBorder += hOffset;
      rightBorder -= hOffset;
      topBorder += vOffset;
      bottomBorder -= vOffset;
    }

    return {
      paperWidth,
      paperHeight,
      printWidth,
      printHeight,
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
    };
  }, [
    aspectRatio,
    customAspectWidth,
    customAspectHeight,
    paperSize,
    customPaperWidth,
    customPaperHeight,
    minBorder,
    enableOffset,
    horizontalOffset,
    verticalOffset,
    isLandscape,
    isRatioFlipped,
  ]);

  // Calculate warning messages for offsets
  const offsetWarning = useMemo(() => {
    if (!enableOffset || !calculation) return null;

    const hOffset = parseFloat(horizontalOffset) || 0;
    const vOffset = parseFloat(verticalOffset) || 0;

    // Calculate the position of the print area edges
    const leftEdge = calculation.leftBorder;
    const rightEdge = calculation.paperWidth - calculation.rightBorder;
    const topEdge = calculation.topBorder;
    const bottomEdge = calculation.paperHeight - calculation.bottomBorder;

    // Check if any edge is outside the paper bounds
    if (
      leftEdge < 0 ||
      rightEdge > calculation.paperWidth ||
      topEdge < 0 ||
      bottomEdge > calculation.paperHeight
    ) {
      return "Warning: Photo extends beyond paper edges";
    }

    return null;
  }, [calculation, enableOffset, horizontalOffset, verticalOffset]);

  // Calculate preview scale
  const previewScale = useMemo(() => {
    if (!calculation) return 1;

    const maxPreviewWidth = 400;
    const maxPreviewHeight = 400;
    const scaleX = maxPreviewWidth / calculation.paperWidth;
    const scaleY = maxPreviewHeight / calculation.paperHeight;
    return Math.min(scaleX, scaleY);
  }, [calculation]);

  return {
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
    calculation,
    previewScale,
  };
} 