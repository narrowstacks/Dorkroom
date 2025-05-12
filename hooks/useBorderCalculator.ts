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

const tryNumber = (v: string): number | null => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

/* ---------- types ----------------------------------------------- */

interface State {
  /* inputs */
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

  /* image‑related */
  selectedImageUri: string | null;
  imageDimensions: { width: number; height: number };
  isCropping: boolean;
  cropOffset: { x: number; y: number };
  cropScale: number;

  /* “last valid” for custom free‑text inputs */
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
  const prevWarnings   = useRef({
    offset: null as string | null,
    blade:  null as string | null,
    minBorder: null as string | null,
    paperSize: null as string | null,
    lastValid: state.lastValidMinBorder,
  });

  /* -------- Step 1 : derive numeric inputs ---------------------- */

  const inputs = useMemo(() => {
    /** paper dims */
    const paperEntry =
      state.paperSize === 'custom'
        ? {
            w: state.lastValidCustomPaperWidth,
            h: state.lastValidCustomPaperHeight,
            custom: true,
          }
        : (() => {
            const p = PAPER_SIZES.find(x => x.value === state.paperSize)!;
            return { w: p.width, h: p.height, custom: false };
          })();

    const paperSizeWarning =
      paperEntry.custom &&
      (paperEntry.w > MAX_EASEL_DIMENSION || paperEntry.h > MAX_EASEL_DIMENSION)
        ? `Custom paper (${paperEntry.w}×${paperEntry.h}) exceeds largest standard easel (20×24").`
        : null;

    /** aspect ratio */
    const ratioEntry =
      state.aspectRatio === 'custom'
        ? {
            w: state.lastValidCustomAspectWidth,
            h: state.lastValidCustomAspectHeight,
          }
        : (() => {
            const r = ASPECT_RATIOS.find(x => x.value === state.aspectRatio)!;
            return { w: r.width, h: r.height };
          })();

    /** orientation + flip */
    const orientedPaper = state.isLandscape
      ? { w: paperEntry.h, h: paperEntry.w }
      : { w: paperEntry.w, h: paperEntry.h };

    const orientedRatio = state.isRatioFlipped
      ? { w: ratioEntry.h, h: ratioEntry.w }
      : { w: ratioEntry.w, h: ratioEntry.h };

    /** min‑border validation */
    const maxBorder = Math.min(orientedPaper.w, orientedPaper.h) / 2;
    let minBorder   = state.minBorder;
    let minBorderWarning: string | null = null;
    let lastValid   = state.lastValidMinBorder;

    if (minBorder >= maxBorder && maxBorder > 0) {
      minBorderWarning = `Minimum border too large; using ${state.lastValidMinBorder}.`;
      minBorder        = state.lastValidMinBorder;
    } else if (minBorder < 0) {
      minBorderWarning = `Border cannot be negative; using ${state.lastValidMinBorder}.`;
      minBorder        = state.lastValidMinBorder;
    } else {
      lastValid = minBorder;
    }

    return {
      paperEntry,
      orientedPaper,
      orientedRatio,
      minBorder,
      lastValid,
      paperSizeWarning,
    };
  }, [
    state.paperSize,
    state.lastValidCustomPaperWidth,
    state.lastValidCustomPaperHeight,
    state.aspectRatio,
    state.lastValidCustomAspectWidth,
    state.lastValidCustomAspectHeight,
    state.minBorder,
    state.isLandscape,
    state.isRatioFlipped,
  ]);

  /* -------- Step 2 : preview scale (depends only on size + win) -- */

  const previewScale = useMemo(() => {
    const { w, h } = inputs.orientedPaper;
    if (!w || !h) return 1;
    const maxW = Math.min(winW * 0.9, 400);
    const maxH = Math.min(winH * 0.5, 400);
    return Math.min(maxW / w, maxH / h);
  }, [inputs.orientedPaper, winW, winH]);

  /* -------- Step 3 : heavy geometry calculations ----------------- */

  const calc = useMemo(() => {
    const { orientedPaper, orientedRatio, minBorder } = inputs;

    /* print size */
    const { printW, printH } = computePrintSize(
      orientedPaper.w,
      orientedPaper.h,
      orientedRatio.w,
      orientedRatio.h,
      minBorder,
    );

    /* offsets */
    const { h: offH, v: offV, halfW, halfH, warning: offsetWarning } =
      clampOffsets(
        orientedPaper.w,
        orientedPaper.h,
        printW,
        printH,
        minBorder,
        state.enableOffset ? state.horizontalOffset : 0,
        state.enableOffset ? state.verticalOffset   : 0,
        state.ignoreMinBorder,
      );

    /* borders */
    const borders = bordersFromGaps(halfW, halfH, offH, offV);

    /* easel + paper shift */
    const {
      easelSize,
      effectiveSlot,
      isNonStandardPaperSize,
    } = findCenteringOffsets(
      inputs.paperEntry.w,
      inputs.paperEntry.h,
      state.isLandscape,
    );

    const spX = isNonStandardPaperSize
      ? (orientedPaper.w - effectiveSlot.width) / 2
      : 0;
    const spY = isNonStandardPaperSize
      ? (orientedPaper.h - effectiveSlot.height) / 2
      : 0;

    /* blade readings */
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
        'Many easels have no markings below about 3 in.';

    /* build result */
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
        isNonStandardPaperSize && !inputs.paperSizeWarning,

      easelSize,
      easelSizeLabel:
        (EASEL_SIZES.find(e => e.width === easelSize.width &&
                               e.height === easelSize.height)?.label) ??
        `${easelSize.width}×${easelSize.height}`,

      offsetWarning,
      bladeWarning,
      minBorderWarning: inputs.minBorder !== state.minBorder
        ? inputs.minBorderWarning
        : null,
      paperSizeWarning: inputs.paperSizeWarning,
      lastValidMinBorder: inputs.lastValid,
      clampedHorizontalOffset: offH,
      clampedVerticalOffset:   offV,

      previewScale,
      previewWidth:  orientedPaper.w * previewScale,
      previewHeight: orientedPaper.h * previewScale,
    };

    return res;
  }, [
    inputs,
    state.enableOffset,
    state.horizontalOffset,
    state.verticalOffset,
    state.ignoreMinBorder,
    state.isLandscape,
    previewScale,
  ]);

  /* -------- Step 4 : push warnings back to state ---------------- */

  useEffect(() => {
    const delta: Partial<State> = {};

    if (calc.offsetWarning !== prevWarnings.current.offset) {
      delta.offsetWarning = calc.offsetWarning;
      prevWarnings.current.offset = calc.offsetWarning;
    }
    if (calc.bladeWarning !== prevWarnings.current.blade) {
      delta.bladeWarning = calc.bladeWarning;
      prevWarnings.current.blade = calc.bladeWarning;
    }
    if (calc.minBorderWarning !== prevWarnings.current.minBorder) {
      delta.minBorderWarning = calc.minBorderWarning;
      prevWarnings.current.minBorder = calc.minBorderWarning;
    }
    if (calc.paperSizeWarning !== prevWarnings.current.paperSize) {
      delta.paperSizeWarning = calc.paperSizeWarning;
      prevWarnings.current.paperSize = calc.paperSizeWarning;
    }
    if (calc.lastValidMinBorder !== prevWarnings.current.lastValid) {
      delta.lastValidMinBorder = calc.lastValidMinBorder;
      prevWarnings.current.lastValid = calc.lastValidMinBorder;
    }

    if (Object.keys(delta).length) {
      dispatch({ type: 'INTERNAL_UPDATE', payload: delta });
    }
  }, [calc]);

  /* -------- stable setter callbacks ----------------------------- */

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

  const setNumericField = useCallback((
    key: keyof State,
    v: string,
  ) => {
    const num = tryNumber(v);
    if (num !== null) {
      dispatch({ type: 'SET_FIELD', key, value: num });
    } else if (v === '' || v === '-' || v === '.') {
      dispatch({ type: 'SET_FIELD', key, value: v });
    }
  }, []);

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
      setCustomDimensionField('customAspectWidth',  'lastValidCustomAspectWidth',  v), []),

    setCustomAspectHeight: useCallback((v: string) =>
      setCustomDimensionField('customAspectHeight', 'lastValidCustomAspectHeight', v), []),

    setCustomPaperWidth:   useCallback((v: string) =>
      setCustomDimensionField('customPaperWidth',   'lastValidCustomPaperWidth',   v), []),

    setCustomPaperHeight:  useCallback((v: string) =>
      setCustomDimensionField('customPaperHeight',  'lastValidCustomPaperHeight',  v), []),

    setMinBorder:          useCallback((v: string) =>
      setNumericField('minBorder', v), []),

    setEnableOffset:       useCallback((v: boolean) =>
      dispatch({ type: 'SET_FIELD', key: 'enableOffset', value: v }), []),

    setIgnoreMinBorder:    useCallback((v: boolean) =>
      dispatch({ type: 'SET_FIELD', key: 'ignoreMinBorder', value: v }), []),

    setHorizontalOffset:   useCallback((v: string) =>
      setNumericField('horizontalOffset', v), []),

    setVerticalOffset:     useCallback((v: string) =>
      setNumericField('verticalOffset', v), []),

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

    /* reset */
    resetToDefaults: useCallback(() =>
      dispatch({ type: 'RESET' }), []),
  };
};

export default useBorderCalculator;