import React, { useCallback, useMemo } from "react";
import { FlatList, Platform, ListRenderItem } from "react-native";
import { Box } from "@gluestack-ui/themed";
import { RecipeRow } from "./RecipeRow";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";

/**
 * Virtualized table component for development recipes
 * Uses FlatList for efficient rendering of large datasets
 */

export interface VirtualizedRecipeTableProps {
  combinations: Combination[];
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getCustomRecipeFilm: (recipeId: string) => Film | undefined;
  getCustomRecipeDeveloper: (recipeId: string) => Developer | undefined;
  isCustomRecipe: (combination: Combination) => boolean;
  onRecipePress: (combination: Combination, isCustom: boolean) => void;
  isLoading?: boolean;
}

interface RecipeListItem {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  isCustom: boolean;
  index: number;
}

export const VirtualizedRecipeTable: React.FC<VirtualizedRecipeTableProps> = ({
  combinations,
  getFilmById,
  getDeveloperById,
  getCustomRecipeFilm,
  getCustomRecipeDeveloper,
  isCustomRecipe,
  onRecipePress,
  isLoading = false,
}) => {
  const { height: windowHeight } = useWindowDimensions();

  // Prepare data for FlatList with all necessary info pre-computed
  const listData = useMemo(() => {
    return combinations.map((combination, index): RecipeListItem => {
      const isCustom = isCustomRecipe(combination);
      const film = isCustom
        ? getCustomRecipeFilm(combination.id)
        : getFilmById(combination.filmStockId);
      const developer = isCustom
        ? getCustomRecipeDeveloper(combination.id)
        : getDeveloperById(combination.developerId);

      return {
        combination,
        film,
        developer,
        isCustom,
        index,
      };
    });
  }, [
    combinations,
    isCustomRecipe,
    getCustomRecipeFilm,
    getFilmById,
    getCustomRecipeDeveloper,
    getDeveloperById,
  ]);

  // Render function for each list item
  const renderItem: ListRenderItem<RecipeListItem> = useCallback(
    ({ item }) => (
      <RecipeRow
        combination={item.combination}
        film={item.film}
        developer={item.developer}
        onPress={() => onRecipePress(item.combination, item.isCustom)}
        isEven={item.index % 2 === 0}
      />
    ),
    [onRecipePress],
  );

  // Get unique key for each item
  const keyExtractor = useCallback(
    (item: RecipeListItem) => item.combination.uuid,
    [],
  );

  // Get item layout for optimization
  const getItemLayout = useCallback(
    (data: RecipeListItem[] | null | undefined, index: number) => {
      const ITEM_HEIGHT = Platform.OS === "web" ? 60 : 70; // Estimated row height
      return {
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      };
    },
    [],
  );

  // Calculate container height (90% of screen minus some padding)
  const containerHeight = Math.max(300, windowHeight * 0.6);

  // Performance optimizations
  const windowSize = Math.max(10, Math.ceil(containerHeight / 70)); // Number of items to render
  const initialNumToRender = Math.min(20, listData.length); // Initial render count
  const maxToRenderPerBatch = 10; // Batch rendering size
  const updateCellsBatchingPeriod = 100; // Batching delay in ms

  if (isLoading) {
    return (
      <Box
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: containerHeight,
        }}
      >
        {/* Loading state handled by parent component */}
      </Box>
    );
  }

  if (listData.length === 0) {
    return (
      <Box
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: containerHeight,
        }}
      >
        {/* Empty state handled by parent component */}
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, height: containerHeight }}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        // Performance optimizations
        windowSize={windowSize}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        updateCellsBatchingPeriod={updateCellsBatchingPeriod}
        removeClippedSubviews={true} // Remove off-screen items from memory
        // Scrolling optimizations
        showsVerticalScrollIndicator={Platform.OS !== "web"}
        scrollEventThrottle={16} // 60fps scrolling
        // Memory optimizations
        disableVirtualization={false} // Ensure virtualization is enabled
        // Style
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </Box>
  );
};

VirtualizedRecipeTable.displayName = "VirtualizedRecipeTable";
