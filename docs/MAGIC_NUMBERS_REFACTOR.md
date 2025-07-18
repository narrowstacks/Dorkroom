# Magic Numbers Refactor Summary

This document summarizes the refactoring work done to eliminate magic numbers and improve code maintainability.

## Files Created

### 1. `constants/calculations.ts`

- Centralized location for all calculation-related constants
- Organized into logical groups: timing, optimization, cache, precision, and paper standards
- Includes derived constants for computed values

### 2. `utils/precision.ts`

- Utility functions for consistent precision handling
- Standardized rounding operations
- Memoization key generation with consistent precision

## Files Modified

### 1. `utils/borderCalculations.ts`

**Magic numbers eliminated:**

- `20 * 24` → `DERIVED_CONSTANTS.BASE_PAPER_AREA`
- `0.01` → `CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.STEP`
- `0.5` → `CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.SEARCH_SPAN`
- `0.25` → `CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.SNAP`
- `1e-9` → `CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.EPSILON`
- `50` → `CALCULATION_CONSTANTS.CACHE.MAX_MEMO_SIZE`
- `100` → `CALCULATION_CONSTANTS.BORDER_OPTIMIZATION.ADAPTIVE_STEP_DIVISOR`
- `2` → `CALCULATION_CONSTANTS.PAPER.MAX_SCALE_FACTOR`
- `Math.round(value * 100) / 100` → `roundToStandardPrecision(value)`
- Manual key generation → `createMemoKey(...values)`

### 2. `hooks/borderCalculator/useWarningSystem.ts`

**Magic numbers eliminated:**

- `250` → `CALCULATION_CONSTANTS.DEBOUNCE_WARNING_DELAY`

### 3. `hooks/useExposureCalculator.ts`

**Magic numbers eliminated:**

- `Math.floor(value * 100) / 100` → `roundToStandardPrecision(value)`
- `.toFixed(2)` → `roundToStandardPrecision(value).toString()`

### 4. `constants/reciprocity.ts`

**Cleaned up:**

- Removed unused `BLADE_THICKNESS` constant (was inconsistent with border calculator)

## Benefits Achieved

### 1. **Maintainability**

- All calculation constants are now in one place
- Easy to modify timing, precision, or optimization parameters
- Clear semantic meaning for all numeric values

### 2. **Consistency**

- Standardized precision handling across the application
- Unified approach to rounding and memoization
- Eliminated duplicate/inconsistent constants

### 3. **Type Safety**

- All constants are properly typed with `as const`
- Import-time validation of constant usage
- Better IDE support and autocomplete

### 4. **Performance**

- Optimized memoization key generation
- Consistent precision operations
- Reduced code duplication

## Usage Examples

### Before:

```typescript
// Scattered magic numbers
const key = `${Math.round(paperW * 100)}:${Math.round(paperH * 100)}:${landscape}`;
const rounded = Math.round(value * 100) / 100;
setTimeout(() => {
  /* ... */
}, 250);
```

### After:

```typescript
// Semantic constants and utilities
const key = createMemoKey(paperW, paperH, landscape);
const rounded = roundToStandardPrecision(value);
setTimeout(() => {
  /* ... */
}, CALCULATION_CONSTANTS.DEBOUNCE_WARNING_DELAY);
```

## Future Improvements

1. **Additional Constants**: Continue identifying and extracting magic numbers in other parts of the codebase
2. **Configuration**: Consider making some constants configurable via environment variables or user preferences
3. **Documentation**: Add JSDoc comments to explain the reasoning behind specific constant values
4. **Testing**: Add unit tests for the precision utilities and constant calculations

## Migration Notes

- All changes are backward compatible
- Existing functionality remains unchanged
- No breaking changes to public APIs
- Constants can be easily adjusted without touching calculation logic
