# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `bun run dev` or `bunx expo start` - Start development server with options for iOS, Android, or web
- `bun run web` - Start web version specifically  
- `bun run ios` - Start iOS simulator
- `bun run android` - Start Android emulator
- `bun test` - Run Jest tests
- `bun run lint` - Run linting (use this for code quality checks)

### Build and Deployment

- `bun run build` or `expo export -p web` - Build web version
- `bun run vercel-build` - Build for Vercel deployment
- `bun run deploy` - Deploy to Vercel
- `bun run clean` - Clean node_modules, .expo, and dist directories

### Testing

- `bun test` - Run all Jest tests
- Tests are located in `__tests__/` directories and use jest-expo preset

## Architecture Overview

### Tech Stack

- **Framework**: React Native with Expo SDK 53, file-based routing via Expo Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: NativeWind (Tailwind CSS for React Native) + Gluestack UI components
- **Package Manager**: Bun (preferred) or npm
- **Platforms**: iOS, Android, and responsive web with platform-specific navigation

### Project Structure

```structure
app/(tabs)/           # Tab-based navigation screens
  _layout.tsx         # Complex responsive navigation (mobile tabs, desktop top nav, mobile web sidebar)
  index.tsx           # Home screen
  border.tsx          # Print Border Calculator
  resize.tsx          # Print Resizing Calculator  
  exposure.tsx        # Stop-Based Exposure Calculator
  cameraExposure.tsx  # Camera Exposure Calculator
  reciprocity.tsx     # Reciprocity Calculator
  settings.tsx        # Settings screen

hooks/                # Calculator logic and utilities
  useBorderCalculator.ts      # Print border blade positioning
  useExposureCalculator.ts    # Stop-based exposure adjustments
  useCameraExposureCalculator.ts # Camera exposure triangle calculations
  useReciprocityCalculator.ts # Film reciprocity failure compensation
  useResizeCalculator.ts      # Print size scaling calculations
  commonFunctions.ts          # Shared utility functions

components/           # Reusable UI components
  ui/                 # Gluestack UI component wrappers
  ThemedText.tsx      # Theme-aware text component
  ThemedView.tsx      # Theme-aware view component
  NumberInput.tsx     # Numeric input with validation
  SelectList.tsx      # Custom select component

constants/            # Data and calculation constants
  border.ts           # Paper sizes, aspect ratios, easel configurations
  exposure.ts         # Exposure calculation constants
  reciprocity.ts      # Film reciprocity data
  Colors.ts           # Theme color definitions

utils/                # Pure calculation functions
  borderCalculations.ts # Core border geometry calculations
```

### Navigation Architecture

The app uses a sophisticated responsive navigation system:

- **Mobile Native**: Bottom tab navigation with haptic feedback
- **Desktop Web**: Top horizontal navigation bar  
- **Mobile Web**: Hamburger menu with animated sidebar
- All implemented in `app/(tabs)/_layout.tsx` with responsive breakpoints

### Calculator Hook Pattern

Calculator hooks follow a consistent pattern:

1. Accept input parameters via state
2. Perform calculations using pure functions from `utils/` or `constants/`
3. Return calculated values and helper functions
4. Handle validation and error states
5. Implement memoization for performance

Key calculators:

- **Border Calculator**: Calculates blade positions for darkroom easels based on paper size and desired borders
- **Resize Calculator**: Determines exposure adjustments when changing print sizes
- **Exposure Calculator**: Handles stop-based exposure calculations
- **Camera Exposure**: Implements exposure triangle relationships (aperture, shutter, ISO)
- **Reciprocity**: Compensates for film reciprocity failure at long exposures

### Styling Approach

- NativeWind for utility-first styling with Tailwind classes
- Gluestack UI for consistent cross-platform components
- Theme-aware components that adapt to light/dark mode
- Platform-specific styling handled through Tailwind responsive prefixes
- Colors defined in `constants/Colors.ts` with light/dark variants

### File Naming Conventions

- Calculator screens: descriptive names (border.tsx, cameraExposure.tsx)
- Hooks: use + descriptive name (useBorderCalculator.ts)
- Components: PascalCase (ThemedText.tsx, NumberInput.tsx)
- Utilities: camelCase (borderCalculations.ts)
- Constants: camelCase (border.ts, reciprocity.ts)

### Testing Strategy

- Jest with jest-expo preset
- Component tests in `__tests__/` directories
- Hook tests for calculator logic
- Snapshot testing for UI components
- Focus on testing calculation accuracy and edge cases

### Performance Considerations

- Calculator hooks use useMemo for expensive calculations
- Components are properly memoized where needed
- Image assets optimized for multiple platforms
- Bundle optimization for web deployment
- Platform-specific optimizations in navigation

### Cross-Platform Compatibility

- Expo Router handles routing across platforms
- Responsive design adapts to different screen sizes
- Platform-specific components where needed (TabBarBackground.ios.tsx)
- Consistent user experience across iOS, Android, and web

### Rules

- Assume the expo server is already running-- don't try to run `bun run dev`.
- We should aim for consistency in styling, including libraries used.
- When grepping the codebase, use ripgrep `rg` instead of standard grep.
