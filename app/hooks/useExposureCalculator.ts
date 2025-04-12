import { useState, useCallback, useEffect } from 'react';
import { calculateNewTime, roundStops } from './commonFunctions';

export const useExposureCalculator = () => {
  const [originalTime, setOriginalTime] = useState<string>('10');
  const [newTime, setNewTime] = useState<string>('');
  const [stops, setStops] = useState<string>('1');

  const updateExposure = useCallback((time: string, stopChange: number) => {
    const numericTime = parseFloat(time);
    if (isNaN(numericTime) || numericTime <= 0) {
      setNewTime('');
      return;
    }

    const calculatedTime = calculateNewTime(numericTime, stopChange);
    setNewTime(calculatedTime.toFixed(2));
    setStops(stopChange.toString());
  }, []);

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
  }, [originalTime, stops, updateExposure]);

  const handleStopChange = useCallback((value: string) => {
    setStops(value);
    if (!originalTime) return;
    const numericStops = parseFloat(value);
    if (!isNaN(numericStops)) {
      const roundedStops = roundStops(numericStops);
      updateExposure(originalTime, roundedStops);
    }
  }, [originalTime, updateExposure]);

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