import { Platform } from 'react-native';

// Platform-specific font configurations
export const fonts = {
  android: {
    primary: 'Roboto',
  },
  ios: {
    primary: 'Menlo',
  },
  web: {
    primary: 'Arial',
  },
};

// Helper function to get the current platform's font
export const getPlatformFont = () => {
  if (Platform.OS === 'ios') return fonts.ios.primary;
  if (Platform.OS === 'android') return fonts.android.primary;
  return fonts.web.primary;
};

// Common styles with platform-specific configurations
export const commonStyles = {
  fonts: {
    // Default font based on platform
    primary: getPlatformFont(),
  },
  // Additional platform-specific styles can be added here
  android: {
    // Android-specific styles
  },
  ios: {
    // iOS-specific styles
  },
  web: {
    // Web-specific styles
  },
};

export default {
  fonts,
  getPlatformFont,
  commonStyles,
};
