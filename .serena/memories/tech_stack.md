# Tech Stack and Architecture

## Core Framework

- **React Native** with **Expo** - Cross-platform mobile development
- **TypeScript** - Type safety and better developer experience
- **Expo Router** - File-based routing system

## UI and Styling

- **Gluestack UI** - Component library for consistent UI elements
- **NativeWind** - Tailwind CSS for React Native styling
- **React Native Reanimated** - High-performance animations

## Development Tools

- **Metro** - React Native bundler (both .js and .cjs configs present)
- **Babel** - JavaScript transpilation
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Commitlint** - Commit message linting

## Testing

- **Jest** - Unit testing framework (evident from test files)
- Tests found in:
  - `utils/__tests__/` - Utility function tests
  - `hooks/__tests__/` - Custom hook tests
  - `components/__tests__/` - Component tests
  - `api/dorkroom/__tests__/` - API tests

## Performance Optimizations

- **Web Workers** - Heavy calculations moved to background threads
- **Throttling** - Input throttling for real-time calculations
- **React.memo** - Component optimization mentioned in conventions

## Architecture Patterns

- **Custom Hooks** - Business logic separated into reusable hooks
- **Component-based** - Modular UI components
- **Responsive Design** - Mobile-first with desktop adaptations
- **Cross-platform Components** - Platform-specific implementations where needed
