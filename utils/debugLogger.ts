const DEBUG_ENABLED = __DEV__ || false;

export const debugLog = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.log(...args);
  }
};

export const debugWarn = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.warn(...args);
  }
};

export const debugError = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.error(...args);
  }
};