# Dorkroom App - Active Context

## Current Development Focus

The Dorkroom app is in active development, focusing on core calculator features and cross-platform UI/UX improvements. The Print Border Calculator remains the highest priority and is in progress. Print Resizing Calculator is started. Stop-Based Exposure, Camera Exposure, and Reciprocity Calculators are completed. Developer Dilution and Push/Pull Calculators are not started.

### Priority Features

1. **Print Border Calculator** - HIGHEST PRIORITY (IN PROGRESS)
   - Core feature for darkroom printing
   - Calculation of blade positions for different paper sizes and aspect ratios
   - Visual feedback implementation
   - Preset saving and offline support planned

2. **Print Resizing Calculator** - HIGH PRIORITY (STARTED)
   - Calculate exposure time adjustments based on print size changes
   - Conversion between seconds and stops
   - Preset saving and offline support planned

3. **Additional Calculators** - MEDIUM PRIORITY
   - Stop-Based Exposure Calculator (COMPLETED)
   - Camera Exposure Calculator (COMPLETED)
   - Reciprocity Calculator (COMPLETED)
   - Developer Dilution Calculator (NOT STARTED)
   - Push/Pull Calculator (NOT STARTED)

### Platform-Specific Development

1. **Web Interface** - HIGH PRIORITY (IN PROGRESS)
   - Responsive layout optimization
   - Keyboard shortcuts for power users (planned)
   - Browser compatibility and performance optimization

2. **Mobile Interface** - HIGH PRIORITY (IN PROGRESS)
   - Touch controls and gestures
   - Platform-specific UI components (iOS/Android)
   - Responsive layouts for various screen sizes
   - Battery and performance optimization

## Implementation Status

### Completed Components and Features
- Project infrastructure with Expo Router
- Basic navigation with tab-based layout
- Print Border Calculator core functionality
- Print Resizing Calculator basic implementation
- Reciprocity Calculator implementation
- Stop-Based Exposure Calculator implementation
- Camera Exposure Calculator implementation
- Theme support (light/dark mode)
- Basic UI components
- Core functionality working across web and mobile platforms

### In Progress
- Print Border Calculator refinements
- Data persistence for calculator settings (planned)
- UI/UX improvements
- Additional calculator implementations
- Web and mobile interface optimizations

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
- Print Border Calculator core functionality implemented
- Basic tab navigation structure set up
- Print Resizing Calculator added
- Theme support for light and dark modes configured
- Responsive layouts implemented
- Camera Exposure Calculator implemented and enhanced
- Stop-Based Exposure Calculator implemented with adjustment buttons and manual input

## Next Tasks
1. Complete Print Border Calculator (presets, offline, visual feedback)
2. Enhance Print Resizing Calculator (presets, UI/UX)
3. Begin Developer Dilution Calculator (UI, logic, feedback)
4. Add preset functionality to calculators
5. Implement data persistence layer
6. Rework and beautify UI to platform standards (light/dark/darkroom/high contrast)

## Active Decisions
- Expo Router for navigation
- File-based routing structure
- Functional components with hooks
- Custom hooks for calculator logic
- Bottom tab navigation for main features
- Modern, clean UI with usability focus
- Light/dark theme support
- Platform-specific UI/UX
- Focus on Border Calculator, sequential calculator development, accuracy/usability over feature quantity

## Technical Considerations
- Accurate calculations across calculators
- Consistent UI/UX across platforms
- Data persistence (planned)
- Performance for complex calculations
- Expo Router conventions, tab-based navigation, custom hooks for logic, UI separated from business logic
- Core navigation: Expo Router, React Navigation
- Animation: React Native Reanimated
- Icons: Expo Vector Icons
- Haptics: Expo Haptics
- Safe area: React Native Safe Area Context

This document will be updated as development progresses.
