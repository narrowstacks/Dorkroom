/* ------------------------------------------------------------------ *\
   useInputHandlers.ts
   -------------------------------------------------------------
   Hook for input validation and debounced field handlers
   -------------------------------------------------------------
   Exports:
     - useInputHandlers: Input validation and setter functions
\* ------------------------------------------------------------------ */

import { useCallback } from 'react';
import { tryNumber, debounce } from '../utils/inputValidation';
import type { BorderCalculatorState } from './types';

export const useInputHandlers = (
  state: BorderCalculatorState,
  dispatch: (action: any) => void
) => {
  // Debounced numeric field setter for better performance
  const debouncedNumericFieldSetter = useCallback(
    debounce((key: keyof BorderCalculatorState, v: string) => {
      const num = tryNumber(v);

      if (num !== null) {
        // The user has entered a complete number – store it as a number.
        dispatch({ type: 'SET_FIELD', key, value: num });
        return;
      }

      // Allow "in-progress" numeric strings such as "", "-", ".", "0.", "-."
      // so the user can keep typing without the input being overridden.
      if (/^-?\d*\.?$/.test(v)) {
        dispatch({ type: 'SET_FIELD', key, value: v });
      }
    }, 150), // 150ms debounce for better responsiveness
    [dispatch]
  );

  const setNumericField = useCallback((
    key: keyof BorderCalculatorState,
    v: string,
  ) => {
    // For immediate UI feedback, allow the input to update immediately
    // but debounce the actual number parsing and validation
    if (/^-?\d*\.?\d*$/.test(v) || v === '') {
      dispatch({ type: 'SET_FIELD', key, value: v });
    }
    
    // Debounce the heavy number validation
    debouncedNumericFieldSetter(key, v);
  }, [debouncedNumericFieldSetter, dispatch]);

  const setCustomDimensionField = useCallback((
    key: keyof BorderCalculatorState,
    lastKey: keyof BorderCalculatorState,
    v: string,
  ) => {
    dispatch({ type: 'SET_FIELD', key, value: v });
    const num = tryNumber(v);
    if (num && num > 0)
      dispatch({ type: 'SET_FIELD', key: lastKey, value: num });
  }, [dispatch]);

  // Basic field setters
  const setAspectRatio = useCallback((v: string) =>
    dispatch({ type: 'SET_ASPECT_RATIO', value: v }), [dispatch]);

  const setPaperSize = useCallback((v: string) =>
    dispatch({ type: 'SET_PAPER_SIZE', value: v }), [dispatch]);

  // Custom dimension setters
  const setCustomAspectWidth = useCallback((v: string) =>
    setCustomDimensionField('customAspectWidth', 'lastValidCustomAspectWidth', v), [setCustomDimensionField]);

  const setCustomAspectHeight = useCallback((v: string) =>
    setCustomDimensionField('customAspectHeight', 'lastValidCustomAspectHeight', v), [setCustomDimensionField]);

  const setCustomPaperWidth = useCallback((v: string) =>
    setCustomDimensionField('customPaperWidth', 'lastValidCustomPaperWidth', v), [setCustomDimensionField]);

  const setCustomPaperHeight = useCallback((v: string) =>
    setCustomDimensionField('customPaperHeight', 'lastValidCustomPaperHeight', v), [setCustomDimensionField]);

  // Numeric field setters
  const setMinBorder = useCallback((v: string) =>
    setNumericField('minBorder', v), [setNumericField]);

  const setHorizontalOffset = useCallback((v: string) =>
    setNumericField('horizontalOffset', v), [setNumericField]);

  const setVerticalOffset = useCallback((v: string) =>
    setNumericField('verticalOffset', v), [setNumericField]);

  // Boolean field setters
  const setEnableOffset = useCallback((v: boolean) =>
    dispatch({ type: 'SET_FIELD', key: 'enableOffset', value: v }), [dispatch]);

  const setIgnoreMinBorder = useCallback((v: boolean) =>
    dispatch({ type: 'SET_FIELD', key: 'ignoreMinBorder', value: v }), [dispatch]);

  const setShowBlades = useCallback((v: boolean) =>
    dispatch({ type: 'SET_FIELD', key: 'showBlades', value: v }), [dispatch]);

  const setIsLandscape = useCallback((v: boolean) =>
    dispatch({ type: 'SET_FIELD', key: 'isLandscape', value: v }), [dispatch]);

  const setIsRatioFlipped = useCallback((v: boolean) =>
    dispatch({ type: 'SET_FIELD', key: 'isRatioFlipped', value: v }), [dispatch]);

  // Utility actions
  const applyPreset = useCallback((preset: Partial<BorderCalculatorState>) =>
    dispatch({ type: 'BATCH_UPDATE', payload: preset }), [dispatch]);

  const resetToDefaults = useCallback(() =>
    dispatch({ type: 'RESET' }), [dispatch]);

  return {
    // Basic setters
    setAspectRatio,
    setPaperSize,

    // Custom dimension setters
    setCustomAspectWidth,
    setCustomAspectHeight,
    setCustomPaperWidth,
    setCustomPaperHeight,

    // Numeric field setters
    setMinBorder,
    setHorizontalOffset,
    setVerticalOffset,

    // Boolean field setters
    setEnableOffset,
    setIgnoreMinBorder,
    setShowBlades,
    setIsLandscape,
    setIsRatioFlipped,

    // Utility actions
    applyPreset,
    resetToDefaults,
  };
}; 