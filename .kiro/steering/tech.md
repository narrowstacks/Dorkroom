# Technology Stack

## Core Framework

- **React Native** with **Expo SDK 53** for cross-platform development
- **TypeScript** with strict type checking for reliability
- **Expo Router** for file-based routing with typed routes

## Package Management & Runtime

- **Bun** (preferred) for faster builds and installs
- **Node.js** as fallback runtime
- Uses ES modules (`"type": "module"` in package.json)

## Styling & UI

- **NativeWind** (Tailwind CSS v4 for React Native) for styling
- **Gluestack UI** component library for consistent UI components
- **Lucide React Native** for icons
- **React Native Reanimated** for animations
- **@legendapp/motion** for enhanced animations

## State Management & Performance

- **React hooks** with custom calculator hooks for state management
- **Web Workers** for heavy calculations to maintain UI responsiveness
- **React.memo** and **useMemo** for performance optimizations
- **AsyncStorage** for data persistence

## Development Tools

- **ESLint** with Expo configuration
- **Prettier** with Tailwind plugin for code formatting
- **Husky** + **lint-staged** for pre-commit hooks
- **Commitlint** with conventional commits
- **Jest** with React Native Testing Library for testing

## Build & Deployment

- **Metro** bundler with custom configuration
- **Vercel** for web deployment with static site generation
- **EAS Build** for native app builds

## Common Commands

### Development

```bash
# Start development server (preferred)
bun run dev

# Platform-specific development
bun run ios          # iOS simulator
bun run android      # Android emulator
bun run web          # Web browser

# Alternative start command
bun run start        # Development build client
```

### Building & Deployment

```bash
# Build web version
bun run build

# Export static web build
bun run web-export

# Deploy to Vercel
bun run deploy

# Clean build artifacts
bun run clean
```

### Code Quality

```bash
# Run linting
bun run lint

# Format code
bun run format

# Run tests
bun test

# Interactive commit (conventional commits)
bun run commit
```

### Project Management

```bash
# Install dependencies
bun install

# Reset to blank Expo project (dev tool)
bun run reset-project
```

## Architecture Patterns

### Modular Hook Architecture

- Calculator logic split into focused, reusable hooks
- Example: `useBorderCalculator` composed of multiple specialized hooks
- State management, calculations, and UI logic separated

### File-based Routing

- Expo Router with `app/` directory structure
- Tab navigation in `app/(tabs)/`
- Typed routes with `experiments.typedRoutes: true`

### Cross-platform Components

- Platform-specific files using `.ios.tsx`, `.android.tsx`, `.web.tsx` extensions
- Responsive design with breakpoint-based layouts
- Shared components in `components/ui/` with platform variants

### Performance Optimization

- Web Workers for heavy calculations (`workers/` directory)
- Throttled inputs to reduce calculation frequency
- Memoized components and calculations
