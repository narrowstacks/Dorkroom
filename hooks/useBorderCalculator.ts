/* ------------------------------------------------------------------ *\
   useBorderCalculator.ts
   -------------------------------------------------------------
   React Hook – UI state + calls into pure geometry helpers
   -------------------------------------------------------------
   Exports:
     - useBorderCalculator (default)
\* ------------------------------------------------------------------ */

import {
  useReducer,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useWindowDimensions } from 'react-native';

import type { BorderCalculation } from '@/types/borderTypes';
import {
  ASPECT_RATIOS,
  PAPER_SIZES,
  EASEL_SIZES,
  PAPER_SIZE_MAP,
  ASPECT_RATIO_MAP,
  EASEL_SIZE_MAP,
} from '@/constants/border';
import {
  calculateBladeThickness,
  findCenteringOffsets,
  computePrintSize,
  clampOffsets,
  bordersFromGaps,
  bladeReadings,
} from '@/utils/borderCalculations';

/* ---------- util helpers ---------------------------------------- */

// Enhanced numeric parser: returns a number only when the string represents a
// *complete* numeric literal (i.e. digits on both sides of the decimal if a
// decimal point is present). This avoids prematurely treating inputs like
// "0." as the number 0, which would otherwise drop the trailing dot and stop
// the user from continuing to type the decimal part on iOS.
const tryNumber = (v: string): number | null => {
  // Matches optional leading minus, digits, optional fractional part with at
  // least one digit after the dot.
  const completeNumberRegex = /^-?\d+(?:\.\d+)?$/;

  if (!completeNumberRegex.test(v)) return null;

  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// Debounce utility for input processing
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// RequestIdleCallback polyfill for React Native
const requestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for React Native
  return setTimeout(callback, 1);
};

/* ---------- types ----------------------------------------------- */

interface State {
  /* inputs */
  aspectRatio: string;
  paperSize: string;
  customAspectWidth: number;
  customAspectHeight: number;
  customPaperWidth: number;
  customPaperHeight: number;
  minBorder: number;
  enableOffset: boolean;
  ignoreMinBorder: boolean;
  horizontalOffset: number;
  verticalOffset: number;
  showBlades: boolean;
  isLandscape: boolean;
  isRatioFlipped: boolean;

  /* warnings & last‑valid tracking */
  offsetWarning: string | null;
  bladeWarning: string | null;
  minBorderWarning: string | null;
  paperSizeWarning: string | null;
  lastValidMinBorder: number;

  /* image‑related */
  selectedImageUri: string | null;
  imageDimensions: { width: number; height: number };
  isCropping: boolean;
  cropOffset: { x: number; y: number };
  cropScale: number;

  /* "last valid" for custom free‑text inputs */
  lastValidCustomAspectWidth: number;
  lastValidCustomAspectHeight: number;
  lastValidCustomPaperWidth: number;
  lastValidCustomPaperHeight: number;
}

/* ---------- reducer actions ------------------------------------- */

type SetFieldAction<K extends keyof State> = {
  type: 'SET_FIELD';
  key: K;
  value: State[K];
};

type Action =
  | SetFieldAction<keyof State>
  | { type: 'SET_PAPER_SIZE'; value: string }
  | { type: 'SET_ASPECT_RATIO'; value: string }
  | { type: 'SET_IMAGE_FIELD'; key: Exclude<keyof State, 'imageDimensions' | 'cropOffset'>; value: any }
  | { type: 'SET_IMAGE_DIMENSIONS'; value: { width: number; height: number } }
  | { type: 'SET_CROP_OFFSET'; value: { x: number; y: number } }
  | { type: 'RESET' }
  | {
      type: 'INTERNAL_UPDATE';
      payload: Partial<Pick<
        State,
        | 'offsetWarning'
        | 'bladeWarning'
        | 'minBorderWarning'
        | 'paperSizeWarning'
        | 'lastValidMinBorder'
      >>;
    }
  | {
      type: 'SET_IMAGE_CROP_DATA';
      payload: Partial<Pick<
        State,
        'selectedImageUri' | 'imageDimensions' | 'isCropping' | 'cropOffset' | 'cropScale'
      >>;
    }
  | {
      type: 'BATCH_UPDATE';
      payload: Partial<State>;
    };

/* ---------- constants ------------------------------------------- */

const DEFAULT_MIN_BORDER = 0.5;
const DEFAULT_CUSTOM_PAPER_WIDTH  = 13;
const DEFAULT_CUSTOM_PAPER_HEIGHT = 10;
const DEFAULT_CUSTOM_ASPECT_WIDTH  = 2;
const DEFAULT_CUSTOM_ASPECT_HEIGHT = 3;

const MAX_EASEL_DIMENSION = EASEL_SIZES
  .reduce((m, e) => Math.max(m, e.width, e.height), 0);

/* ---------- initial state --------------------------------------- */

const initialState: State = {
  aspectRatio: ASPECT_RATIOS[0].value,
  paperSize:   PAPER_SIZES[3].value,

  customAspectWidth:  DEFAULT_CUSTOM_ASPECT_WIDTH,
  customAspectHeight: DEFAULT_CUSTOM_ASPECT_HEIGHT,
  customPaperWidth:   DEFAULT_CUSTOM_PAPER_WIDTH,
  customPaperHeight:  DEFAULT_CUSTOM_PAPER_HEIGHT,

  lastValidCustomAspectWidth:  DEFAULT_CUSTOM_ASPECT_WIDTH,
  lastValidCustomAspectHeight: DEFAULT_CUSTOM_ASPECT_HEIGHT,
  lastValidCustomPaperWidth:   DEFAULT_CUSTOM_PAPER_WIDTH,
  lastValidCustomPaperHeight:  DEFAULT_CUSTOM_PAPER_HEIGHT,

  minBorder: DEFAULT_MIN_BORDER,
  enableOffset: false,
  ignoreMinBorder: false,
  horizontalOffset: 0,
  verticalOffset:   0,
  showBlades: false,
  isLandscape: true,
  isRatioFlipped: false,

  offsetWarning: null,
  bladeWarning: null,
  minBorderWarning: null,
  paperSizeWarning: null,
  lastValidMinBorder: DEFAULT_MIN_BORDER,

  selectedImageUri: null,
  imageDimensions: { width: 0, height: 0 },
  isCropping: false,
  cropOffset: { x: 0, y: 0 },
  cropScale: 1,
};

/* ---------- reducer --------------------------------------------- */

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.key]: action.value };

    case 'SET_PAPER_SIZE': {
      const isCustom = action.value === 'custom';
      return {
        ...state,
        paperSize: action.value,
        isLandscape: !isCustom,
        isRatioFlipped: false,
      };
    }

    case 'SET_ASPECT_RATIO':
      return { ...state, aspectRatio: action.value, isRatioFlipped: false };

    case 'SET_IMAGE_FIELD':
      return { ...state, [action.key]: action.value };

    case 'SET_IMAGE_DIMENSIONS':
      return { ...state, imageDimensions: action.value };

    case 'SET_CROP_OFFSET':
      return { ...state, cropOffset: action.value };

    case 'RESET':
      return { ...initialState };

    case 'INTERNAL_UPDATE':
      return { ...state, ...action.payload };

    case 'SET_IMAGE_CROP_DATA':
      return { ...state, ...action.payload };

    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ *\
   Hook
\* ------------------------------------------------------------------ */

export const useBorderCalculator = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { width: winW, height: winH } = useWindowDimensions();

  /* refs */
  const imageLayoutRef = useRef({ width: 0, height: 0 });
  const warningTimeouts = useRef<{
    offset: NodeJS.Timeout | null;
    blade: NodeJS.Timeout | null;
    minBorder: NodeJS.Timeout | null;
    paperSize: NodeJS.Timeout | null;
  }>({
    offset: null,
    blade: null,
    minBorder: null,
    paperSize: null,
  });

  /* -------- Step 1 : derive numeric inputs ---------------------- */

  // Split into smaller memos for better performance
  const paperEntry = useMemo(() => {
    if (state.paperSize === 'custom') {
      return {
        w: state.lastValidCustomPaperWidth,
        h: state.lastValidCustomPaperHeight,
        custom: true,
      };
    }
    
    // Use O(1) lookup instead of linear search
    const p = PAPER_SIZE_MAP[state.paperSize];
    if (!p) {
      console.warn(`Unknown paper size: ${state.paperSize}`);
      return { w: 8, h: 10, custom: false }; // fallback to 8x10
    }
    return { w: p.width, h: p.height, custom: false };
  }, [state.paperSize, state.lastValidCustomPaperWidth, state.lastValidCustomPaperHeight]);

  const paperSizeWarning = useMemo(() => {
    return paperEntry.custom &&
      (paperEntry.w > MAX_EASEL_DIMENSION || paperEntry.h > MAX_EASEL_DIMENSION)
        ? `Custom paper (${paperEntry.w}×${paperEntry.h}) exceeds largest standard easel (20×24").`
        : null;
  }, [paperEntry]);

  const ratioEntry = useMemo(() => {
    if (state.aspectRatio === 'custom') {
      return {
        w: state.lastValidCustomAspectWidth,
        h: state.lastValidCustomAspectHeight,
      };
    }
    
    // Use O(1) lookup instead of linear search
    const r = ASPECT_RATIO_MAP[state.aspectRatio];
    if (!r) {
      console.warn(`Unknown aspect ratio: ${state.aspectRatio}`);
      return { w: 3, h: 2 }; // fallback to 3:2
    }
    return { w: r.width || 1, h: r.height || 1 };
  }, [state.aspectRatio, state.lastValidCustomAspectWidth, state.lastValidCustomAspectHeight]);

  const orientedDimensions = useMemo(() => {
    const orientedPaper = state.isLandscape
      ? { w: paperEntry.h, h: paperEntry.w }
      : { w: paperEntry.w, h: paperEntry.h };

    const orientedRatio = state.isRatioFlipped
      ? { w: ratioEntry.h, h: ratioEntry.w }
      : { w: ratioEntry.w, h: ratioEntry.h };

    return { orientedPaper, orientedRatio };
  }, [paperEntry, ratioEntry, state.isLandscape, state.isRatioFlipped]);

  const minBorderData = useMemo(() => {
    const { orientedPaper } = orientedDimensions;
    const maxBorder = Math.min(orientedPaper.w, orientedPaper.h) / 2;
    let minBorder = state.minBorder;
    let minBorderWarning: string | null = null;
    let lastValid = state.lastValidMinBorder;

    if (minBorder >= maxBorder && maxBorder > 0) {
      minBorderWarning = `Minimum border too large; using ${state.lastValidMinBorder}.`;
      minBorder = state.lastValidMinBorder;
    } else if (minBorder < 0) {
      minBorderWarning = `Border cannot be negative; using ${state.lastValidMinBorder}.`;
      minBorder = state.lastValidMinBorder;
    } else {
      lastValid = minBorder;
    }

    return { minBorder, minBorderWarning, lastValid };
  }, [orientedDimensions, state.minBorder, state.lastValidMinBorder]);

  /* -------- Step 2 : preview scale (depends only on size + win) -- */

  const previewScale = useMemo(() => {
    const { w, h } = orientedDimensions.orientedPaper;
    if (!w || !h) return 1;
    const maxW = Math.min(winW * 0.9, 400);
    const maxH = Math.min(winH * 0.5, 400);
    return Math.min(maxW / w, maxH / h);
  }, [orientedDimensions.orientedPaper, winW, winH]);

  /* -------- Step 3 : split heavy geometry calculations ----------- */

  // Step 3a: Print size calculation
  const printSize = useMemo(() => {
    const { orientedPaper, orientedRatio } = orientedDimensions;
    const { minBorder } = minBorderData;

    return computePrintSize(
      orientedPaper.w,
      orientedPaper.h,
      orientedRatio.w,
      orientedRatio.h,
      minBorder,
    );
  }, [orientedDimensions, minBorderData]);

  // Step 3b: Offset calculations
  const offsetData = useMemo(() => {
    const { orientedPaper } = orientedDimensions;
    const { minBorder } = minBorderData;
    const { printW, printH } = printSize;

    return clampOffsets(
      orientedPaper.w,
      orientedPaper.h,
      printW,
      printH,
      minBorder,
      state.enableOffset ? state.horizontalOffset : 0,
      state.enableOffset ? state.verticalOffset   : 0,
      state.ignoreMinBorder,
    );
  }, [orientedDimensions, minBorderData, printSize, state.enableOffset, state.horizontalOffset, state.verticalOffset, state.ignoreMinBorder]);

  // Step 3c: Border calculations
  const borders = useMemo(() => {
    const { halfW, halfH, h: offH, v: offV } = offsetData;
    return bordersFromGaps(halfW, halfH, offH, offV);
  }, [offsetData]);

  // Step 3d: Easel fitting calculations
  const easelData = useMemo(() => {
    return findCenteringOffsets(
      paperEntry.w,
      paperEntry.h,
      state.isLandscape,
    );
  }, [paperEntry, state.isLandscape]);

  // Step 3e: Paper shift calculations
  const paperShift = useMemo(() => {
    const { orientedPaper } = orientedDimensions;
    const { effectiveSlot, isNonStandardPaperSize } = easelData;

    const spX = isNonStandardPaperSize
      ? (orientedPaper.w - effectiveSlot.width) / 2
      : 0;
    const spY = isNonStandardPaperSize
      ? (orientedPaper.h - effectiveSlot.height) / 2
      : 0;

    return { spX, spY };
  }, [orientedDimensions, easelData]);

  // Step 3f: Blade readings and warnings
  const bladeData = useMemo(() => {
    const { printW, printH } = printSize;
    const { h: offH, v: offV } = offsetData;
    const { spX, spY } = paperShift;

    const blades = bladeReadings(
      printW,
      printH,
      spX + offH,
      spY + offV,
    );

    let bladeWarning: string | null = null;
    const values = Object.values(blades);
    if (values.some(v => v < 0))
      bladeWarning = 'Negative blade reading – use opposite side of scale.';
    if (values.some(v => Math.abs(v) < 3 && v !== 0))
      bladeWarning = (bladeWarning ? bladeWarning + '\n' : '') +
        'Many easels have no markings below about 3 in.';

    return { blades, bladeWarning };
  }, [printSize, offsetData, paperShift]);

  // Step 3g: Final calculation assembly
  const calc = useMemo(() => {
    const { orientedPaper } = orientedDimensions;
    const { printW, printH } = printSize;
    const { h: offH, v: offV, warning: offsetWarning } = offsetData;
    const { easelSize, isNonStandardPaperSize } = easelData;
    const { blades, bladeWarning } = bladeData;

    const res: BorderCalculation & {
      offsetWarning: string | null;
      bladeWarning: string | null;
      minBorderWarning: string | null;
      paperSizeWarning: string | null;
      lastValidMinBorder: number;
      clampedHorizontalOffset: number;
      clampedVerticalOffset: number;
      previewScale: number;
      previewWidth: number;
      previewHeight: number;
      easelSizeLabel: string;
    } = {
      leftBorder: borders.left,
      rightBorder: borders.right,
      topBorder: borders.top,
      bottomBorder: borders.bottom,

      printWidth:  printW,
      printHeight: printH,
      paperWidth:  orientedPaper.w,
      paperHeight: orientedPaper.h,

      printWidthPercent:  orientedPaper.w ? (printW / orientedPaper.w) * 100 : 0,
      printHeightPercent: orientedPaper.h ? (printH / orientedPaper.h) * 100 : 0,
      leftBorderPercent:  orientedPaper.w ? (borders.left  / orientedPaper.w) * 100 : 0,
      rightBorderPercent: orientedPaper.w ? (borders.right / orientedPaper.w) * 100 : 0,
      topBorderPercent:   orientedPaper.h ? (borders.top   / orientedPaper.h) * 100 : 0,
      bottomBorderPercent:orientedPaper.h ? (borders.bottom/ orientedPaper.h) * 100 : 0,

      leftBladeReading:  blades.left,
      rightBladeReading: blades.right,
      topBladeReading:   blades.top,
      bottomBladeReading:blades.bottom,
      bladeThickness: calculateBladeThickness(orientedPaper.w, orientedPaper.h),

      isNonStandardPaperSize:
        isNonStandardPaperSize && !paperSizeWarning,

      easelSize,
      easelSizeLabel:
        (EASEL_SIZE_MAP[`${easelSize.width}×${easelSize.height}`]?.label) ??
        `${easelSize.width}×${easelSize.height}`,

      offsetWarning,
      bladeWarning,
      minBorderWarning: minBorderData.minBorder !== state.minBorder
        ? minBorderData.minBorderWarning
        : null,
      paperSizeWarning: paperSizeWarning,
      lastValidMinBorder: minBorderData.lastValid,
      clampedHorizontalOffset: offH,
      clampedVerticalOffset:   offV,

      previewScale,
      previewWidth:  orientedPaper.w * previewScale,
      previewHeight: orientedPaper.h * previewScale,
    };

    return res;
  }, [orientedDimensions, printSize, offsetData, easelData, bladeData, borders, minBorderData, paperSizeWarning, previewScale]);

  /* -------- Step 4 : debounced warning updates to prevent flashing ---- */

  const debouncedWarningUpdate = useCallback((
    warningType: keyof typeof warningTimeouts.current,
    newValue: string | null,
    currentValue: string | null,
    stateKey: keyof State
  ) => {
    // Clear existing timeout
    if (warningTimeouts.current[warningType]) {
      clearTimeout(warningTimeouts.current[warningType]!);
    }

    // If warning is being cleared (newValue is null), update immediately
    if (newValue === null && currentValue !== null) {
      dispatch({ type: 'SET_FIELD', key: stateKey, value: null });
      return;
    }

    // If warning is appearing or changing, debounce it
    if (newValue !== currentValue) {
      warningTimeouts.current[warningType] = setTimeout(() => {
        dispatch({ type: 'SET_FIELD', key: stateKey, value: newValue });
      }, 250); // 250ms debounce for warning appearance
    }
  }, []);

  useEffect(() => {
    // Handle each warning type with debouncing
    debouncedWarningUpdate('offset', calc.offsetWarning, state.offsetWarning, 'offsetWarning');
    debouncedWarningUpdate('blade', calc.bladeWarning, state.bladeWarning, 'bladeWarning');
    debouncedWarningUpdate('minBorder', calc.minBorderWarning, state.minBorderWarning, 'minBorderWarning');
    debouncedWarningUpdate('paperSize', calc.paperSizeWarning, state.paperSizeWarning, 'paperSizeWarning');

    // Update lastValidMinBorder immediately (not a UI warning)
    if (calc.lastValidMinBorder !== state.lastValidMinBorder) {
      dispatch({ type: 'SET_FIELD', key: 'lastValidMinBorder', value: calc.lastValidMinBorder });
    }

    // Cleanup timeouts on unmount
    return () => {
      Object.values(warningTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [calc, state.offsetWarning, state.bladeWarning, state.minBorderWarning, state.paperSizeWarning, state.lastValidMinBorder, debouncedWarningUpdate]);

  /* -------- optimized setter callbacks with debouncing ----------- */

  const setCustomDimensionField = useCallback((
    key: keyof State,
    lastKey: keyof State,
    v: string,
  ) => {
    dispatch({ type: 'SET_FIELD', key, value: v });
    const num = tryNumber(v);
    if (num && num > 0)
      dispatch({ type: 'SET_FIELD', key: lastKey, value: num });
  }, []);

  // Debounced numeric field setter for better performance
  const debouncedNumericFieldSetter = useCallback(
    debounce((key: keyof State, v: string) => {
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
    []
  );

  const setNumericField = useCallback((
    key: keyof State,
    v: string,
  ) => {
    // For immediate UI feedback, allow the input to update immediately
    // but debounce the actual number parsing and validation
    if (/^-?\d*\.?\d*$/.test(v) || v === '') {
      dispatch({ type: 'SET_FIELD', key, value: v });
    }
    
    // Debounce the heavy number validation
    debouncedNumericFieldSetter(key, v);
  }, [debouncedNumericFieldSetter]);

  const setImageLayout = useCallback((
    l: { width: number; height: number },
  ) => { imageLayoutRef.current = l; }, []);

  /* =============================================================== *
     Public API
  * =============================================================== */

  return {
    /* primitive state values */
    aspectRatio: state.aspectRatio,
    paperSize:   state.paperSize,
    customAspectWidth:  state.customAspectWidth,
    customAspectHeight: state.customAspectHeight,
    customPaperWidth:   state.customPaperWidth,
    customPaperHeight:  state.customPaperHeight,
    minBorder: state.minBorder,
    enableOffset: state.enableOffset,
    ignoreMinBorder: state.ignoreMinBorder,
    horizontalOffset: state.horizontalOffset,
    verticalOffset: state.verticalOffset,
    showBlades: state.showBlades,
    isLandscape: state.isLandscape,
    isRatioFlipped: state.isRatioFlipped,

    /* warnings */
    offsetWarning: state.offsetWarning,
    bladeWarning:  state.bladeWarning,
    minBorderWarning: state.minBorderWarning,
    paperSizeWarning: state.paperSizeWarning,
    clampedHorizontalOffset: calc.clampedHorizontalOffset,
    clampedVerticalOffset:   calc.clampedVerticalOffset,

    /* image‑related */
    selectedImageUri: state.selectedImageUri,
    imageDimensions:  state.imageDimensions,
    isCropping:       state.isCropping,
    cropOffset:       state.cropOffset,
    cropScale:        state.cropScale,
    imageLayout:      imageLayoutRef.current,

    /* geometry results */
    calculation: {
      leftBorder:   calc.leftBorder,
      rightBorder:  calc.rightBorder,
      topBorder:    calc.topBorder,
      bottomBorder: calc.bottomBorder,
      printWidth:   calc.printWidth,
      printHeight:  calc.printHeight,
      paperWidth:   calc.paperWidth,
      paperHeight:  calc.paperHeight,

      printWidthPercent:  calc.printWidthPercent,
      printHeightPercent: calc.printHeightPercent,
      leftBorderPercent:  calc.leftBorderPercent,
      rightBorderPercent: calc.rightBorderPercent,
      topBorderPercent:   calc.topBorderPercent,
      bottomBorderPercent:calc.bottomBorderPercent,

      leftBladeReading:  calc.leftBladeReading,
      rightBladeReading: calc.rightBladeReading,
      topBladeReading:   calc.topBladeReading,
      bottomBladeReading:calc.bottomBladeReading,
      bladeThickness:    calc.bladeThickness,

      isNonStandardPaperSize: calc.isNonStandardPaperSize,
      easelSize:              calc.easelSize,
      easelSizeLabel:         calc.easelSizeLabel,

      previewScale:  calc.previewScale,
      previewWidth:  calc.previewWidth,
      previewHeight: calc.previewHeight,
    } as BorderCalculation,

    /* setters (memoised with useCallback) */
    setAspectRatio:  useCallback((v: string) =>
      dispatch({ type: 'SET_ASPECT_RATIO', value: v }), []),

    setPaperSize:    useCallback((v: string) =>
      dispatch({ type: 'SET_PAPER_SIZE', value: v }), []),

    setCustomAspectWidth:  useCallback((v: string) =>
      setCustomDimensionField('customAspectWidth',  'lastValidCustomAspectWidth',  v), [setCustomDimensionField]),

    setCustomAspectHeight: useCallback((v: string) =>
      setCustomDimensionField('customAspectHeight', 'lastValidCustomAspectHeight', v), [setCustomDimensionField]),

    setCustomPaperWidth:   useCallback((v: string) =>
      setCustomDimensionField('customPaperWidth',   'lastValidCustomPaperWidth',   v), [setCustomDimensionField]),

    setCustomPaperHeight:  useCallback((v: string) =>
      setCustomDimensionField('customPaperHeight',  'lastValidCustomPaperHeight',  v), [setCustomDimensionField]),

    setMinBorder:          useCallback((v: string) =>
      setNumericField('minBorder', v), [setNumericField]),

    setEnableOffset:       useCallback((v: boolean) =>
      dispatch({ type: 'SET_FIELD', key: 'enableOffset', value: v }), []),

    setIgnoreMinBorder:    useCallback((v: boolean) =>
      dispatch({ type: 'SET_FIELD', key: 'ignoreMinBorder', value: v }), []),

    setHorizontalOffset:   useCallback((v: string) =>
      setNumericField('horizontalOffset', v), [setNumericField]),

    setVerticalOffset:     useCallback((v: string) =>
      setNumericField('verticalOffset', v), [setNumericField]),

    setShowBlades:         useCallback((v: boolean) =>
      dispatch({ type: 'SET_FIELD', key: 'showBlades', value: v }), []),

    setIsLandscape:        useCallback((v: boolean) =>
      dispatch({ type: 'SET_FIELD', key: 'isLandscape', value: v }), []),

    setIsRatioFlipped:     useCallback((v: boolean) =>
      dispatch({ type: 'SET_FIELD', key: 'isRatioFlipped', value: v }), []),

    /* image setters */
    setSelectedImageUri: useCallback((v: string | null) =>
      dispatch({ type: 'SET_IMAGE_FIELD', key: 'selectedImageUri', value: v }), []),

    setImageDimensions: useCallback((v: { width: number; height: number }) =>
      dispatch({ type: 'SET_IMAGE_DIMENSIONS', value: v }), []),

    setIsCropping: useCallback((v: boolean) =>
      dispatch({ type: 'SET_IMAGE_FIELD', key: 'isCropping', value: v }), []),

    setCropOffset: useCallback((v: { x: number; y: number }) =>
      dispatch({ type: 'SET_CROP_OFFSET', value: v }), []),

    setCropScale: useCallback((v: number) =>
      dispatch({ type: 'SET_IMAGE_FIELD', key: 'cropScale', value: v }), []),

    setImageLayout,

    applyPreset: useCallback((p: Partial<State>) =>
      dispatch({ type: 'BATCH_UPDATE', payload: p }), []),

    /* reset */
    resetToDefaults: useCallback(() =>
      dispatch({ type: 'RESET' }), []),
  };
};

export default useBorderCalculator;