import { DorkroomClient } from '../client';
import type { HTTPTransport } from '../transport';
import { 
  DataFetchError, 
  DataParseError, 
  DataNotLoadedError 
} from '../errors';
import type { Film, Developer, Combination } from '../types';

// Mock data for testing
const mockFilms: Film[] = [
  {
    id: 'kodak-tri-x-400',
    name: 'Tri-X 400',
    brand: 'Kodak',
    iso_speed: 400,
    color_type: 'B&W',
    description: 'Professional black and white film',
    discontinued: 0,
    manufacturer_notes: ['Classic grain structure'],
    grain_structure: 'Fine grain',
    reciprocity_failure: 'Minimal up to 1 second'
  },
  {
    id: 'kodak-portra-400',
    name: 'Portra 400',
    brand: 'Kodak',
    iso_speed: 400,
    color_type: 'Color',
    description: 'Professional color negative film',
    discontinued: 0,
    manufacturer_notes: ['Excellent skin tones'],
    grain_structure: 'Ultra-fine grain'
  },
  {
    id: 'fuji-acros-100',
    name: 'Acros 100',
    brand: 'Fujifilm',
    iso_speed: 100,
    color_type: 'B&W',
    description: 'Fine grain black and white film',
    discontinued: 1,
    manufacturer_notes: ['Discontinued 2018']
  }
];

const mockDevelopers: Developer[] = [
  {
    id: 'kodak-d76',
    name: 'D-76',
    manufacturer: 'Kodak',
    type: 'Black & White Film',
    film_or_paper: 'Film',
    dilutions: [
      { id: 1, ratio: '1:1', description: 'Stock solution' },
      { id: 2, ratio: '1:2', description: 'Diluted solution' }
    ],
    working_life_hours: 24,
    stock_life_months: 6,
    notes: 'Classic black and white developer',
    discontinued: 0,
    mixing_instructions: 'Mix with water at 68°F',
    safety_notes: 'Wear gloves when handling'
  },
  {
    id: 'ilford-id11',
    name: 'ID-11',
    manufacturer: 'Ilford',
    type: 'Black & White Film',
    film_or_paper: 'Film',
    dilutions: [
      { id: 1, ratio: '1:1', description: 'Stock solution' }
    ],
    working_life_hours: 24,
    discontinued: 0
  }
];

const mockCombinations: Combination[] = [
  {
    id: 'tri-x-d76-1',
    name: 'Tri-X 400 in D-76 (1:1)',
    film_stock_id: 'kodak-tri-x-400',
    developer_id: 'kodak-d76',
    temperature_f: 68,
    time_minutes: 7.5,
    shooting_iso: 400,
    push_pull: 0,
    agitation_schedule: 'Initial 30s, then 5s every 30s',
    notes: 'Standard development',
    dilution_id: 1
  },
  {
    id: 'tri-x-id11-1',
    name: 'Tri-X 400 in ID-11',
    film_stock_id: 'kodak-tri-x-400',
    developer_id: 'ilford-id11',
    temperature_f: 68,
    time_minutes: 8,
    shooting_iso: 400,
    push_pull: 0
  },
  {
    id: 'portra-c41-1',
    name: 'Portra 400 C-41',
    film_stock_id: 'kodak-portra-400',
    developer_id: 'kodak-d76', // Not realistic but for testing
    temperature_f: 100,
    time_minutes: 3.25,
    shooting_iso: 400,
    push_pull: 0
  }
];

// Mock transport implementation
class MockHTTPTransport implements HTTPTransport {
  private shouldFail: boolean = false;
  private shouldFailJSON: boolean = false;
  private customResponses: Map<string, any> = new Map();

  setFailure(fail: boolean) {
    this.shouldFail = fail;
  }

  setJSONFailure(fail: boolean) {
    this.shouldFailJSON = fail;
  }

  setCustomResponse(filename: string, data: any) {
    this.customResponses.set(filename, data);
  }

  async get(url: string, timeout: number): Promise<Response> {
    if (this.shouldFail) {
      throw new Error('Network error');
    }

    // Extract filename from URL
    const filename = url.split('/').pop() || '';
    
    let data: any;
    if (this.customResponses.has(filename)) {
      data = this.customResponses.get(filename);
    } else {
      // Default mock responses
      switch (filename) {
        case 'film_stocks.json':
          data = mockFilms;
          break;
        case 'developers.json':
          data = mockDevelopers;
          break;
        case 'development_combinations.json':
          data = mockCombinations;
          break;
        default:
          throw new Error(`Unknown file: ${filename}`);
      }
    }

    const responseText = this.shouldFailJSON ? 'invalid json' : JSON.stringify(data);
    
    return new Response(responseText, {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

describe('DorkroomClient', () => {
  let client: DorkroomClient;
  let mockTransport: MockHTTPTransport;

  beforeEach(() => {
    mockTransport = new MockHTTPTransport();
    // @ts-ignore - Accessing private property for testing
    client = new DorkroomClient();
    // @ts-ignore - Replacing transport for testing
    client['transport'] = mockTransport;
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(client).toBeInstanceOf(DorkroomClient);
      expect(client.isLoaded()).toBe(false);
    });

    it('should initialize with custom configuration', () => {
      const customClient = new DorkroomClient({
        baseUrl: 'https://custom.api.com/',
        timeout: 5000,
        maxRetries: 5
      });
      expect(customClient).toBeInstanceOf(DorkroomClient);
    });
  });

  describe('Data Loading', () => {
    it('should load all data successfully', async () => {
      await client.loadAll();
      
      expect(client.isLoaded()).toBe(true);
      
      const stats = client.getStats();
      expect(stats.films).toBe(mockFilms.length);
      expect(stats.developers).toBe(mockDevelopers.length);
      expect(stats.combinations).toBe(mockCombinations.length);
    });

    it('should handle network errors during loading', async () => {
      mockTransport.setFailure(true);
      
      await expect(client.loadAll()).rejects.toThrow(DataFetchError);
      expect(client.isLoaded()).toBe(false);
    });

    it('should handle JSON parsing errors during loading', async () => {
      mockTransport.setJSONFailure(true);
      
      await expect(client.loadAll()).rejects.toThrow(DataParseError);
      expect(client.isLoaded()).toBe(false);
    });
  });

  describe('Data Access Before Loading', () => {
    it('should throw DataNotLoadedError when accessing data before loading', () => {
      expect(() => client.getFilm('any-id')).toThrow(DataNotLoadedError);
      expect(() => client.getDeveloper('any-id')).toThrow(DataNotLoadedError);
      expect(() => client.getAllFilms()).toThrow(DataNotLoadedError);
      expect(() => client.searchFilms('query')).toThrow(DataNotLoadedError);
      expect(() => client.fuzzySearchFilms('query')).toThrow(DataNotLoadedError);
    });
  });

  describe('Film Operations', () => {
    beforeEach(async () => {
      await client.loadAll();
    });

    it('should get film by ID', () => {
      const film = client.getFilm('kodak-tri-x-400');
      expect(film).toBeDefined();
      expect(film?.name).toBe('Tri-X 400');
      expect(film?.brand).toBe('Kodak');
    });

    it('should return undefined for non-existent film ID', () => {
      const film = client.getFilm('non-existent-film');
      expect(film).toBeUndefined();
    });

    it('should get all films', () => {
      const films = client.getAllFilms();
      expect(films).toHaveLength(mockFilms.length);
      expect(films[0]).toEqual(mockFilms[0]);
    });

    it('should search films by name', () => {
      const films = client.searchFilms('tri-x');
      expect(films).toHaveLength(1);
      expect(films[0].name).toBe('Tri-X 400');
    });

    it('should search films by brand', () => {
      const films = client.searchFilms('kodak');
      expect(films).toHaveLength(2);
      expect(films.every(f => f.brand === 'Kodak')).toBe(true);
    });

    it('should search films with color type filter', () => {
      const colorFilms = client.searchFilms('kodak', 'Color');
      expect(colorFilms).toHaveLength(1);
      expect(colorFilms[0].name).toBe('Portra 400');

      const bwFilms = client.searchFilms('kodak', 'B&W');
      expect(bwFilms).toHaveLength(1);
      expect(bwFilms[0].name).toBe('Tri-X 400');
    });

    it('should perform case-insensitive search', () => {
      const films = client.searchFilms('KODAK');
      expect(films).toHaveLength(2);
    });
  });

  describe('Developer Operations', () => {
    beforeEach(async () => {
      await client.loadAll();
    });

    it('should get developer by ID', () => {
      const developer = client.getDeveloper('kodak-d76');
      expect(developer).toBeDefined();
      expect(developer?.name).toBe('D-76');
      expect(developer?.manufacturer).toBe('Kodak');
    });

    it('should return undefined for non-existent developer ID', () => {
      const developer = client.getDeveloper('non-existent-developer');
      expect(developer).toBeUndefined();
    });

    it('should get all developers', () => {
      const developers = client.getAllDevelopers();
      expect(developers).toHaveLength(mockDevelopers.length);
    });

    it('should search developers by name', () => {
      const developers = client.searchDevelopers('d-76');
      expect(developers).toHaveLength(1);
      expect(developers[0].name).toBe('D-76');
    });

    it('should search developers by manufacturer', () => {
      const developers = client.searchDevelopers('kodak');
      expect(developers).toHaveLength(1);
      expect(developers[0].manufacturer).toBe('Kodak');
    });
  });

  describe('Combination Operations', () => {
    beforeEach(async () => {
      await client.loadAll();
    });

    it('should get combination by ID', () => {
      const combination = client.getCombination('tri-x-d76-1');
      expect(combination).toBeDefined();
      expect(combination?.film_stock_id).toBe('kodak-tri-x-400');
      expect(combination?.developer_id).toBe('kodak-d76');
    });

    it('should get all combinations', () => {
      const combinations = client.getAllCombinations();
      expect(combinations).toHaveLength(mockCombinations.length);
    });

    it('should get combinations for specific film', () => {
      const combinations = client.getCombinationsForFilm('kodak-tri-x-400');
      expect(combinations).toHaveLength(2);
      expect(combinations.every(c => c.film_stock_id === 'kodak-tri-x-400')).toBe(true);
    });

    it('should get combinations for specific developer', () => {
      const combinations = client.getCombinationsForDeveloper('kodak-d76');
      expect(combinations).toHaveLength(2);
      expect(combinations.every(c => c.developer_id === 'kodak-d76')).toBe(true);
    });

    it('should return empty array for non-existent film combinations', () => {
      const combinations = client.getCombinationsForFilm('non-existent-film');
      expect(combinations).toHaveLength(0);
    });
  });

  describe('Fuzzy Search', () => {
    beforeEach(async () => {
      await client.loadAll();
    });

    it('should perform fuzzy search on films', () => {
      // Test fuzzy matching with typos - use a more lenient threshold
      const films = client.fuzzySearchFilms('trix', { threshold: 0.3 }); // Missing hyphen, lower threshold
      expect(films.length).toBeGreaterThan(0);
      expect(films[0].name).toBe('Tri-X 400');
    });

    it('should perform fuzzy search on developers', () => {
      const developers = client.fuzzySearchDevelopers('d76', { threshold: 0.3 }); // Missing hyphen, lower threshold
      expect(developers.length).toBeGreaterThan(0);
      expect(developers[0].name).toBe('D-76');
    });

    it('should respect fuzzy search options', () => {
      const films = client.fuzzySearchFilms('kodak', { 
        limit: 1, 
        threshold: 0.1 
      });
      expect(films.length).toBeLessThanOrEqual(1);
    });

    it('should fallback to regular search if fuzzy search fails', () => {
      // This tests the fallback mechanism when fuzzy search is not available
      // @ts-ignore - Access private property for testing
      client['filmSearcher'] = undefined;
      
      const films = client.fuzzySearchFilms('tri-x', { limit: 5 });
      expect(films).toHaveLength(1);
      expect(films[0].name).toBe('Tri-X 400');
    });
  });

  describe('Client State Management', () => {
    it('should reset client state', async () => {
      await client.loadAll();
      expect(client.isLoaded()).toBe(true);
      expect(client.getAllFilms()).toHaveLength(mockFilms.length);

      client.reset();
      expect(client.isLoaded()).toBe(false);
      expect(() => client.getAllFilms()).toThrow(DataNotLoadedError);
    });

    it('should provide accurate statistics', async () => {
      await client.loadAll();
      
      const stats = client.getStats();
      expect(stats.films).toBe(mockFilms.length);
      expect(stats.developers).toBe(mockDevelopers.length);
      expect(stats.combinations).toBe(mockCombinations.length);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      await client.loadAll();
    });

    it('should handle empty search queries', () => {
      const films = client.searchFilms('');
      expect(films).toHaveLength(0);
    });

    it('should handle search queries with no matches', () => {
      const films = client.searchFilms('nonexistent-film-brand');
      expect(films).toHaveLength(0);
    });

    it('should handle special characters in search queries', () => {
      const films = client.searchFilms('tri-x'); // Hyphen
      expect(films).toHaveLength(1);
    });
  });

  describe('Data Integrity', () => {
    beforeEach(async () => {
      await client.loadAll();
    });

    it('should return copies of data arrays to prevent mutation', () => {
      const films1 = client.getAllFilms();
      const films2 = client.getAllFilms();
      
      expect(films1).not.toBe(films2); // Different array instances
      expect(films1).toEqual(films2); // Same content
    });

    it('should maintain referential integrity between combinations and films/developers', () => {
      const combination = client.getCombination('tri-x-d76-1');
      expect(combination).toBeDefined();
      
      if (combination) {
        const film = client.getFilm(combination.film_stock_id);
        const developer = client.getDeveloper(combination.developer_id);
        
        expect(film).toBeDefined();
        expect(developer).toBeDefined();
        expect(film?.id).toBe('kodak-tri-x-400');
        expect(developer?.id).toBe('kodak-d76');
      }
    });
  });
}); 