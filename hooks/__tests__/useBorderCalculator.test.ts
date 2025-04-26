import { renderHook, act } from '@testing-library/react-native';
import { useBorderCalculator } from '../useBorderCalculator';
import { ASPECT_RATIOS, PAPER_SIZES } from '../../constants/border';

// Mock specific react-native modules needed
jest.mock('react-native', () => ({
  // Mock only the specific functions/objects needed
  useWindowDimensions: jest.fn(() => ({ width: 1024, height: 768 })),
  Platform: {
    OS: 'web', // Explicitly mock OS
    select: jest.fn((spec) => spec.web || spec.default), // Basic mock for Platform.select
    // Add other Platform properties if needed by the hook/component, e.g.:
    // Version: 'test-version',
    // isTesting: true,
  },
  // Add other RN exports if the hook uses them, e.g.:
  // StyleSheet: { create: (styles) => styles },
}));

// Helper to get initial state values (mirroring the hook's initial state)
const getInitialStateValues = () => ({
  aspectRatio: ASPECT_RATIOS[0].value, // "3/2"
  paperSize: PAPER_SIZES[3].value, // "8x10"
  customAspectWidth: 0,
  customAspectHeight: 0,
  customPaperWidth: 10, // Default custom W
  customPaperHeight: 13, // Default custom H
  minBorder: 0.5,
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
  // Image state omitted for brevity unless specifically tested
  selectedImageUri: null,
  isCropping: false,
  cropScale: 1,
});


describe('useBorderCalculator Hook', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useBorderCalculator());
    const initialValues = getInitialStateValues();

    expect(result.current.aspectRatio).toBe(initialValues.aspectRatio);
    expect(result.current.paperSize).toBe(initialValues.paperSize);
    expect(result.current.customAspectWidth).toBe(initialValues.customAspectWidth);
    expect(result.current.customAspectHeight).toBe(initialValues.customAspectHeight);
    expect(result.current.customPaperWidth).toBe(initialValues.customPaperWidth);
    expect(result.current.customPaperHeight).toBe(initialValues.customPaperHeight);
    expect(result.current.minBorder).toBe(initialValues.minBorder);
    expect(result.current.enableOffset).toBe(initialValues.enableOffset);
    expect(result.current.ignoreMinBorder).toBe(initialValues.ignoreMinBorder);
    expect(result.current.horizontalOffset).toBe(initialValues.horizontalOffset);
    expect(result.current.verticalOffset).toBe(initialValues.verticalOffset);
    expect(result.current.showBlades).toBe(initialValues.showBlades);
    expect(result.current.isLandscape).toBe(initialValues.isLandscape);
    expect(result.current.isRatioFlipped).toBe(initialValues.isRatioFlipped);
    expect(result.current.offsetWarning).toBe(initialValues.offsetWarning);
    expect(result.current.bladeWarning).toBe(initialValues.bladeWarning);
    expect(result.current.minBorderWarning).toBe(initialValues.minBorderWarning);
  });

  it('should update aspectRatio correctly', () => {
    const { result } = renderHook(() => useBorderCalculator());
    const newRatio = ASPECT_RATIOS[1].value; // "65/24"

    act(() => {
      result.current.setAspectRatio(newRatio);
    });

    expect(result.current.aspectRatio).toBe(newRatio);
    expect(result.current.isRatioFlipped).toBe(false); // Should reset flip
  });

   it('should update paperSize and orientation correctly', () => {
    const { result } = renderHook(() => useBorderCalculator());
    const newPaperSize = PAPER_SIZES[4].value; // "11x14"

    act(() => {
      result.current.setPaperSize(newPaperSize);
    });

    expect(result.current.paperSize).toBe(newPaperSize);
    expect(result.current.isLandscape).toBe(true); // Standard defaults to landscape
    expect(result.current.isRatioFlipped).toBe(false); // Should reset flip

    // Switch to custom
     act(() => {
      result.current.setPaperSize('custom');
    });
     expect(result.current.paperSize).toBe('custom');
     expect(result.current.isLandscape).toBe(false); // Custom defaults to portrait
     expect(result.current.isRatioFlipped).toBe(false); // Should reset flip
  });

  it('should update minBorder using setNumericField logic', () => {
    const { result } = renderHook(() => useBorderCalculator());

    act(() => {
      result.current.setMinBorder("1.25");
    });
    expect(result.current.minBorder).toBe(1.25);

    act(() => {
      result.current.setMinBorder(""); // Clear input
    });
    // The hook's `setNumericField` stores '' which becomes 0 during calculation
    expect(result.current.minBorder).toBe(''); // State holds '', calculation uses 0 or last valid

    act(() => {
      result.current.setMinBorder("invalid"); // Invalid input
    });
    expect(result.current.minBorder).toBe(0); // State becomes 0
  });

  it('should update boolean toggles correctly', () => {
    const { result } = renderHook(() => useBorderCalculator());

    expect(result.current.enableOffset).toBe(false);
    act(() => {
      result.current.setEnableOffset(true);
    });
    expect(result.current.enableOffset).toBe(true);

    expect(result.current.showBlades).toBe(false);
    act(() => {
      result.current.setShowBlades(true);
    });
    expect(result.current.showBlades).toBe(true);

    expect(result.current.isLandscape).toBe(true); // Starts true for standard
     act(() => {
      result.current.setIsLandscape(false);
    });
    expect(result.current.isLandscape).toBe(false);

     expect(result.current.isRatioFlipped).toBe(false);
     act(() => {
      result.current.setIsRatioFlipped(true);
    });
    expect(result.current.isRatioFlipped).toBe(true);
  });

   it('should update offset values using setNumericField logic', () => {
    const { result } = renderHook(() => useBorderCalculator());

    act(() => {
      result.current.setHorizontalOffset("0.5");
    });
    expect(result.current.horizontalOffset).toBe(0.5);

     act(() => {
      result.current.setVerticalOffset("-0.25");
    });
    expect(result.current.verticalOffset).toBe(-0.25);

     act(() => {
      result.current.setHorizontalOffset("");
    });
    expect(result.current.horizontalOffset).toBe('');

     act(() => {
      result.current.setVerticalOffset("abc");
    });
    expect(result.current.verticalOffset).toBe(0);
  });

   it('should reset state to defaults', () => {
    const { result } = renderHook(() => useBorderCalculator());
    const initialValues = getInitialStateValues();

    // Change some values
    act(() => {
      result.current.setMinBorder("1.5");
      result.current.setEnableOffset(true);
      result.current.setHorizontalOffset("1");
      result.current.setPaperSize(PAPER_SIZES[0].value); // 4x5
       result.current.setIsLandscape(false); // Set to portrait explicitly
    });

    expect(result.current.minBorder).toBe(1.5);
    expect(result.current.enableOffset).toBe(true);
    expect(result.current.horizontalOffset).toBe(1);
    expect(result.current.paperSize).toBe(PAPER_SIZES[0].value);
    expect(result.current.isLandscape).toBe(false); // Changed from default

    // Reset
    act(() => {
      result.current.resetToDefaults();
    });

    // Check against initial values
    expect(result.current.aspectRatio).toBe(initialValues.aspectRatio);
    expect(result.current.paperSize).toBe(initialValues.paperSize);
    expect(result.current.minBorder).toBe(initialValues.minBorder);
    expect(result.current.enableOffset).toBe(initialValues.enableOffset);
    expect(result.current.horizontalOffset).toBe(initialValues.horizontalOffset);
    expect(result.current.verticalOffset).toBe(initialValues.verticalOffset);
    expect(result.current.showBlades).toBe(initialValues.showBlades);
    expect(result.current.isLandscape).toBe(initialValues.isLandscape); // Should reset to default
    expect(result.current.isRatioFlipped).toBe(initialValues.isRatioFlipped);
    expect(result.current.offsetWarning).toBe(initialValues.offsetWarning);
    expect(result.current.bladeWarning).toBe(initialValues.bladeWarning);
    expect(result.current.minBorderWarning).toBe(initialValues.minBorderWarning);
  });

  it('should calculate initial values correctly', () => {
    const { result } = renderHook(() => useBorderCalculator());
    const calc = result.current.calculation;

    // Default: 8x10 paper (landscape -> 10x8), 3:2 ratio, 0.5" border
    expect(calc.paperWidth).toBe(10);
    expect(calc.paperHeight).toBe(8);
    expect(calc.printWidth).toBeCloseTo(10 - 2 * 0.5); // Width is limiting factor (10-1=9)
    expect(calc.printHeight).toBeCloseTo(calc.printWidth / (3 / 2)); // 9 / 1.5 = 6
    expect(calc.leftBorder).toBeCloseTo((10 - calc.printWidth) / 2);
    expect(calc.rightBorder).toBeCloseTo((10 - calc.printWidth) / 2);
    expect(calc.topBorder).toBeCloseTo((8 - calc.printHeight) / 2);
    expect(calc.bottomBorder).toBeCloseTo((8 - calc.printHeight) / 2);
    // Blade readings should equal print dimensions when centered (s_x=0, s_y=0)
    expect(calc.leftBladeReading).toBeCloseTo(calc.printWidth);
    expect(calc.rightBladeReading).toBeCloseTo(calc.printWidth);
    expect(calc.topBladeReading).toBeCloseTo(calc.printHeight);
    expect(calc.bottomBladeReading).toBeCloseTo(calc.printHeight);
    expect(calc.isNonStandardPaperSize).toBe(false);
  });

  it('should update calculation on state change (minBorder)', () => {
    const { result } = renderHook(() => useBorderCalculator());
    const initialPrintWidth = result.current.calculation.printWidth;

    act(() => {
      result.current.setMinBorder("1.0");
    });

    const calc = result.current.calculation;
    expect(result.current.minBorder).toBe(1.0); // Check state directly
    expect(calc.printWidth).toBeLessThan(initialPrintWidth);
    // Recalculate based on 10x8 paper, 3:2 ratio, 1.0" border
    const expectedPrintW = 10 - 2 * 1.0; // 8
    const expectedPrintH = expectedPrintW / 1.5; // 8 / 1.5 = 5.333
    expect(calc.printWidth).toBeCloseTo(expectedPrintW);
    expect(calc.printHeight).toBeCloseTo(expectedPrintH);
    expect(calc.leftBorder).toBeCloseTo(1.0);
    expect(calc.topBorder).toBeCloseTo((8 - expectedPrintH) / 2);
  });

  it('should update calculation on orientation change', () => {
    const { result } = renderHook(() => useBorderCalculator()); // Starts landscape (10x8 paper)

    act(() => {
      result.current.setIsLandscape(false); // Set to portrait (8x10 paper)
    });

    const calc = result.current.calculation;
    expect(result.current.isLandscape).toBe(false);
    expect(calc.paperWidth).toBe(8);
    expect(calc.paperHeight).toBe(10);
    // Now height is limiting: available H = 10 - 2*0.5 = 9
    expect(calc.printHeight).toBeCloseTo(9);
    expect(calc.printWidth).toBeCloseTo(9 * (3/2)); // 9 * 1.5 = 13.5 - Too wide for 8x10! Ah, width limits now.
    // Width limited: available W = 8 - 2*0.5 = 7
    expect(calc.printWidth).toBeCloseTo(7);
    expect(calc.printHeight).toBeCloseTo(7 / (3/2)); // 7 / 1.5 = 4.666
    expect(calc.leftBorder).toBeCloseTo((8 - 7) / 2); // 0.5
    expect(calc.topBorder).toBeCloseTo((10 - calc.printHeight) / 2);
  });

  it('should update calculation on ratio flip', () => {
     const { result } = renderHook(() => useBorderCalculator()); // Starts landscape (10x8 paper), ratio 3:2

    act(() => {
      result.current.setIsRatioFlipped(true); // Ratio becomes 2:3
    });

     const calc = result.current.calculation;
     expect(result.current.isRatioFlipped).toBe(true);
     // Paper 10x8, ratio 2:3, border 0.5
     // Available W=9, H=7. Ratio = 2/3 = 0.667
     // Available W/H = 9/7 = 1.28 > 0.667 => Height limited
     expect(calc.printHeight).toBeCloseTo(7); // available H
     expect(calc.printWidth).toBeCloseTo(7 * (2/3)); // 7 * 0.667 = 4.667
     expect(calc.leftBorder).toBeCloseTo((10 - calc.printWidth) / 2);
     expect(calc.topBorder).toBeCloseTo((8 - 7) / 2); // 0.5
  });

  it('should handle offsets correctly when enabled', () => {
    const { result } = renderHook(() => useBorderCalculator());
    const initialLeftBlade = result.current.calculation.leftBladeReading;

    act(() => {
      result.current.setEnableOffset(true);
      result.current.setHorizontalOffset("0.5"); // Shift right
      result.current.setVerticalOffset("-0.25"); // Shift up
    });

    expect(result.current.enableOffset).toBe(true);
    expect(result.current.horizontalOffset).toBe(0.5);
    expect(result.current.verticalOffset).toBe(-0.25);

    const calc = result.current.calculation;
    const centeredBorderX = (calc.paperWidth - calc.printWidth) / 2;
    const centeredBorderY = (calc.paperHeight - calc.printHeight) / 2;

    expect(calc.leftBorder).toBeCloseTo(centeredBorderX - 0.5);
    expect(calc.rightBorder).toBeCloseTo(centeredBorderX + 0.5);
    expect(calc.topBorder).toBeCloseTo(centeredBorderY + (-0.25)); // Top border increases when shifting up
    expect(calc.bottomBorder).toBeCloseTo(centeredBorderY - (-0.25)); // Bottom border decreases

    // Blade readings R = I +/- 2s. s_x=0.5, s_y=-0.25
    expect(calc.leftBladeReading).toBeCloseTo(calc.printWidth - 2 * 0.5);
    expect(calc.rightBladeReading).toBeCloseTo(calc.printWidth + 2 * 0.5);
    expect(calc.topBladeReading).toBeCloseTo(calc.printHeight + 2 * (-0.25));
    expect(calc.bottomBladeReading).toBeCloseTo(calc.printHeight - 2 * (-0.25));
    expect(result.current.offsetWarning).toBeNull();
  });

  it('should clamp offsets and show warning if needed', () => {
    const { result } = renderHook(() => useBorderCalculator());

    act(() => {
      result.current.setEnableOffset(true);
      result.current.setMinBorder("1.0"); // Border = 1.0
      // Paper 10x8, Print 8x5.333. Gaps: X=(10-8)/2=1, Y=(8-5.333)/2=1.333
      // Max offset = Gap - Border = 1-1=0 (X), 1.333-1=0.333 (Y)
      result.current.setHorizontalOffset("0.5"); // Too large, should clamp to 0
      result.current.setVerticalOffset("-1"); // Too large, should clamp to -0.333
    });

    expect(result.current.horizontalOffset).toBe(0.5); // State holds user input
    expect(result.current.verticalOffset).toBe(-1);
    expect(result.current.clampedHorizontalOffset).toBeCloseTo(0); // Access directly from hook result
    expect(result.current.clampedVerticalOffset).toBeCloseTo(-0.333, 2); // Access directly from hook result
    expect(result.current.offsetWarning).toContain("adjusted to maintain minimum borders");

    // Test ignoreMinBorder
    act(() => {
       result.current.setIgnoreMinBorder(true);
       // Max offset = Gap = 1 (X), 1.333 (Y)
       result.current.setHorizontalOffset("1.5"); // Too large, clamp to 1
       result.current.setVerticalOffset("-2"); // Too large, clamp to -1.333
    });
    expect(result.current.clampedHorizontalOffset).toBeCloseTo(1); // Access directly
    expect(result.current.clampedVerticalOffset).toBeCloseTo(-1.333, 2); // Access directly
     expect(result.current.offsetWarning).toContain("adjusted to keep print within paper edges");

    // Test warning clearing
     act(() => {
      result.current.setIgnoreMinBorder(false);
      result.current.setHorizontalOffset("0"); // Valid offset
      result.current.setVerticalOffset("0.1"); // Valid offset
    });
     expect(result.current.clampedHorizontalOffset).toBeCloseTo(0); // Access directly
    expect(result.current.clampedVerticalOffset).toBeCloseTo(0.1); // Access directly
     expect(result.current.offsetWarning).toBeNull();
  });

  it('should show minBorder warning for invalid values', () => {
    const { result } = renderHook(() => useBorderCalculator()); // Paper 10x8
    const initialMinBorder = result.current.minBorder; // 0.5

    // Too large
    act(() => {
      result.current.setMinBorder("5.0"); // Max possible border is 8/2 = 4
    });
    expect(result.current.minBorder).toBe(5.0); // State holds user input
    expect(result.current.minBorderWarning).toContain(`Using last valid: ${initialMinBorder}`);
    expect(result.current.calculation.printWidth).toBeGreaterThan(0); // Ensure calc used valid border
    expect(result.current.calculation.paperHeight - 2 * result.current.calculation.topBorder).toBeCloseTo(result.current.calculation.printHeight);

    // Negative
     act(() => {
      result.current.setMinBorder("-1.0");
    });
     expect(result.current.minBorder).toBe(-1.0);
    expect(result.current.minBorderWarning).toContain(`Minimum border cannot be negative. Using last valid: ${initialMinBorder}`);
    expect(result.current.calculation.printWidth).toBeGreaterThan(0);

     // Clear warning
     act(() => {
      result.current.setMinBorder("0.75");
    });
     expect(result.current.minBorder).toBe(0.75);
     expect(result.current.minBorderWarning).toBeNull();
  });

  it('should show blade warning for negative or small readings', () => {
     const { result } = renderHook(() => useBorderCalculator());
     // Force negative reading: Large offset + ignore min border
     act(() => {
      result.current.setEnableOffset(true);
      result.current.setIgnoreMinBorder(true);
      result.current.setHorizontalOffset("-6.0"); // Print width approx 9. Offset makes s_x = -6.
      // Left blade (Near) = I - 2s = 9 - 2*(-6) = 21
      // Right blade (Far) = I + 2s = 9 + 2*(-6) = -3
    });
     expect(result.current.calculation.rightBladeReading).toBeCloseTo(-3);
    expect(result.current.bladeWarning).toContain("Negative blade reading");

    // Force small reading (requires small print size potentially)
    // Use 4x6 paper (landscape 6x4), 1:1 ratio, 0.1 border
    act(() => {
       result.current.resetToDefaults(); // Reset first
       result.current.setPaperSize('4x6'); // Landscape => 6x4
       result.current.setAspectRatio('1/1'); // Ratio 1:1
       result.current.setMinBorder('0.1');
       // Paper 6x4, Ratio 1:1, Border 0.1. Available W=5.8, H=3.8. Height limits.
       // Print = 3.8 x 3.8.
       // Blades = 3.8 (centered)
       result.current.setEnableOffset(true);
       result.current.setIgnoreMinBorder(true);
       result.current.setHorizontalOffset("-1.5"); // s_x = -1.5
       // Left = 3.8 - 2*(-1.5) = 6.8
       // Right = 3.8 + 2*(-1.5) = 0.8
     });
      expect(result.current.calculation.rightBladeReading).toBeCloseTo(0.8);
      expect(result.current.bladeWarning).toContain("lack markings below 3 inches");

     // Clear warning
     act(() => {
      result.current.resetToDefaults();
    });
     expect(result.current.bladeWarning).toBeNull();
  });

   it('should calculate optimal min border and update state', () => {
     const { result } = renderHook(() => useBorderCalculator());
     const initialMinBorder = result.current.minBorder;

    act(() => {
      result.current.calculateOptimalMinBorder();
    });

    // The optimal border depends on the calculation, check it changed and is reasonable
    expect(result.current.minBorder).not.toBe(initialMinBorder);
    expect(result.current.minBorder).toBeGreaterThan(0);
    expect(result.current.minBorder).toBeLessThan(4); // Max possible for 8x10 paper
    // Optionally, check if resulting borders are close to 0.25 increments (like in util test)
    const calc = result.current.calculation;
    const borderX = calc.leftBorder; // Centered calculation assumed for optimal border finding
    const borderY = calc.topBorder;
    const tolerance = 0.02;
    expect(borderX % 0.25).toBeLessThanOrEqual(tolerance);
    expect(borderY % 0.25).toBeLessThanOrEqual(tolerance);
   });

   it('should handle non-standard paper size correctly', () => {
     const { result } = renderHook(() => useBorderCalculator());

     // Set custom paper size (e.g., 9x12)
     act(() => {
      result.current.setPaperSize('custom');
      result.current.setCustomPaperWidth("9");
      result.current.setCustomPaperHeight("12");
      result.current.setIsLandscape(false); // Portrait 9x12
    });

     expect(result.current.calculation.isNonStandardPaperSize).toBe(true);
     // Should fit in 11x14 easel
     expect(result.current.calculation.easelSize).toEqual({ width: 11, height: 14 });

      // Test landscape (12x9)
      act(() => {
        result.current.setIsLandscape(true);
      });
       expect(result.current.calculation.isNonStandardPaperSize).toBe(true);
      // Should fit in 11x14 flipped (14x11 slot)
       expect(result.current.calculation.easelSize).toEqual({ width: 14, height: 11 });
   });


  // More tests needed for calculation logic, warnings, optimal border calculation, etc.
  // ... existing it block for resetToDefaults ...
}); 