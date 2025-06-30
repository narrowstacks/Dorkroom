# Code Style and Conventions

## Reference Document

**IMPORTANT**: The primary source for coding conventions is the workspace-level rules document which contains comprehensive guidelines for:

- TypeScript & React patterns
- File naming conventions
- Import organization
- Styling with NativeWind and Gluestack UI
- Calculator logic patterns
- Component patterns
- Performance considerations
- Error handling

## Key Highlights from Workspace Rules

### Component Structure

- Use functional components with TypeScript
- Export components as default exports
- Prefer composition over inheritance

### File Naming

- Components: PascalCase (e.g., `ThemedText.tsx`, `CalculatorLayout.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useBorderCalculator.ts`)
- Utilities: camelCase (e.g., `borderCalculations.ts`)
- Types: PascalCase for interfaces/types

### Import Organization

1. React and React Native imports
2. Third-party libraries
3. Local components and hooks
4. Types and constants

### Styling Approach

- **NativeWind** (Tailwind) for utility-first styling
- **Gluestack UI** for themed components
- Responsive design with breakpoint prefixes
- Logical grouping of related classes

### Calculator Patterns

- Separate calculation logic into custom hooks
- Use useMemo for expensive calculations
- Include proper TypeScript typing
- Implement input validation and error handling

### Performance Best Practices

- Use Web Workers for heavy calculations
- Implement throttling for rapid input changes
- Use React.memo for expensive components
- Optimize re-renders with proper dependency arrays

## Testing Conventions

- Unit tests for calculation logic
- Component tests with React Native Testing Library
- Test files in `__tests__/` directories
- Mock heavy computations for faster tests

## External Resources Integration

- **Context7** for library documentation and current best practices
- **Sequential thinking** for complex problem-solving
- **Playwright** for UI testing (assumes dev server running on http://localhost:8081/)
