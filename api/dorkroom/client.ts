/**
 * Main client for interacting with the Dorkroom REST API.
 * 
 * This client provides methods to fetch film stocks, developers, and 
 * development combinations from the Dorkroom REST API. Features:
 * - Automatic retries and timeouts
 * - Indexed lookups for O(1) performance
 * - API-driven fuzzy searching
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

/**
 * Main client for interacting with the Dorkroom REST API.
 */
export class DorkroomClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly transport: HTTPTransport;
  private readonly logger: Logger;

  // Data storage
  private films: Film[] = [];
  private developers: Developer[] = [];
  private combinations: Combination[] = [];
  private loaded = false;

  // Indexes for O(1) lookup
  private filmIndex = new Map<string, Film>();
  private developerIndex = new Map<string, Developer>();
  private combinationIndex = new Map<string, Combination>();

  constructor(config: DorkroomClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://api.dorkroom.art/api';
    this.timeout = config.timeout || 10000; // 10 seconds
    this.logger = config.logger || new ConsoleLogger();
    
    // Initialize HTTP transport
    this.transport = new FetchHTTPTransport(
      { maxRetries: config.maxRetries || 3 },
      this.logger
    );
  }

  /**
   * Fetch and parse a JSON resource from the API.
   */
  private async fetch<T>(resource: string, params: URLSearchParams = new URLSearchParams()): Promise<T[]> {
    const url = joinURL(this.baseUrl, `${resource}?${params.toString()}`);
    
    try {
      this.logger.debug(`Fetching ${resource} with params: ${params.toString()}`);
      const response = await this.transport.get(url, this.timeout);
      
      try {
        const apiResponse = await response.json() as ApiResponse<T>;
        if (apiResponse && apiResponse.data) {
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
    }
  }

  /**
   * Fetch and parse all JSON data, building internal indexes.
   * 
   * This method must be called before using any other client methods.
   */
  async loadAll(): Promise<void> {
    try {
      // Fetch all data in parallel
      const [rawFilms, rawDevelopers, rawCombinations] = await Promise.all([
        this.fetch<Film>('films'),
        this.fetch<Developer>('developers'),
        this.fetch<Combination>('combinations'),
      ]);

      // Store data
      this.films = rawFilms;
      this.developers = rawDevelopers;
      this.combinations = rawCombinations;

      // Build indexes
      this.buildIndexes();

      this.loaded = true;
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
   * Fuzzy search for films by name, brand, and description via the API.
   */
  async fuzzySearchFilms(
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
    
    return this.fetch<Film>('films', params);
  }

  /**
   * Fuzzy search for developers by manufacturer, name, and notes via the API.
   */
  async fuzzySearchDevelopers(
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
    
    return this.fetch<Developer>('developers', params);
  }

  /**
   * Get statistics about the loaded data.
   */
  getStats(): { films: number; developers: number; combinations: number } {
    this.ensureLoaded();
    return {
      films: this.films.length,
      developers: this.developers.length,
      combinations: this.combinations.length,
    };
  }

  /**
   * Check if data has been loaded.
   */
  isLoaded(): boolean {
    return this.loaded;
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
  }
} 