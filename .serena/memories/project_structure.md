# Project Structure Overview

## Main Directories

### `/app` - Application Pages (Expo Router)

- **`(tabs)/`** - Tab-based navigation screens
  - `border.tsx` - Border calculator screen
  - `exposure.tsx` - Exposure calculator screen
  - `cameraExposure.tsx` - Camera exposure calculator
  - `reciprocity.tsx` - Reciprocity calculator
  - `resize.tsx` - Resize calculator
  - `developmentRecipes.tsx` - Recipe database screen
  - `settings.tsx` - App settings
  - `index.tsx` - Home/landing screen
- **`_layout.tsx`** - Root layout configuration
- **Navigation files** - Route configuration and layouts

### `/components` - Reusable UI Components

- **`ui/`** - Core UI component library
  - `core/` - Basic themed components (ThemedText, ThemedView, etc.)
  - `forms/` - Form inputs (NumberInput, TextInput, Sliders, etc.)
  - `layout/` - Layout components (CalculatorLayout, ParallaxScrollView)
  - `select/` - Selection components and dropdowns
  - `calculator/` - Calculator-specific UI components
  - `feedback/` - User feedback components (banners, alerts)
- **`border-calculator/`** - Border calculator specific components
  - Mobile-optimized components and modals
  - Animated preview components
- **`development-recipes/`** - Recipe management components

### `/hooks` - Custom React Hooks

- **Business logic hooks** for each calculator type
- **`borderCalculator/`** - Comprehensive border calculation logic
- **Common functions** - Shared calculation utilities
- **Validation and state management** hooks

### `/constants` - Static Data and Configuration

- Calculator-specific constants (border sizes, film types, etc.)
- Color themes and styling constants
- API URLs and endpoints

### `/utils` - Utility Functions

- **Calculation utilities** (borderCalculations.ts, etc.)
- **Helper functions** for data processing
- **Platform detection** and responsive utilities

### `/types` - TypeScript Type Definitions

- Interface definitions for calculators
- Preset and recipe type definitions
- Component prop types

### `/workers` - Web Workers

- **Background calculation processing** for performance
- Heavy computational tasks moved off main thread

### `/api` - External API Integration

- **`dorkroom/`** - API client for external services
- Error handling and data transport layers

## Configuration Files

- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`metro.config.js/.cjs`** - Metro bundler config
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`eslint.config.js`** - ESLint rules
- **`.prettierrc*`** - Code formatting rules
- **`app.json`** - Expo configuration

## Key Architectural Principles

- **Feature-based organization** - Each calculator has its own components/hooks
- **Shared UI components** - Reusable across all calculators
- **Platform-specific implementations** - Native vs Web optimizations
- **Performance-first** - Workers and throttling for smooth UX
