/**
 * Utility functions for dynamic URL construction
 */

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
 * Generates a sharing URL for the border calculator with encoded preset data
 * @param encoded - The encoded preset data
 * @returns Object containing web and native URLs
 */
export const generateSharingUrls = (encoded: string) => {
  const webUrl = `${getDynamicShareUrl('/border')}#${encoded}`;
  const nativeUrl = `dorkroom://border/s/${encoded}`;
  
  return {
    webUrl,
    nativeUrl,
  };
}; 