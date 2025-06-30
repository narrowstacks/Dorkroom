# DorkroomReact Testing Implementation Plan

## Executive Summary

The DorkroomReact project currently has minimal test coverage despite having a robust testing infrastructure in place. With Jest configured using the jest-expo preset and React Native Testing Library available, the foundation exists to implement comprehensive testing. This document outlines a prioritized plan to achieve thorough test coverage across the application.

## Current State Analysis

### Existing Tests

- ✅ `utils/__tests__/borderCalculations.test.ts` - Comprehensive utility function tests
- ✅ `utils/__tests__/borderCalculations.performance.test.ts` - Performance benchmarks
- ✅ `utils/__tests__/dilutionUtils.test.ts` - Dilution calculation tests
- ✅ `components/__tests__/ThemedText-test.tsx` - Basic component snapshot test
- ✅ `api/dorkroom/__tests__/client.test.ts` - API client tests
- ✅ `api/dorkroom/__tests__/enhanced-client.test.ts` - Enhanced API tests
- ⚠️ `hooks/__tests__/useBorderCalculator.test.skip.ts` - Skipped hook test

### Testing Infrastructure

- **Framework**: Jest with jest-expo preset
- **Component Testing**: React Native Testing Library + react-test-renderer
- **Test Command**: `bun test`
- **Pattern**: Tests in `__tests__/` directories
- **Configuration**: Configured in package.json with jest-expo preset

## Testing Gaps Analysis

### Critical Missing Tests (Priority 1)

#### Calculator Hooks

- `hooks/useBorderCalculator.ts` - **HIGH PRIORITY** Core business logic
- `hooks/useExposureCalculator.ts` - Critical calculation logic
- `hooks/useReciprocityCalculator.ts` - Complex time calculations
- `hooks/useCameraExposureCalculator.ts` - Camera-specific calculations
- `hooks/useResizeCalculator.ts` - Print resizing calculations
- `hooks/useChemistryCalculator.ts` - Chemical mixing calculations
- `hooks/borderCalculator/useBorderCalculatorState.ts` - State management
- `hooks/borderCalculator/useDimensionCalculations.ts` - Geometry calculations
- `hooks/borderCalculator/useGeometryCalculations.ts` - Complex geometry
- `hooks/borderCalculator/useWarningSystem.ts` - Validation logic

#### Core Utilities

- `utils/githubIssueGenerator.ts` - Data formatting and URL generation
- `utils/presetSharing.ts` - Encoding/decoding logic
- `utils/appDetection.ts` - Platform detection logic
- `utils/urlHelpers.ts` - URL generation and parsing

#### API Integration

- Additional coverage for `api/dorkroom/transport.ts` - Circuit breaker and retry logic
- Enhanced error handling scenarios

### Important Missing Tests (Priority 2)

#### Core Components

- `components/ui/forms/NumberInput.tsx` - Complex input component
- `components/ui/forms/LabeledSliderInput.tsx` - Slider with validation
- `components/ui/forms/TextInput.tsx` - Text input with mobile support
- `components/ui/select/ThemedSelect.tsx` - Cross-platform select
- `components/ui/search/SearchDropdown.tsx` - Dynamic search functionality
- `components/development-recipes/ChemistryCalculator.tsx` - Calculator component
- `components/border-calculator/mobile/MobileBorderCalculator.tsx` - Complex mobile UI

#### Hooks (Non-Calculator)

- `hooks/useCustomRecipes.ts` - Storage and state management
- `hooks/useDevelopmentRecipes.ts` - API integration hook
- `hooks/useAppDetection.ts` - Platform detection hook
- `hooks/useSharedPresetLoader.ts` - Preset loading logic

### Nice-to-Have Tests (Priority 3)

#### Simple Components

- `components/ui/core/ThemedText.tsx` - Enhanced beyond snapshot
- `components/ui/feedback/AppBanner.tsx` - Simple notification component
- `components/ui/feedback/WarningAlert.tsx` - Alert component
- `components/ui/layout/Collapsible.tsx` - Accordion component

#### Simple Utilities

- `utils/throttle.ts` - Throttling utilities
- `utils/debugLogger.ts` - Logging utilities
- `hooks/useThemeColor.ts` - Theme utilities
- `hooks/useColorScheme.ts` - Color scheme detection

## Implementation Plan

### Phase 1: Critical Business Logic (2-3 weeks)

#### Week 1: Calculator Hooks Foundation

**Target: Core calculation hooks**

1. **`hooks/__tests__/useBorderCalculator.test.ts`** ✅ DONE
   - Test calculation accuracy with various inputs
   - Test edge cases (zero dimensions, extreme ratios)
   - Test state management and updates
   - Mock external dependencies (AsyncStorage)
   - Test preset loading and saving

2. **`hooks/__tests__/useExposureCalculator.test.ts`** ✅ DONE
   - Test exposure time calculations
   - Test stop adjustments (positive/negative)
   - Test edge cases (zero time, extreme stops)
   - Validate mathematical accuracy

3. **`hooks/__tests__/useReciprocityCalculator.test.ts`** ✅ DONE
   - Test time parsing and formatting
   - Test reciprocity calculations for different films
   - Test custom factor applications
   - Test time validation and error handling

#### Week 2: Border Calculator Ecosystem

**Target: Border calculator sub-hooks**

4. **`hooks/borderCalculator/__tests__/useBorderCalculatorState.test.ts`** ✅ DONE
   - Test reducer logic for all actions
   - Test state initialization and persistence
   - Test complex state transitions

5. **`hooks/borderCalculator/__tests__/useDimensionCalculations.test.ts`** ✅ DONE
   - Test dimension fitting algorithms
   - Test aspect ratio calculations
   - Test constraint handling

6. **`hooks/borderCalculator/__tests__/useGeometryCalculations.test.ts`** ✅ DONE
   - Test geometric calculations
   - Test coordinate transformations
   - Test positioning algorithms

#### Week 3: Critical Utilities

**Target: Core utility functions**

7. **`utils/__tests__/githubIssueGenerator.test.ts`** ✅ DONE
   - Test URL generation
   - Test data formatting
   - Test temperature conversions
   - Test edge cases and validation

8. **`utils/__tests__/presetSharing.test.ts`** ✅ DONE
   - Test encoding/decoding symmetry
   - Test data integrity
   - Test error handling for malformed data

### Phase 2: Core Components & Integration (2-3 weeks)

#### Week 4-5: Form Components ✅ COMPLETED

**Target: Critical UI components**

9. **`components/ui/forms/__tests__/NumberInput.test.tsx`** ✅ DONE
   - ✅ Test input validation (numeric pattern regex, text change validation)
   - ✅ Test increment/decrement functionality (various step values, NaN handling, zero clamping)
   - ✅ Test mobile modal behavior (stepper buttons, confirm/cancel logic)
   - ✅ Test accessibility (label generation, platform-specific behavior)
   - **18 tests, 63 expect() calls**

10. **`components/ui/forms/__tests__/LabeledSliderInput.test.tsx`** ✅ DONE
    - ✅ Test slider interactions (platform-specific components, continuous vs discrete modes)
    - ✅ Test value changes and validation (range validation, format conversion)
    - ✅ Test throttling behavior (web vs native timing, cleanup, velocity-based haptics)
    - ✅ Test performance optimizations (memoization, callback dependencies)
    - **37 tests, 93 expect() calls**

11. **`components/ui/select/__tests__/ThemedSelect.test.tsx`** ✅ DONE
    - ✅ Test item selection (normalization, label finding, selection state)
    - ✅ Test platform-specific behavior (theme integration, dropdown behavior)
    - ✅ Test data formatting (string vs object items, divider handling)
    - ✅ Test edge cases (malformed data, null handling, duplicate values)
    - **32 tests, 79 expect() calls**

**Week 4-5 Summary**: ✅ **87 total tests implemented** with **235 expect() calls** covering critical form component business logic. All tests focus on core functionality without React Native component rendering issues, ensuring robust coverage of input validation, platform-specific behavior, performance optimizations, and edge case handling.

#### Week 6: Complex Components

**Target: Calculator components**

12. **`components/development-recipes/__tests__/ChemistryCalculator.test.tsx`** ✅ DONE
    - Test calculation rendering
    - Test user interactions
    - Test data flow

13. **`components/border-calculator/mobile/__tests__/MobileBorderCalculator.test.tsx`** ✅ DONE
    - Test mobile-specific behavior
    - Test drawer interactions
    - Test state management integration

### Phase 3: Remaining Coverage (2 weeks)

#### Week 7-8: Complete Coverage

**Target: Remaining hooks and utilities**

14. **`hooks/__tests__/useCustomRecipes.test.ts`** ✅ DONE
15. **`hooks/__tests__/useDevelopmentRecipes.test.ts`** ✅ DONE
16. **`api/dorkroom/__tests__/transport.test.ts`** (enhanced coverage) ✅ DONE
17. Additional component tests as needed

## Testing Guidelines

### Test Structure Standards

#### Hook Tests

```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useExampleHook } from "../useExampleHook";

describe("useExampleHook", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useExampleHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it("should update value when action is called", () => {
    const { result } = renderHook(() => useExampleHook());
    act(() => {
      result.current.updateValue(newValue);
    });
    expect(result.current.value).toBe(newValue);
  });
});
```

#### Component Tests

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExampleComponent } from '../ExampleComponent';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ExampleComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });

  it('handles user interactions', () => {
    const mockHandler = jest.fn();
    const { getByRole } = render(
      <ExampleComponent onPress={mockHandler} />
    );
    fireEvent.press(getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

#### Utility Tests

```typescript
import { utilityFunction } from "../utilityFunction";

describe("utilityFunction", () => {
  it("should handle normal cases", () => {
    expect(utilityFunction(input)).toBe(expectedOutput);
  });

  it("should handle edge cases", () => {
    expect(utilityFunction(null)).toBe(fallbackValue);
    expect(utilityFunction(undefined)).toBe(fallbackValue);
  });

  it("should throw on invalid input", () => {
    expect(() => utilityFunction(invalidInput)).toThrow("Expected error");
  });
});
```

### Mocking Strategies

#### React Native APIs

```typescript
// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  select: jest.fn((options) => options.ios),
}));
```

#### External Libraries

```typescript
// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
}));

// Mock expo-clipboard
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));
```

### Testing Best Practices

#### Calculator Logic Testing

1. **Test mathematical accuracy** with known inputs/outputs
2. **Test edge cases**: zero values, negative values, extreme values
3. **Test validation**: invalid inputs, type mismatches
4. **Test state persistence**: hook state across re-renders
5. **Test performance**: calculations complete within reasonable time

#### Component Testing

1. **Snapshot tests** for UI consistency
2. **Interaction tests** for user behavior
3. **Accessibility tests** for screen readers
4. **Platform-specific behavior** testing
5. **Error boundary testing** for graceful failures

#### Integration Testing

1. **End-to-end workflows**: complete calculator operations
2. **Data flow testing**: props → hooks → calculations → UI
3. **State management**: complex state transitions
4. **API integration**: mock network requests appropriately

## Effort Estimation

### Time Investment

- **Phase 1**: 15-20 hours (Critical business logic)
- **Phase 2**: 15-20 hours (Core components)
- **Phase 3**: 10-15 hours (Remaining coverage)
- **Total**: 40-55 hours

### Implementation Strategy

1. **Start with existing patterns** from current tests
2. **Focus on business logic first** (calculator hooks)
3. **Build component tests incrementally**
4. **Add integration tests last**
5. **Maintain consistent naming and structure**

## Success Metrics

### Coverage Targets

- **Hooks**: 90%+ coverage for calculator hooks
- **Utilities**: 95%+ coverage for mathematical functions
- **Components**: 80%+ coverage for core UI components
- **Integration**: Key user workflows tested

### Quality Indicators

- All tests pass consistently
- Tests run in under 30 seconds
- Tests catch real bugs during development
- Tests serve as documentation for complex logic
- Tests enable confident refactoring

## Maintenance Strategy

### Ongoing Testing

- **New features require tests** before merge
- **Bug fixes include regression tests**
- **Refactoring maintains test coverage**
- **Performance tests for optimization validation**

### Test Organization

- Keep tests close to source code
- Maintain consistent test naming
- Group related tests logically
- Document complex test scenarios
- Regular test suite maintenance

## Conclusion

This comprehensive testing plan addresses the current testing gaps in the DorkroomReact project. By following the prioritized implementation approach, the project will achieve robust test coverage that ensures calculation accuracy, UI consistency, and overall application reliability. The phased approach allows for incremental progress while maintaining development velocity.

The investment in comprehensive testing will pay dividends in:

- **Reduced bugs** in production
- **Faster development** with confidence in changes
- **Better documentation** through test examples
- **Easier refactoring** with safety nets
- **Improved code quality** through test-driven practices
