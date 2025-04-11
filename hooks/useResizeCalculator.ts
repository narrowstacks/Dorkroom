import { useState, useEffect, useCallback } from "react";

export const useResizeCalculator = () => {
  const [originalWidth, setOriginalWidth] = useState("4");
  const [originalLength, setOriginalLength] = useState("6");
  const [newWidth, setNewWidth] = useState("6");
  const [newLength, setNewLength] = useState("9");
  const [originalTime, setOriginalTime] = useState("10");
  const [newTime, setNewTime] = useState("");
  const [stopsDifference, setStopsDifference] = useState("");
  const [isAspectRatioMatched, setIsAspectRatioMatched] = useState(true);

  const checkAspectRatio = useCallback(() => {
    const origWidth = parseFloat(originalWidth);
    const origLength = parseFloat(originalLength);
    const newW = parseFloat(newWidth);
    const newL = parseFloat(newLength);

    if (
      isNaN(origWidth) ||
      isNaN(origLength) ||
      isNaN(newW) ||
      isNaN(newL) ||
      origWidth <= 0 ||
      origLength <= 0 ||
      newW <= 0 ||
      newL <= 0
    ) {
      setIsAspectRatioMatched(true); // Or false, depending on desired behavior for invalid input
      return;
    }

    const originalRatio = (origWidth / origLength).toFixed(3);
    const newRatio = (newW / newL).toFixed(3);

    setIsAspectRatioMatched(originalRatio === newRatio);
  }, [originalWidth, originalLength, newWidth, newLength]);

  const calculateExposure = useCallback(() => {
    const origWidth = parseFloat(originalWidth);
    const origLength = parseFloat(originalLength);
    const newW = parseFloat(newWidth);
    const newL = parseFloat(newLength);
    const origTime = parseFloat(originalTime);

    if (
      isNaN(origWidth) ||
      isNaN(origLength) ||
      isNaN(newW) ||
      isNaN(newL) ||
      isNaN(origTime) ||
      origWidth <= 0 ||
      origLength <= 0 ||
      newW <= 0 ||
      newL <= 0 ||
      origTime <= 0
    ) {
      setNewTime("");
      setStopsDifference("");
      checkAspectRatio(); // Still check aspect ratio even if calculation fails
      return;
    }

    const originalArea = origWidth * origLength;
    const newArea = newW * newL;

    if (originalArea <= 0) {
      setNewTime("");
      setStopsDifference("");
      checkAspectRatio();
      return;
    }

    const ratio = newArea / originalArea;
    const newTimeValue = origTime * ratio;
    const stops = Math.log2(ratio);

    setNewTime(newTimeValue.toFixed(1));
    setStopsDifference(stops.toFixed(2));

    checkAspectRatio();
  }, [
    originalWidth,
    originalLength,
    newWidth,
    newLength,
    originalTime,
    checkAspectRatio,
  ]);

  // Calculate exposure time when component mounts with default values
  useEffect(() => {
    calculateExposure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Check aspect ratio when dimensions change
  useEffect(() => {
    checkAspectRatio();
  }, [checkAspectRatio]);

  return {
    originalWidth,
    setOriginalWidth,
    originalLength,
    setOriginalLength,
    newWidth,
    setNewWidth,
    newLength,
    setNewLength,
    originalTime,
    setOriginalTime,
    newTime,
    stopsDifference,
    isAspectRatioMatched,
    calculateExposure, // Expose the function to be called on button press
  };
}; 