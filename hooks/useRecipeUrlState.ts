import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Film, Developer, Combination } from "../api/dorkroom/types";
import {
  RecipeUrlParams,
  InitialUrlState,
  UrlValidationConfig,
  UrlValidationResult,
} from "../types/urlTypes";
import type { CustomRecipe } from "../types/customRecipeTypes";
import { useCustomRecipeSharing } from "./useCustomRecipeSharing";

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
  console.log("[validateUrlParams] Input params:", params);
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

  const result = {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };

  console.log("[validateUrlParams] Validation result:", result);
  return result;
};

/**
 * Enhanced URL state interface that includes recipe lookup functionality
 */
export interface EnhancedUrlState extends InitialUrlState {
  /** Shared recipe data if found */
  sharedRecipe?: Combination;
  /** Shared custom recipe data if found */
  sharedCustomRecipe?: Omit<
    CustomRecipe,
    "id" | "dateCreated" | "dateModified"
  >;
  /** Loading state for recipe lookup */
  isLoadingSharedRecipe?: boolean;
  /** Error message if recipe lookup failed */
  sharedRecipeError?: string;
  /** Whether this URL contains a shared recipe ID */
  hasSharedRecipe?: boolean;
  /** Whether this URL contains a shared custom recipe */
  hasSharedCustomRecipe?: boolean;
}

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
  recipesByUuid?: Map<string, Combination>, // Optional recipe lookup map
) => {
  const params = useLocalSearchParams();
  const isInitializedRef = useRef(false);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State for shared recipe lookup
  const [sharedRecipe, setSharedRecipe] = useState<Combination | null>(null);
  const [sharedCustomRecipe, setSharedCustomRecipe] = useState<Omit<
    CustomRecipe,
    "id" | "dateCreated" | "dateModified"
  > | null>(null);
  const [isLoadingSharedRecipe, setIsLoadingSharedRecipe] = useState(false);
  const [sharedRecipeError, setSharedRecipeError] = useState<string | null>(
    null,
  );

  // Custom recipe sharing hooks
  const { decodeSharedCustomRecipe, isCustomRecipeUrl } =
    useCustomRecipeSharing();

  // Parse and validate URL parameters on mount
  const initialUrlState: InitialUrlState = useMemo(() => {
    console.log("[useRecipeUrlState] initialUrlState useMemo triggered");
    console.log(
      "[useRecipeUrlState] isInitializedRef.current:",
      isInitializedRef.current,
    );
    console.log("[useRecipeUrlState] films.length:", films.length);
    console.log("[useRecipeUrlState] developers.length:", developers.length);
    console.log("[useRecipeUrlState] Raw URL params:", params);

    // Only process URL if data is loaded, but allow re-processing when data becomes available
    if (!films.length || !developers.length) {
      console.log("[useRecipeUrlState] Early return - data not loaded yet");
      return {};
    }

    // Skip re-processing if we've already successfully processed valid URL params
    if (isInitializedRef.current) {
      console.log(
        "[useRecipeUrlState] Already initialized, checking for URL params",
      );
      const hasValidParams = Object.keys(params).some(
        (key) =>
          ["recipe", "film", "developer", "iso", "dilution"].includes(key) &&
          params[key],
      );
      if (!hasValidParams) {
        console.log(
          "[useRecipeUrlState] No valid URL params, skipping re-processing",
        );
        return {};
      }
      console.log("[useRecipeUrlState] Valid URL params found, re-processing");
    }

    const validation = validateUrlParams(params as RecipeUrlParams);
    console.log("[useRecipeUrlState] URL validation result:", validation);

    if (!validation.isValid) {
      console.warn(
        "[useRecipeUrlState] Invalid URL parameters:",
        validation.errors,
      );
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
      console.log(
        "[useRecipeUrlState] Found recipe ID in URL:",
        validation.sanitized.recipe,
      );
    }

    console.log("[useRecipeUrlState] Final initial state:", state);
    isInitializedRef.current = true;
    return state;
  }, [params, films, developers]);

  // Handle shared recipe lookup when recipe UUID/encoded data is present
  useEffect(() => {
    const handleSharedRecipeLookup = async () => {
      console.log("[useRecipeUrlState] handleSharedRecipeLookup triggered");
      const validation = validateUrlParams(params as RecipeUrlParams);
      const recipeId = validation.sanitized.recipe;
      const isFromShare = validation.sanitized.source === "share";

      console.log("[useRecipeUrlState] Recipe lookup params:", {
        recipeId:
          recipeId?.substring(0, 50) +
          (recipeId && recipeId.length > 50 ? "..." : ""),
        isFromShare,
        hasRecipesByUuid: !!recipesByUuid,
        recipesByUuidSize: recipesByUuid?.size,
      });

      if (!recipeId || !isFromShare) {
        console.log(
          "[useRecipeUrlState] Early return - no recipe ID or not from share",
        );
        setSharedRecipe(null);
        setSharedCustomRecipe(null);
        setIsLoadingSharedRecipe(false);
        setSharedRecipeError(null);
        return;
      }

      console.log(
        "[useRecipeUrlState] Starting recipe lookup for ID:",
        recipeId.substring(0, 50) + (recipeId.length > 50 ? "..." : ""),
      );
      setIsLoadingSharedRecipe(true);
      setSharedRecipeError(null);

      try {
        // First, check if this is a custom recipe (encoded data)
        if (isCustomRecipeUrl(recipeId)) {
          console.log("[useRecipeUrlState] Detected custom recipe URL");
          const importedRecipe = decodeSharedCustomRecipe(recipeId);

          if (importedRecipe && importedRecipe.isValid) {
            console.log(
              "[useRecipeUrlState] Successfully decoded custom recipe:",
              importedRecipe.recipe.name,
            );
            setSharedCustomRecipe(importedRecipe.recipe);
            setSharedRecipe(null); // Clear any existing database recipe
            setIsLoadingSharedRecipe(false);
            return;
          } else {
            console.log("[useRecipeUrlState] Failed to decode custom recipe");
            setSharedRecipeError("Invalid custom recipe data");
            setSharedRecipe(null);
            setSharedCustomRecipe(null);
            setIsLoadingSharedRecipe(false);
            return;
          }
        }

        // If not a custom recipe, try database recipe lookup
        // Wait for data to be loaded before attempting lookup
        if (!recipesByUuid || recipesByUuid.size === 0) {
          console.log(
            "[useRecipeUrlState] Waiting for recipes data to load...",
          );
          setIsLoadingSharedRecipe(true);
          setSharedRecipeError(null);
          return;
        }

        // Try to find recipe in provided lookup map
        if (recipesByUuid && recipesByUuid.has(recipeId)) {
          const recipe = recipesByUuid.get(recipeId)!;
          console.log(
            "[useRecipeUrlState] Found recipe in lookup map:",
            recipe,
          );
          setSharedRecipe(recipe);
          setSharedCustomRecipe(null); // Clear any existing custom recipe
          setIsLoadingSharedRecipe(false);
          return;
        }

        console.log("[useRecipeUrlState] Recipe not found in lookup map");

        // If not found in map, it could be an API recipe UUID
        // This would require an API call to fetch the recipe
        // For now, we'll just show an error if not found in the provided map
        setSharedRecipeError(
          `Recipe with ID ${recipeId.substring(0, 20)}... not found`,
        );
        setSharedRecipe(null);
        setSharedCustomRecipe(null);
      } catch (error) {
        setSharedRecipeError(
          error instanceof Error
            ? error.message
            : "Failed to load shared recipe",
        );
        setSharedRecipe(null);
        setSharedCustomRecipe(null);
      } finally {
        setIsLoadingSharedRecipe(false);
      }
    };

    handleSharedRecipeLookup();
  }, [params, recipesByUuid, isCustomRecipeUrl, decodeSharedCustomRecipe]);

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

  // Enhanced return state with shared recipe functionality
  const enhancedUrlState: EnhancedUrlState = {
    ...initialUrlState,
    sharedRecipe: sharedRecipe || undefined,
    sharedCustomRecipe: sharedCustomRecipe || undefined,
    isLoadingSharedRecipe,
    sharedRecipeError: sharedRecipeError || undefined,
    hasSharedRecipe:
      !!initialUrlState.recipeId &&
      params.source === "share" &&
      !sharedCustomRecipe,
    hasSharedCustomRecipe:
      !!initialUrlState.recipeId &&
      params.source === "share" &&
      !!sharedCustomRecipe,
  };

  // Calculate hasUrlState - should be true if we have URL params OR a shared recipe OR a shared custom recipe
  const hasUrlState =
    Object.keys(initialUrlState).length > 0 ||
    !!sharedRecipe ||
    !!sharedCustomRecipe;

  return {
    initialUrlState: enhancedUrlState,
    updateUrl,
    hasUrlState,
    sharedRecipe,
    sharedCustomRecipe,
    isLoadingSharedRecipe,
    sharedRecipeError,
    hasSharedRecipe: enhancedUrlState.hasSharedRecipe,
    hasSharedCustomRecipe: enhancedUrlState.hasSharedCustomRecipe,
  };
};
