/**
 * Common functions shared between hooks
 */

// Time and Exposure Calculations
export const calculateNewTime = (time: number, stopChange: number): number => {
  // Formula: newTime = originalTime * 2^stopChange
  return time * Math.pow(2, stopChange);
};

export const roundStops = (value: number): number => {
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
};

// Shutter Speed Parsing/Formatting
export const parseShutterSpeed = (speed: string): number => {
  if (speed.includes('/')) {
    const [numerator, denominator] = speed.split('/').map(Number);
    return numerator / denominator;
  }
  return Number(speed);
};

export const formatShutterSpeed = (seconds: number): string => {
  if (seconds < 1) {
    const fraction = Math.round(1 / seconds);
    return `1/${fraction}`;
  }
  return seconds.toString();
};

// EV Calculations
export const calculateEV = (
  apertureValue: number, 
  isoValue: number, 
  speedSeconds: number
): number => {
  // EV = log2(aperture²) + log2(1/seconds) - log2(ISO/100)
  return Math.log2(Math.pow(apertureValue, 2)) + Math.log2(1 / speedSeconds) - Math.log2(isoValue / 100);
};

// Time formatting
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds * 10) / 10} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round((seconds % 60) * 10) / 10;
    return remainingSeconds === 0 
      ? `${minutes} minutes` 
      : `${minutes} minutes ${remainingSeconds} seconds`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes === 0 
      ? `${hours} hours` 
      : `${hours} hours ${minutes} minutes`;
  }
};

export const parseTimeInput = (input: string): number | null => {
  // Clean up the input
  const cleaned = input.toLowerCase().trim();
  
  // If input is just a number, assume it's seconds
  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    return parseFloat(cleaned);
  }
  
  // Try to parse complex time formats
  let seconds = 0;
  let valid = false;
  
  // Extract hours
  const hourMatch = cleaned.match(/(\d+(\.\d+)?)\s*h/);
  if (hourMatch) {
    seconds += parseFloat(hourMatch[1]) * 3600;
    valid = true;
  }
  
  // Extract minutes
  const minuteMatch = cleaned.match(/(\d+(\.\d+)?)\s*m(?!s)/);
  if (minuteMatch) {
    seconds += parseFloat(minuteMatch[1]) * 60;
    valid = true;
  }
  
  // Extract seconds
  const secondMatch = cleaned.match(/(\d+(\.\d+)?)\s*s/);
  if (secondMatch) {
    seconds += parseFloat(secondMatch[1]);
    valid = true;
  }
  
  return valid ? seconds : null;
};

// Generic helper to find the closest value in an array
export const findClosestValue = <T extends string | number>(
  value: number, 
  options: T[], 
  valueConverter: (opt: T) => number = (opt) => typeof opt === 'number' ? opt : parseFloat(opt as string)
): T => {
  return options.reduce((prev, curr) => {
    return Math.abs(valueConverter(curr) - value) < Math.abs(valueConverter(prev) - value) 
      ? curr 
      : prev;
  });
};

// Border calculator helpers
export const calculateBladeThickness = (
  paperWidth: number, 
  paperHeight: number, 
  basePaperArea: number = 20 * 24, 
  baseThickness: number = 2
): number => {
  const paperArea = paperWidth * paperHeight;
  const scaleFactor = basePaperArea / paperArea;
  // Cap the maximum scale factor to avoid too thick blades
  const cappedScale = Math.min(scaleFactor, 2);
  return Math.round(baseThickness * cappedScale);
}; 