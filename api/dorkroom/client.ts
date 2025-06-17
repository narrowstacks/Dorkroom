/**
 * Main client for interacting with the Dorkroom Static API.
 * 
 * This client provides methods to fetch film stocks, developers, and 
 * development combinations from the Dorkroom Static API. Features:
 * - Automatic retries and timeouts
 * - Indexed lookups for O(1) performance
 * - Optional fuzzy searching
 * - Comprehensive error handling
 */

import Fuse, { FuseResult } from 'fuse.js';
import { 
  Film, 
  Developer, 
  Combination, 
  DorkroomClientConfig, 
  Logger, 
  FuzzySearchOptions 
} from './types';
import { DataFetchError, DataParseError, DataNotLoadedError } from './errors';
import { 
  HTTPTransport, 
  FetchHTTPTransport, 
  ConsoleLogger, 
  joinURL 
} from './transport';

/**
 * Configuration for Fuse.js fuzzy search.
 */
const FUSE_CONFIG = {
  includeScore: true,
  threshold: 0.4, // 0 = perfect match, 1 = match anything
  ignoreLocation: true,
  useExtendedSearch: true,
};

/**
 * Main client for interacting with the Dorkroom Static API.
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

  // Fuzzy search instances
  private filmSearcher?: Fuse<Film>;
  private developerSearcher?: Fuse<Developer>;

  constructor(config: DorkroomClientConfig = {}) {
    this.baseUrl = config.baseUrl || 
      'https://raw.githubusercontent.com/narrowstacks/dorkroom-static-api/main/';
    this.timeout = config.timeout || 10000; // 10 seconds
    this.logger = config.logger || new ConsoleLogger();
    
    // Initialize HTTP transport
    this.transport = new FetchHTTPTransport(
      { maxRetries: config.maxRetries || 3 },
      this.logger
    );
  }

  /**
   * Fetch and parse a JSON file from the API.
   */
  private async fetch<T>(filename: string): Promise<T[]> {
    const url = joinURL(this.baseUrl, filename);
    
    try {
      this.logger.debug(`Fetching ${filename}`);
      const response = await this.transport.get(url, this.timeout);
      
      try {
        const data = await response.json();
        return data as T[];
      } catch (error) {
        throw new DataParseError(
          `Invalid JSON in ${filename}: ${error}`,
          error as Error
        );
      }
    } catch (error) {
      if (error instanceof DataParseError) {
        throw error;
      }
      throw new DataFetchError(
        `Failed to fetch ${filename}: ${error}`,
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
        this.fetch<Film>('film_stocks.json'),
        this.fetch<Developer>('developers.json'),
        this.fetch<Combination>('development_combinations.json'),
      ]);

      // Store data
      this.films = rawFilms;
      this.developers = rawDevelopers;
      this.combinations = rawCombinations;

      // Build indexes
      this.buildIndexes();

      // Initialize fuzzy searchers
      this.initializeFuzzySearch();

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
      this.filmIndex.set(film.id, film);
    }

    for (const developer of this.developers) {
      this.developerIndex.set(developer.id, developer);
    }

    for (const combination of this.combinations) {
      this.combinationIndex.set(combination.id, combination);
    }
  }

  /**
   * Initialize fuzzy search instances.
   */
  private initializeFuzzySearch(): void {
    // Film fuzzy search
    this.filmSearcher = new Fuse(this.films, {
      ...FUSE_CONFIG,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'brand', weight: 0.4 },
        { name: 'description', weight: 0.2 },
      ],
    });

    // Developer fuzzy search
    this.developerSearcher = new Fuse(this.developers, {
      ...FUSE_CONFIG,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'manufacturer', weight: 0.4 },
        { name: 'notes', weight: 0.2 },
      ],
    });
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
   * Get a film by its ID.
   */
  getFilm(filmId: string): Film | undefined {
    this.ensureLoaded();
    return this.filmIndex.get(filmId);
  }

  /**
   * Get a developer by its ID.
   */
  getDeveloper(developerId: string): Developer | undefined {
    this.ensureLoaded();
    return this.developerIndex.get(developerId);
  }

  /**
   * Get a combination by its ID.
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
    return this.combinations.filter(c => c.film_stock_id === filmId);
  }

  /**
   * Get all development combinations for a specific developer.
   */
  getCombinationsForDeveloper(developerId: string): Combination[] {
    this.ensureLoaded();
    return this.combinations.filter(c => c.developer_id === developerId);
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
      
      const matchesColorType = !colorType || film.color_type === colorType;
      
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
   * Fuzzy search for films by name, brand, and description.
   */
  fuzzySearchFilms(
    query: string, 
    options: FuzzySearchOptions = {}
  ): Film[] {
    this.ensureLoaded();
    
    if (!this.filmSearcher) {
      this.logger.warn('Fuzzy search not initialized, falling back to regular search');
      return this.searchFilms(query).slice(0, options.limit || 10);
    }

    const results = this.filmSearcher.search(query);
    
    // Filter by threshold if specified
    const threshold = options.threshold || 0.6;
    const filteredResults = results.filter((result: FuseResult<Film>) => 
      (result.score || 0) <= (1 - threshold)
    );

    // Apply limit
    const limit = options.limit || 10;
    return filteredResults
      .slice(0, limit)
      .map((result: FuseResult<Film>) => result.item);
  }

  /**
   * Fuzzy search for developers by manufacturer, name, and notes.
   */
  fuzzySearchDevelopers(
    query: string, 
    options: FuzzySearchOptions = {}
  ): Developer[] {
    this.ensureLoaded();
    
    if (!this.developerSearcher) {
      this.logger.warn('Fuzzy search not initialized, falling back to regular search');
      return this.searchDevelopers(query).slice(0, options.limit || 10);
    }

    const results = this.developerSearcher.search(query);
    
    // Filter by threshold if specified
    const threshold = options.threshold || 0.6;
    const filteredResults = results.filter((result: FuseResult<Developer>) => 
      (result.score || 0) <= (1 - threshold)
    );

    // Apply limit
    const limit = options.limit || 10;
    return filteredResults
      .slice(0, limit)
      .map((result: FuseResult<Developer>) => result.item);
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
    this.filmSearcher = undefined;
    this.developerSearcher = undefined;
    this.loaded = false;
  }
} 