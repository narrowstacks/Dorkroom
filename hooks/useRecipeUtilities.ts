import { useCallback } from "react";
import type { Film, Developer } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";

/**
 * Shared utilities for recipe lookups and data access
 * Consolidates all film/developer lookup logic in one place
 */
export interface UseRecipeUtilitiesReturn {
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getFilmBySlug: (slug: string) => Film | undefined;
  getDeveloperBySlug: (slug: string) => Developer | undefined;
  getCustomRecipeFilm: (
    recipeId: string,
    customRecipes: CustomRecipe[],
  ) => Film | undefined;
  getCustomRecipeDeveloper: (
    recipeId: string,
    customRecipes: CustomRecipe[],
  ) => Developer | undefined;
}

export function useRecipeUtilities(
  allFilms: Film[],
  allDevelopers: Developer[],
): UseRecipeUtilitiesReturn {
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

  const getCustomRecipeFilm = useCallback(
    (recipeId: string, customRecipes: CustomRecipe[]) => {
      const recipe = customRecipes.find((r) => r.id === recipeId);
      if (!recipe) return undefined;

      if (recipe.isCustomFilm && recipe.customFilm) {
        // Return a Film-like object for custom films
        return {
          id: recipe.id,
          uuid: recipe.id,
          name: recipe.customFilm.name,
          brand: recipe.customFilm.brand,
          slug: recipe.id,
          isoSpeed: 400, // Default value
          colorType: "BW", // Default value
          description: "",
          discontinued: 0,
          manufacturerNotes: [],
          grainStructure: "",
          reciprocityFailure: null,
          staticImageURL: "",
          dateAdded: new Date().toISOString(),
        } as Film;
      } else {
        return getFilmById(recipe.filmId);
      }
    },
    [getFilmById],
  );

  const getCustomRecipeDeveloper = useCallback(
    (recipeId: string, customRecipes: CustomRecipe[]) => {
      const recipe = customRecipes.find((r) => r.id === recipeId);
      if (!recipe) return undefined;

      if (recipe.isCustomDeveloper && recipe.customDeveloper) {
        // Return a Developer-like object for custom developers
        return {
          id: recipe.id,
          uuid: recipe.id,
          name: recipe.customDeveloper.name,
          manufacturer: recipe.customDeveloper.manufacturer,
          slug: recipe.id,
          type: recipe.customDeveloper.type,
          filmOrPaper: "film",
          dilutions: [],
          workingLifeHours: 0,
          stockLifeMonths: 0,
          notes: "",
          discontinued: 0,
          staticImageURL: "",
          dateAdded: new Date().toISOString(),
        } as Developer;
      } else {
        return getDeveloperById(recipe.developerId);
      }
    },
    [getDeveloperById],
  );

  return {
    getFilmById,
    getDeveloperById,
    getFilmBySlug,
    getDeveloperBySlug,
    getCustomRecipeFilm,
    getCustomRecipeDeveloper,
  };
}
