/**
 * Throttle helper function with configurable leading/trailing execution
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void } => {
  const { leading = true, trailing = true } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    const execute = () => {
      lastCallTime = now;
      func(...args);
    };

    if (leading && now - lastCallTime >= delay) {
      execute();
    } else if (trailing) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
          lastCallTime = Date.now();
        }
      }, delay - (now - lastCallTime));
    }
  };

  // Add cleanup function
  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return throttled as T & { cancel: () => void };
};

/**
 * Debounce helper function that delays execution until after delay milliseconds
 * have elapsed since the last time the function was invoked.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { immediate?: boolean } = {}
): T & { cancel: () => void; flush: () => void } => {
  const { immediate = false } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate && lastArgs) {
        result = func(...lastArgs);
      }
    }, delay);

    if (callNow) {
      result = func(...args);
    }

    return result;
  };

  // Add utility functions
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      result = func(...lastArgs);
    }
    return result;
  };

  return debounced as unknown as T & { cancel: () => void; flush: () => void };
}; 