# Dorkroom App - Active Context

## Current Development Focus

The Dorkroom app is currently in active development with a primary focus on implementing the core calculator features. The project is built using React Native with Expo and uses a file-based routing system with expo-router.

### Priority Features

1. **Print Border Calculator** - HIGHEST PRIORITY (IN PROGRESS)

   - Core feature for darkroom printing
   - Calculation of blade positions for different paper sizes and aspect ratios
   - Visual feedback implementation

2. **Print Resizing Calculator** - HIGH PRIORITY (STARTED)

   - Calculate exposure time adjustments based on print size changes
   - Conversion between seconds and stops

3. **Additional Calculators** - MEDIUM PRIORITY
   - Stop-Based Exposure Calculator (NOT STARTED)
   - Camera Exposure Calculator (NOT STARTED)
   - Reciprocity Calculator (COMPLETED)
   - Developer Dilution Calculator (NOT STARTED)
   - Push/Pull Calculator (NOT STARTED)

### Platform-Specific Development

1. **Web Interface** - HIGH PRIORITY (IN PROGRESS)

   - Optimize responsive layout for desktop browsers
   - Implement keyboard shortcuts for power users
   - Ensure browser compatibility across major browsers
   - Optimize performance for web-specific contexts

2. **Mobile Interface** - HIGH PRIORITY (IN PROGRESS)
   - Optimize touch controls and gestures
   - Implement platform-specific UI components (iOS/Android)
   - Ensure proper appearance across various mobile screen sizes
   - Optimize for battery efficiency and performance

## Implementation Status

### Completed Components and Features

- Project infrastructure with Expo Router
- Basic navigation with tab-based layout
- Print Border Calculator core functionality
- Print Resizing Calculator basic implementation
- Reciprocity Calculator implementation
- Theme support (light/dark mode)
- Basic UI components
- Core functionality working across web and mobile platforms

### In Progress

- Print Border Calculator refinements
- Data persistence for calculator settings
- UI/UX improvements
- Additional calculator implementations
- Web interface optimizations
- Mobile interface platform-specific enhancements

### Not Started

- Offline functionality
- User presets system
- Film development tracking features
- Testing implementation
- Performance optimizations
- Final styling
- Web-specific keyboard shortcuts
- Platform-specific gesture implementations

## Recent Changes

- Implemented Print Border Calculator core functionality
- Set up basic tab navigation structure
- Added Print Resizing Calculator
- Configured theme support for light and dark modes
- Implemented responsive layouts
- Added tracking for web and mobile interface development

## Next Tasks

1. Complete Print Border Calculator

   - Add ability to save custom presets
   - Implement offline functionality
   - Enhance visual feedback

2. Enhance Print Resizing Calculator

   - Add preset functionality
   - Improve UI/UX

3. Begin implementing Stop-Based Exposure Calculator

   - Create UI components
   - Implement calculation logic
   - Add visual feedback

4. Add preset functionality to Reciprocity Calculator

   - Create UI for saving custom presets
   - Implement local storage for presets
   - Add preset selection UI

5. Implement data persistence layer

   - Local storage for calculator settings
   - User preferences

6. Rework and beautify UI to platform standards.
   - Light/dark/darkroom (red/black)/high contrast (e-ink black/white)
   - Implement platform-specific UI optimizations for web
   - Implement platform-specific UI optimizations for iOS/Android

## Active Decisions

### Technical Decisions

- Using Expo Router for navigation instead of React Navigation directly
- File-based routing structure for simplicity and maintainability
- Using functional components with hooks for state management
- Using custom hooks for calculator logic separation

### Design Decisions

- Bottom tab navigation for main features
- Modern, clean UI with focus on usability
- Support for both light and dark themes
- Platform-specific UI/UX considerations

### Feature Prioritization

- Focus on completing Border Calculator as core feature
- Sequential development of additional calculators
- Emphasis on accuracy and usability over feature quantity

## Technical Considerations

### Current Challenges

- Ensuring accurate calculations across all calculator features
- Maintaining consistent UI/UX across platforms
- Implementing proper data persistence
- Optimizing performance for complex calculations

### Architecture Notes

- App structure follows Expo Router conventions with `/app` directory
- Tab-based navigation in `/(tabs)` directory
- Custom hooks for calculator logic in `/hooks` directory
- UI components separated from business logic

### Dependencies

- Core navigation using Expo Router and React Navigation
- Animation support with React Native Reanimated
- Vector icons from Expo Vector Icons
- Haptic feedback using Expo Haptics
- Safe area handling with React Native Safe Area Context

This document will be continuously updated as development progresses to reflect the current state and focus of the project.
