/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

const pageTints = {
  stopCalcTint: "#9C27B0",
  resizeCalcTint: "#2196F3",
  cameraExposureCalcTint: "#3F51B5",
  reciprocityCalcTint: "#FF9800",
  borderCalcTint: "#4CAF50",
  developmentRecipesTint: "#ad1b1d",
};

type ColorScheme = {
  // general colors
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  listItemText: string;
  selectedItemBackground: string;

  // results box colors
  cardBackground: string;
  resultRowBackground: string;
  inputBackground: string;
  borderColor: string;
  shadowColor: string;
  outline: string;

  // text colors
  textSecondary: string;
  textMuted: string;

  // error and success colors
  errorColor: string;
  successColor: string;
  surfaceVariant: string;

  // stop calculator
  stopCalcTint: string;

  // resize calculator
  resizeCalcTint: string;

  // camera exposure calculator
  cameraExposureCalcTint: string;

  // reciprocity calculator
  reciprocityCalcTint: string;

  // border calculator
  borderCalcTint: string;
  bladeColor: string;
  bladeShadowColor: string;
  paperColor: string;
  printPreviewColor: string;

  // development recipes
  developmentRecipesTint: string;
};

export const Colors: {
  light: ColorScheme;
  dark: ColorScheme;
  darkroom: ColorScheme;
  eInk: ColorScheme;
} = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    listItemText: "#000000",
    selectedItemBackground: "#e0e0e0",

    // results box colors
    cardBackground: "#ffffff",
    resultRowBackground: "#ececec",
    inputBackground: "rgba(255,255,255,0.8)",
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000000",
    textSecondary: "rgba(0,0,0,0.7)",
    textMuted: "rgba(0,0,0,0.6)",
    errorColor: "#FF6B6B",
    successColor: "#4ECDC4",
    surfaceVariant: "rgba(255,255,255,0.6)",
    outline: "rgba(0,0,0,0.05)",
    // stop exposure calculator
    stopCalcTint: pageTints.stopCalcTint,

    // resize calculator
    resizeCalcTint: pageTints.resizeCalcTint,

    // camera exposure calculator
    cameraExposureCalcTint: pageTints.cameraExposureCalcTint,

    // reciprocity calculator
    reciprocityCalcTint: pageTints.reciprocityCalcTint,

    // border calculator
    borderCalcTint: pageTints.borderCalcTint,
    bladeColor: "#2b2b2b",
    bladeShadowColor: "#151515",
    paperColor: "#ffffff",
    printPreviewColor: "#8b8b8b",

    // development recipes
    developmentRecipesTint: pageTints.developmentRecipesTint,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    listItemText: "#000000",
    selectedItemBackground: "#444444",

    // results box colors
    cardBackground: "#1e1e1e",
    resultRowBackground: "#2e2e2e",
    inputBackground: "rgba(30,30,30,0.8)",
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000000",
    outline: "rgba(255,255,255,0.05)",

    // text colors
    textSecondary: "rgba(255,255,255,0.7)",
    textMuted: "rgba(255,255,255,0.6)",

    // error and success colors
    errorColor: "#FF6B6B",
    successColor: "#4ECDC4",
    surfaceVariant: "rgba(30,30,30,0.6)",

    // stop exposure calculator
    stopCalcTint: pageTints.stopCalcTint,

    // resize calculator
    resizeCalcTint: pageTints.resizeCalcTint,

    // camera exposure calculator
    cameraExposureCalcTint: pageTints.cameraExposureCalcTint,

    // reciprocity calculator
    reciprocityCalcTint: pageTints.reciprocityCalcTint,

    // border calculator
    borderCalcTint: pageTints.borderCalcTint,
    bladeColor: "#393939",
    bladeShadowColor: "#151515",
    paperColor: "#5e5e5e",
    printPreviewColor: "#393939",

    // development recipes
    developmentRecipesTint: pageTints.developmentRecipesTint,
  },
  darkroom: {
    background: "#000000",
    text: "#FF0000",
    tint: "#FF0000",
    icon: "#FF0000",
    tabIconDefault: "#FF0000",
    tabIconSelected: "#FF0000",
    listItemText: "#000000",
    selectedItemBackground: "#550000",

    // results box colors
    cardBackground: "#000000",
    resultRowBackground: "#000000",
    inputBackground: "rgba(0,0,0,0.8)",
    borderColor: "rgba(255,0,0,0.3)",
    shadowColor: "#000000",
    textSecondary: "rgba(255,0,0,0.7)",
    textMuted: "rgba(255,0,0,0.6)",
    errorColor: "#FF0000",
    successColor: "#FF0000",
    surfaceVariant: "rgba(0,0,0,0.6)",
    outline: "rgba(255,0,0,0.1)",

    // stop exposure calculator
    stopCalcTint: "#8f0000",

    // resize calculator
    resizeCalcTint: "#8f0000",

    // camera exposure calculator
    cameraExposureCalcTint: "#8f0000",

    // reciprocity calculator
    reciprocityCalcTint: "#8f0000",

    // border calculator
    borderCalcTint: "#4CAF50",
    bladeColor: "#8f0000",
    bladeShadowColor: "#3a0000",
    paperColor: "#000000",
    printPreviewColor: "#ff0000",

    // development recipes
    developmentRecipesTint: "#8f0000",
  },
  eInk: {
    background: "#FFFFFF",
    text: "#000000",
    tint: "#000000",
    icon: "#000000",
    tabIconDefault: "#000000",
    tabIconSelected: "#000000",
    listItemText: "#000000",
    selectedItemBackground: "#cccccc",
    // results box colors
    cardBackground: "#ffffff",
    resultRowBackground: "#ffffff",
    inputBackground: "rgba(255,255,255,0.8)",
    borderColor: "rgba(0,0,0,0.3)",
    shadowColor: "#000000",
    textSecondary: "rgba(0,0,0,0.7)",
    textMuted: "rgba(0,0,0,0.6)",
    errorColor: "#000000",
    successColor: "#000000",
    surfaceVariant: "rgba(255,255,255,0.6)",
    outline: "rgba(0,0,0,0.2)",

    // stop calculator
    stopCalcTint: "#000000",

    // resize calculator
    resizeCalcTint: "#000000",

    // camera exposure calculator
    cameraExposureCalcTint: "#000000",

    // reciprocity calculator
    reciprocityCalcTint: "#000000",

    // border calculator
    borderCalcTint: "#000000",
    bladeColor: "#000000",
    bladeShadowColor: "#ffffff",
    paperColor: "#ffffff",
    printPreviewColor: "#7f7f7f",

    // development recipes
    developmentRecipesTint: "#000000",
  },
};

export default Colors;
