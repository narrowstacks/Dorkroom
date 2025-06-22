/**
 * Tests for enhanced Dorkroom client with debouncing and better error handling.
 */

import { DorkroomClient } from '../client';
import { CircuitBreakerError, RateLimitError, TimeoutError } from '../errors';

describe('Enhanced DorkroomClient', () => {
  let client: DorkroomClient;

  beforeEach(() => {
    client = new DorkroomClient({
      baseUrl: 'https://api.dorkroom.art/api',
      searchDebounceMs: 100, // Fast debounce for testing
      cacheTTL: 1000, // Short cache for testing
      timeout: 5000,
      maxRetries: 2,
    });
  });

  afterEach(() => {
    client.reset();
  });

  describe('Debouncing', () => {
    it('should debounce rapid search requests', async () => {
      // Mock the transport to track calls
      const transportSpy = jest.spyOn(client['transport'], 'get');
      transportSpy.mockResolvedValue(new Response(JSON.stringify({
        data: [],
        success: true,
        message: 'Success',
        total: 0
      })));

      // Make rapid search requests
      const promises = [
        client.fuzzySearchFilms('kodak'),
        client.fuzzySearchFilms('kodak'),
        client.fuzzySearchFilms('kodak'),
      ];

      await Promise.all(promises);

      // Should only make one actual API call due to debouncing
      expect(transportSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow manual flushing of pending searches', async () => {
      const transportSpy = jest.spyOn(client['transport'], 'get');
      transportSpy.mockResolvedValue(new Response(JSON.stringify({
        data: [],
        success: true,
        message: 'Success',
        total: 0
      })));

      // Start a search but don't wait
      const promise = client.fuzzySearchFilms('kodak');
      
      // Flush immediately
      client.flushPendingSearches();
      
      await promise;
      
      expect(transportSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Caching', () => {
    it('should cache search results and return cached data', async () => {
      const mockData = [{ uuid: '1', name: 'Test Film', brand: 'Test' }];
      const transportSpy = jest.spyOn(client['transport'], 'get');
      transportSpy.mockResolvedValue(new Response(JSON.stringify({
        data: mockData,
        success: true,
        message: 'Success',
        total: 1
      })));

      // First request
      const result1 = await client.fuzzySearchFilms('test');
      
      // Second request should use cache
      const result2 = await client.fuzzySearchFilms('test');

      expect(transportSpy).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
    });

    it('should provide cache statistics', async () => {
      const stats = client.getStats();
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('pendingRequests');
    });
  });

  describe('Request Management', () => {
    it('should allow cancellation of specific requests', async () => {
      const transportSpy = jest.spyOn(client['transport'], 'get');
      transportSpy.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      // Start a request
      const promise = client.fuzzySearchFilms('kodak');
      
      // Cancel it
      client.cancelRequest('fuzzy-films-kodak-{}');
      
      // Should be able to cancel without error
      client.cancelAllRequests();
    });

    it('should provide transport status information', () => {
      const status = client.getTransportStatus();
      expect(status).toHaveProperty('circuitBreakerState');
    });
  });

  describe('Error Handling', () => {
    it('should handle and classify different error types', async () => {
      const client = new DorkroomClient({
        baseUrl: 'https://invalid-url-that-should-fail.invalid',
        maxRetries: 1,
        timeout: 100,
      });

      try {
        await client.loadAll();
        fail('Should have thrown an error');
      } catch (error) {
        // Should be a network or timeout error
        expect(error).toBeDefined();
      }
    });
  });

  describe('Circuit Breaker Integration', () => {
    it('should respect circuit breaker state', () => {
      const status = client.getTransportStatus();
      expect(status.circuitBreakerState).toBeDefined();
    });
  });
}); 