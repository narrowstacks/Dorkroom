/**
 * Custom error classes for Dorkroom API operations.
 * 
 * These error classes provide specific error types for different
 * failure scenarios when interacting with the Dorkroom API.
 */

/**
 * Base exception for Dorkroom API errors.
 */
export class DorkroomAPIError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DorkroomAPIError';
    
    // Maintain proper stack trace for where our error was thrown (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DorkroomAPIError);
    }
  }
}

/**
 * Raised when HTTP fetch fails.
 */
export class DataFetchError extends DorkroomAPIError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DataFetchError';
  }
}

/**
 * Raised when JSON parsing fails.
 */
export class DataParseError extends DorkroomAPIError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DataParseError';
  }
}

/**
 * Raised when data operations are attempted before loading.
 */
export class DataNotLoadedError extends DorkroomAPIError {
  constructor(message: string = 'Call loadAll() before using the client.') {
    super(message);
    this.name = 'DataNotLoadedError';
  }
} 