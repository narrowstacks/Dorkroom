/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

type ColorScheme = {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  listItemText: string;
  selectedItemBackground: string;
  // Additional colors for enhanced theming
  cardBackground: string;
  inputBackground: string;
  borderColor: string;
  shadowColor: string;
  textSecondary: string;
  textMuted: string;
  errorColor: string;
  successColor: string;
  surfaceVariant: string;
  outline: string;
};

export const Colors: {
  light: ColorScheme;
  dark: ColorScheme;
  darkroom: ColorScheme;
  eInk: ColorScheme;
} = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    listItemText: '#000000',
    selectedItemBackground: '#e0e0e0',
    // Additional colors for enhanced theming
    cardBackground: '#ffffff',
    inputBackground: 'rgba(255,255,255,0.8)',
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000000',
    textSecondary: 'rgba(0,0,0,0.7)',
    textMuted: 'rgba(0,0,0,0.6)',
    errorColor: '#FF6B6B',
    successColor: '#4ECDC4',
    surfaceVariant: 'rgba(255,255,255,0.6)',
    outline: 'rgba(0,0,0,0.05)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    listItemText: '#000000',
    selectedItemBackground: '#444444',
    // Additional colors for enhanced theming
    cardBackground: '#1e1e1e',
    inputBackground: 'rgba(30,30,30,0.8)',
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000000',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.6)',
    errorColor: '#FF6B6B',
    successColor: '#4ECDC4',
    surfaceVariant: 'rgba(30,30,30,0.6)',
    outline: 'rgba(255,255,255,0.05)',
  },
  darkroom: {
    background: '#000000',
    text: '#FF0000',
    tint: '#FF0000',
    icon: '#FF0000',
    tabIconDefault: '#FF0000',
    tabIconSelected: '#FF0000',
    listItemText: '#000000',
    selectedItemBackground: '#550000',
    // Additional colors for enhanced theming
    cardBackground: '#000000',
    inputBackground: 'rgba(0,0,0,0.8)',
    borderColor: 'rgba(255,0,0,0.3)',
    shadowColor: '#000000',
    textSecondary: 'rgba(255,0,0,0.7)',
    textMuted: 'rgba(255,0,0,0.6)',
    errorColor: '#FF0000',
    successColor: '#FF0000',
    surfaceVariant: 'rgba(0,0,0,0.6)',
    outline: 'rgba(255,0,0,0.1)',
  },
  eInk: {
    background: '#FFFFFF',
    text: '#000000',
    tint: '#000000',
    icon: '#000000',
    tabIconDefault: '#000000',
    tabIconSelected: '#000000',
    listItemText: '#000000',
    selectedItemBackground: '#cccccc',
    // Additional colors for enhanced theming
    cardBackground: '#ffffff',
    inputBackground: 'rgba(255,255,255,0.8)',
    borderColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#000000',
    textSecondary: 'rgba(0,0,0,0.7)',
    textMuted: 'rgba(0,0,0,0.6)',
    errorColor: '#000000',
    successColor: '#000000',
    surfaceVariant: 'rgba(255,255,255,0.6)',
    outline: 'rgba(0,0,0,0.2)',
  },
};

export default Colors; 