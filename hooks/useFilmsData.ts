import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Film } from "@/api/dorkroom/types";
import { getApiUrl } from "@/utils/platformDetection";

export interface FilmsDataState {
  films: Film[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  searchQuery: string;
  brandFilter: string;
  typeFilter: string;
  sortBy: "name" | "brand" | "iso" | "dateAdded";
  sortDirection: "asc" | "desc";
}

export interface FilmsDataActions {
  setSearchQuery: (query: string) => void;
  setBrandFilter: (brand: string) => void;
  setTypeFilter: (type: string) => void;
  setSortBy: (sortBy: FilmsDataState["sortBy"]) => void;
  setSortDirection: (direction: FilmsDataState["sortDirection"]) => void;
  handleSort: (field: FilmsDataState["sortBy"]) => void;
  clearFilters: () => void;
  refetch: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export interface UseFilmsDataReturn extends FilmsDataState, FilmsDataActions {
  filteredFilms: Film[];
  totalFilms: number;
  availableBrands: string[];
  availableTypes: string[];
  getFilmById: (id: string) => Film | undefined;
}

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for managing films data with search, filtering, and sorting
 */
export function useFilmsData(): UseFilmsDataReturn {
  const [state, setState] = useState<FilmsDataState>({
    films: [],
    isLoading: false,
    isLoaded: false,
    error: null,
    searchQuery: "",
    brandFilter: "",
    typeFilter: "",
    sortBy: "name",
    sortDirection: "asc",
  });

  const cacheRef = useRef<{ data: Film[]; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cache TTL: 5 minutes
  const CACHE_TTL = 5 * 60 * 1000;

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(state.searchQuery, 300);

  /**
   * Fetch films data from API
   */
  const fetchFilms = useCallback(
    async (forceRefresh = false) => {
      // Check cache first
      if (!forceRefresh && cacheRef.current) {
        const age = Date.now() - cacheRef.current.timestamp;
        if (age < CACHE_TTL) {
          setState((prev) => ({
            ...prev,
            films: cacheRef.current!.data,
            isLoading: false,
            isLoaded: true,
            error: null,
          }));
          return;
        }
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const params = new URLSearchParams();
        if (debouncedSearchQuery.trim()) {
          params.set("query", debouncedSearchQuery.trim());
          params.set("fuzzy", "true");
        }
        params.set("limit", "1000"); // Get all films

        const queryString = params.toString();
        const url = getApiUrl(`films${queryString ? `?${queryString}` : ""}`);

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch films: ${response.status} ${response.statusText}`,
          );
        }

        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid response format from films API");
        }

        const filmsData = result.data as Film[];

        // Update cache
        cacheRef.current = {
          data: filmsData,
          timestamp: Date.now(),
        };

        setState((prev) => ({
          ...prev,
          films: filmsData,
          isLoading: false,
          isLoaded: true,
          error: null,
        }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled, don't update state
        }

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [debouncedSearchQuery],
  );

  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchFilms();
  }, [fetchFilms]);

  /**
   * Filter and sort films based on current state
   */
  const filteredFilms = useMemo(() => {
    let filtered = [...state.films];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (film) =>
          film.name.toLowerCase().includes(query) ||
          film.brand.toLowerCase().includes(query) ||
          film.description?.toLowerCase().includes(query),
      );
    }

    // Apply brand filter
    if (state.brandFilter) {
      filtered = filtered.filter(
        (film) => film.brand.toLowerCase() === state.brandFilter.toLowerCase(),
      );
    }

    // Apply type filter
    if (state.typeFilter) {
      filtered = filtered.filter(
        (film) =>
          film.colorType.toLowerCase() === state.typeFilter.toLowerCase(),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (state.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "brand":
          comparison = a.brand.localeCompare(b.brand);
          break;
        case "iso":
          comparison = a.isoSpeed - b.isoSpeed;
          break;
        case "dateAdded":
          comparison =
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        default:
          comparison = 0;
      }

      return state.sortDirection === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [
    state.films,
    debouncedSearchQuery,
    state.brandFilter,
    state.typeFilter,
    state.sortBy,
    state.sortDirection,
  ]);

  /**
   * Get available filter options
   */
  const availableBrands = useMemo(() => {
    const brands = [...new Set(state.films.map((film) => film.brand))];
    return brands.sort();
  }, [state.films]);

  const availableTypes = useMemo(() => {
    const types = [...new Set(state.films.map((film) => film.colorType))];
    return types.sort();
  }, [state.films]);

  /**
   * Get film by ID
   */
  const getFilmById = useCallback(
    (id: string): Film | undefined => {
      return state.films.find((film) => film.id === id || film.uuid === id);
    },
    [state.films],
  );

  /**
   * Update search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  /**
   * Update brand filter
   */
  const setBrandFilter = useCallback((brand: string) => {
    setState((prev) => ({ ...prev, brandFilter: brand }));
  }, []);

  /**
   * Update type filter
   */
  const setTypeFilter = useCallback((type: string) => {
    setState((prev) => ({ ...prev, typeFilter: type }));
  }, []);

  /**
   * Update sort field
   */
  const setSortBy = useCallback((sortBy: FilmsDataState["sortBy"]) => {
    setState((prev) => ({ ...prev, sortBy }));
  }, []);

  /**
   * Update sort direction
   */
  const setSortDirection = useCallback(
    (direction: FilmsDataState["sortDirection"]) => {
      setState((prev) => ({ ...prev, sortDirection: direction }));
    },
    [],
  );

  /**
   * Handle sort with automatic direction toggle
   */
  const handleSort = useCallback((field: FilmsDataState["sortBy"]) => {
    setState((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection:
        prev.sortBy === field && prev.sortDirection === "asc" ? "desc" : "asc",
    }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchQuery: "",
      brandFilter: "",
      typeFilter: "",
    }));
  }, []);

  /**
   * Refetch data (respects cache)
   */
  const refetch = useCallback(async () => {
    await fetchFilms(false);
  }, [fetchFilms]);

  /**
   * Force refresh (ignores cache)
   */
  const forceRefresh = useCallback(async () => {
    await fetchFilms(true);
  }, [fetchFilms]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    filteredFilms,
    totalFilms: state.films.length,
    availableBrands,
    availableTypes,
    getFilmById,
    setSearchQuery,
    setBrandFilter,
    setTypeFilter,
    setSortBy,
    setSortDirection,
    handleSort,
    clearFilters,
    refetch,
    forceRefresh,
  };
}
