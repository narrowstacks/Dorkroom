# Dorkroom React Native App - Technical Context

## Core Technologies

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **Runtime**: Node.js
- **Package Manager**: npm
- **Architecture**: Expo Router (File-based routing)

## Development Environment

- **Expo SDK Version**: 52.0.39
- **React Native Version**: 0.76.7
- **React Version**: 18.3.1
- **TypeScript Version**: 5.3.3
- **Platforms**: iOS, Android, Web
- **Development Tools**: Expo CLI, Metro Bundler

## Key Dependencies

### Core Dependencies

- `expo-router`: File-based routing system
- `react-native-gesture-handler`: Gesture handling
- `react-native-reanimated`: Animation library
- `react-native-safe-area-context`: Safe area handling
- `react-native-screens`: Screen management
- `@expo/vector-icons`: Icon library
- `expo-blur`: Blur effects
- `expo-haptics`: Haptic feedback
- `expo-symbols`: Symbol components

### Navigation

- `@react-navigation/native`: Core navigation
- `@react-navigation/bottom-tabs`: Tab navigation

### Development Dependencies

- `jest`: Testing framework
- `jest-expo`: Expo testing utilities
- `@types/react`: TypeScript definitions
- `babel-plugin-module-resolver`: Module resolution

## Project Structure

```
assets/
  images/
    icon.png
    adaptive-icon.png
    favicon.png
    splash-icon.png
app/
  (tabs)/
    _layout.tsx          # Tab navigation layout
    index.tsx            # Home screen
    border.tsx           # Print Border Calculator
    resize.tsx           # Print Resizing Calculator
    exposure.tsx         # Stop-Based Exposure Calculator
    cameraExposure.tsx   # Camera Exposure Calculator
    reciprocity.tsx      # Reciprocity Calculator
  hooks/
    useBorderCalculator.ts
    useExposureCalculator.ts
    useCameraExposureCalculator.ts
    useReciprocityCalculator.ts
    useThemeColor.ts
    useWindowDimensions.ts
  components/
    ui/
    ThemedText.tsx
    ThemedView.tsx
App.js
app.json
```

## Build and Deployment

### Configuration

- **App Name**: DorkroomReact
- **Orientation**: Portrait
- **User Interface Style**: Automatic (Light/Dark)
- **New Architecture**: Enabled
- **iOS Support**: Tablet support enabled
- **Android Support**: Adaptive icons configured
- **Web Support**: Metro bundler with static output

### Build Features

- Splash screen configuration
- Typed routes enabled
- OTA (Over The Air) updates support
- Cross-platform compatibility

## Testing Setup

- **Testing Framework**: Jest
- **Test Runner**: jest-expo
- **TypeScript Support**: @types/jest
- **Test Renderer**: react-test-renderer

## Development Workflow

### Scripts

- `npx expo start`: Start Expo development server
- `npm test`: Run Jest tests
- `npm run lint`: Run Expo linting
- `npm run reset-project`: Reset project state

### Development Features

- Hot reloading
- Cross-platform development
- TypeScript type checking
- ESLint integration
- Module resolution aliases

## Technical Constraints

- Must maintain compatibility with Expo managed workflow
- Must support web, iOS, and Android platforms
- Must adhere to platform-specific guidelines
- Must maintain performance standards
- Must support offline functionality
- Must implement proper error handling

## Platform-Specific Technical Requirements

### Web Requirements

- **Browsers**: Support for Chrome, Firefox, Safari, and Edge (latest 2 versions)
- **Responsiveness**: Fully responsive from mobile to desktop viewports
- **PWA Support**: Progressive Web App capabilities
- **SEO**: Basic SEO optimization for public pages
- **Keyboard Navigation**: Full keyboard accessibility
- **Performance**: Target Lighthouse performance score of 90+

### iOS Requirements

- **Minimum iOS Version**: iOS 13+
- **Devices**: iPhone (all sizes) and iPad support
- **UI Guidelines**: Adhere to Apple Human Interface Guidelines
- **Native Features**: Haptic feedback, share extensions integration
- **Optimization**: Support for different screen sizes and notches

### Android Requirements

- **Minimum Android Version**: Android 8+ (API level 26)
- **Material Design**: Follow Material Design guidelines
- **Device Support**: Various screen sizes and aspect ratios
- **Performance**: Optimization for lower-end devices
- **Native Features**: Back button handling, notifications

## Performance Considerations

- Use of React Native Reanimated for smooth animations
- Proper image optimization
- Efficient state management
- Proper memory management
- Optimized rendering
- Platform-specific performance optimizations
- Web-specific bundle optimization
- Mobile-specific battery and memory optimizations

## Security Considerations

- Use of Expo's secure store for sensitive data
- Proper data validation
- Secure API communication
- Proper error handling
- Input sanitization
- Platform-specific security best practices
- Web-specific protection against XSS and CSRF

## Calculator Hooks

The app implements a series of specialized calculator hooks to handle the complex calculations required for darkroom printing:

- **useBorderCalculator**: Handles border calculations for various paper sizes and aspect ratios
- **useExposureCalculator**: Manages exposure time adjustments based on stop changes
- **useCameraExposureCalculator**: Implements the exposure triangle logic for equivalent exposures
- **useReciprocityCalculator**: Handles film reciprocity failure calculations

These hooks follow the pattern of:

- Taking inputs through state
- Processing calculations based on established formulas
- Returning calculated values and additional helper functions

This document will be updated as the project evolves and new technical decisions are made.
