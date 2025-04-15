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
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    listItemText: '#000000',
  },
  darkroom: {
    background: '#000000',
    text: '#FF0000',
    tint: '#FF0000',
    icon: '#FF0000',
    tabIconDefault: '#FF0000',
    tabIconSelected: '#FF0000',
    listItemText: '#000000',
  },
  eInk: {
    background: '#FFFFFF',
    text: '#000000',
    tint: '#000000',
    icon: '#000000',
    tabIconDefault: '#000000',
    tabIconSelected: '#000000',
    listItemText: '#000000',
  },
};

export default Colors; 