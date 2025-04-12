import { useState, useMemo } from 'react';
import { FILM_TYPES } from '../constants/reciprocity';
import { ReciprocityCalculation } from '../types/reciprocity';
import { formatTime, parseTimeInput } from './commonFunctions';

// Maximum width for visual representation of time bars in pixels
const MAX_BAR_WIDTH = 300;

export const useReciprocityCalculator = () => {
  // Form state
  const [filmType, setFilmType] = useState(FILM_TYPES[0].value);
  const [meteredTime, setMeteredTime] = useState('');
  const [customFactor, setCustomFactor] = useState('1.3');
  const [formattedTime, setFormattedTime] = useState<string | null>(null);
  const [timeFormatError, setTimeFormatError] = useState<string | null>(null);

  // Format time input when it changes
  const handleTimeChange = (text: string) => {
    setMeteredTime(text);
    setTimeFormatError(null);
    
    const parsedSeconds = parseTimeInput(text);
    if (parsedSeconds !== null) {
      setFormattedTime(formatTime(parsedSeconds));
    } else if (text.trim()) {
      setTimeFormatError('Invalid time format. Try: 30s, 1m30s, 1h15m');
      setFormattedTime(null);
    } else {
      setFormattedTime(null);
    }
  };

  // Calculate the reciprocity failure compensation
  const calculation = useMemo<ReciprocityCalculation | null>(() => {
    // Get the parsed original time
    const originalTime = parseTimeInput(meteredTime);
    if (!originalTime || originalTime <= 0) return null;
    
    // Get the reciprocity factor
    let factor = 1;
    let filmName = '';
    
    if (filmType === 'custom') {
      factor = parseFloat(customFactor) || 1;
      filmName = 'Custom';
    } else {
      const selectedFilm = FILM_TYPES.find(film => film.value === filmType);
      if (selectedFilm) {
        factor = selectedFilm.factor || 1;
        filmName = selectedFilm.label;
      }
    }
    
    // Calculate adjusted time using the power function
    const adjustedTime = Math.pow(originalTime, factor);
    
    // Calculate percentage increase
    const percentageIncrease = ((adjustedTime - originalTime) / originalTime) * 100;
    
    // Calculate visual bar widths, logarithmically scaled for better visualization
    const logScale = (time: number) => Math.min(MAX_BAR_WIDTH, 
      Math.log(time + 1) / Math.log(Math.max(adjustedTime, 10) + 1) * MAX_BAR_WIDTH);
    
    const timeBarWidth = logScale(originalTime);
    const adjustedTimeBarWidth = logScale(adjustedTime);
    
    return {
      originalTime,
      adjustedTime,
      factor,
      filmName,
      percentageIncrease,
      timeBarWidth,
      adjustedTimeBarWidth
    };
  }, [filmType, meteredTime, customFactor]);

  return {
    filmType,
    setFilmType,
    meteredTime,
    setMeteredTime: handleTimeChange,
    customFactor,
    setCustomFactor,
    formattedTime,
    timeFormatError,
    calculation,
    formatTime
  };
};

export default useReciprocityCalculator; 