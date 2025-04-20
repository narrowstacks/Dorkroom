import { useState, useCallback } from 'react';
import { calculateNewTime, roundStops } from './commonFunctions';

// Helper function to calculate and format the new time
const getCalculatedNewTime = (time: string, stopChange: string): string => {
  const numericTime = parseFloat(time);
  const numericStops = parseFloat(stopChange);

  if (isNaN(numericTime) || numericTime <= 0 || isNaN(numericStops)) {
    return '';
  }

  const calculatedTime = calculateNewTime(numericTime, numericStops);
  return calculatedTime.toFixed(2);
};

export const useExposureCalculator = () => {
  const initialOriginalTime = '10';
  const initialStops = '1';

  const [originalTime, setOriginalTimeState] = useState<string>(initialOriginalTime);
  const [stops, setStopsState] = useState<string>(initialStops);
  // Initialize newTime based on initial values
  const [newTime, setNewTime] = useState<string>(() => getCalculatedNewTime(initialOriginalTime, initialStops));

  // Handler for original time changes
  const handleOriginalTimeChange = useCallback((time: string) => {
    setOriginalTimeState(time);
    setNewTime(getCalculatedNewTime(time, stops)); // Recalculate newTime with current stops
  }, [stops]); // Dependency: stops

  // Handler for direct stop input changes
  const handleStopChange = useCallback((value: string) => {
    setStopsState(value);
    // Recalculate newTime only if the input is a valid number after parsing
    const numericStops = parseFloat(value);
    if (!isNaN(numericStops)) {
        const roundedStops = roundStops(numericStops);
        setStopsState(roundedStops.toString()); // Update state with rounded value
        setNewTime(getCalculatedNewTime(originalTime, roundedStops.toString()));
    } else {
        // If input is not a valid number (e.g., empty string), clear newTime
        setNewTime('');
    }
  }, [originalTime]); // Dependency: originalTime

  // Handler for adjusting stops incrementally
  const adjustStops = useCallback((increment: number) => {
    const currentStops = parseFloat(stops);
     // Avoid calculation if currentStops is NaN (e.g., empty input)
    if (isNaN(currentStops)) return;

    const newStopsValue = roundStops(currentStops + increment);
    const newStopsString = newStopsValue.toString();
    setStopsState(newStopsString);
    setNewTime(getCalculatedNewTime(originalTime, newStopsString)); // Recalculate newTime
  }, [originalTime, stops]); // Dependencies: originalTime, stops

  return {
    originalTime,
    setOriginalTime: handleOriginalTimeChange,
    newTime,
    stops,
    setStops: handleStopChange,
    adjustStops,
    // updateExposure is removed as its logic is integrated
  };
};

export default useExposureCalculator; 