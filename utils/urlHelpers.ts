/**
 * Utility functions for dynamic URL construction
 */
import Constants from 'expo-constants';

/**
 * Gets the current domain and constructs the base URL for sharing
 * Works for any deployment (localhost, Vercel, production, etc.)
 * @param path - The path to append to the base URL (e.g., '/border')
 * @returns The full URL for the current domain
 */
export const getDynamicShareUrl = (path: string): string => {
  // For web platforms, we can use window.location
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, host } = window.location;
    return `${protocol}//${host}${path}`;
  }
  
  // Fallback for development
  return `http://localhost:8081${path}`;
};

/**
 * Generates the appropriate native URL for the current environment
 * @param encoded - The encoded preset data
 * @returns Native URL (Expo Go in dev, custom scheme in production)
 */
export const getNativeUrl = (encoded: string): string => {
  // Check if we're in Expo Go development mode
  if (__DEV__ && Constants.appOwnership === 'expo') {
    // In Expo Go, we need to use the exp:// scheme with the current host
    const manifest = Constants.expoConfig;
    if (manifest?.hostUri) {
      // Use the border route with a query parameter instead of nested path
      return `exp://${manifest.hostUri}/--/border?preset=${encoded}`;
    }
  }
  
  // Production or standalone build - use custom scheme
  return `dorkroom://border?preset=${encoded}`;
};

/**
 * Generates a sharing URL for the border calculator with encoded preset data
 * @param encoded - The encoded preset data
 * @returns Object containing web and native URLs
 */
export const generateSharingUrls = (encoded: string) => {
  const webUrl = `${getDynamicShareUrl('/border')}#${encoded}`;
  const nativeUrl = getNativeUrl(encoded);
  
  return {
    webUrl,
    nativeUrl,
  };
}; 