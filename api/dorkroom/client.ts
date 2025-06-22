/**
 * Main client for interacting with the Dorkroom REST API.
 * 
 * This client provides methods to fetch film stocks, developers, and 
 * development combinations from the Dorkroom REST API. Features:
 * - Automatic retries and timeouts with circuit breaker
 * - Indexed lookups for O(1) performance
 * - API-driven fuzzy searching with debouncing
 * - Request caching and deduplication
 * - Comprehensive error handling
 */

import { 
  Film, 
  Developer, 
  Combination, 
  DorkroomClientConfig, 
  Logger, 
  FuzzySearchOptions,
  ApiResponse
} from './types';
import { DataFetchError, DataParseError, DataNotLoadedError } from './errors';
import { 
  HTTPTransport, 
  FetchHTTPTransport, 
  ConsoleLogger, 
  joinURL 
} from './transport';
import { debounce } from '../../utils/throttle';

/**
 * Cache entry with expiration.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Request deduplication manager.
 */
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const promise = operation()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  cancel(key: string): void {
    this.pendingRequests.delete(key);
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

/**
 * Simple in-memory cache with TTL support.
 */
class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, value: T, ttlMs: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Main client for interacting with the Dorkroom REST API.
 */
export class DorkroomClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly transport: HTTPTransport;
  private readonly logger: Logger;
  private readonly cacheTTL: number;

  // Data cache TTL (10 minutes)
  private static readonly DATA_CACHE_TTL = 600000;

  // Data storage
  private films: Film[] = [];
  private developers: Developer[] = [];
  private combinations: Combination[] = [];
  private loaded = false;
  private lastLoadedTimestamp: number | null = null;

  // Indexes for O(1) lookup
  private filmIndex = new Map<string, Film>();
  private developerIndex = new Map<string, Developer>();
  private combinationIndex = new Map<string, Combination>();

  // Caching and deduplication
  private searchCache = new TTLCache<any>();
  private deduplicator = new RequestDeduplicator();

  // Request cancellation
  private abortControllers = new Map<string, AbortController>();

  // Debounced search methods
  private debouncedFuzzySearchFilms: ReturnType<typeof debounce>;
  private debouncedFuzzySearchDevelopers: ReturnType<typeof debounce>;

  constructor(config: DorkroomClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://api.dorkroom.art/api';
    this.timeout = config.timeout || 10000; // 10 seconds
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes
    this.logger = config.logger || new ConsoleLogger();
    
    // Initialize HTTP transport
    this.transport = new FetchHTTPTransport(
      { maxRetries: config.maxRetries || 3 },
      this.logger
    );

    // Initialize debounced search methods
    this.debouncedFuzzySearchFilms = debounce(
      this.performFuzzySearchFilms.bind(this),
      config.searchDebounceMs || 300
    );

    this.debouncedFuzzySearchDevelopers = debounce(
      this.performFuzzySearchDevelopers.bind(this),
      config.searchDebounceMs || 300
    );

    // Cleanup expired cache entries periodically
    setInterval(() => {
      this.searchCache.cleanup();
    }, 60000); // Every minute
  }

  /**
   * Fetch and parse a JSON resource from the API.
   */
  private async fetch<T>(
    resource: string, 
    params: URLSearchParams = new URLSearchParams(),
    requestKey?: string
  ): Promise<T[]> {
    const url = joinURL(this.baseUrl, `${resource}?${params.toString()}`);
    const cacheKey = requestKey || url;
    
    // Check cache first
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${resource}`);
      return cached as T[];
    }

    // Use request deduplication
    return this.deduplicator.deduplicate(cacheKey, async () => {
      // Set up request cancellation
      const controller = new AbortController();
      if (requestKey) {
        this.abortControllers.set(requestKey, controller);
      }

      try {
        this.logger.debug(`Fetching ${resource} with params: ${params.toString()}`);
        const response = await this.transport.get(url, this.timeout);
        
        try {
          const apiResponse = await response.json() as ApiResponse<T>;
          if (apiResponse && apiResponse.data) {
                       // Cache the result
           this.searchCache.set(cacheKey, apiResponse.data as any, this.cacheTTL);
           return apiResponse.data;
          }
          throw new DataParseError(`Invalid API response structure from ${resource}`);
        } catch (error) {
          throw new DataParseError(
            `Invalid JSON in ${resource}: ${error}`,
            error as Error
          );
        }
      } catch (error) {
        if (error instanceof DataParseError) {
          throw error;
        }
        throw new DataFetchError(
          `Failed to fetch ${resource}: ${error}`,
          error as Error
        );
      } finally {
        if (requestKey) {
          this.abortControllers.delete(requestKey);
        }
      }
    });
  }

  /**
   * Cancel a specific request by key.
   */
  cancelRequest(requestKey: string): void {
    const controller = this.abortControllers.get(requestKey);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestKey);
    }
    this.deduplicator.cancel(requestKey);
  }

  /**
   * Cancel all pending requests.
   */
  cancelAllRequests(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
    this.deduplicator.clear();
  }

  /**
   * Fetch and parse all JSON data, building internal indexes.
   * 
   * This method must be called before using any other client methods.
   * Will only reload if data is expired (older than 10 minutes) or not loaded.
   */
  async loadAll(): Promise<void> {
    // Check if data is already loaded and not expired
    if (this.loaded && !this.isDataExpired()) {
      this.logger.debug(
        `Data cache still valid (age: ${Math.round(this.getCacheAge() / 1000)}s), ` +
        `skipping reload`
      );
      return;
    }

    await this.performLoad();
  }

  /**
   * Force reload all data from the API, bypassing cache.
   */
  async forceReload(): Promise<void> {
    this.logger.info('Force reloading data from API');
    await this.performLoad();
  }

  /**
   * Internal method to perform the actual data loading.
   */
  private async performLoad(): Promise<void> {
    try {
      // Fetch all data in parallel
      const [rawFilms, rawDevelopers, rawCombinations] = await Promise.all([
        this.fetch<Film>('films'),
        this.fetch<Developer>('developers'),
        this.fetch<any>('combinations'),
      ]);

      // Store data
      this.films = rawFilms;
      this.developers = rawDevelopers;
      this.combinations = (rawCombinations as any[]).map(c => ({
        ...c,
        dilutionId: c.dilutionId ? parseInt(String(c.dilutionId), 10) : undefined,
      }));

      // Build indexes
      this.buildIndexes();

      this.loaded = true;
      this.lastLoadedTimestamp = Date.now();
      
      this.logger.info(
        `Loaded ${this.films.length} films, ` +
        `${this.developers.length} developers, ` +
        `${this.combinations.length} combinations.`
      );
    } catch (error) {
      this.logger.error(`Failed to load data: ${error}`);
      throw error;
    }
  }

  /**
   * Build internal indexes for O(1) lookups.
   */
  private buildIndexes(): void {
    this.filmIndex.clear();
    this.developerIndex.clear();
    this.combinationIndex.clear();

    for (const film of this.films) {
      this.filmIndex.set(film.uuid, film);
    }

    for (const developer of this.developers) {
      this.developerIndex.set(developer.uuid, developer);
    }

    for (const combination of this.combinations) {
      this.combinationIndex.set(combination.uuid, combination);
    }
  }

  /**
   * Check if the cached data has expired (older than 10 minutes).
   */
  isDataExpired(): boolean {
    if (!this.loaded || this.lastLoadedTimestamp === null) {
      return true;
    }
    return Date.now() - this.lastLoadedTimestamp > DorkroomClient.DATA_CACHE_TTL;
  }

  /**
   * Get the age of cached data in milliseconds.
   */
  getCacheAge(): number {
    if (!this.loaded || this.lastLoadedTimestamp === null) {
      return 0;
    }
    return Date.now() - this.lastLoadedTimestamp;
  }

  /**
   * Ensure data has been loaded before performing operations.
   */
  private ensureLoaded(): void {
    if (!this.loaded) {
      throw new DataNotLoadedError();
    }
  }

  /**
   * Get a film by its UUID.
   */
  getFilm(filmId: string): Film | undefined {
    this.ensureLoaded();
    return this.filmIndex.get(filmId);
  }

  /**
   * Get a developer by its UUID.
   */
  getDeveloper(developerId: string): Developer | undefined {
    this.ensureLoaded();
    return this.developerIndex.get(developerId);
  }

  /**
   * Get a combination by its UUID.
   */
  getCombination(combinationId: string): Combination | undefined {
    this.ensureLoaded();
    return this.combinationIndex.get(combinationId);
  }

  /**
   * Get all films.
   */
  getAllFilms(): Film[] {
    this.ensureLoaded();
    return [...this.films];
  }

  /**
   * Get all developers.
   */
  getAllDevelopers(): Developer[] {
    this.ensureLoaded();
    return [...this.developers];
  }

  /**
   * Get all combinations.
   */
  getAllCombinations(): Combination[] {
    this.ensureLoaded();
    return [...this.combinations];
  }

  /**
   * Get all development combinations for a specific film.
   */
  getCombinationsForFilm(filmId: string): Combination[] {
    this.ensureLoaded();
    return this.combinations.filter(c => c.filmStockId === filmId);
  }

  /**
   * Get all development combinations for a specific developer.
   */
  getCombinationsForDeveloper(developerId: string): Combination[] {
    this.ensureLoaded();
    return this.combinations.filter(c => c.developerId === developerId);
  }

  /**
   * Search films by name or brand using substring matching.
   */
  searchFilms(query: string, colorType?: string): Film[] {
    this.ensureLoaded();
    const lowerQuery = query.toLowerCase().trim();
    
    // Return empty array for empty queries
    if (!lowerQuery) {
      return [];
    }
    
    return this.films.filter(film => {
      const matchesQuery = 
        film.name.toLowerCase().includes(lowerQuery) ||
        film.brand.toLowerCase().includes(lowerQuery);
      
      const matchesColorType = !colorType || film.colorType === colorType;
      
      return matchesQuery && matchesColorType;
    });
  }

  /**
   * Search developers by manufacturer or name using substring matching.
   */
  searchDevelopers(query: string, type?: string): Developer[] {
    this.ensureLoaded();
    const lowerQuery = query.toLowerCase().trim();
    
    // Return empty array for empty queries
    if (!lowerQuery) {
      return [];
    }
    
    return this.developers.filter(developer => {
      const matchesQuery = 
        developer.name.toLowerCase().includes(lowerQuery) ||
        developer.manufacturer.toLowerCase().includes(lowerQuery);
      
      const matchesType = !type || developer.type === type;
      
      return matchesQuery && matchesType;
    });
  }

  /**
   * Internal method for performing fuzzy search on films.
   */
  private async performFuzzySearchFilms(
    query: string, 
    options: FuzzySearchOptions = {}
  ): Promise<Film[]> {
    const params = new URLSearchParams({
      query,
      fuzzy: 'true',
    });

    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    const requestKey = `fuzzy-films-${query}-${JSON.stringify(options)}`;
    return this.fetch<Film>('films', params, requestKey);
  }

  /**
   * Internal method for performing fuzzy search on developers.
   */
  private async performFuzzySearchDevelopers(
    query: string, 
    options: FuzzySearchOptions = {}
  ): Promise<Developer[]> {
    const params = new URLSearchParams({
      query,
      fuzzy: 'true',
    });

    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    const requestKey = `fuzzy-developers-${query}-${JSON.stringify(options)}`;
    return this.fetch<Developer>('developers', params, requestKey);
  }

  /**
   * Fuzzy search for films by name, brand, and description via the API.
   * This method is debounced to prevent excessive API calls.
   */
  async fuzzySearchFilms(
    query: string, 
    options: FuzzySearchOptions = {}
  ): Promise<Film[]> {
    return new Promise((resolve, reject) => {
      this.debouncedFuzzySearchFilms(query, options)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Fuzzy search for developers by manufacturer, name, and notes via the API.
   * This method is debounced to prevent excessive API calls.
   */
  async fuzzySearchDevelopers(
    query: string, 
    options: FuzzySearchOptions = {}
  ): Promise<Developer[]> {
    return new Promise((resolve, reject) => {
      this.debouncedFuzzySearchDevelopers(query, options)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Flush pending debounced search requests immediately.
   */
  flushPendingSearches(): void {
    this.debouncedFuzzySearchFilms.flush();
    this.debouncedFuzzySearchDevelopers.flush();
  }

  /**
   * Cancel pending debounced search requests.
   */
  cancelPendingSearches(): void {
    this.debouncedFuzzySearchFilms.cancel();
    this.debouncedFuzzySearchDevelopers.cancel();
  }

  /**
   * Get statistics about the loaded data.
   */
  getStats(): { 
    films: number; 
    developers: number; 
    combinations: number;
    cacheSize: number;
    pendingRequests: number;
  } {
    this.ensureLoaded();
    return {
      films: this.films.length,
      developers: this.developers.length,
      combinations: this.combinations.length,
      cacheSize: this.searchCache.size(),
      pendingRequests: this.abortControllers.size,
    };
  }

  /**
   * Clear all caches and cancel pending requests.
   */
  clearCache(): void {
    this.searchCache.clear();
    this.cancelAllRequests();
    this.cancelPendingSearches();
  }

  /**
   * Check if data has been loaded.
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get transport layer status for monitoring.
   */
  getTransportStatus(): { circuitBreakerState?: string } {
    const transport = this.transport as FetchHTTPTransport;
    return {
      circuitBreakerState: transport.getCircuitBreakerState?.(),
    };
  }

  /**
   * Reset the client state (useful for testing).
   */
  reset(): void {
    this.films = [];
    this.developers = [];
    this.combinations = [];
    this.filmIndex.clear();
    this.developerIndex.clear();
    this.combinationIndex.clear();
    this.loaded = false;
    this.lastLoadedTimestamp = null;
    this.clearCache();
    
    // Reset transport layer if possible
    const transport = this.transport as FetchHTTPTransport;
    if (transport.resetCircuitBreaker) {
      transport.resetCircuitBreaker();
    }
  }
} 