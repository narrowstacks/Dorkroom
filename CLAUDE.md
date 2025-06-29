# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Rules

- **Always commit before making changes**. Before starting any work, check the current git status, and if the user hasn't yet committed their changes, commit their changes, _but not sync_, so for them before you make a change
- **Husky and lint-staged commit messages**. Your commit messages should follow the conventions defined by the husky and lint-staged config in `project.json` and `commitlint.config.cjs`.
- **Don't commit until confirming with user.** The user should always test your changes before they are committed.
- **Let user sync commits to remote**. You should never be the one to sync the commits.

## Rules

- Assume the expo server is already running-- don't try to run `bun run dev`.
- We should aim for consistency in styling, including libraries used.
- When grepping the codebase, use ripgrep `rg` instead of standard grep.
- Add new libraries using `bun install`, do not edit the dependencies of @project.json directly. Other parts of the @projects.json file can be modified, but never the dependencies.
- Refrain from using emojis in documentation (.md files) and code, unless specificially specified.
- Use the tools at your disposal listed in the next section.

## Tools

- **Context7**: Use context7 to grab the latest versions of docs and sample code.
- **Clear-thought**: Use sequentialthinking, debuggingapproach, decisionframework, and other tools provided by clear-thought to work through problems in an orderly way.
- **Playwright**: Use Playwright MCP tools for end-to-end testing and browser automation.
- **Serena**: Use Serena to access more granular edit functions, IDE tools, get tasks and memory, replace lines, and think a bit. **Before using any other tools, read the initial instructions.**

### Context7

Always running.

#### Context7 Core Approach

- **Documentation-first development**: Reference official documentation through Context7 before implementing new patterns or features
- **Library research workflow**: Use `resolve-library-id` followed by `get-library-docs` to access up-to-date documentation and code examples
- **Problem-solving resource**: When encountering library-specific issues, Context7 should be the first resource for current solutions and workarounds

#### Context7 Workflow Pattern

- **Library identification**: Start with `resolve-library-id` to find the correct Context7-compatible library identifier for any package or framework
- **Documentation retrieval**: Use `get-library-docs` with specific topics when possible to get focused, relevant documentation
- **Integration verification**: Verify compatibility and version requirements using Context7 before package updates or new integrations

#### Context7 Key Tools

- **`resolve-library-id`**: Convert package names to Context7-compatible identifiers for documentation lookup
- **`get-library-docs`**: Fetch comprehensive, up-to-date documentation with optional topic focusing and token limits

#### Context7 Best Practices

- **Preferred for dependency research**: Before adding new packages or updating existing ones, use Context7 to understand current best practices and API changes
- **Library-specific guidance**: For complex integrations (React, Next.js, TypeScript, testing frameworks), Context7 provides authoritative documentation and examples
- **Performance optimization**: Consult Context7 for performance optimization techniques specific to your technology stack

#### Context7 Capability

- **Real-time documentation access**: Get the most current documentation and examples directly from official sources
- **Comprehensive coverage**: Access documentation for thousands of popular libraries and frameworks
- **Focused retrieval**: Target specific topics within large documentation sets for efficient information gathering

#### Context7 Library IDs for DorkroomReact Core Dependencies

Use when calling `get-library-docs`.

##### Core Frameworks & Languages

- **React**: `/reactjs/react.dev` (Trust Score: 9, 2791 snippets)
- **React Native**: `/facebook/react-native-website` (Trust Score: 9.2, 14551 snippets)
- **TypeScript**: `/microsoft/typescript` (Trust Score: 9.9, 26981 snippets)
- **React DOM**: `/reactjs/react.dev` (covered under main React docs)

##### Expo Ecosystem

- **Expo**: `/expo/expo` (Trust Score: 10, 4431 snippets)
- **Expo SDK**: `/context7/docs_expo_dev-versions-latest` (Trust Score: 10, 14576 snippets)

##### Styling & UI

- **TailwindCSS**: `/tailwindlabs/tailwindcss.com` (Trust Score: 8, 2026 snippets)
- **NativeWind**: `/nativewind/nativewind` (Trust Score: 7.3, 12 snippets)
- **Gluestack UI**: `/gluestack/gluestack-ui` (Trust Score: 7.9, 2078 snippets)

##### Animation & Gestures

- **React Native Reanimated**: `/software-mansion/react-native-reanimated` (973 snippets)
- **React Native Gesture Handler**: `/software-mansion/react-native-gesture-handler` (287 snippets)

##### React Native Core Libraries

- **React Native Web**: `/necolas/react-native-web` (Trust Score: 9.6, 195 snippets)
- **React Native SVG**: `/software-mansion/react-native-svg` (Trust Score: 8.7, 65 snippets)
- **React Native Screens**: `/software-mansion/react-native-screens` (62 snippets)

##### Development & Testing

- **TypeScript ESLint**: `/typescript-eslint/typescript-eslint` (Trust Score: 8.6, 1213 snippets)
- **Prettier Plugin TailwindCSS**: `/tailwindlabs/prettier-plugin-tailwindcss` (Trust Score: 8, 10 snippets)

##### Additional Core Libraries

- **React Native Safe Area Context**: `/appandflow/react-native-safe-area-context` (Trust Score: 8.7, 36 snippets)
- **React Native Paper**: `/callstack/react-native-paper` (Trust Score: 10, 1239 snippets)

### Clear-Thought

Always running.

#### Clear-Thought Core Approach

- **Systematic problem decomposition**: Use structured thinking tools to break down complex problems into manageable components
- **Multi-perspective analysis**: Apply various mental models and reasoning frameworks to approach problems from different angles
- **Iterative refinement**: Use sequential thinking and debugging approaches to refine solutions through multiple iterations

#### Clear-Thought Workflow Pattern

- **Problem analysis**: Start with `sequentialthinking` for complex tasks requiring step-by-step breakdown
- **Decision making**: Use `decisionframework` for structured evaluation of options and trade-offs
- **Debugging workflow**: Apply `debuggingapproach` for systematic issue identification and resolution
- **Creative exploration**: Use `creativethinking` for brainstorming and innovative solution development

#### Clear-Thought Key Tools

- **`sequentialthinking`**: Break down complex problems into ordered, manageable steps with branching and revision capabilities
- **`debuggingapproach`**: Apply systematic debugging methodologies (binary search, divide and conquer, root cause analysis)
- **`decisionframework`**: Structure decision-making with frameworks like pros/cons analysis, decision matrices, and risk assessment
- **`mentalmodel`**: Apply proven thinking frameworks (first principles, opportunity cost, Pareto principle, Occam's razor)
- **`collaborativereasoning`**: Simulate multiple expert perspectives for comprehensive problem analysis
- **`scientificmethod`**: Apply rigorous hypothesis-driven inquiry for complex investigations

#### Clear-Thought Best Practices

- **Use for big/complex tasks**: When tackling large features, refactoring, or complex problem-solving, leverage sequential thinking systematically
- **Architecture decisions**: Apply structured frameworks for significant architectural changes or technology integrations
- **Multi-step development**: Use sequential thinking when developing complex algorithms or multi-component systems
- **Debugging complex issues**: Use structured approaches for multi-layered bugs or performance problems
- **Code review preparation**: Apply systematic thinking to review large changesets or complex features

#### Clear-Thought Capability

- **Structured reasoning**: Transform chaotic problems into organized, solvable components
- **Multiple thinking modes**: Access various cognitive approaches for different types of challenges
- **Session persistence**: Maintain thinking context across interactions for complex, multi-session problems

### Playwright

Not always running, only use when user asks for web version help. If not running when user needs web help, stop what you're doing and ask user to turn Playwright MCP server on.

#### Playwright Core Approach

- **End-to-end testing focus**: Use Playwright for comprehensive UI testing and user workflow validation
- **Browser automation**: Leverage Playwright's cross-browser capabilities for thorough testing coverage
- **Real user simulation**: Create tests that mirror actual user interactions and behaviors

#### Playwright Workflow Pattern

- **Test environment assumption**: All tests assume development server is running at expected URL (typically localhost)
- **Cross-platform validation**: Test across desktop, tablet, and mobile viewports systematically
- **User journey testing**: Focus on complete workflows from user entry to final output
- **Responsive behavior verification**: Ensure interfaces work correctly across different screen sizes

#### Playwright Key Tools

- **Browser context management**: Create isolated browser contexts for clean test environments
- **Element interaction**: Use robust selectors and wait strategies for reliable element interaction
- **Screenshot and visual testing**: Capture visual states for regression testing and debugging
- **Network interception**: Monitor and mock network requests for comprehensive testing scenarios

#### Playwright Best Practices

- **No server management**: Focus tests on UI interactions, not server lifecycle management
- **Robust selectors**: Use data attributes or role-based selectors over fragile CSS selectors
- **Wait strategies**: Implement proper waiting for dynamic content and async operations
- **Test isolation**: Ensure tests can run independently without side effects
- **Error handling**: Include comprehensive error scenarios in test coverage

#### Playwright Capability

- **Multi-browser testing**: Validate functionality across Chromium, Firefox, and WebKit
- **Mobile simulation**: Test responsive designs and touch interactions
- **Performance monitoring**: Measure and validate application performance metrics
- **Accessibility testing**: Verify WCAG compliance and screen reader compatibility

### Serena

Always running.

**Important:** **Before using any other tools, read the initial instructions.**

#### Serena Core Approach

- **Core approach**: Use the language server protocol (LSP) tools for symbol-level understanding rather than text-based analysis. Search for symbols by name/type using `find_symbol`, examine code structure with `get_symbols_overview`, and navigate relationships with `find_referencing_symbols`/`code_snippets`.

#### Serena Workflow Pattern

- **Workflow pattern**: Start by reading project memories and performing onboarding if needed. Use `find_symbol` and overview tools to understand codebase structure. Edit at symbol level with `replace_symbol_body` or `insert_before`/`after_symbol` rather than line-based operations when possible. Execute tests/commands to verify changes and self-correct.

#### Serena Key Tools

- **Key tools**:
  - Active tools: `activate_project`, `check_onboarding_performed`, `delete_memory`, `find_file`, `find_referencing_symbols`, `find_symbol`, `get_current_config`, `get_symbols_overview`, `initial_instructions`, `insert_after_symbol`, `insert_before_symbol`, `list_dir`, `list_memories`, `onboarding`, `prepare_for_new_conversation`, `read_memory`, `remove_project`, `replace_regex`, `replace_symbol_body`, `restart_language_server`, `search_for_pattern`, `summarize_changes`, `switch_modes`, `think_about_collected_information`, `think_about_task_adherence`, `think_about_whether_you_are_done`, `write_memory`
  - Excluded 9 tools: `create_text_file`, `read_file`, `delete_lines`, `replace_lines`, `insert_at_line`, `execute_shell_command`. **DO NOT USE THESE TOOLS, USE CLAUDE CODE NATIVE TOOLS**

#### Serena Best Practices

- **Best practices**: Work from clean git state, create/read memories for context, use symbolic editing over line-based when possible, validate changes through testing, and split complex tasks across conversations using memories to manage context limits.

#### Serena Capability

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
- **Mobile Web**: Hamburger menu with animated right-thumb accessible menu.
- All implemented in `app/(tabs)/_layout.tsx` with responsive breakpoints

### Hook Pattern

Calculator hooks follow a consistent pattern:

1. Accept input parameters via state
2. Perform calculations using pure functions from `utils/` or `constants/`
3. Return calculated values and helper functions
4. Handle validation and error states
5. Implement memoization for performance

Key features:

- **Border Calculator**: Calculates blade positions for darkroom easels based on paper size and desired borders
- **Resize Calculator**: Determines exposure adjustments when changing print sizes
- **Exposure Calculator**: Handles stop-based exposure calculations
- **Camera Exposure**: Implements exposure triangle relationships (aperture, shutter, ISO)
- **Reciprocity**: Compensates for film reciprocity failure at long exposures
- **Film Development Recipes**: Find and add development recipe combinations for black and white film development.

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
