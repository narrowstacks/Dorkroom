import React, { useCallback } from "react";
import { RecipeResultsView } from "@/components/development-recipes";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";

/**
 * Container component for recipe display logic
 * Reduces prop drilling by managing display-related state and handlers
 */
interface RecipeDisplayContainerProps {
  // Results data
  totalItems: number;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  displayCombinations: Combination[];
  filteredCustomRecipesCount: number;

  // Display options
  viewMode: "cards" | "table";
  showCustomRecipes: boolean;
  isLoading: boolean;

  // Sort state
  sortBy: string;
  sortDirection: "asc" | "desc";

  // Data and utilities
  customRecipes: CustomRecipe[];
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getCustomRecipeFilm: (recipeId: string) => Film | undefined;
  getCustomRecipeDeveloper: (recipeId: string) => Developer | undefined;
  isCustomRecipe: (combination: Combination) => boolean;

  // State setters
  setViewMode: (mode: "cards" | "table") => void;
  setShowCustomRecipes: (show: boolean) => void;

  // Actions
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  onForceRefresh: () => void;
  onNewCustomRecipe: () => void;
  onSort: (sortKey: string) => void;

  // Recipe selection handlers
  onRecipePress: (combination: Combination, isCustom: boolean) => void;
}

export const RecipeDisplayContainer: React.FC<RecipeDisplayContainerProps> = ({
  totalItems,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  hasNext,
  hasPrevious,
  displayCombinations,
  filteredCustomRecipesCount,
  viewMode,
  showCustomRecipes,
  isLoading,
  sortBy,
  sortDirection,
  customRecipes,
  getFilmById,
  getDeveloperById,
  getCustomRecipeFilm,
  getCustomRecipeDeveloper,
  isCustomRecipe,
  setViewMode,
  setShowCustomRecipes,
  goToPage,
  goToNext,
  goToPrevious,
  onForceRefresh,
  onNewCustomRecipe,
  onSort,
  onRecipePress,
}) => {
  // Optimize recipe film lookup
  const optimizedGetCustomRecipeFilm = useCallback(
    (recipeId: string) => {
      return getCustomRecipeFilm(recipeId);
    },
    [getCustomRecipeFilm],
  );

  // Optimize recipe developer lookup
  const optimizedGetCustomRecipeDeveloper = useCallback(
    (recipeId: string) => {
      return getCustomRecipeDeveloper(recipeId);
    },
    [getCustomRecipeDeveloper],
  );

  return (
    <RecipeResultsView
      totalItems={totalItems}
      currentPage={currentPage}
      totalPages={totalPages}
      startIndex={startIndex}
      endIndex={endIndex}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      paginatedCombinations={displayCombinations}
      viewMode={viewMode}
      showCustomRecipes={showCustomRecipes}
      customRecipesCount={filteredCustomRecipesCount}
      isLoading={isLoading}
      setViewMode={setViewMode}
      setShowCustomRecipes={setShowCustomRecipes}
      goToPage={goToPage}
      goToNext={goToNext}
      goToPrevious={goToPrevious}
      onForceRefresh={onForceRefresh}
      onNewCustomRecipe={onNewCustomRecipe}
      onRecipePress={onRecipePress}
      onSort={onSort}
      getFilmById={getFilmById}
      getDeveloperById={getDeveloperById}
      getCustomRecipeFilm={optimizedGetCustomRecipeFilm}
      getCustomRecipeDeveloper={optimizedGetCustomRecipeDeveloper}
      isCustomRecipe={isCustomRecipe}
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};
