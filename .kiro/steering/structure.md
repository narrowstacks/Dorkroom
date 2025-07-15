# Project Structure

## Root Directory Organization

```
DorkroomReact/
├── app/                    # Expo Router file-based routing
├── components/             # Reusable UI components
├── hooks/                  # Custom hooks for business logic
├── api/                    # API clients and data management
├── constants/              # App constants and configuration
├── utils/                  # Utility functions and calculations
├── workers/                # Web Workers for performance
├── types/                  # TypeScript type definitions
├── styles/                 # Global styles and Tailwind config
├── assets/                 # Static assets (images, fonts)
├── ios/                    # iOS-specific native code
├── android/                # Android-specific native code
└── docs/                   # Documentation
```

## Key Directory Details

### `app/` - Expo Router Structure

- **File-based routing** with typed routes
- `app/(tabs)/` - Tab navigation layout group
- `app/_layout.tsx` - Root layout with providers
- `app/+html.tsx` - Web-specific HTML template
- `app/+not-found.tsx` - 404 error page
- Each calculator has its own route file (e.g., `border.tsx`, `exposure.tsx`)

### `components/` - Component Architecture

```
components/
├── ui/                     # Core reusable UI components
│   ├── core/              # Basic themed components (ThemedText, ThemedView)
│   ├── forms/             # Form inputs and controls
│   ├── feedback/          # Alerts, banners, haptic feedback
│   ├── calculator/        # Calculator-specific UI components
│   └── layout/            # Layout and navigation components
├── border-calculator/      # Border calculator specific components
├── development-recipes/    # Recipe management components
└── infobase/              # Film/developer info components
```

### `hooks/` - Modular Hook Architecture

```
hooks/
├── borderCalculator/       # Modular border calculator hooks
│   ├── useBorderCalculatorState.ts    # Core state management
│   ├── useDimensionCalculations.ts    # Paper size calculations
│   ├── useGeometryCalculations.ts     # Print size, borders
│   ├── useWarningSystem.ts            # Debounced warnings
│   ├── useImageHandling.ts            # Image operations
│   └── useInputHandlers.ts            # Input validation
├── useExposureCalculator.ts           # Individual calculator hooks
├── useReciprocityCalculator.ts
├── useDevelopmentRecipes.ts
└── utils/                             # Hook utilities
```

### `api/` - Data Management

- `dorkroom/` - API client with transport layer and error handling
- Individual API modules for films, developers, combinations
- Comprehensive test coverage in `__tests__/`

### `constants/` - Configuration

- Color themes and design tokens
- Calculator-specific constants (exposure values, film data)
- Feature flags and URL configurations
- Brand and preset data

### `utils/` - Utility Functions

- Calculation utilities (border calculations, dilution formulas)
- Search and filtering (fuzzy search, tokenized search)
- Platform detection and app detection
- Sharing and URL helpers
- Performance utilities (throttling, debouncing)

## File Naming Conventions

### Component Files

- **PascalCase** for component files: `ThemedText.tsx`, `BorderCalculator.tsx`
- **Platform-specific extensions**: `.ios.tsx`, `.android.tsx`, `.web.tsx`, `.native.tsx`
- **Test files**: `ComponentName.test.tsx` in `__tests__/` directories

### Hook Files

- **camelCase** with `use` prefix: `useBorderCalculator.ts`, `useThemeColor.ts`
- **Modular hooks** in dedicated directories with `index.ts` for re-exports

### Utility Files

- **camelCase** for utility files: `borderCalculations.ts`, `presetSharing.ts`
- **Descriptive names** that indicate purpose

## Import Path Conventions

### Absolute Imports

- Use `@/` prefix for root-level imports
- Configured in `tsconfig.json` with `baseUrl: "."` and `paths: { "@/*": ["./*"] }`

### Examples

```typescript
// Components
import { ThemedText } from "@/components/ui/core/ThemedText";
import { BorderCalculator } from "@/components/border-calculator";

// Hooks
import { useBorderCalculator } from "@/hooks/borderCalculator";
import { useThemeColor } from "@/hooks/useThemeColor";

// Constants and utilities
import { Colors } from "@/constants/Colors";
import { borderCalculations } from "@/utils/borderCalculations";
```

## Architecture Patterns

### Modular Design

- **Feature-based organization** with dedicated directories for complex features
- **Separation of concerns** between UI, business logic, and data
- **Reusable components** in `components/ui/` for cross-feature usage

### Cross-Platform Strategy

- **Shared core logic** with platform-specific UI implementations
- **Responsive design** using breakpoints and platform detection
- **Progressive enhancement** for web features

### Performance Organization

- **Web Workers** in dedicated `workers/` directory
- **Lazy loading** and code splitting for web builds
- **Optimized imports** to reduce bundle size

## Testing Structure

- **Co-located tests** in `__tests__/` directories within each module
- **Snapshot tests** for UI consistency
- **Unit tests** for calculation logic and hooks
- **Performance tests** for critical calculation functions
