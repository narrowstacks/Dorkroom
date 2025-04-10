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
src/
  components/
  screens/
  navigation/
  hooks/
  utils/
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

## Performance Considerations

- Use of React Native Reanimated for smooth animations
- Proper image optimization
- Efficient state management
- Proper memory management
- Optimized rendering

## Security Considerations

- Use of Expo's secure store for sensitive data
- Proper data validation
- Secure API communication
- Proper error handling
- Input sanitization

This document will be updated as the project evolves and new technical decisions are made.