# Calculation Constants Documentation

This document describes the centralized mathematical constants used throughout the Dorkroom application for calculations and algorithms.

## Overview

The `constants/calculations.ts` file provides a centralized location for all mathematical constants, algorithm parameters, and configuration values used in calculator computations. This ensures consistency across the application and makes it easier to tune performance and accuracy.

## Constants Structure

### CALCULATION_CONSTANTS

The main constants object containing all calculation-related values:

#### Debounce and Timing

```typescript
DEBOUNCE_WARNING_DELAY: 250; // Milliseconds to debounce warning messages
```

#### Border Optimization Algorithm

```typescript
BORDER_OPTIMIZATION: {
  STEP: 0.01,                    // Step size for border optimization search
  SEARCH_SPAN: 0.5,              // Search range around starting point
  SNAP: 0.25,                    // Snap increment for border measurements
  EPSILON: 1e-9,                 // Floating point comparison tolerance
  ADAPTIVE_STEP_DIVISOR: 100,    // Divisor for adaptive step size calculation
}
```

#### Cache Management

```typescript
CACHE: {
  MAX_MEMO_SIZE: 50,             // Maximum number of cached calculation results
}
```

#### Precision and Rounding

```typescript
PRECISION: {
  DECIMAL_PLACES: 2,             // Number of decimal places for display
  ROUNDING_MULTIPLIER: 100,      // Multiplier for efficient rounding (10^DECIMAL_PLACES)
}
```

#### Paper and Easel Standards

```typescript
PAPER: {
  STANDARD_WIDTH: 20,            // Standard paper width in inches
  STANDARD_HEIGHT: 24,           // Standard paper height in inches
  MAX_SCALE_FACTOR: 2,           // Maximum scaling factor for blade thickness
}
```

### DERIVED_CONSTANTS

Constants calculated from the base constants:

```typescript
BASE_PAPER_AREA: 480; // STANDARD_WIDTH * STANDARD_HEIGHT (20 × 24)
```

## Usage Examples

### Importing Constants

```typescript
import {
  CALCULATION_CONSTANTS,
  DERIVED_CONSTANTS,
} from "@/constants/calculations";

// Or import the default export with all constants
import CALC_CONSTANTS from "@/constants/calculations";
```

### Using in Calculations

```typescript
// Border optimization
const step = CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.STEP;
const searchSpan = CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.SEARCH_SPAN;

// Cache management
if (cache.size >= CALCULATION_CONSTANTS.CACHE.MAX_MEMO_SIZE) {
  // Clear oldest entries
}

// Precision handling (legacy approach)
const rounded =
  Math.round(value * CALCULATION_CONSTANTS.PRECISION.ROUNDING_MULTIPLIER) /
  CALCULATION_CONSTANTS.PRECISION.ROUNDING_MULTIPLIER;
```

### Using Precision Utilities

The recommended approach is to use the precision utilities from `@/utils/precision`:

```typescript
import {
  roundToStandardPrecision,
  roundToPrecision,
  createMemoKey,
} from "@/utils/precision";

// Standard 2-decimal precision rounding
const rounded = roundToStandardPrecision(3.14159); // 3.14

// Custom precision rounding
const customRounded = roundToPrecision(3.14159, 3); // 3.142

// Memoization key generation
const cacheKey = createMemoKey(paperWidth, paperHeight, isLandscape); // "2000:2400:true"
```

## Algorithm Details

### Border Optimization Algorithm

The border optimization uses a search algorithm with the following parameters:

- **STEP (0.01)**: The increment size when searching for optimal border values
- **SEARCH_SPAN (0.5)**: The range to search around the initial value (±0.5 inches)
- **SNAP (0.25)**: The increment that borders should "snap" to for easier measurement
- **EPSILON (1e-9)**: Tolerance for floating-point comparisons to handle precision issues
- **ADAPTIVE_STEP_DIVISOR (100)**: Used to calculate adaptive step sizes for better performance

### Cache Management

The memoization system uses:

- **MAX_MEMO_SIZE (50)**: Limits memory usage by capping cached results
- LRU (Least Recently Used) eviction when cache is full
- Optimized key generation for better hash performance

### Precision Control

All displayed values use:

- **DECIMAL_PLACES (2)**: Consistent 2-decimal precision for user display
- **ROUNDING_MULTIPLIER (100)**: Efficient rounding using integer math instead of `toFixed()`

## Performance Considerations

### Optimized Constants

These constants are tuned for optimal performance:

- **STEP size**: Small enough for accuracy, large enough for speed
- **Cache size**: Balances memory usage with lookup performance
- **Search span**: Covers practical adjustment range without excessive computation

### Memory Management

- Constants are marked as `const` for immutability
- Derived constants are pre-calculated to avoid runtime computation
- Cache limits prevent memory leaks in long-running sessions

## Migration Notes

### From Inline Constants

If you're migrating from inline constants in calculation files:

```typescript
// Before
const STEP = 0.01;
const SEARCH_SPAN = 0.5;

// After
import { CALCULATION_CONSTANTS } from "@/constants/calculations";
const { STEP, SEARCH_SPAN } = CALCULATION_CONSTANTS.BORDER_OPTIMIZATION;
```

### Backward Compatibility

The constants maintain the same values as previously used inline constants, ensuring no changes to calculation behavior.

## Testing

### Constant Validation

Constants should be validated in tests:

```typescript
import { CALCULATION_CONSTANTS } from "@/constants/calculations";

describe("Calculation Constants", () => {
  test("border optimization constants are positive", () => {
    expect(CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.STEP).toBeGreaterThan(0);
    expect(
      CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.SEARCH_SPAN,
    ).toBeGreaterThan(0);
  });

  test("precision constants are valid", () => {
    expect(
      CALCULATION_CONSTANTS.PRECISION.DECIMAL_PLACES,
    ).toBeGreaterThanOrEqual(0);
    expect(CALCULATION_CONSTANTS.PRECISION.ROUNDING_MULTIPLIER).toBe(
      Math.pow(10, CALCULATION_CONSTANTS.PRECISION.DECIMAL_PLACES),
    );
  });
});
```

## Future Enhancements

### Planned Additions

- **Temperature constants**: For chemical calculations
- **Time constants**: For development timing
- **Exposure constants**: For reciprocity calculations
- **Validation ranges**: Min/max values for input validation

### Configuration Options

Future versions may support:

- Runtime configuration overrides
- User preference adjustments
- Platform-specific optimizations
- A/B testing of algorithm parameters

## Precision Utilities

The `utils/precision.ts` module provides optimized utility functions for consistent precision handling across the application.

### Available Functions

#### `roundToPrecision(value, places?)`

Rounds a number to a specified number of decimal places.

```typescript
import { roundToPrecision } from "@/utils/precision";

const result = roundToPrecision(3.14159, 3); // 3.142
const defaultResult = roundToPrecision(3.14159); // 3.14 (uses DECIMAL_PLACES constant)
```

**Parameters:**

- `value: number` - The number to round
- `places?: number` - Number of decimal places (defaults to `CALCULATION_CONSTANTS.PRECISION.DECIMAL_PLACES`)

**Returns:** `number` - The rounded value

#### `roundToStandardPrecision(value)`

Rounds a number to the standard 2-decimal precision using optimized integer math.

```typescript
import { roundToStandardPrecision } from "@/utils/precision";

const result = roundToStandardPrecision(3.14159); // 3.14
```

**Parameters:**

- `value: number` - The number to round

**Returns:** `number` - The rounded value

**Performance Note:** This function uses integer multiplication/division instead of `toFixed()` for better performance in calculation-heavy operations.

#### `createMemoKey(...values)`

Creates a consistent hash key for memoization with proper precision handling.

```typescript
import { createMemoKey } from "@/utils/precision";

// Mixed types supported
const key = createMemoKey(20.5, 24.3, true, "landscape"); // "2050:2430:true:landscape"

// Numbers are automatically rounded for consistent keys
const key1 = createMemoKey(20.501, 24.299); // "2050:2430"
const key2 = createMemoKey(20.499, 24.301); // "2050:2430" (same key)
```

**Parameters:**

- `...values: (number | boolean | string)[]` - Values to include in the key

**Returns:** `string` - A colon-separated key suitable for Map/Set operations

**Key Features:**

- Numbers are rounded using `ROUNDING_MULTIPLIER` for consistent precision
- Handles mixed data types (numbers, booleans, strings)
- Generates collision-resistant keys for memoization

### Integration with Constants

The precision utilities automatically use the centralized constants:

```typescript
// These are equivalent:
roundToStandardPrecision(value);
roundToPrecision(value, CALCULATION_CONSTANTS.PRECISION.DECIMAL_PLACES);

// Key generation uses ROUNDING_MULTIPLIER internally
createMemoKey(value); // Uses CALCULATION_CONSTANTS.PRECISION.ROUNDING_MULTIPLIER
```

### Migration from Manual Rounding

Replace manual precision handling with the utilities:

```typescript
// Before
const rounded = Math.round(value * 100) / 100;
const key = `${Math.round(w * 100)}:${Math.round(h * 100)}:${landscape}`;

// After
import { roundToStandardPrecision, createMemoKey } from "@/utils/precision";
const rounded = roundToStandardPrecision(value);
const key = createMemoKey(w, h, landscape);
```

## Related Files

- `utils/precision.ts` - Precision and rounding utilities (NEW)
- `constants/calculations.ts` - Centralized calculation constants
- `utils/borderCalculations.ts` - Uses border optimization constants and precision utilities
- `hooks/borderCalculator/` - Implements algorithms using these constants
- `components/border-calculator/` - UI components that display calculated values
- `workers/borderCalculations.worker.ts` - Web worker using calculation constants

## See Also

- [Precision Utilities API](./PRECISION_UTILITIES.md) - Detailed API documentation for precision utilities
- [Project Structure](../README.md#project-structure) - Overall architecture
- [Border Calculator Documentation](../calculator-info/formulas/borderCalculator.md) - Algorithm details
- [Performance Optimization Guide](../README.md#performance-optimizations) - Performance considerations
