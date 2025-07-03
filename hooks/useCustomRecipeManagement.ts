import { useMemo } from "react";
import { useDebounce } from "./useDebounce";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";
import type { ServerRecipeFilters } from "./useServerDevelopmentRecipes";

/**
 * Custom recipe management and filtering logic
 * Extracted from the main component to reduce complexity
 */
export interface UseCustomRecipeManagementReturn {
  customRecipesAsCombinations: Combination[];
  filteredCustomRecipes: Combination[];
  isCustomRecipe: (combination: Combination) => boolean;
}

export interface UseCustomRecipeManagementOptions {
  customRecipes: CustomRecipe[];
  showCustomRecipes: boolean;
  selectedFilm: Film | null;
  selectedDeveloper: Developer | null;
  filmSearch: string;
  developerSearch: string;
  filters: ServerRecipeFilters;
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  debounceMs?: number;
}

export function useCustomRecipeManagement({
  customRecipes,
  showCustomRecipes,
  selectedFilm,
  selectedDeveloper,
  filmSearch,
  developerSearch,
  filters,
  getFilmById,
  getDeveloperById,
  debounceMs = 300,
}: UseCustomRecipeManagementOptions): UseCustomRecipeManagementReturn {
  // Debounced search to prevent excessive filtering
  const debouncedFilmSearch = useDebounce(filmSearch, debounceMs);
  const debouncedDeveloperSearch = useDebounce(developerSearch, debounceMs);

  // Create recipe lookup cache for performance optimization
  const recipeLookupCache = useMemo(() => {
    const cache = new Map<string, CustomRecipe>();
    customRecipes.forEach((recipe) => {
      cache.set(recipe.id, recipe);
    });
    return cache;
  }, [customRecipes]);

  // Convert custom recipes to combination format for display
  const customRecipesAsCombinations = useMemo(() => {
    if (!showCustomRecipes) return [];

    return customRecipes.map(
      (recipe): Combination => ({
        id: recipe.id,
        name: recipe.name,
        uuid: recipe.id,
        slug: recipe.id,
        filmStockId: recipe.filmId,
        developerId: recipe.developerId,
        temperatureF: recipe.temperatureF,
        timeMinutes: recipe.timeMinutes,
        shootingIso: recipe.shootingIso,
        pushPull: recipe.pushPull,
        agitationSchedule: recipe.agitationSchedule,
        notes: recipe.notes,
        customDilution: recipe.customDilution,
        dateAdded: recipe.dateCreated,
        dilutionId: undefined,
      }),
    );
  }, [customRecipes, showCustomRecipes]);

  // Create film filter predicate to optimize performance
  const filmFilterPredicate = useMemo(() => {
    if (selectedFilm) {
      return (combo: Combination) => {
        const recipe = recipeLookupCache.get(combo.id);
        if (!recipe) return false;

        if (recipe.isCustomFilm) {
          const customFilm = recipe.customFilm;
          return (
            customFilm?.brand
              ?.toLowerCase()
              .includes(selectedFilm.brand.toLowerCase()) ||
            customFilm?.name
              ?.toLowerCase()
              .includes(selectedFilm.name.toLowerCase())
          );
        }
        return combo.filmStockId === selectedFilm.uuid;
      };
    } else if (debouncedFilmSearch.trim()) {
      const searchLower = debouncedFilmSearch.toLowerCase();
      return (combo: Combination) => {
        const recipe = recipeLookupCache.get(combo.id);
        if (!recipe) return false;

        if (recipe.isCustomFilm && recipe.customFilm) {
          return (
            recipe.customFilm.brand.toLowerCase().includes(searchLower) ||
            recipe.customFilm.name.toLowerCase().includes(searchLower)
          );
        } else {
          const film = getFilmById(combo.filmStockId);
          return (
            film &&
            (film.name.toLowerCase().includes(searchLower) ||
              film.brand.toLowerCase().includes(searchLower))
          );
        }
      };
    }
    return null;
  }, [selectedFilm, debouncedFilmSearch, recipeLookupCache, getFilmById]);

  // Film filtering logic using predicate
  const filmFilteredRecipes = useMemo(() => {
    return filmFilterPredicate
      ? customRecipesAsCombinations.filter(filmFilterPredicate)
      : customRecipesAsCombinations;
  }, [customRecipesAsCombinations, filmFilterPredicate]);

  // Create developer filter predicate to optimize performance
  const developerFilterPredicate = useMemo(() => {
    if (selectedDeveloper) {
      return (combo: Combination) => {
        const recipe = recipeLookupCache.get(combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper) {
          const customDev = recipe.customDeveloper;
          return (
            customDev?.manufacturer
              ?.toLowerCase()
              .includes(selectedDeveloper.manufacturer.toLowerCase()) ||
            customDev?.name
              ?.toLowerCase()
              .includes(selectedDeveloper.name.toLowerCase())
          );
        }
        return combo.developerId === selectedDeveloper.uuid;
      };
    } else if (debouncedDeveloperSearch.trim()) {
      const searchLower = debouncedDeveloperSearch.toLowerCase();
      return (combo: Combination) => {
        const recipe = recipeLookupCache.get(combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper && recipe.customDeveloper) {
          return (
            recipe.customDeveloper.manufacturer
              .toLowerCase()
              .includes(searchLower) ||
            recipe.customDeveloper.name.toLowerCase().includes(searchLower)
          );
        } else {
          const dev = getDeveloperById(combo.developerId);
          return (
            dev &&
            (dev.name.toLowerCase().includes(searchLower) ||
              dev.manufacturer.toLowerCase().includes(searchLower))
          );
        }
      };
    }
    return null;
  }, [
    selectedDeveloper,
    debouncedDeveloperSearch,
    recipeLookupCache,
    getDeveloperById,
  ]);

  // Developer filtering logic using predicate
  const developerFilteredRecipes = useMemo(() => {
    return developerFilterPredicate
      ? filmFilteredRecipes.filter(developerFilterPredicate)
      : filmFilteredRecipes;
  }, [filmFilteredRecipes, developerFilterPredicate]);

  // Create server filter predicates for better performance
  const serverFilterPredicates = useMemo(() => {
    const predicates: Array<(combo: Combination) => boolean> = [];

    // Developer type filter predicate
    if (filters.developerType && filters.developerType !== "all") {
      predicates.push((combo) => {
        const recipe = recipeLookupCache.get(combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper) {
          return recipe.customDeveloper?.type === filters.developerType;
        } else {
          const dev = getDeveloperById(combo.developerId);
          return dev?.type === filters.developerType;
        }
      });
    }

    // ISO filter predicate
    if (filters.shootingIso && filters.shootingIso !== "all") {
      predicates.push(
        (combo) => combo.shootingIso.toString() === filters.shootingIso,
      );
    }

    return predicates;
  }, [
    filters.developerType,
    filters.shootingIso,
    recipeLookupCache,
    getDeveloperById,
  ]);

  // Apply all server-based filters efficiently
  const filteredCustomRecipes = useMemo(() => {
    if (serverFilterPredicates.length === 0) {
      return developerFilteredRecipes;
    }

    return developerFilteredRecipes.filter((combo) =>
      serverFilterPredicates.every((predicate) => predicate(combo)),
    );
  }, [developerFilteredRecipes, serverFilterPredicates]);

  // Helper function to check if a combination is a custom recipe
  const isCustomRecipe = useMemo(() => {
    return (combination: Combination) => {
      return recipeLookupCache.has(combination.id);
    };
  }, [recipeLookupCache]);

  return {
    customRecipesAsCombinations,
    filteredCustomRecipes,
    isCustomRecipe,
  };
}
