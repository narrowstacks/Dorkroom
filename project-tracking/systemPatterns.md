# Dorkroom React Native App - System Patterns

## Application Architecture

### Expo Router Architecture

- File-based routing system using `expo-router`
- Pages are defined in the `app` directory
- Automatic route generation based on file structure
- Type-safe routing with TypeScript

### Component Architecture

- Functional components with hooks
- Component composition over inheritance
- Separation of concerns:
  - UI components in `components/`
  - Screen components in `screens/`
  - Navigation components in `navigation/`
  - Custom hooks in `hooks/`
  - Utility functions in `utils/`

## State Management

### Local State

- React's `useState` for component-level state
- React's `useReducer` for complex state logic
- Custom hooks for reusable state logic

### Global State

- Context API for global state management
- Proper context splitting for performance
- Type-safe context with TypeScript

## Navigation Patterns

### Tab Navigation

- Bottom tab navigation using `@react-navigation/bottom-tabs`
- Type-safe navigation with TypeScript
- Proper screen transitions and animations

### Screen Navigation

- Stack navigation for screen flows
- Proper back handling
- Screen transition animations
- Deep linking support

## Component Patterns

### Presentational Components

- Stateless functional components
- Props-based data flow
- Proper prop typing with TypeScript
- Reusable UI components

### Container Components

- State management
- Data fetching
- Business logic
- Composition of presentational components

### Custom Hooks

- Reusable logic extraction
- Proper dependency management
- Type-safe hooks with TypeScript
- Error handling

## Styling Patterns

### StyleSheet

- Centralized styles using `StyleSheet`
- Platform-specific styles
- Responsive design patterns
- Theme-based styling

### Animation Patterns

- `react-native-reanimated` for complex animations
- Proper animation cleanup
- Performance-optimized animations
- Gesture handling with `react-native-gesture-handler`

## Data Flow

### Unidirectional Data Flow

- Props down, events up
- Proper state lifting
- Controlled components
- Type-safe data flow

### Data Fetching

- Proper error handling
- Loading states
- Caching strategies
- Offline support

## Error Handling

### Error Boundaries

- Component-level error boundaries
- Proper error logging
- User-friendly error messages
- Recovery strategies

### Validation

- Input validation
- Form validation
- Type checking with TypeScript
- Runtime validation

## Performance Patterns

### Optimization Techniques

- Memoization with `useMemo` and `useCallback`
- Proper component splitting
- Lazy loading
- Image optimization

### Memory Management

- Proper cleanup in effects
- Unsubscribe patterns
- Resource management
- Memory leak prevention

## Testing Patterns

### Testing Strategy

- Jest for testing
- React Native Testing Library
- Component testing
- Hook testing
- Integration testing

### Test Organization

- Test files alongside components
- Proper test isolation
- Mocking strategies
- Test coverage goals

## Development Workflow

### Code Organization

- Feature-based organization
- Proper file naming
- Consistent import patterns
- TypeScript strict mode

### Development Practices

- Hot reloading
- Type checking
- Linting
- Formatting
- Git workflow

### Build and Deployment

- Expo OTA updates
- Platform-specific builds
- Version management
- Release process

## Security Patterns

### Data Security

- Secure storage with `expo-secure-store`
- Proper data encryption
- Secure API communication
- Input sanitization

### Authentication

- Secure token management
- Session handling
- Proper logout
- Security best practices

## Cross-Platform Patterns

### Platform-Specific Code

- Platform-specific components
- Platform-specific styles
- Platform-specific logic
- Proper platform detection

### Responsive Design

- Flexible layouts
- Adaptive components
- Screen size handling
- Orientation support

This document will be updated as new patterns are established or existing patterns evolve.
