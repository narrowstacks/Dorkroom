import React from "react";
import { Platform, TouchableOpacity, ScrollView } from "react-native";
import { Box, Text, HStack } from "@gluestack-ui/themed";
import { RefreshCw, Plus, Grid3X3, Table } from "lucide-react-native";

import { Spinner } from "@/components/ui/spinner";
import { PaginationControls } from "@/components/ui/pagination";
import { RecipeCard } from "@/components/development-recipes/RecipeCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { formatTime } from "@/constants/developmentRecipes";
import { formatDilution } from "@/utils/dilutionUtils";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";

// Re-import TableHeader and RecipeRow components that will be extracted here
interface TableHeaderProps {
  title: string;
  sortKey: string;
  currentSort: string;
  sortDirection: "asc" | "desc";
  onSort: (sortKey: string) => void;
}

const TableHeader = React.memo(function TableHeader({
  title,
  sortKey,
  currentSort,
  sortDirection,
  onSort,
}: TableHeaderProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const isActive = currentSort === sortKey;

  // Define flex values to match the row cells
  const getHeaderStyle = () => {
    switch (sortKey) {
      case "filmName":
        return { flex: 2.5 };
      case "developerName":
        return { flex: 2 };
      case "timeMinutes":
        return { flex: 1 };
      case "temperatureF":
        return { flex: 1 };
      case "shootingIso":
        return { flex: 0.8 };
      case "dilution":
        return { flex: 1.2 };
      default:
        return { flex: 1 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Platform.OS === "web" ? 8 : 4,
          paddingVertical: 4,
          justifyContent: "center",
        },
        getHeaderStyle(),
      ]}
      onPress={() => onSort(sortKey)}
    >
      <Text
        style={[
          {
            fontSize: Platform.OS === "web" ? 14 : 12,
            fontWeight: "600",
            marginRight: 4,
            textAlign: "center",
          },
          { color: isActive ? developmentTint : textColor },
        ]}
      >
        {title}
      </Text>
      {isActive &&
        (sortDirection === "asc" ? (
          <Text style={{ color: developmentTint, marginLeft: 2 }}>↑</Text>
        ) : (
          <Text style={{ color: developmentTint, marginLeft: 2 }}>↓</Text>
        ))}
    </TouchableOpacity>
  );
});

interface RecipeRowProps {
  combination: Combination;
  film: Film | undefined;
  developer: Developer | undefined;
  onPress: () => void;
  isEven: boolean;
}

const RecipeRow = React.memo(function RecipeRow({
  combination,
  film,
  developer,
  onPress,
  isEven,
}: RecipeRowProps) {
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const rowBackground = useThemeColor(
    {},
    isEven ? "cardBackground" : "background",
  );
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== "web" || width <= 768;

  const filmName = film
    ? isMobile
      ? film.name
      : `${film.brand} ${film.name}`
    : "Unknown Film";

  // Format push/pull value if present
  const pushPullDisplay =
    combination.pushPull !== 0
      ? ` ${combination.pushPull > 0 ? `+${combination.pushPull}` : combination.pushPull}`
      : null;

  const developerName = developer ? developer.name : "Unknown Developer";

  // Get dilution info
  const dilutionInfo = formatDilution(
    combination.customDilution ||
      developer?.dilutions.find((d) => d.id === combination.dilutionId)
        ?.dilution ||
      "Stock",
  );

  // Format temperature more compactly
  const tempDisplay = `${combination.temperatureF}°F`;

  return (
    <TouchableOpacity onPress={onPress}>
      <Box
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: Platform.OS === "web" ? 12 : 8,
            paddingHorizontal: Platform.OS === "web" ? 8 : 4,
            minHeight: Platform.OS === "web" ? 48 : 40,
          },
          { backgroundColor: rowBackground },
        ]}
      >
        <Box style={{ flex: 2.5, paddingRight: 8 }}>
          <Text
            style={[
              {
                fontSize: Platform.OS === "web" ? 14 : 12,
                fontWeight: "600",
              },
              { color: textColor },
            ]}
            numberOfLines={1}
          >
            {filmName}
            {pushPullDisplay && (
              <Text style={{ color: developmentTint }}>{pushPullDisplay}</Text>
            )}
          </Text>
        </Box>

        <Box style={{ flex: 2, paddingRight: 8 }}>
          <Text
            style={[
              {
                fontSize: Platform.OS === "web" ? 13 : 11,
                fontWeight: "500",
              },
              { color: textColor },
            ]}
            numberOfLines={1}
          >
            {developerName}
          </Text>
        </Box>

        <Box style={{ flex: 1, paddingRight: 8, alignItems: "center" }}>
          <Text
            style={[
              {
                fontSize: Platform.OS === "web" ? 13 : 11,
                fontWeight: "500",
                textAlign: "center",
              },
              { color: textColor },
            ]}
          >
            {formatTime(combination.timeMinutes)}
          </Text>
        </Box>

        <Box style={{ flex: 1, paddingRight: 8, alignItems: "center" }}>
          <Text
            style={[
              {
                fontSize: Platform.OS === "web" ? 13 : 11,
                fontWeight: "500",
                textAlign: "center",
              },
              { color: textColor },
            ]}
          >
            {tempDisplay}
          </Text>
        </Box>

        <Box style={{ flex: 0.8, paddingRight: 8, alignItems: "center" }}>
          <Text
            style={[
              {
                fontSize: Platform.OS === "web" ? 13 : 11,
                fontWeight: "500",
                textAlign: "center",
              },
              { color: textColor },
            ]}
          >
            {combination.shootingIso}
          </Text>
        </Box>

        <Box style={{ flex: 1.2, paddingRight: 8, alignItems: "center" }}>
          <Text
            style={[
              {
                fontSize: Platform.OS === "web" ? 13 : 11,
                fontWeight: "500",
                textAlign: "center",
              },
              { color: textColor },
            ]}
            numberOfLines={1}
          >
            {dilutionInfo}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
});

interface RecipeResultsViewProps {
  // Results data
  totalItems: number;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  paginatedCombinations: Combination[];

  // Display options
  viewMode: "cards" | "table";
  showCustomRecipes: boolean;
  customRecipesCount: number;

  // Loading state
  isLoading: boolean;

  // Actions
  setViewMode: (mode: "cards" | "table") => void;
  setShowCustomRecipes: (show: boolean) => void;
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  onForceRefresh: () => void;
  onNewCustomRecipe: () => void;

  // Recipe handlers
  onRecipePress: (combination: Combination, isCustom: boolean) => void;
  onSort: (sortKey: string) => void;

  // Utility functions
  getFilmById: (id: string) => Film | undefined;
  getDeveloperById: (id: string) => Developer | undefined;
  getCustomRecipeFilm: (recipeId: string) => Film | undefined;
  getCustomRecipeDeveloper: (recipeId: string) => Developer | undefined;
  isCustomRecipe: (combination: Combination) => boolean;

  // Sort state
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export const RecipeResultsView = React.memo(function RecipeResultsView({
  totalItems,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  hasNext,
  hasPrevious,
  paginatedCombinations,
  viewMode,
  showCustomRecipes,
  customRecipesCount,
  isLoading,
  setViewMode,
  setShowCustomRecipes,
  goToPage,
  goToNext,
  goToPrevious,
  onForceRefresh,
  onNewCustomRecipe,
  onRecipePress,
  onSort,
  getFilmById,
  getDeveloperById,
  getCustomRecipeFilm,
  getCustomRecipeDeveloper,
  isCustomRecipe,
  sortBy,
  sortDirection,
}: RecipeResultsViewProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  return (
    <Box style={{ flex: 1, marginTop: 16, position: "relative" }}>
      {/* Title */}
      <Text
        style={[
          {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 12,
          },
          { color: textColor, textAlign: isDesktop ? "left" : "center" },
        ]}
      >
        {totalItems} Development Recipe
        {totalItems !== 1 ? "s" : ""}
        {totalPages > 1 && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "normal",
              color: textColor,
              opacity: 0.7,
            }}
          >
            {" "}
            (Page {currentPage} of {totalPages})
          </Text>
        )}
        {customRecipesCount > 0 && showCustomRecipes && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "normal",
              color: textColor,
              opacity: 0.7,
            }}
          >
            {" "}
            ({customRecipesCount} custom)
          </Text>
        )}
      </Text>

      {/* Buttons - Different layouts for mobile vs desktop */}
      {isDesktop ? (
        /* Desktop: Buttons in top right */
        <Box style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
          <HStack style={{ gap: 8, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() =>
                setViewMode(viewMode === "cards" ? "table" : "cards")
              }
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: "currentColor",
                  gap: 4,
                },
              ]}
            >
              {viewMode === "cards" ? (
                <Table size={14} color={developmentTint} />
              ) : (
                <Grid3X3 size={14} color={developmentTint} />
              )}
              <Text
                style={[
                  { fontSize: 12, fontWeight: "500" },
                  { color: developmentTint },
                ]}
              >
                {viewMode === "cards" ? "Table" : "Cards"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onForceRefresh}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: "currentColor",
                  gap: 4,
                },
              ]}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="small" color={developmentTint} />
              ) : (
                <RefreshCw size={14} color={developmentTint} />
              )}
              <Text
                style={[
                  { fontSize: 12, fontWeight: "500" },
                  {
                    color: developmentTint,
                    opacity: isLoading ? 0.5 : 1,
                  },
                ]}
              >
                {isLoading ? "Loading..." : "Refresh"}
              </Text>
            </TouchableOpacity>

            {customRecipesCount > 0 && (
              <TouchableOpacity
                onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 8,
                    borderRadius: 6,
                    backgroundColor: showCustomRecipes
                      ? developmentTint
                      : "transparent",
                    borderWidth: 1,
                    borderColor: "currentColor",
                    gap: 4,
                  },
                ]}
              >
                <Text
                  style={[
                    { fontSize: 12, fontWeight: "500" },
                    {
                      color: showCustomRecipes ? "#fff" : developmentTint,
                    },
                  ]}
                >
                  My Recipes
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onNewCustomRecipe}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "currentColor",
                  gap: 4,
                },
                { backgroundColor: developmentTint },
              ]}
            >
              <Plus size={14} color="#fff" />
              <Text
                style={[{ fontSize: 12, fontWeight: "500" }, { color: "#fff" }]}
              >
                Add Recipe
              </Text>
            </TouchableOpacity>
          </HStack>
        </Box>
      ) : (
        /* Mobile: Buttons centered below title */
        <Box style={{ alignItems: "center", marginBottom: 16 }}>
          <HStack
            style={{ gap: 12, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              onPress={onForceRefresh}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "currentColor",
                  gap: 6,
                  minWidth: 120,
                  justifyContent: "center",
                },
              ]}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="small" color={developmentTint} />
              ) : (
                <RefreshCw size={16} color={developmentTint} />
              )}
              <Text
                style={[
                  { fontSize: 14, fontWeight: "600" },
                  {
                    color: developmentTint,
                    opacity: isLoading ? 0.5 : 1,
                  },
                ]}
              >
                {isLoading ? "Loading..." : "Refresh"}
              </Text>
            </TouchableOpacity>

            {customRecipesCount > 0 && (
              <TouchableOpacity
                onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "currentColor",
                    gap: 6,
                    minWidth: 120,
                    justifyContent: "center",
                  },
                  {
                    backgroundColor: showCustomRecipes
                      ? developmentTint
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    { fontSize: 14, fontWeight: "600" },
                    {
                      color: showCustomRecipes ? "#fff" : developmentTint,
                    },
                  ]}
                >
                  My Recipes
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onNewCustomRecipe}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "currentColor",
                  gap: 6,
                  minWidth: 120,
                  justifyContent: "center",
                },
                { backgroundColor: developmentTint },
              ]}
            >
              <Plus size={16} color="#fff" />
              <Text
                style={[{ fontSize: 14, fontWeight: "600" }, { color: "#fff" }]}
              >
                Add Recipe
              </Text>
            </TouchableOpacity>
          </HStack>
        </Box>
      )}

      {paginatedCombinations.length === 0 ? (
        <Box
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <Text
            style={[
              {
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 8,
                textAlign: "center",
              },
              { color: textColor },
            ]}
          >
            No development recipes found.
          </Text>
          <Text
            style={[
              { fontSize: 14, textAlign: "center" },
              { color: textColor },
            ]}
          >
            Try adjusting your search terms or filters, or create your own
            recipe.
          </Text>
        </Box>
      ) : (
        // Cards or Table View
        <>
          {/* Pagination Controls - Top */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            goToPage={goToPage}
            goToNext={goToNext}
            goToPrevious={goToPrevious}
          />

          {isDesktop && viewMode === "table" ? (
            // Table view for desktop
            <Box
              style={{
                flex: 1,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "transparent",
              }}
            >
              <Box
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 2,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                }}
              >
                <TableHeader
                  title="Film"
                  sortKey="filmName"
                  currentSort={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
                <TableHeader
                  title="Developer"
                  sortKey="developerName"
                  currentSort={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
                <TableHeader
                  title="Time"
                  sortKey="timeMinutes"
                  currentSort={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
                <TableHeader
                  title="Temp"
                  sortKey="temperatureF"
                  currentSort={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
                <TableHeader
                  title="ISO"
                  sortKey="shootingIso"
                  currentSort={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
                <TableHeader
                  title="Dilution"
                  sortKey="dilution"
                  currentSort={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </Box>

              <ScrollView style={{ flex: 1 }}>
                {paginatedCombinations.map((combination, index) => {
                  const isCustom = isCustomRecipe(combination);
                  const film = isCustom
                    ? getCustomRecipeFilm(combination.id)
                    : getFilmById(combination.filmStockId);
                  const developer = isCustom
                    ? getCustomRecipeDeveloper(combination.id)
                    : getDeveloperById(combination.developerId);

                  return (
                    <RecipeRow
                      key={combination.uuid}
                      combination={combination}
                      film={film}
                      developer={developer}
                      onPress={() => onRecipePress(combination, isCustom)}
                      isEven={index % 2 === 0}
                    />
                  );
                })}
              </ScrollView>
            </Box>
          ) : (
            // Cards view (default for mobile, optional for desktop)
            <Box
              style={{
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                paddingVertical: 8,
              }}
            >
              {paginatedCombinations.map((combination) => {
                const isCustom = isCustomRecipe(combination);
                const film = isCustom
                  ? getCustomRecipeFilm(combination.id)
                  : getFilmById(combination.filmStockId);
                const developer = isCustom
                  ? getCustomRecipeDeveloper(combination.id)
                  : getDeveloperById(combination.developerId);

                return (
                  <RecipeCard
                    key={combination.uuid}
                    combination={combination}
                    film={film}
                    developer={developer}
                    onPress={() => onRecipePress(combination, isCustom)}
                    isCustomRecipe={isCustom}
                  />
                );
              })}
            </Box>
          )}

          {/* Pagination Controls - Bottom */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            goToPage={goToPage}
            goToNext={goToNext}
            goToPrevious={goToPrevious}
          />
        </>
      )}
    </Box>
  );
});
