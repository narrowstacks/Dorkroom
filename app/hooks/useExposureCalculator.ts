import { useState, useCallback, useEffect } from 'react';

export const useExposureCalculator = () => {
  const [originalTime, setOriginalTime] = useState<string>('10');
  const [newTime, setNewTime] = useState<string>('');
  const [stops, setStops] = useState<string>('1');

  // Round stops to nearest whole or half stop if they're close
  const roundStops = useCallback((value: number) => {
    const tolerance = 0.01; // Threshold for rounding (1%)
    
    // Check if close to whole number
    const nearestWhole = Math.round(value);
    if (Math.abs(value - nearestWhole) <= tolerance) {
      return nearestWhole;
    }
    
    // Check if close to half stop
    const halfStops = [0.5, 1.5, 2.5, -0.5, -1.5, -2.5]; // Common half stops
    for (const halfStop of halfStops) {
      if (Math.abs(value - halfStop) <= tolerance) {
        return halfStop;
      }
    }
    
    return value; // Return original if not close to whole or half
  }, []);

  const calculateNewTime = useCallback((time: number, stopChange: number) => {
    // Formula: newTime = originalTime * 2^stopChange
    return time * Math.pow(2, stopChange);
  }, []);

  const updateExposure = useCallback((time: string, stopChange: number) => {
    const numericTime = parseFloat(time);
    if (isNaN(numericTime) || numericTime <= 0) {
      setNewTime('');
      return;
    }

    const calculatedTime = calculateNewTime(numericTime, stopChange);
    setNewTime(calculatedTime.toFixed(2));
    setStops(stopChange.toString());
  }, [calculateNewTime]);

  // Initialize with default values
  useEffect(() => {
    const defaultTime = '10';
    const defaultStops = 1;
    updateExposure(defaultTime, defaultStops);
  }, [updateExposure]);

  const adjustStops = useCallback((increment: number) => {
    if (!originalTime) return;
    const currentStops = parseFloat(stops);
    const newStops = roundStops(currentStops + increment);
    updateExposure(originalTime, newStops);
  }, [originalTime, stops, updateExposure, roundStops]);

  const handleStopChange = useCallback((value: string) => {
    setStops(value);
    if (!originalTime) return;
    const numericStops = parseFloat(value);
    if (!isNaN(numericStops)) {
      const roundedStops = roundStops(numericStops);
      updateExposure(originalTime, roundedStops);
    }
  }, [originalTime, updateExposure, roundStops]);

  return {
    originalTime,
    setOriginalTime,
    newTime,
    stops,
    setStops: handleStopChange,
    adjustStops,
    updateExposure,
  };
};

export default useExposureCalculator; 