import { useState, useEffect, useCallback, useMemo } from "react";
import { useServerPagination } from "./useServerPagination";
import { useDorkroomClient } from "./useDorkroomClient";
import { useDebounce } from "./useDebounce";
import { debugLog, debugError } from "@/utils/debugLogger";
import type {
  Film,
  Developer,
  Combination,
  PaginatedApiResponse,
} from "@/api/dorkroom/types";

/**
 * Server-side development recipes hook
 * Provides optimized data loading with server-side pagination and filtering
 */

export interface ServerRecipeFilters {
  filmSlug?: string;
  developerSlug?: string;
  developerType?: string;
  dilution?: string;
  shootingIso?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface UseServerDevelopmentRecipesOptions {
  pageSize?: number;
  debounceMs?: number;
  enablePreloading?: boolean;
}

export interface UseServerDevelopmentRecipesReturn {
  // Data
  combinations: Combination[];
  allFilms: Film[];
  allDevelopers: Developer[];

  // Pagination state
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
  startIndex: number;
  endIndex: number;

  // Loading states
  isLoading: boolean;
  isInitialLoading: boolean;
  error: Error | null;

  // Filters
  filters: ServerRecipeFilters;

  // Actions
  setFilters: (filters: Partial<ServerRecipeFilters>) => void;
  clearFilters: () => void;
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  refresh: () => void;

  // Helper functions
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getFilmBySlug: (slug: string) => Film | undefined;
  getDeveloperBySlug: (slug: string) => Developer | undefined;
}

export function useServerDevelopmentRecipes(
  options: UseServerDevelopmentRecipesOptions = {},
): UseServerDevelopmentRecipesReturn {
  const { pageSize = 50, debounceMs = 300, enablePreloading = true } = options;

  const client = useDorkroomClient();

  // Core state
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [allFilms, setAllFilms] = useState<Film[]>([]);
  const [allDevelopers, setAllDevelopers] = useState<Developer[]>([]);
  const [filters, setFiltersState] = useState<ServerRecipeFilters>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Debounced filters to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, debounceMs);

  // Server pagination hook
  const pagination = useServerPagination({
    initialPageSize: pageSize,
    onPageChange: (page) => {
      debugLog("useServerDevelopmentRecipes", `Page changed to ${page}`);
    },
  });

  // Load initial data (films and developers only, not all combinations)
  const loadInitialData = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      pagination.setLoading(true);
      pagination.setError(null);

      debugLog("useServerDevelopmentRecipes", "Loading initial data...");

      // Initialize the client first - this loads all data including films and developers
      await client.loadAll();

      // Get the loaded films and developers from the client
      const films = client.getAllFilms();
      const developers = client.getAllDevelopers();

      setAllFilms(films);
      setAllDevelopers(developers);

      debugLog(
        "useServerDevelopmentRecipes",
        `Loaded ${films.length} films and ${developers.length} developers`,
      );
    } catch (error) {
      debugError(
        "useServerDevelopmentRecipes",
        "Failed to load initial data",
        error,
      );
      pagination.setError(error as Error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [client, pagination]);

  // Load combinations with server-side pagination and filtering
  const loadCombinations = useCallback(
    async (page: number = 1, resetData: boolean = false) => {
      try {
        if (!resetData) {
          pagination.setLoading(true);
        }
        pagination.setError(null);

        debugLog(
          "useServerDevelopmentRecipes",
          `Loading combinations page ${page} with filters:`,
          debouncedFilters,
        );

        // Convert internal filters to API parameters
        const apiFilters: { filmSlug?: string; developerSlug?: string } = {};
        if (debouncedFilters.filmSlug)
          apiFilters.filmSlug = debouncedFilters.filmSlug;
        if (debouncedFilters.developerSlug)
          apiFilters.developerSlug = debouncedFilters.developerSlug;

        // Use server-side pagination API
        const response: PaginatedApiResponse<Combination> =
          await client.getPaginatedCombinations(page, pageSize, apiFilters);

        // Apply client-side filters for features not supported by API
        let filteredData = response.data;

        // Apply developer type filter
        if (
          debouncedFilters.developerType &&
          debouncedFilters.developerType !== "all"
        ) {
          filteredData = filteredData.filter((combo) => {
            const developer = allDevelopers.find(
              (d) => d.uuid === combo.developerId,
            );
            return developer?.type === debouncedFilters.developerType;
          });
        }

        // Apply dilution filter
        if (debouncedFilters.dilution && debouncedFilters.dilution !== "all") {
          filteredData = filteredData.filter((combo) => {
            const developer = allDevelopers.find(
              (d) => d.uuid === combo.developerId,
            );
            const dilution = developer?.dilutions.find(
              (d) => d.id === combo.dilutionId,
            );
            return dilution?.dilution === debouncedFilters.dilution;
          });
        }

        // Apply ISO filter
        if (
          debouncedFilters.shootingIso &&
          debouncedFilters.shootingIso !== "all"
        ) {
          filteredData = filteredData.filter(
            (combo) =>
              combo.shootingIso.toString() === debouncedFilters.shootingIso,
          );
        }

        // Apply client-side sorting if needed
        if (debouncedFilters.sortBy) {
          filteredData = [...filteredData].sort((a, b) => {
            const direction =
              debouncedFilters.sortDirection === "desc" ? -1 : 1;

            switch (debouncedFilters.sortBy) {
              case "filmName": {
                const filmA =
                  allFilms.find((f) => f.uuid === a.filmStockId)?.name || "";
                const filmB =
                  allFilms.find((f) => f.uuid === b.filmStockId)?.name || "";
                return direction * filmA.localeCompare(filmB);
              }
              case "developerName": {
                const devA =
                  allDevelopers.find((d) => d.uuid === a.developerId)?.name ||
                  "";
                const devB =
                  allDevelopers.find((d) => d.uuid === b.developerId)?.name ||
                  "";
                return direction * devA.localeCompare(devB);
              }
              case "timeMinutes":
                return direction * (a.timeMinutes - b.timeMinutes);
              case "temperatureF":
                return direction * (a.temperatureF - b.temperatureF);
              case "shootingIso":
                return direction * (a.shootingIso - b.shootingIso);
              default:
                return 0;
            }
          });
        }

        setCombinations(filteredData);

        // Update pagination state with server response
        // Note: We need to adjust total count if client-side filtering was applied
        const totalCount = response.count || filteredData.length;
        pagination.setTotal(totalCount);

        debugLog(
          "useServerDevelopmentRecipes",
          `Loaded ${filteredData.length} combinations (${totalCount} total)`,
        );

        // Preload next page if enabled and available
        if (enablePreloading && page < Math.ceil(totalCount / pageSize)) {
          setTimeout(() => {
            client
              .getPaginatedCombinations(page + 1, pageSize, apiFilters)
              .catch(() => {
                // Silently fail preloading
              });
          }, 500);
        }
      } catch (error) {
        debugError(
          "useServerDevelopmentRecipes",
          "Failed to load combinations",
          error,
        );
        pagination.setError(error as Error);
        setCombinations([]);
      } finally {
        pagination.setLoading(false);
      }
    },
    [
      client,
      debouncedFilters,
      pageSize,
      allFilms,
      allDevelopers,
      pagination,
      enablePreloading,
    ],
  );

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load combinations when filters or page changes
  useEffect(() => {
    if (allFilms.length > 0 && allDevelopers.length > 0) {
      loadCombinations(pagination.currentPage);
    }
  }, [
    debouncedFilters,
    pagination.currentPage,
    allFilms.length,
    allDevelopers.length,
    loadCombinations,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      pagination.setPage(1);
    }
  }, [debouncedFilters]); // Don't include pagination.currentPage here to avoid infinite loop

  // Action handlers
  const setFilters = useCallback((newFilters: Partial<ServerRecipeFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const refresh = useCallback(() => {
    loadCombinations(pagination.currentPage, true);
  }, [loadCombinations, pagination.currentPage]);

  // Helper functions
  const getFilmById = useCallback(
    (id: string) => {
      return allFilms.find((film) => film.uuid === id);
    },
    [allFilms],
  );

  const getDeveloperById = useCallback(
    (id: string) => {
      return allDevelopers.find((developer) => developer.uuid === id);
    },
    [allDevelopers],
  );

  const getFilmBySlug = useCallback(
    (slug: string) => {
      return allFilms.find((film) => film.slug === slug);
    },
    [allFilms],
  );

  const getDeveloperBySlug = useCallback(
    (slug: string) => {
      return allDevelopers.find((developer) => developer.slug === slug);
    },
    [allDevelopers],
  );

  return {
    // Data
    combinations,
    allFilms,
    allDevelopers,

    // Pagination state
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    hasNext: pagination.hasNext,
    hasPrevious: pagination.hasPrevious,
    startIndex: pagination.startIndex,
    endIndex: pagination.endIndex,

    // Loading states
    isLoading: pagination.isLoading,
    isInitialLoading,
    error: pagination.error,

    // Filters
    filters,

    // Actions
    setFilters,
    clearFilters,
    goToPage: pagination.setPage,
    goToNext: pagination.goToNext,
    goToPrevious: pagination.goToPrevious,
    refresh,

    // Helper functions
    getFilmById,
    getDeveloperById,
    getFilmBySlug,
    getDeveloperBySlug,
  };
}
