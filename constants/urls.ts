/**
 * Application URLs for different environments and sharing functionality
 */

// Base URLs for different environments
export const BASE_URLS = {
  DEVELOPMENT: 'http://localhost:8081',
  PRODUCTION: 'https://beta.dorkroom.art',
} as const;

// Sharing URLs for different calculators
export const SHARING_URLS = {
  BORDER_CALCULATOR: {
    DEVELOPMENT: `${BASE_URLS.DEVELOPMENT}/border`,
    PRODUCTION: `${BASE_URLS.PRODUCTION}/border`,
  },
  // Add other calculators here as needed
  // EXPOSURE_CALCULATOR: {
  //   DEVELOPMENT: `${BASE_URLS.DEVELOPMENT}/exposure`,
  //   PRODUCTION: `${BASE_URLS.PRODUCTION}/exposure`,
  // },
} as const; 