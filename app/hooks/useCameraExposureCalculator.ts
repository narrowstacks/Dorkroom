import { useState, useCallback, useMemo, useEffect } from 'react';

// Standard aperture values
export const APERTURE_VALUES = [
  '1.0', '1.4', '2.0', '2.8', '4.0', '5.6', '8.0', '11', '16', '22', '32'
];

// Common ISO values
export const ISO_VALUES = [
  '25', '50', '100', '200', '400', '800', '1600', '3200'
];

// Common shutter speed values in seconds
export const SHUTTER_SPEED_VALUES = [
  '1/8000', '1/6000', '1/4000', '1/2000', '1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8', '1/4', '1/2', '1', '2', '4', '8', '15', '30', '60'
];

export type ExposureSetting = 'aperture' | 'iso' | 'shutterSpeed';

export type EquivalentExposure = {
  aperture: string;
  iso: string;
  shutterSpeed: string;
  ev: string;
};

export const useCameraExposureCalculator = () => {
  // Form state with new default values
  const [aperture, setAperture] = useState<string>('5.6');
  const [iso, setIso] = useState<string>('100');
  const [shutterSpeed, setShutterSpeed] = useState<string>('1/250'); // Changed from 1/60 to 1/250
  const [settingToChange, setSettingToChange] = useState<ExposureSetting>('aperture');
  const [newValue, setNewValue] = useState<string>('16'); // Set default to f16

  // Helper function to convert shutter speed to decimal seconds
  const parseShutterSpeed = useCallback((speed: string): number => {
    if (speed.includes('/')) {
      const [numerator, denominator] = speed.split('/').map(Number);
      return numerator / denominator;
    }
    return Number(speed);
  }, []);

  // Helper function to format shutter speed from decimal to fractional if needed
  const formatShutterSpeed = useCallback((seconds: number): string => {
    if (seconds < 1) {
      const fraction = Math.round(1 / seconds);
      return `1/${fraction}`;
    }
    return seconds.toString();
  }, []);

  // Find the closest standard shutter speed value to the calculated seconds
  const findClosestShutterSpeed = useCallback((seconds: number): string => {
    // Convert all standard shutter speeds to decimal seconds for comparison
    const decimalShutterSpeeds = SHUTTER_SPEED_VALUES.map(speed => ({
      original: speed,
      decimal: parseShutterSpeed(speed)
    }));
    
    // Find the closest value
    const closest = decimalShutterSpeeds.reduce((prev, curr) => {
      return Math.abs(curr.decimal - seconds) < Math.abs(prev.decimal - seconds) 
        ? curr 
        : prev;
    });
    
    return closest.original;
  }, [parseShutterSpeed]);

  // Calculate the exposure value (EV) for the current settings
  const calculateEV = useCallback((apertureValue: number, isoValue: number, speedSeconds: number): number => {
    // EV = log2(aperture²) + log2(1/seconds) - log2(ISO/100)
    return Math.log2(Math.pow(apertureValue, 2)) + Math.log2(1 / speedSeconds) - Math.log2(isoValue / 100);
  }, []);

  // Calculate new settings based on the exposure value and the changed setting
  const calculateEquivalentExposure = useMemo((): EquivalentExposure | null => {
    if (!aperture || !iso || !shutterSpeed || !newValue) return null;

    try {
      // Parse current values
      const apertureValue = parseFloat(aperture);
      const isoValue = parseInt(iso);
      const speedSeconds = parseShutterSpeed(shutterSpeed);

      // Calculate the current exposure value
      const currentEV = calculateEV(apertureValue, isoValue, speedSeconds);

      // Calculate new settings based on the setting being changed
      if (settingToChange === 'aperture') {
        const newAperture = parseFloat(newValue);
        
        // New settings
        const newIso = iso;
        // Calculate the exact shutter speed in decimal seconds
        const newSpeedSeconds = speedSeconds * Math.pow(newAperture / apertureValue, 2);
        // Find the closest standard shutter speed
        const standardShutterSpeed = findClosestShutterSpeed(newSpeedSeconds);
        
        return {
          aperture: newValue,
          iso: newIso,
          shutterSpeed: standardShutterSpeed,
          ev: currentEV.toFixed(1)
        };
      } else if (settingToChange === 'iso') {
        const newIsoValue = parseInt(newValue);
        
        // New settings
        const newAperture = aperture;
        // Calculate the exact shutter speed in decimal seconds
        const newSpeedSeconds = speedSeconds * (isoValue / newIsoValue);
        // Find the closest standard shutter speed
        const standardShutterSpeed = findClosestShutterSpeed(newSpeedSeconds);
        
        return {
          aperture: newAperture,
          iso: newValue,
          shutterSpeed: standardShutterSpeed,
          ev: currentEV.toFixed(1)
        };
      } else if (settingToChange === 'shutterSpeed') {
        const newSpeedSeconds = parseShutterSpeed(newValue);
        
        // New settings
        const newAperture = apertureValue * Math.sqrt(speedSeconds / newSpeedSeconds);
        const newIso = iso;
        
        // Round to nearest standard aperture if close
        const closestAperture = APERTURE_VALUES.reduce((prev, curr) => {
          return Math.abs(parseFloat(curr) - newAperture) < Math.abs(parseFloat(prev) - newAperture) 
            ? curr 
            : prev;
        });
        
        return {
          aperture: parseFloat(closestAperture).toFixed(1).replace(/\.0$/, ''),
          iso: newIso,
          shutterSpeed: newValue,
          ev: currentEV.toFixed(1)
        };
      }
    } catch (error) {
      console.log('Error calculating exposure:', error);
    }
    
    return null;
  }, [aperture, iso, shutterSpeed, settingToChange, newValue, parseShutterSpeed, calculateEV, findClosestShutterSpeed]);

  return {
    aperture,
    setAperture,
    iso, 
    setIso,
    shutterSpeed,
    setShutterSpeed,
    settingToChange,
    setSettingToChange,
    newValue,
    setNewValue,
    equivalentExposure: calculateEquivalentExposure
  };
};

export default useCameraExposureCalculator; 