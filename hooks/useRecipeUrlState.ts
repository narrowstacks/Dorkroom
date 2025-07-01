import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Film, Developer } from "../api/dorkroom/types";
import {
  RecipeUrlParams,
  InitialUrlState,
  UrlValidationConfig,
  UrlValidationResult,
} from "../types/urlTypes";

/**
 * Configuration for URL parameter validation
 */
const VALIDATION_CONFIG: UrlValidationConfig = {
  maxSlugLength: 100,
  isoRange: { min: 6, max: 25600 },
  dilutionPatterns: [/^stock$/i, /^\d+:\d+$/, /^\d+\+\d+$/, /^\d+$/],
};

/**
 * Helper function to convert film slug to film object
 */
export const slugToFilm = (slug: string, films: Film[]): Film | null => {
  if (!slug || !films.length) return null;
  return films.find((film) => film.slug === slug) || null;
};

/**
 * Helper function to convert film object to slug
 */
export const filmToSlug = (film: Film | null): string => {
  return film?.slug || "";
};

/**
 * Helper function to convert developer slug to developer object
 */
export const slugToDeveloper = (
  slug: string,
  developers: Developer[],
): Developer | null => {
  if (!slug || !developers.length) return null;
  return developers.find((developer) => developer.slug === slug) || null;
};

/**
 * Helper function to convert developer object to slug
 */
export const developerToSlug = (developer: Developer | null): string => {
  return developer?.slug || "";
};

/**
 * Validate and sanitize URL parameters
 */
export const validateUrlParams = (
  params: RecipeUrlParams,
): UrlValidationResult => {
  const errors: string[] = [];
  const sanitized: RecipeUrlParams = {};

  // Validate film slug
  if (params.film) {
    if (params.film.length > VALIDATION_CONFIG.maxSlugLength) {
      errors.push("Film slug too long");
    } else if (/^[a-z0-9-]+$/.test(params.film)) {
      sanitized.film = params.film;
    } else {
      errors.push("Invalid film slug format");
    }
  }

  // Validate developer slug
  if (params.developer) {
    if (params.developer.length > VALIDATION_CONFIG.maxSlugLength) {
      errors.push("Developer slug too long");
    } else if (/^[a-z0-9-]+$/.test(params.developer)) {
      sanitized.developer = params.developer;
    } else {
      errors.push("Invalid developer slug format");
    }
  }

  // Validate ISO value
  if (params.iso) {
    const isoNum = parseInt(params.iso);
    if (
      isNaN(isoNum) ||
      isoNum < VALIDATION_CONFIG.isoRange.min ||
      isoNum > VALIDATION_CONFIG.isoRange.max
    ) {
      errors.push("Invalid ISO value");
    } else {
      sanitized.iso = params.iso;
    }
  }

  // Validate dilution
  if (params.dilution) {
    const isValidDilution = VALIDATION_CONFIG.dilutionPatterns.some((pattern) =>
      pattern.test(params.dilution!),
    );
    if (isValidDilution) {
      sanitized.dilution = params.dilution;
    } else {
      errors.push("Invalid dilution format");
    }
  }

  // Validate recipe UUID
  if (params.recipe) {
    // UUID or encoded data validation
    if (
      params.recipe.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ) ||
      params.recipe.length > 20
    ) {
      // Assume encoded data if longer
      sanitized.recipe = params.recipe;
    } else {
      errors.push("Invalid recipe format");
    }
  }

  // Copy source parameter if present
  if (params.source === "share") {
    sanitized.source = "share";
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
};

/**
 * Hook for managing URL state synchronization with development recipe filters
 */
export const useRecipeUrlState = (
  films: Film[],
  developers: Developer[],
  currentState: {
    selectedFilm: Film | null;
    selectedDeveloper: Developer | null;
    dilutionFilter: string;
    isoFilter: string;
  },
) => {
  const params = useLocalSearchParams();
  const isInitializedRef = useRef(false);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse and validate URL parameters on mount
  const initialUrlState: InitialUrlState = useMemo(() => {
    if (isInitializedRef.current || !films.length || !developers.length) {
      return {};
    }

    const validation = validateUrlParams(params as RecipeUrlParams);

    if (!validation.isValid) {
      console.warn("Invalid URL parameters:", validation.errors);
      return {};
    }

    const state: InitialUrlState = { fromUrl: true };

    // Convert film slug to film object
    if (validation.sanitized.film) {
      const film = slugToFilm(validation.sanitized.film, films);
      if (film) {
        state.selectedFilm = film;
      }
    }

    // Convert developer slug to developer object
    if (validation.sanitized.developer) {
      const developer = slugToDeveloper(
        validation.sanitized.developer,
        developers,
      );
      if (developer) {
        state.selectedDeveloper = developer;
      }
    }

    // Set filter values
    if (validation.sanitized.dilution) {
      state.dilutionFilter = validation.sanitized.dilution;
    }

    if (validation.sanitized.iso) {
      state.isoFilter = validation.sanitized.iso;
    }

    if (validation.sanitized.recipe) {
      state.recipeId = validation.sanitized.recipe;
    }

    isInitializedRef.current = true;
    return state;
  }, [params, films, developers]);

  // Debounced URL update function
  const updateUrl = useCallback((newParams: Partial<RecipeUrlParams>) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      // Only update if we've been initialized to prevent initial load updates
      if (isInitializedRef.current) {
        const cleanParams: Partial<RecipeUrlParams> = {};

        // Only include non-empty parameters
        Object.entries(newParams).forEach(([key, value]) => {
          if (value && value !== "") {
            cleanParams[key as keyof RecipeUrlParams] = value as any;
          }
        });

        router.setParams(cleanParams as any);
      }
    }, 300); // 300ms debounce
  }, []);

  // Update URL when current state changes
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const urlParams: RecipeUrlParams = {};

    if (currentState.selectedFilm) {
      urlParams.film = filmToSlug(currentState.selectedFilm);
    }

    if (currentState.selectedDeveloper) {
      urlParams.developer = developerToSlug(currentState.selectedDeveloper);
    }

    if (currentState.dilutionFilter) {
      urlParams.dilution = currentState.dilutionFilter;
    }

    if (currentState.isoFilter) {
      urlParams.iso = currentState.isoFilter;
    }

    updateUrl(urlParams);
  }, [
    currentState.selectedFilm,
    currentState.selectedDeveloper,
    currentState.dilutionFilter,
    currentState.isoFilter,
    updateUrl,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    initialUrlState,
    updateUrl,
    hasUrlState: Object.keys(initialUrlState).length > 0,
  };
};
