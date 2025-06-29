# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules and Tools

- Refrain from using emojis in documentation (.md files) and code, unless specificially specified.
- Use the tools at your disposal:
  - **Context7**: Use context7 to grab the latest versions of docs and sample code.
  - **Clear-thought**: Use sequentialthinking, debuggingapproach, decisionframework, and other tools provided by clear-thought to work through problems in an orderly way.
  - **Serena**: Use Serena to access IDE tools, get tasks and memory, replace lines, and think a bit.
    - **Core approach**: Use the language server protocol (LSP) tools for symbol-level understanding rather than text-based analysis. Search for symbols by name/type using `find_symbol`, examine code structure with `get_symbols_overview`, and navigate relationships with `find_referencing_symbols`/`code_snippets`.
    - **Workflow pattern**: Start by reading project memories and performing onboarding if needed. Use `find_symbol` and overview tools to understand codebase structure. Edit at symbol level with `replace_symbol_body` or `insert_before`/`after_symbol` rather than line-based operations when possible. Execute tests/commands to verify changes and self-correct.
    - **Key tools**: `find_symbol` for discovery, `get_symbols_overview` for structure, `read_file` for content, `replace_symbol_body` for editing, `execute_shell_command` for testing, and memory tools for persistence across conversations.
    - **Best practices**: Work from clean git state, create/read memories for context, use symbolic editing over line-based when possible, validate changes through testing, and split complex tasks across conversations using memories to manage context limits.
    - **Capability**: The toolkit enables autonomous coding workflows from analysis through implementation to testing and version control.

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
