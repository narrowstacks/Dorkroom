# Dorkroom

Dorkroom is a cross-platform React Native application built with Expo, designed to provide photographers with essential calculators for darkroom printing, film developing, and photography workflows. The app features multiple specialized calculators with real-time calculations, preset management, and responsive design across mobile, tablet, and web platforms.

## Features

### Fully Implemented Calculators

- **Print Border Calculator**: Calculate blade positions for adjustable darkroom easels with various paper sizes, aspect ratios, and border configurations
- **Print Resizing Calculator**: Calculate exposure adjustments and enlarger settings when changing print sizes
- **Stop-Based Exposure Calculator**: Calculate exposure adjustments by stops with precise timing
- **Camera Exposure Calculator**: Calculate equivalent camera exposure settings across aperture, shutter speed, and ISO
- **Reciprocity Calculator**: Calculate reciprocity failure compensation for various film stocks and long exposures
- **Development Recipes**: Comprehensive database of film development recipes with search, filtering, and custom recipe creation

### Additional Features

- **Settings**: App configuration and preferences
- **Cross-platform Support**: Native iOS, Android, and responsive web application
- **Preset Management**: Save, share, and manage calculation presets
- **Responsive Design**: Optimized for mobile phones, tablets, and desktop browsers
- **Real-time Calculations**: Instant feedback with performance-optimized calculations using Web Workers
- **Dark/Light Theme**: Automatic theme switching based on system preferences

## Technology Stack

- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript with strict type checking
- **Package Manager**: Bun (preferred for faster builds and installs)
- **Runtime**: Node.js
- **Architecture**: Expo Router (File-based routing with typed routes)
- **Styling**: NativeWind (Tailwind CSS v4 for React Native) with Gluestack UI components
- **State Management**: React hooks with custom calculator hooks
- **Performance**: Web Workers for heavy calculations, React.memo optimizations
- **Testing**: Jest with React Native Testing Library
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, commitlint
- **Deployment**: Vercel for web hosting with static site generation

## Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- iOS Simulator (for iOS development)
- Android Studio and emulator (for Android development)

### Installation

1. Install Bun (recommended for faster performance):

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Clone and install dependencies:

   ```bash
   git clone https://github.com/narrowstacks/Dorkroom.git
   cd DorkroomReact
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

### Development Options

Choose your preferred development environment:

- **[Development build](https://docs.expo.dev/develop/development-builds/introduction/)** - Full native features
- **[iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)** - Test iOS-specific features
- **[Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)** - Test Android-specific features
- **[Web Browser](https://docs.expo.dev/workflow/web/)** - Responsive web version
- **[Expo Go](https://expo.dev/go)** - Quick testing on physical devices

## Project Structure

```
DorkroomReact/
├── app/                          # Expo Router file-based routing
│   ├── (tabs)/                   # Tab navigation layout
│   │   ├── index.tsx            # Home/Dashboard screen
│   │   ├── border.tsx           # Print Border Calculator
│   │   ├── resize.tsx           # Print Resizing Calculator
│   │   ├── exposure.tsx         # Stop-Based Exposure Calculator
│   │   ├── cameraExposure.tsx   # Camera Exposure Calculator
│   │   ├── reciprocity.tsx      # Reciprocity Calculator
│   │   ├── developmentRecipes.tsx # Development Recipes
│   │   └── settings.tsx         # App Settings
│   ├── _layout.tsx              # Root layout with providers
│   ├── +html.tsx                # Web-specific HTML template
│   └── +not-found.tsx           # 404 error page
├── components/                   # Reusable UI components
│   ├── border-calculator/        # Border calculator specific components
│   ├── development-recipes/      # Recipe management components
│   └── ui/                      # Core UI components and providers
├── hooks/                       # Custom hooks for calculator logic
│   ├── borderCalculator/        # Modular border calculator hooks
│   └── [calculator-name].ts     # Individual calculator hooks
├── api/                         # API clients and data management
├── constants/                   # App constants and configuration
│   ├── calculations.ts          # Mathematical constants and algorithm parameters
│   └── [feature-name].ts        # Feature-specific constants
├── utils/                       # Utility functions and calculations
│   ├── precision.ts             # Precision and rounding utilities
│   └── [utility-name].ts        # Feature-specific utilities
├── workers/                     # Web Workers for performance
├── types/                       # TypeScript type definitions
└── styles/                      # Global styles and Tailwind config
```

## Available Scripts

### Development

- `bun run dev` - Start development server with platform selection
- `bun run ios` - Start iOS simulator
- `bun run android` - Start Android emulator
- `bun run web` - Start web development server
- `bun run start` - Start development build client

### Building & Deployment

- `bun run build` - Build optimized web version
- `bun run web-export` - Export static web build
- `bun run deploy` - Deploy to Vercel
- `bun run clean` - Clean build artifacts and dependencies

### Code Quality

- `bun run lint` - Run ESLint code linting
- `bun run format` - Format code with Prettier
- `bun test` - Run Jest test suite
- `bun run commit` - Interactive conventional commit

### Project Management

- `bun run reset-project` - Reset to blank Expo project (development tool)

## Development Features

### Performance Optimizations

- **Web Workers**: Heavy calculations run in background threads
- **Memoization**: React.memo and useMemo for expensive operations
- **Throttling**: Input throttling to reduce calculation frequency
- **Bundle Optimization**: Tree-shaking and code splitting for web builds
- **Centralized Constants**: Mathematical constants and algorithm parameters centralized for consistency and performance tuning

### Code Quality Tools

- **TypeScript**: Strict type checking for reliability
- **ESLint**: Airbnb configuration with React Native rules
- **Prettier**: Automatic code formatting with Tailwind plugin
- **Husky**: Pre-commit hooks for code quality enforcement
- **Commitlint**: Conventional commit message format

### Testing Strategy

- **Unit Tests**: Jest with React Native Testing Library
- **Component Tests**: Snapshot testing for UI consistency
- **Hook Tests**: Calculator logic validation
- **Performance Tests**: Calculation accuracy and speed validation

## Learn More

### Framework Documentation

- [Expo Documentation](https://docs.expo.dev/) - Expo SDK and tools
- [React Native Documentation](https://reactnative.dev/) - React Native framework
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/) - File-based routing

### Styling and UI

- [NativeWind Documentation](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [Gluestack UI Documentation](https://ui.gluestack.io/) - Component library
- [Tailwind CSS Documentation](https://tailwindcss.com/) - Utility-first CSS framework

### Development Tools

- [Bun Documentation](https://bun.sh/docs) - Fast JavaScript runtime and package manager
- [TypeScript Documentation](https://www.typescriptlang.org/) - Static type checking

## Project Status

**Current Status**: Active development with all core calculators implemented and functional across iOS, Android, and web platforms.

**Recent Updates**:

- ✅ Complete mobile and tablet responsive design
- ✅ All six calculator modules fully implemented
- ✅ Development recipe database with search and filtering
- ✅ Performance optimizations with Web Workers
- ✅ Centralized calculation constants for improved maintainability
- ✅ Precision utilities for consistent mathematical operations
- ✅ Comprehensive testing suite
- ✅ Modern development toolchain with Bun support
- ✅ Vercel deployment pipeline

**Deployment**: The web version is deployed and accessible via Vercel with automatic deployments from the main branch.

## Contributing

This project follows conventional commit standards and includes automated code quality checks. Please ensure all tests pass and follow the established coding conventions before submitting contributions.
