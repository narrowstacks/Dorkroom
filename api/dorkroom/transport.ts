/**
 * HTTP transport layer for Dorkroom API client.
 * 
 * Provides a configurable HTTP transport with retry logic and timeout handling,
 * similar to the Python requests.Session with retries.
 */

import { DataFetchError } from './errors';
import type { Logger } from './types';

/**
 * Protocol for HTTP transport layer dependency injection.
 * This allows for easy testing by injecting mock transports.
 */
export interface HTTPTransport {
  /**
   * Perform HTTP GET request.
   */
  get(url: string, timeout: number): Promise<Response>;
}

/**
 * Configuration for retry behavior.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Multiplier for exponential backoff */
  backoffFactor: number;
  /** HTTP status codes that should trigger a retry */
  retryStatusCodes: number[];
}

/**
 * Default retry configuration.
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 300,
  backoffFactor: 2,
  retryStatusCodes: [502, 503, 504, 429], // Server errors and rate limiting
};

/**
 * Simple console logger implementation.
 */
export class ConsoleLogger implements Logger {
  debug(message: string): void {
    console.debug(`[DEBUG] ${message}`);
  }

  info(message: string): void {
    console.info(`[INFO] ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

/**
 * HTTP transport implementation with retry logic and timeout handling.
 */
export class FetchHTTPTransport implements HTTPTransport {
  private readonly retryConfig: RetryConfig;
  private readonly logger: Logger;

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    logger: Logger = new ConsoleLogger()
  ) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.logger = logger;
  }

  async get(url: string, timeout: number): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.logger.debug(`GET ${url} (attempt ${attempt + 1})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Dorkroom-Client-TS/1.0',
            },
          });

          clearTimeout(timeoutId);

          // Check if we should retry based on status code
          if (this.retryConfig.retryStatusCodes.includes(response.status)) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // If not ok but not a retry status, throw immediately
          if (!response.ok) {
            throw new DataFetchError(
              `HTTP ${response.status}: ${response.statusText}`
            );
          }

          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Don't retry certain types of errors
        if (error instanceof DataFetchError && !this.shouldRetryError(error)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.retryConfig.baseDelay * 
          Math.pow(this.retryConfig.backoffFactor, attempt);
        
        this.logger.warn(
          `Request failed (attempt ${attempt + 1}), retrying in ${delay}ms: ${error}`
        );

        await this.sleep(delay);
      }
    }

    // All retries exhausted
    throw new DataFetchError(
      `Failed to fetch ${url} after ${this.retryConfig.maxRetries + 1} attempts`,
      lastError || undefined
    );
  }

  /**
   * Determine if an error should trigger a retry.
   */
  private shouldRetryError(error: Error): boolean {
    // Retry network errors, timeouts, and abort errors
    return (
      error.name === 'TypeError' || // Network errors in fetch
      error.name === 'AbortError' || // Timeout errors
      error.message.includes('fetch') ||
      error.message.includes('network')
    );
  }

  /**
   * Sleep for the specified number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a URL by joining base URL and path.
 * Similar to Python's urljoin but simplified for our use case.
 */
export function joinURL(baseUrl: string, path: string): string {
  // Remove trailing slash from base
  const cleanBase = baseUrl.replace(/\/$/, '');
  // Remove leading slash from path
  const cleanPath = path.replace(/^\//, '');
  
  return `${cleanBase}/${cleanPath}`;
} 