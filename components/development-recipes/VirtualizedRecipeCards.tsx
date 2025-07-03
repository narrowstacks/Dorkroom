import React, { useCallback, useMemo } from "react";
import { FlatList, Platform, ListRenderItem } from "react-native";
import { Box } from "@gluestack-ui/themed";
import { RecipeCard } from "./RecipeCard";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";

/**
 * Virtualized cards component for development recipes
 * Uses FlatList for efficient rendering of large datasets in card layout
 */

export interface VirtualizedRecipeCardsProps {
  combinations: Combination[];
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getCustomRecipeFilm: (recipeId: string) => Film | undefined;
  getCustomRecipeDeveloper: (recipeId: string) => Developer | undefined;
  isCustomRecipe: (combination: Combination) => boolean;
  onRecipePress: (combination: Combination, isCustom: boolean) => void;
  isLoading?: boolean;
}

interface RecipeCardItem {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  isCustom: boolean;
}

export const VirtualizedRecipeCards: React.FC<VirtualizedRecipeCardsProps> = ({
  combinations,
  getFilmById,
  getDeveloperById,
  getCustomRecipeFilm,
  getCustomRecipeDeveloper,
  isCustomRecipe,
  onRecipePress,
  isLoading = false,
}) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    if (windowWidth > 1200) return 3; // Desktop: 3 columns
    if (windowWidth > 768) return 2; // Tablet: 2 columns
    return 1; // Mobile: 1 column
  }, [windowWidth]);

  // Prepare data for FlatList with all necessary info pre-computed
  const listData = useMemo(() => {
    return combinations.map((combination): RecipeCardItem => {
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

  // Render function for each card item
  const renderItem: ListRenderItem<RecipeCardItem> = useCallback(
    ({ item }) => (
      <Box
        style={{
          flex: 1,
          margin: 4,
          maxWidth: numColumns === 1 ? "100%" : `${100 / numColumns - 2}%`,
        }}
      >
        <RecipeCard
          combination={item.combination}
          film={item.film}
          developer={item.developer}
          onPress={() => onRecipePress(item.combination, item.isCustom)}
          isCustomRecipe={item.isCustom}
        />
      </Box>
    ),
    [onRecipePress, numColumns],
  );

  // Get unique key for each item
  const keyExtractor = useCallback(
    (item: RecipeCardItem) => item.combination.uuid,
    [],
  );

  // Get item layout for optimization (estimated card height)
  const getItemLayout = useCallback(
    (data: RecipeCardItem[] | null | undefined, index: number) => {
      const CARD_HEIGHT = Platform.OS === "web" ? 220 : 240; // Estimated card height
      const rowIndex = Math.floor(index / numColumns);
      return {
        length: CARD_HEIGHT,
        offset: CARD_HEIGHT * rowIndex,
        index,
      };
    },
    [numColumns],
  );

  // Calculate container height (90% of screen minus some padding)
  const containerHeight = Math.max(300, windowHeight * 0.6);

  // Performance optimizations
  const estimatedCardHeight = Platform.OS === "web" ? 220 : 240;
  const windowSize = Math.max(
    6,
    Math.ceil((containerHeight / estimatedCardHeight) * numColumns * 2),
  ); // Number of items to render
  const initialNumToRender = Math.min(numColumns * 4, listData.length); // Initial render count (4 rows)
  const maxToRenderPerBatch = numColumns * 2; // Batch rendering size (2 rows at a time)
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
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        getItemLayout={numColumns === 1 ? getItemLayout : undefined} // Only use getItemLayout for single column
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
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
        // Column wrapper style for proper spacing
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: "space-around",
                paddingHorizontal: 8,
              }
            : undefined
        }
      />
    </Box>
  );
};

VirtualizedRecipeCards.displayName = "VirtualizedRecipeCards";
