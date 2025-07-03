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

  // Film filtering logic
  const filmFilteredRecipes = useMemo(() => {
    let filtered = customRecipesAsCombinations;

    // Apply film filter
    if (selectedFilm) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomFilm) {
          return (
            recipe.customFilm?.brand
              ?.toLowerCase()
              .includes(selectedFilm.brand.toLowerCase()) ||
            recipe.customFilm?.name
              ?.toLowerCase()
              .includes(selectedFilm.name.toLowerCase())
          );
        } else {
          return combo.filmStockId === selectedFilm.uuid;
        }
      });
    } else if (debouncedFilmSearch.trim()) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomFilm && recipe.customFilm) {
          return (
            recipe.customFilm.brand
              .toLowerCase()
              .includes(debouncedFilmSearch.toLowerCase()) ||
            recipe.customFilm.name
              .toLowerCase()
              .includes(debouncedFilmSearch.toLowerCase())
          );
        } else {
          const film = getFilmById(combo.filmStockId);
          return (
            film &&
            (film.name
              .toLowerCase()
              .includes(debouncedFilmSearch.toLowerCase()) ||
              film.brand
                .toLowerCase()
                .includes(debouncedFilmSearch.toLowerCase()))
          );
        }
      });
    }

    return filtered;
  }, [
    customRecipesAsCombinations,
    selectedFilm,
    debouncedFilmSearch,
    customRecipes,
    getFilmById,
  ]);

  // Developer filtering logic
  const developerFilteredRecipes = useMemo(() => {
    let filtered = filmFilteredRecipes;

    // Apply developer filter
    if (selectedDeveloper) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper) {
          return (
            recipe.customDeveloper?.manufacturer
              ?.toLowerCase()
              .includes(selectedDeveloper.manufacturer.toLowerCase()) ||
            recipe.customDeveloper?.name
              ?.toLowerCase()
              .includes(selectedDeveloper.name.toLowerCase())
          );
        } else {
          return combo.developerId === selectedDeveloper.uuid;
        }
      });
    } else if (debouncedDeveloperSearch.trim()) {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper && recipe.customDeveloper) {
          return (
            recipe.customDeveloper.manufacturer
              .toLowerCase()
              .includes(debouncedDeveloperSearch.toLowerCase()) ||
            recipe.customDeveloper.name
              .toLowerCase()
              .includes(debouncedDeveloperSearch.toLowerCase())
          );
        } else {
          const dev = getDeveloperById(combo.developerId);
          return (
            dev &&
            (dev.name
              .toLowerCase()
              .includes(debouncedDeveloperSearch.toLowerCase()) ||
              dev.manufacturer
                .toLowerCase()
                .includes(debouncedDeveloperSearch.toLowerCase()))
          );
        }
      });
    }

    return filtered;
  }, [
    filmFilteredRecipes,
    selectedDeveloper,
    debouncedDeveloperSearch,
    customRecipes,
    getDeveloperById,
  ]);

  // Additional server-based filters
  const filteredCustomRecipes = useMemo(() => {
    let filtered = developerFilteredRecipes;

    // Apply developer type filter
    if (filters.developerType && filters.developerType !== "all") {
      filtered = filtered.filter((combo) => {
        const recipe = customRecipes.find((r) => r.id === combo.id);
        if (!recipe) return false;

        if (recipe.isCustomDeveloper) {
          return recipe.customDeveloper?.type === filters.developerType;
        } else {
          const dev = getDeveloperById(combo.developerId);
          return dev?.type === filters.developerType;
        }
      });
    }

    // Apply ISO filter
    if (filters.shootingIso && filters.shootingIso !== "all") {
      filtered = filtered.filter(
        (combo) => combo.shootingIso.toString() === filters.shootingIso,
      );
    }

    return filtered;
  }, [
    developerFilteredRecipes,
    filters.developerType,
    filters.shootingIso,
    customRecipes,
    getDeveloperById,
  ]);

  // Helper function to check if a combination is a custom recipe
  const isCustomRecipe = useMemo(() => {
    return (combination: Combination) => {
      return customRecipes.some((r) => r.id === combination.id);
    };
  }, [customRecipes]);

  return {
    customRecipesAsCombinations,
    filteredCustomRecipes,
    isCustomRecipe,
  };
}
