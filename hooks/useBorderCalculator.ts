import { useReducer, useMemo, useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { BorderCalculation } from '@/types/borderTypes';
import { ASPECT_RATIOS, PAPER_SIZES, EASEL_SIZES } from '@/constants/border';
import { calculateBladeThickness, findCenteringOffsets } from '@/utils/borderCalculations';

interface State {
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
  // Internal / derived state related to warnings
  offsetWarning: string | null;
  bladeWarning: string | null;
  minBorderWarning: string | null;
  paperSizeWarning: string | null;
  lastValidMinBorder: number;
  // Image state (kept separate for now, could be integrated)
  selectedImageUri: string | null;
  imageDimensions: { width: number; height: number };
  isCropping: boolean;
  cropOffset: { x: number; y: number };
  cropScale: number;
  lastValidCustomAspectWidth: number;
  lastValidCustomAspectHeight: number;
  lastValidCustomPaperWidth: number;
  lastValidCustomPaperHeight: number;
}

type Action =
  | { type: 'SET_FIELD'; key: keyof State; value: any } // Use 'any' for simplicity, refine if needed
  | { type: 'SET_PAPER_SIZE'; value: string }
  | { type: 'SET_ASPECT_RATIO'; value: string }
  | { type: 'SET_IMAGE_FIELD'; key: Exclude<keyof State, 'imageDimensions' | 'cropOffset'>; value: any }
  | { type: 'SET_IMAGE_DIMENSIONS'; value: { width: number; height: number } }
  | { type: 'SET_CROP_OFFSET'; value: { x: number; y: number } }
  | { type: 'RESET' }
  | { type: 'INTERNAL_UPDATE'; payload: Partial<Pick<State, 'offsetWarning' | 'bladeWarning' | 'minBorderWarning' | 'paperSizeWarning' | 'lastValidMinBorder'>> }
  | { type: 'SET_IMAGE_CROP_DATA'; payload: Partial<Pick<State, 'selectedImageUri' | 'imageDimensions' | 'isCropping' | 'cropOffset' | 'cropScale'>> };

const DEFAULT_MIN_BORDER = 0.5;
const DEFAULT_CUSTOM_PAPER_WIDTH = 13; // Swapped default custom dims
const DEFAULT_CUSTOM_PAPER_HEIGHT = 10;
const DEFAULT_CUSTOM_ASPECT_WIDTH = 2; // Default valid custom aspect
const DEFAULT_CUSTOM_ASPECT_HEIGHT = 3; // Default valid custom aspect
// Find the maximum dimension among all standard easels
const MAX_EASEL_DIMENSION = EASEL_SIZES.reduce((max, easel) => Math.max(max, easel.width, easel.height), 0);

const initialState: State = {
  aspectRatio: ASPECT_RATIOS[0].value,
  paperSize: PAPER_SIZES[3].value,
  customAspectWidth: DEFAULT_CUSTOM_ASPECT_WIDTH, // Initialize with default
  customAspectHeight: DEFAULT_CUSTOM_ASPECT_HEIGHT, // Initialize with default
  customPaperWidth: DEFAULT_CUSTOM_PAPER_WIDTH,
  customPaperHeight: DEFAULT_CUSTOM_PAPER_HEIGHT,
  lastValidCustomAspectWidth: DEFAULT_CUSTOM_ASPECT_WIDTH, // Add last valid state
  lastValidCustomAspectHeight: DEFAULT_CUSTOM_ASPECT_HEIGHT, // Add last valid state
  lastValidCustomPaperWidth: DEFAULT_CUSTOM_PAPER_WIDTH, // Add last valid state
  lastValidCustomPaperHeight: DEFAULT_CUSTOM_PAPER_HEIGHT, // Add last valid state
  minBorder: DEFAULT_MIN_BORDER,
  enableOffset: false,
  ignoreMinBorder: false,
  horizontalOffset: 0,
  verticalOffset: 0,
  showBlades: false,
  isLandscape: true, // Default standard paper to landscape
  isRatioFlipped: false,
  offsetWarning: null,
  bladeWarning: null,
  minBorderWarning: null,
  paperSizeWarning: null,
  lastValidMinBorder: DEFAULT_MIN_BORDER,
  // Image State
  selectedImageUri: null,
  imageDimensions: { width: 0, height: 0 },
  isCropping: false,
  cropOffset: { x: 0, y: 0 },
  cropScale: 1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.key]: action.value };
    case 'SET_PAPER_SIZE':
      // When switching paper size, reset orientation and flip state
      // Default standard to landscape, custom to portrait
      const isCustom = action.value === 'custom';
      return {
        ...state,
        paperSize: action.value,
        isLandscape: !isCustom, // Custom defaults to portrait (false), standard to landscape (true)
        isRatioFlipped: false, // Reset flip
      };
    case 'SET_ASPECT_RATIO':
       // Reset flip when aspect ratio changes
      return {
        ...state,
        aspectRatio: action.value,
        isRatioFlipped: false,
      };
    case 'SET_IMAGE_FIELD':
      // Specific action for non-nested image fields
      return { ...state, [action.key]: action.value };
    case 'SET_IMAGE_DIMENSIONS':
      return { ...state, imageDimensions: action.value };
    case 'SET_CROP_OFFSET':
      return { ...state, cropOffset: action.value };
    case 'RESET':
      // Ensure lastValid fields are also reset
      return {
        ...initialState,
        // Re-initialize lastValid fields explicitly on reset
        lastValidCustomAspectWidth: DEFAULT_CUSTOM_ASPECT_WIDTH,
        lastValidCustomAspectHeight: DEFAULT_CUSTOM_ASPECT_HEIGHT,
        lastValidCustomPaperWidth: DEFAULT_CUSTOM_PAPER_WIDTH,
        lastValidCustomPaperHeight: DEFAULT_CUSTOM_PAPER_HEIGHT,
      };
    case 'INTERNAL_UPDATE':
      // Only update if the warning/value has actually changed
      let hasChanged = false;
      for (const key in action.payload) {
        if (state[key as keyof State] !== action.payload[key as keyof typeof action.payload]) {
          hasChanged = true;
          break;
        }
      }
      return hasChanged ? { ...state, ...action.payload } : state;
    case 'SET_IMAGE_CROP_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const useBorderCalculator = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Refs for state used only in event handlers to avoid re-renders
  const imageLayoutRef = useRef({ width: 0, height: 0 });

  // Use refs to store previous warning values to prevent unnecessary state updates
  const prevOffsetWarning = useRef<string | null>(null);
  const prevBladeWarning = useRef<string | null>(null);
  const prevMinBorderWarning = useRef<string | null>(null);
  const prevPaperSizeWarning = useRef<string | null>(null);
  const prevLastValidMinBorder = useRef<number>(state.lastValidMinBorder);

  // --- Input Derivation ---
  // Memoize the derived input values for the main calculation
  const calculationInputs = useMemo(() => {
    let paperWidth: number;
    let paperHeight: number;
    let ratioWidth: number;
    let ratioHeight: number;
    let paperSizeWarning: string | null = null;

    // Get paper dimensions using last valid values for custom
    if (state.paperSize === "custom") {
      paperWidth = state.lastValidCustomPaperWidth; // Use last valid
      paperHeight = state.lastValidCustomPaperHeight; // Use last valid
      // Check if custom paper size exceeds max easel size
      if (paperWidth > MAX_EASEL_DIMENSION || paperHeight > MAX_EASEL_DIMENSION) {
        paperSizeWarning = `Custom paper size (${paperWidth}x${paperHeight}) exceeds largest standard easel (20x24"). Ensure paper is centered manually if using easel alignment marks.`;
      }
    } else {
      const selectedPaper = PAPER_SIZES.find((p) => p.value === state.paperSize);
      paperWidth = selectedPaper?.width ?? 0;
      paperHeight = selectedPaper?.height ?? 0;
    }

    // Get aspect ratio dimensions using last valid values for custom
    if (state.aspectRatio === "custom") {
      ratioWidth = state.lastValidCustomAspectWidth; // Use last valid
      ratioHeight = state.lastValidCustomAspectHeight; // Use last valid
    } else {
      const selectedRatio = ASPECT_RATIOS.find((r) => r.value === state.aspectRatio);
      ratioWidth = selectedRatio?.width ?? 0;
      ratioHeight = selectedRatio?.height ?? 0;
    }

    // Create oriented dimensions
    const orientedPaperWidth = state.isLandscape ? paperHeight : paperWidth;
    const orientedPaperHeight = state.isLandscape ? paperWidth : paperHeight;

    // Apply ratio flip
    const orientedRatioWidth = state.isRatioFlipped ? ratioHeight : ratioWidth;
    const orientedRatioHeight = state.isRatioFlipped ? ratioWidth : ratioHeight;

    // Validate minimum border value
    const maxPossibleBorder = Math.min(orientedPaperWidth / 2, orientedPaperHeight / 2);
    let minBorderValue = state.minBorder;
    let minBorderWarning: string | null = null;
    let lastValidMinBorder = state.lastValidMinBorder;

    if (minBorderValue >= maxPossibleBorder && maxPossibleBorder > 0) {
      minBorderWarning = `Minimum border makes image size zero or negative. Using last valid: ${state.lastValidMinBorder}.`;
      minBorderValue = state.lastValidMinBorder;
    } else if (minBorderValue < 0) {
       minBorderWarning = `Minimum border cannot be negative. Using last valid: ${state.lastValidMinBorder}.`;
       minBorderValue = state.lastValidMinBorder;
    } else {
      lastValidMinBorder = minBorderValue; // Update last valid if current is ok
    }

     // Determine active offsets
    const horizontalOffsetValue = state.enableOffset ? state.horizontalOffset : 0;
    const verticalOffsetValue = state.enableOffset ? state.verticalOffset : 0;

    return {
      paperWidth, // Original paper dimensions needed for easel centering logic
      paperHeight,
      orientedPaperWidth,
      orientedPaperHeight,
      orientedRatioWidth,
      orientedRatioHeight,
      minBorderValue,
      horizontalOffsetValue,
      verticalOffsetValue,
      ignoreMinBorder: state.ignoreMinBorder,
      isLandscape: state.isLandscape,
      // Pass down warning info to be set after calculation
      minBorderWarning,
      lastValidMinBorder,
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
    state.enableOffset,
    state.horizontalOffset,
    state.verticalOffset,
    state.isLandscape,
    state.isRatioFlipped,
    state.ignoreMinBorder,
    state.lastValidMinBorder, // Include lastValidMinBorder as it affects the result
  ]);

  // --- Main Calculation ---
  // Define an extended type for the calculation result including internal fields
  type CalculationResult = BorderCalculation & {
    offsetWarning: string | null;
    bladeWarning: string | null;
    minBorderWarning: string | null;
    paperSizeWarning: string | null;
    lastValidMinBorder: number;
    clampedHorizontalOffset: number;
    clampedVerticalOffset: number;
    // Include preview fields derived from scale
    previewScale: number;
    previewWidth: number;
    previewHeight: number;
    easelSizeLabel: string;
  };

  const calculation = useMemo<CalculationResult>(() => {
    if (__DEV__) console.log("--- Calculation Start ---");
    const {
      paperWidth, paperHeight, // Original dims for easel calc
      orientedPaperWidth, orientedPaperHeight, orientedRatioWidth, orientedRatioHeight,
      minBorderValue, horizontalOffsetValue: initialHorizontalOffset, verticalOffsetValue: initialVerticalOffset,
      ignoreMinBorder, isLandscape,
      // Warnings pre-calculated
      minBorderWarning: inputMinBorderWarning,
      lastValidMinBorder: inputLastValidMinBorder,
      paperSizeWarning: inputPaperSizeWarning,
    } = calculationInputs;

    if (__DEV__) console.log("Inputs:", calculationInputs);

    // Calculate print size
    const availableWidth = orientedPaperWidth - 2 * minBorderValue;
    const availableHeight = orientedPaperHeight - 2 * minBorderValue;
    const printRatio = orientedRatioHeight === 0 ? 0 : orientedRatioWidth / orientedRatioHeight;

    let printWidth: number;
    let printHeight: number;

    if (printRatio === 0 || availableWidth <= 0 || availableHeight <= 0) {
        printWidth = 0;
        printHeight = 0;
    } else if (availableWidth / availableHeight > printRatio) {
      printHeight = availableHeight;
      printWidth = availableHeight * printRatio;
    } else {
      printWidth = availableWidth;
      printHeight = availableWidth / printRatio;
    }
    if (__DEV__) console.log("Calculated Print Dimensions (I):", { printWidth, printHeight });

    // Calculate maximum allowed offsets
    const halfWidthGap = (orientedPaperWidth - printWidth) / 2;
    const halfHeightGap = (orientedPaperHeight - printHeight) / 2;

    const maxHorizontalOffset = ignoreMinBorder
      ? halfWidthGap
      : Math.min(halfWidthGap - minBorderValue, halfWidthGap);

    const maxVerticalOffset = ignoreMinBorder
      ? halfHeightGap
      : Math.min(halfHeightGap - minBorderValue, halfHeightGap);

    // Clamp offset values
    let horizontalOffset = Math.max(
      -maxHorizontalOffset,
      Math.min(maxHorizontalOffset, initialHorizontalOffset)
    );
    let verticalOffset = Math.max(
      -maxVerticalOffset,
      Math.min(maxVerticalOffset, initialVerticalOffset)
    );

    // Determine offset warning
    let offsetWarning: string | null = null;
    if (
      (state.enableOffset && initialHorizontalOffset !== horizontalOffset) ||
      (state.enableOffset && initialVerticalOffset !== verticalOffset)
    ) {
      offsetWarning = ignoreMinBorder
        ? "Offset values adjusted to keep print within paper edges."
        : "Offset values adjusted to maintain minimum borders and stay within paper bounds.";
    }

    // Calculate borders
    const leftBorder = halfWidthGap - horizontalOffset;  // B1_x (near) or B2_y (far)
    const rightBorder = halfWidthGap + horizontalOffset; // B2_x (far) or B1_y (near)
    const bottomBorder = halfHeightGap - verticalOffset; // B1_y (near) or B2_x (far)
    const topBorder = halfHeightGap + verticalOffset;   // B2_y (far) or B1_x (near)
    if (__DEV__) console.log("Calculated Borders (B):", { leftBorder, rightBorder, topBorder, bottomBorder });

    // Get Easel Slot size (Ws) and non-standard flag using the *original* paper dimensions
    const { easelSize, isNonStandardPaperSize: originalIsNonStandard } = findCenteringOffsets(paperWidth, paperHeight, isLandscape);
    const Ws_x = easelSize.width;
    const Ws_y = easelSize.height;
    if (__DEV__) console.log("Easel Info (Ws):", { Ws_x, Ws_y, isNonStandardPaperSize: originalIsNonStandard });

    // Find the easel label
    const matchingEasel = EASEL_SIZES.find(e => e.width === Ws_x && e.height === Ws_y);
    const easelSizeLabel = matchingEasel ? matchingEasel.label : `${easelSize.width}x${easelSize.height}`;
    if (__DEV__) console.log("Determined Easel Label:", easelSizeLabel);

    // Calculate paper shift (sp) - only if non-standard paper size
    const sp_x = originalIsNonStandard ? (orientedPaperWidth - Ws_x) / 2 : 0;
    const sp_y = originalIsNonStandard ? (orientedPaperHeight - Ws_y) / 2 : 0;
    if (__DEV__) console.log("Calculated Paper Shift (sp):", { sp_x, sp_y });

    // Calculate border-induced offset (sb) - This is simply the applied offset
    const sb_x = horizontalOffset;
    const sb_y = verticalOffset;
    if (__DEV__) console.log("Calculated Border Shift (sb):", { sb_x, sb_y });

    // Calculate total centre shift (s)
    const s_x = sp_x + sb_x;
    const s_y = sp_y + sb_y;
    if (__DEV__) console.log("Calculated Total Shift (s):", { s_x, s_y });

    // Calculate blade scale readings (R1, R2)
    // Note: These were reversed in the original code comments vs calculation
    // R1 = Near blade, R2 = Far blade
    // Horizontal: Left = Near (R1_x), Right = Far (R2_x)
    // Vertical: Bottom = Near (R1_y), Top = Far (R2_y)
    // Formula: R = I ± 2s (positive for far blade, negative for near blade)
    // Example: Right Blade (Far Horizontal, R2_x) = I_x + 2 * s_x
    const leftBladeReading = printWidth - 2 * s_x;   // R1_x (Near)
    const rightBladeReading = printWidth + 2 * s_x;  // R2_x (Far)
    const bottomBladeReading = printHeight - 2 * s_y; // R1_y (Near)
    const topBladeReading = printHeight + 2 * s_y;    // R2_y (Far)

    if (__DEV__) console.log("Calculated Blade Readings (R):", { leftBladeReading, rightBladeReading, topBladeReading, bottomBladeReading });

    // Calculate blade thickness for preview
    const bladeThickness = calculateBladeThickness(orientedPaperWidth, orientedPaperHeight);

    // Blade position warnings
    let bladeWarning: string | null = "";
    const readings = [leftBladeReading, rightBladeReading, topBladeReading, bottomBladeReading];
    if (readings.some(r => r < 0)) {
      bladeWarning += "Negative blade reading detected! Set blade to the positive value and use the opposite mechanism.";
    }
    if (readings.some(r => Math.abs(r) < 3 && r !== 0)) { // Allow exactly 0 reading
       bladeWarning += (bladeWarning ? "\n" : "") + "Most easels lack markings below 2 or 3 inches.";
    }
    bladeWarning = bladeWarning || null; // Set to null if empty

    // Calculate percentages for preview positioning
    const printWidthPercent = orientedPaperWidth > 0 ? (printWidth / orientedPaperWidth) * 100 : 0;
    const printHeightPercent = orientedPaperHeight > 0 ? (printHeight / orientedPaperHeight) * 100 : 0;
    const leftBorderPercent = orientedPaperWidth > 0 ? (leftBorder / orientedPaperWidth) * 100 : 0;
    const topBorderPercent = orientedPaperHeight > 0 ? (topBorder / orientedPaperHeight) * 100 : 0;
    const rightBorderPercent = orientedPaperWidth > 0 ? (rightBorder / orientedPaperWidth) * 100 : 0;
    const bottomBorderPercent = orientedPaperHeight > 0 ? (bottomBorder / orientedPaperHeight) * 100 : 0;

    // Calculate preview scale based on window dimensions (moved here for inclusion in result)
    const tempPreviewScale = (() => {
      if (orientedPaperWidth === 0 || orientedPaperHeight === 0) return 1;
      const maxWidth = Math.min(windowWidth * 0.9, 400);
      const maxHeight = Math.min(windowHeight * 0.5, 400);
      return Math.min(maxWidth / orientedPaperWidth, maxHeight / orientedPaperHeight);
    })();
    const tempPreviewWidth = orientedPaperWidth * tempPreviewScale;
    const tempPreviewHeight = orientedPaperHeight * tempPreviewScale;

    const result: CalculationResult = {
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      printWidth,
      printHeight,
      paperWidth: orientedPaperWidth,
      paperHeight: orientedPaperHeight,
      // Preview scale calculated separately using window dimensions
      printWidthPercent,
      printHeightPercent,
      leftBorderPercent,
      topBorderPercent,
      rightBorderPercent,
      bottomBorderPercent,
      leftBladeReading,
      rightBladeReading,
      topBladeReading,
      bottomBladeReading,
      bladeThickness,
      isNonStandardPaperSize: originalIsNonStandard && !inputPaperSizeWarning,
      easelSize,
      easelSizeLabel,
      // Pass internal state back
      offsetWarning,
      bladeWarning,
      minBorderWarning: inputMinBorderWarning, // Use warning from input derivation
      lastValidMinBorder: inputLastValidMinBorder, // Use last valid from input derivation
      clampedHorizontalOffset: horizontalOffset, // Pass clamped offsets back
      clampedVerticalOffset: verticalOffset,
      paperSizeWarning: inputPaperSizeWarning,
      // Include preview calculations
      previewScale: tempPreviewScale,
      previewWidth: tempPreviewWidth,
      previewHeight: tempPreviewHeight,
    };
    if (__DEV__) console.log("Final Calculation Result:", result);
    if (__DEV__) console.log("--- Calculation End ---");

    return result;
  }, [calculationInputs, state.enableOffset, windowWidth, windowHeight]); // Added window dimensions as dependencies

  // Effect to dispatch internal updates for warnings and last valid border
  useEffect(() => {
    const updates: Partial<Pick<State, 'offsetWarning' | 'bladeWarning' | 'minBorderWarning' | 'paperSizeWarning' | 'lastValidMinBorder'>> = {};

    if (calculation.offsetWarning !== prevOffsetWarning.current) {
      updates.offsetWarning = calculation.offsetWarning;
      prevOffsetWarning.current = calculation.offsetWarning;
    }
    if (calculation.bladeWarning !== prevBladeWarning.current) {
      updates.bladeWarning = calculation.bladeWarning;
      prevBladeWarning.current = calculation.bladeWarning;
    }
     if (calculation.minBorderWarning !== prevMinBorderWarning.current) {
      updates.minBorderWarning = calculation.minBorderWarning;
      prevMinBorderWarning.current = calculation.minBorderWarning;
    }
    if (calculation.paperSizeWarning !== prevPaperSizeWarning.current) {
      updates.paperSizeWarning = calculation.paperSizeWarning;
      prevPaperSizeWarning.current = calculation.paperSizeWarning;
    }
    if (calculation.lastValidMinBorder !== prevLastValidMinBorder.current) {
      updates.lastValidMinBorder = calculation.lastValidMinBorder;
      prevLastValidMinBorder.current = calculation.lastValidMinBorder;
    }

    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'INTERNAL_UPDATE', payload: updates });
    }
  }, [calculation]); // Run only when calculation object changes

  // --- Preview Scaling ---
  // Preview scale is now part of the main calculation result
  const previewScale = calculation.previewScale;

   // --- Public API ---

  // Helper to safely set numeric string fields while tracking last valid number > 0
  const setCustomDimensionField = (
    key: keyof State,
    lastValidKey: keyof State,
    value: string
  ) => {
    // Always update the direct state field with the raw string value
    dispatch({ type: 'SET_FIELD', key, value: value });

    // Try parsing the number
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      // If it's a valid number greater than 0, update the last valid field
      dispatch({ type: 'SET_FIELD', key: lastValidKey, value: num });
    }
    // If it's empty, 0, negative, or NaN, the lastValid field remains unchanged
  };

  // Helper for regular numeric fields (like minBorder, offsets)
  const setNumericField = (key: keyof State, value: string) => {
    const num = parseFloat(value);
    // For these fields, we might just store the number or the string if needed
    // Keeping the previous logic for non-custom dimensions for now
    if (!isNaN(num)) {
      dispatch({ type: 'SET_FIELD', key, value: num });
    } else if (value === '' || value === '-' || value === '.') {
      // Allow empty, negative sign, or decimal point for typing intermediate states
      dispatch({ type: 'SET_FIELD', key, value: value });
    }
  };

  // Image Layout setter (uses ref)
  const setImageLayout = (layout: { width: number; height: number }) => {
    imageLayoutRef.current = layout;
  };

  return {
    // State values (prefer primitives where possible)
    aspectRatio: state.aspectRatio,
    paperSize: state.paperSize,
    customAspectWidth: state.customAspectWidth,
    customAspectHeight: state.customAspectHeight,
    customPaperWidth: state.customPaperWidth,
    customPaperHeight: state.customPaperHeight,
    minBorder: state.minBorder,
    enableOffset: state.enableOffset,
    ignoreMinBorder: state.ignoreMinBorder,
    horizontalOffset: state.horizontalOffset,
    verticalOffset: state.verticalOffset,
    showBlades: state.showBlades,
    isLandscape: state.isLandscape,
    isRatioFlipped: state.isRatioFlipped,
    offsetWarning: state.offsetWarning,
    bladeWarning: state.bladeWarning,
    minBorderWarning: state.minBorderWarning,
    paperSizeWarning: state.paperSizeWarning,
    clampedHorizontalOffset: calculation.clampedHorizontalOffset, // Use clamped values from calculation result
    clampedVerticalOffset: calculation.clampedVerticalOffset,

    // Image state & values (consider grouping if complex)
    selectedImageUri: state.selectedImageUri,
    imageDimensions: state.imageDimensions,
    isCropping: state.isCropping,
    cropOffset: state.cropOffset,
    cropScale: state.cropScale,
    imageLayout: imageLayoutRef.current, // Provide current ref value

    // Calculation results object (excluding internal/warning fields)
    calculation: {
      leftBorder: calculation.leftBorder,
      rightBorder: calculation.rightBorder,
      topBorder: calculation.topBorder,
      bottomBorder: calculation.bottomBorder,
      printWidth: calculation.printWidth,
      printHeight: calculation.printHeight,
      paperWidth: calculation.paperWidth,
      paperHeight: calculation.paperHeight,
      printWidthPercent: calculation.printWidthPercent,
      printHeightPercent: calculation.printHeightPercent,
      leftBorderPercent: calculation.leftBorderPercent,
      topBorderPercent: calculation.topBorderPercent,
      rightBorderPercent: calculation.rightBorderPercent,
      bottomBorderPercent: calculation.bottomBorderPercent,
      leftBladeReading: calculation.leftBladeReading,
      rightBladeReading: calculation.rightBladeReading,
      topBladeReading: calculation.topBladeReading,
      bottomBladeReading: calculation.bottomBladeReading,
      bladeThickness: calculation.bladeThickness,
      isNonStandardPaperSize: calculation.isNonStandardPaperSize,
      easelSize: calculation.easelSize,
      easelSizeLabel: calculation.easelSizeLabel,
      // Add preview fields from calculation result
      previewScale: calculation.previewScale,
      previewWidth: calculation.previewWidth,
      previewHeight: calculation.previewHeight,
    } as BorderCalculation, // Assert type after removing internal fields

    // Dispatchers / Setters (provide functions to interact with state)
    setAspectRatio: (value: string) => dispatch({ type: 'SET_ASPECT_RATIO', value }),
    setPaperSize: (value: string) => dispatch({ type: 'SET_PAPER_SIZE', value }),
    setCustomAspectWidth: (value: string) => setCustomDimensionField('customAspectWidth', 'lastValidCustomAspectWidth', value),
    setCustomAspectHeight: (value: string) => setCustomDimensionField('customAspectHeight', 'lastValidCustomAspectHeight', value),
    setCustomPaperWidth: (value: string) => setCustomDimensionField('customPaperWidth', 'lastValidCustomPaperWidth', value),
    setCustomPaperHeight: (value: string) => setCustomDimensionField('customPaperHeight', 'lastValidCustomPaperHeight', value),
    setMinBorder: (value: string) => setNumericField('minBorder', value),
    setEnableOffset: (value: boolean) => dispatch({ type: 'SET_FIELD', key: 'enableOffset', value }),
    setIgnoreMinBorder: (value: boolean) => dispatch({ type: 'SET_FIELD', key: 'ignoreMinBorder', value }),
    setHorizontalOffset: (value: string) => setNumericField('horizontalOffset', value),
    setVerticalOffset: (value: string) => setNumericField('verticalOffset', value),
    setShowBlades: (value: boolean) => dispatch({ type: 'SET_FIELD', key: 'showBlades', value }),
    setIsLandscape: (value: boolean) => dispatch({ type: 'SET_FIELD', key: 'isLandscape', value }),
    setIsRatioFlipped: (value: boolean) => dispatch({ type: 'SET_FIELD', key: 'isRatioFlipped', value }),

    // Image setters
    setSelectedImageUri: (value: string | null) => dispatch({ type: 'SET_IMAGE_FIELD', key: 'selectedImageUri', value }),
    setImageDimensions: (value: { width: number; height: number }) => dispatch({ type: 'SET_IMAGE_DIMENSIONS', value }),
    setIsCropping: (value: boolean) => dispatch({ type: 'SET_IMAGE_FIELD', key: 'isCropping', value }),
    setCropOffset: (value: { x: number; y: number }) => dispatch({ type: 'SET_CROP_OFFSET', value }),
    setCropScale: (value: number) => dispatch({ type: 'SET_IMAGE_FIELD', key: 'cropScale', value }),
    setImageLayout, // Export ref setter

    // Actions
    resetToDefaults: () => dispatch({ type: 'RESET' }),
  };
};

// Keep default export if needed by other parts of the app
export default useBorderCalculator; 

