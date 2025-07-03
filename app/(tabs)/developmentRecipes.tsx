import React, { useState, useMemo, useRef } from "react";
import {
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import {
  Box,
  Text,
  Button,
  ButtonText,
  VStack,
  HStack,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
} from "@gluestack-ui/themed";
import { Spinner } from "@/components/ui/spinner";
import {
  X,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Grid3X3,
  Table,
} from "lucide-react-native";

import { CalculatorLayout } from "@/components/ui/layout/CalculatorLayout";
import { FormSection, FormGroup } from "@/components/ui/forms/FormSection";
import {
  InfoSection,
  InfoText,
  InfoSubtitle,
  InfoList,
} from "@/components/ui/calculator/InfoSection";
import { StyledSelect } from "@/components/ui/select/StyledSelect";
import { SearchInput, SearchDropdown } from "@/components/ui/search";
import { PaginationControls } from "@/components/ui/pagination";
import {
  RecipeDetail,
  CustomRecipeForm,
  RecipeCard,
} from "@/components/recipes/development";
import {
  getRecipeDetailModalConfig,
  getCustomRecipeDetailModalConfig,
  getRecipeFormModalConfig,
} from "@/components/recipes/development/ModalStyles";
import { useThemeColor } from "@/hooks/ui/theming";
import { useDevelopmentRecipes } from "@/hooks/recipes/development-recipes";
import { useRecipeUrlState } from "@/hooks/data/url-state";
import { useCustomRecipes } from "@/hooks/recipes/custom-recipes";
import { useWindowDimensions } from "@/hooks/ui/detection";
import { useFeatureFlags } from "@/hooks/utils";
import { useDebounce } from "@/hooks/utils/debounce";
import { usePagination } from "@/hooks/data/pagination";
import { DEVELOPER_TYPES, formatTime } from "@/constants/developmentRecipes";
import { formatDilution } from "@/utils/dilutionUtils";
import { debugError } from "@/utils/debugLogger";
import { RecipeErrorBoundary } from "@/components/ui/error";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";
import type { CustomRecipe } from "@/types/customRecipeTypes";

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
      style={[styles.tableHeader, getHeaderStyle()]}
      onPress={() => onSort(sortKey)}
    >
      <Text
        style={[
          styles.tableHeaderText,
          { color: isActive ? developmentTint : textColor },
        ]}
      >
        {title}
      </Text>
      {isActive &&
        (sortDirection === "asc" ? (
          <ChevronUp
            size={12}
            color={developmentTint}
            style={styles.sortIcon}
          />
        ) : (
          <ChevronDown
            size={12}
            color={developmentTint}
            style={styles.sortIcon}
          />
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

  // Format temperature for display

  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={[styles.tableRow, { backgroundColor: rowBackground }]}>
        <Box style={styles.filmCell}>
          <Text
            style={[styles.filmText, { color: textColor }]}
            numberOfLines={1}
          >
            {filmName}
            {pushPullDisplay && (
              <Text style={{ color: developmentTint }}>{pushPullDisplay}</Text>
            )}
          </Text>
        </Box>

        <Box style={styles.developerCell}>
          <Text
            style={[styles.developerText, { color: textColor }]}
            numberOfLines={1}
          >
            {developerName}
          </Text>
        </Box>

        <Box style={styles.timeCell}>
          <Text style={[styles.paramText, { color: textColor }]}>
            {formatTime(combination.timeMinutes)}
          </Text>
        </Box>

        <Box style={styles.tempCell}>
          <Text style={[styles.paramText, { color: textColor }]}>
            {tempDisplay}
          </Text>
        </Box>

        <Box style={styles.isoCell}>
          <Text style={[styles.paramText, { color: textColor }]}>
            {combination.shootingIso}
          </Text>
        </Box>

        <Box style={styles.dilutionCell}>
          <Text
            style={[styles.paramText, { color: textColor }]}
            numberOfLines={1}
          >
            {dilutionInfo}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
});

export default function DevelopmentRecipes() {
  // Get development recipes data (this loads the data and provides films/developers for URL parsing)
  const {
    // State
    filmSearch,
    developerSearch,
    developerTypeFilter,
    dilutionFilter,
    isoFilter,
    sortBy,
    sortDirection,
    selectedFilm,
    selectedDeveloper,
    isLoading,
    isLoaded,
    error,
    allFilms,
    allDevelopers,
    filteredCombinations,

    // Actions
    setFilmSearch,
    setDeveloperSearch,
    setDeveloperTypeFilter,
    setDilutionFilter,
    setIsoFilter,
    handleSort,
    setSelectedFilm,
    setSelectedDeveloper,
    loadData,
    forceRefresh: forceRefreshData,
    clearFilters,
    getFilmById,
    getDeveloperById,
    getAvailableDilutions,
    getAvailableISOs,
  } = useDevelopmentRecipes();

  // Add debouncing to search inputs to prevent excessive filtering operations
  const debouncedFilmSearch = useDebounce(filmSearch, 300);
  const debouncedDeveloperSearch = useDebounce(developerSearch, 300);

  const { customRecipes, forceRefresh, addCustomRecipe } = useCustomRecipes();
  const { isRecipeImportEnabled } = useFeatureFlags();

  // Convert custom recipes to combination-like format for display
  const customRecipesAsCombinations = React.useMemo(() => {
    const combinations = customRecipes.map((recipe): Combination => {
      return {
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
        // Custom recipe specific handling
        dilutionId: undefined,
      };
    });
    return combinations;
  }, [customRecipes]);

  // Create a recipe lookup map for shared recipe functionality
  const recipesByUuid = useMemo(() => {
    const map = new Map<string, Combination>();

    // Add API recipes
    filteredCombinations.forEach((recipe) => {
      if (recipe.uuid) {
        map.set(recipe.uuid, recipe);
      }
    });

    // Add custom recipes (they use id instead of uuid)
    customRecipesAsCombinations.forEach((recipe) => {
      if (recipe.id) {
        map.set(recipe.id, recipe);
      }
    });

    return map;
  }, [filteredCombinations, customRecipesAsCombinations]);

  // URL state management - syncs current filter state with URL parameters
  const {
    initialUrlState,
    hasUrlState,
    sharedRecipe,
    sharedCustomRecipe,
    isLoadingSharedRecipe,
    sharedRecipeError,
    hasSharedRecipe,
    hasSharedCustomRecipe,
  } = useRecipeUrlState(
    allFilms,
    allDevelopers,
    {
      selectedFilm,
      selectedDeveloper,
      dilutionFilter,
      isoFilter,
    },
    recipesByUuid, // Recipe lookup map for shared recipe functionality
  );

  // URL state management for shared recipes

  // Apply URL state to hook state when data is loaded and URL state is available
  const urlStateAppliedRef = React.useRef(false);
  const initialUrlStateRef = React.useRef(initialUrlState);

  // Update ref when initialUrlState changes
  React.useEffect(() => {
    initialUrlStateRef.current = initialUrlState;
  }, [initialUrlState]);

  React.useEffect(() => {
    if (
      isLoaded &&
      hasUrlState &&
      initialUrlStateRef.current.fromUrl &&
      !urlStateAppliedRef.current
    ) {
      // Batch all state updates to prevent multiple re-renders
      const updates: (() => void)[] = [];

      if (
        initialUrlStateRef.current.selectedFilm &&
        initialUrlStateRef.current.selectedFilm !== selectedFilm
      ) {
        updates.push(() =>
          setSelectedFilm(initialUrlStateRef.current.selectedFilm),
        );
      }
      if (
        initialUrlStateRef.current.selectedDeveloper &&
        initialUrlStateRef.current.selectedDeveloper !== selectedDeveloper
      ) {
        updates.push(() =>
          setSelectedDeveloper(initialUrlStateRef.current.selectedDeveloper),
        );
      }
      if (
        initialUrlStateRef.current.dilutionFilter &&
        initialUrlStateRef.current.dilutionFilter !== dilutionFilter
      ) {
        updates.push(() =>
          setDilutionFilter(initialUrlStateRef.current.dilutionFilter),
        );
      }
      if (
        initialUrlStateRef.current.isoFilter &&
        initialUrlStateRef.current.isoFilter !== isoFilter
      ) {
        updates.push(() => setIsoFilter(initialUrlStateRef.current.isoFilter));
      }

      // Apply all updates and mark as applied
      if (updates.length > 0) {
        React.startTransition(() => {
          updates.forEach((update) => update());
          urlStateAppliedRef.current = true;
        });
      } else {
        urlStateAppliedRef.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    hasUrlState,
    // Dependencies intentionally limited to prevent infinite re-render loops
    // Current state values and setter functions removed to ensure stability
  ]);

  // Handle shared recipe - automatically open the recipe detail when a shared recipe is loaded
  React.useEffect(() => {
    if (hasSharedRecipe && sharedRecipe && !isLoadingSharedRecipe) {
      // Check if it's a custom recipe or API recipe
      const isCustomRecipe = customRecipes.some(
        (recipe) => recipe.id === sharedRecipe.id,
      );

      if (isCustomRecipe) {
        const customRecipe = customRecipes.find(
          (recipe) => recipe.id === sharedRecipe.id,
        );
        if (customRecipe) {
          setSelectedCustomRecipe(customRecipe);
          setSelectedCombination(null);
        }
      } else {
        setSelectedCombination(sharedRecipe);
        setSelectedCustomRecipe(null);
      }
    }
  }, [
    hasSharedRecipe,
    sharedRecipe,
    isLoadingSharedRecipe,
    customRecipes,
    sharedRecipeError,
  ]);

  // Show error message if shared recipe fails to load
  React.useEffect(() => {
    if (sharedRecipeError) {
      // Handle shared recipe error (could show toast notification)
      console.warn("Shared recipe error:", sharedRecipeError);
    }
  }, [sharedRecipeError]);

  const [showFilters, setShowFilters] = useState(false);
  const [showCustomRecipeImportModal, setShowCustomRecipeImportModal] =
    useState(false);

  // Track if we've already shown the import modal for this shared recipe
  const sharedRecipeModalShownRef = useRef<string | null>(null);

  // Show import modal when a shared custom recipe is detected (only if import is enabled)
  React.useEffect(() => {
    if (
      hasSharedCustomRecipe &&
      sharedCustomRecipe &&
      !showCustomRecipeImportModal &&
      !isLoadingSharedRecipe &&
      isRecipeImportEnabled
    ) {
      // Create a unique identifier for this shared recipe
      const recipeKey = `${sharedCustomRecipe.name}_${sharedCustomRecipe.filmId}_${sharedCustomRecipe.developerId}_${sharedCustomRecipe.timeMinutes}`;

      // Only show modal if we haven't already shown it for this specific recipe
      if (sharedRecipeModalShownRef.current !== recipeKey) {
        setShowCustomRecipeImportModal(true);
        sharedRecipeModalShownRef.current = recipeKey;
      }
    }
  }, [
    hasSharedCustomRecipe,
    sharedCustomRecipe,
    showCustomRecipeImportModal,
    isLoadingSharedRecipe,
    isRecipeImportEnabled,
  ]);
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [selectedCustomRecipe, setSelectedCustomRecipe] =
    useState<CustomRecipe | null>(null);
  const [showCustomRecipeForm, setShowCustomRecipeForm] = useState(false);
  const [editingCustomRecipe, setEditingCustomRecipe] = useState<
    CustomRecipe | undefined
  >(undefined);
  const [showCustomRecipes, setShowCustomRecipes] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showMobileFilmModal, setShowMobileFilmModal] = useState(false);
  const [showMobileDeveloperModal, setShowMobileDeveloperModal] =
    useState(false);
  const [isFilmSearchFocused, setIsFilmSearchFocused] = useState(false);
  const [isDeveloperSearchFocused, setIsDeveloperSearchFocused] =
    useState(false);

  // Add refs and position state for dynamic positioning
  const filmSearchRef = React.useRef<any>(null);
  const developerSearchRef = React.useRef<any>(null);
  const [filmSearchPosition, setFilmSearchPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [developerSearchPosition, setDeveloperSearchPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const inputBackground = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "borderColor");

  // Break down large computation into smaller focused useMemos for better performance

  // Step 1: Basic filtering of custom recipes
  const baseCustomCombinations = React.useMemo(() => {
    try {
      if (
        !showCustomRecipes ||
        !Array.isArray(customRecipesAsCombinations) ||
        !Array.isArray(customRecipes)
      ) {
        return [];
      }
      return customRecipesAsCombinations.filter((combination) => {
        return (
          combination?.id && customRecipes.some((r) => r?.id === combination.id)
        );
      });
    } catch (error) {
      debugError("Error in baseCustomCombinations useMemo", error);
      return [];
    }
  }, [showCustomRecipes, customRecipesAsCombinations, customRecipes]);

  // Step 2: Apply film filters
  const filmFilteredCustomCombinations = React.useMemo(() => {
    try {
      if (
        !selectedFilm &&
        (!debouncedFilmSearch || !debouncedFilmSearch.trim())
      ) {
        return baseCustomCombinations;
      }

      return baseCustomCombinations.filter((combination) => {
        const recipe = customRecipes.find((r) => r?.id === combination.id);
        if (!recipe) return false;

        // Apply film filter
        if (selectedFilm) {
          if (recipe.isCustomFilm) {
            if (
              !recipe.customFilm ||
              !selectedFilm.brand ||
              !selectedFilm.name
            ) {
              return false;
            }
            return (
              (recipe.customFilm.brand &&
                recipe.customFilm.brand
                  .toLowerCase()
                  .includes(selectedFilm.brand.toLowerCase())) ||
              (recipe.customFilm.name &&
                recipe.customFilm.name
                  .toLowerCase()
                  .includes(selectedFilm.name.toLowerCase()))
            );
          } else {
            return combination.filmStockId === selectedFilm.uuid;
          }
        }

        // Apply film search
        if (debouncedFilmSearch && debouncedFilmSearch.trim()) {
          if (recipe.isCustomFilm && recipe.customFilm) {
            return (
              (recipe.customFilm.brand &&
                recipe.customFilm.brand
                  .toLowerCase()
                  .includes(debouncedFilmSearch.toLowerCase())) ||
              (recipe.customFilm.name &&
                recipe.customFilm.name
                  .toLowerCase()
                  .includes(debouncedFilmSearch.toLowerCase()))
            );
          } else if (combination.filmStockId) {
            const film = getFilmById(combination.filmStockId);
            return (
              film &&
              film.name &&
              film.brand &&
              (film.name
                .toLowerCase()
                .includes(debouncedFilmSearch.toLowerCase()) ||
                film.brand
                  .toLowerCase()
                  .includes(debouncedFilmSearch.toLowerCase()))
            );
          }
        }

        return true;
      });
    } catch (error) {
      debugError("Error in filmFilteredCustomCombinations useMemo", error);
      return baseCustomCombinations;
    }
  }, [
    baseCustomCombinations,
    selectedFilm,
    debouncedFilmSearch,
    customRecipes,
    getFilmById,
  ]);

  // Step 3: Apply developer filters
  const developerFilteredCustomCombinations = React.useMemo(() => {
    try {
      if (
        !selectedDeveloper &&
        (!debouncedDeveloperSearch || !debouncedDeveloperSearch.trim())
      ) {
        return filmFilteredCustomCombinations;
      }

      return filmFilteredCustomCombinations.filter((combination) => {
        const recipe = customRecipes.find((r) => r?.id === combination.id);
        if (!recipe) return false;

        // Apply developer filter
        if (selectedDeveloper) {
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
            return combination.developerId === selectedDeveloper.uuid;
          }
        }

        // Apply developer search
        if (debouncedDeveloperSearch && debouncedDeveloperSearch.trim()) {
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
            const dev = getDeveloperById(combination.developerId);
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
        }

        return true;
      });
    } catch (error) {
      debugError("Error in developerFilteredCustomCombinations useMemo", error);
      return filmFilteredCustomCombinations;
    }
  }, [
    filmFilteredCustomCombinations,
    selectedDeveloper,
    debouncedDeveloperSearch,
    customRecipes,
    getDeveloperById,
  ]);

  // Step 4: Sort custom recipes
  const sortedCustomCombinations = React.useMemo(() => {
    try {
      const sorted = [...developerFilteredCustomCombinations];
      sorted.sort((a, b) => {
        if (!a?.id || !b?.id) return 0;
        const recipeA = customRecipes.find((r) => r?.id === a.id);
        const recipeB = customRecipes.find((r) => r?.id === b.id);
        if (
          !recipeA ||
          !recipeB ||
          !recipeA.dateCreated ||
          !recipeB.dateCreated
        )
          return 0;

        const dateA = new Date(recipeA.dateCreated);
        const dateB = new Date(recipeB.dateCreated);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;

        return dateB.getTime() - dateA.getTime();
      });
      return sorted;
    } catch (error) {
      debugError("Error in sortedCustomCombinations useMemo", error);
      return developerFilteredCustomCombinations;
    }
  }, [developerFilteredCustomCombinations, customRecipes]);

  // Step 5: Final combination with API recipes
  const allCombinations = React.useMemo(() => {
    try {
      const safeCombinations = Array.isArray(filteredCombinations)
        ? filteredCombinations
        : [];
      return [...sortedCustomCombinations, ...safeCombinations];
    } catch (error) {
      debugError("Error in allCombinations useMemo", error);
      return Array.isArray(filteredCombinations) ? filteredCombinations : [];
    }
  }, [sortedCustomCombinations, filteredCombinations]);

  // Additional computation loading state
  const [isComputingCombinations, setIsComputingCombinations] = useState(false);

  // Monitor allCombinations computation
  React.useEffect(() => {
    if (isDataReady) {
      setIsComputingCombinations(true);
      const timer = setTimeout(() => {
        setIsComputingCombinations(false);
      }, 100); // Small delay to allow computation to finish
      return () => clearTimeout(timer);
    }
  }, [
    isDataReady,
    filteredCombinations,
    customRecipesAsCombinations,
    showCustomRecipes,
  ]);

  // Pagination logic
  const {
    paginatedItems: paginatedCombinations,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNext,
    hasPrevious,
    pageSize,
    goToPage,
    goToNext,
    goToPrevious,
    resetToFirstPage,
  } = usePagination(allCombinations, 50);

  // Custom recipe helpers
  const getCustomRecipeFilm = React.useCallback(
    (recipeId: string): Film | undefined => {
      if (!recipeId || !customRecipes || !Array.isArray(customRecipes)) {
        return undefined;
      }

      const recipe = customRecipes.find((r) => r?.id === recipeId);
      if (!recipe) return undefined;

      if (recipe.isCustomFilm && recipe.customFilm) {
        const customFilm = recipe.customFilm;
        if (!customFilm.brand || !customFilm.name) {
          debugError("Invalid custom film data", { recipeId, customFilm });
          return undefined;
        }

        // Convert custom film data to Film interface
        return {
          uuid: `custom_film_${recipe.id}`,
          id: `custom_film_${recipe.id}`,
          slug: `custom_film_${recipe.id}`,
          brand: customFilm.brand,
          name: customFilm.name,
          isoSpeed: customFilm.isoSpeed || 100,
          colorType: customFilm.colorType || "BW",
          grainStructure: customFilm.grainStructure || "Fine",
          description: customFilm.description || "",
          discontinued: 0,
          manufacturerNotes: [],
          staticImageURL: undefined,
          dateAdded: recipe.dateCreated,
        } as Film;
      } else if (recipe.filmId) {
        return getFilmById(recipe.filmId);
      }

      return undefined;
    },
    [customRecipes, getFilmById],
  );

  const getCustomRecipeDeveloper = React.useCallback(
    (recipeId: string): Developer | undefined => {
      if (!recipeId || !customRecipes || !Array.isArray(customRecipes)) {
        return undefined;
      }

      const recipe = customRecipes.find((r) => r?.id === recipeId);
      if (!recipe) return undefined;

      if (recipe.isCustomDeveloper && recipe.customDeveloper) {
        const customDeveloper = recipe.customDeveloper;
        if (!customDeveloper.name || !customDeveloper.manufacturer) {
          debugError("Invalid custom developer data", {
            recipeId,
            customDeveloper,
          });
          return undefined;
        }

        // Convert custom developer data to Developer interface
        return {
          uuid: `custom_dev_${recipe.id}`,
          id: `custom_dev_${recipe.id}`,
          slug: `custom_dev_${recipe.id}`,
          name: customDeveloper.name,
          manufacturer: customDeveloper.manufacturer,
          type: customDeveloper.type || "powder",
          filmOrPaper: customDeveloper.filmOrPaper || "film",
          workingLifeHours: customDeveloper.workingLifeHours || 24,
          stockLifeMonths: customDeveloper.stockLifeMonths || 12,
          notes: customDeveloper.notes || "",
          mixingInstructions: customDeveloper.mixingInstructions || "",
          safetyNotes: customDeveloper.safetyNotes || "",
          discontinued: 0,
          datasheetUrl: [],
          dilutions: Array.isArray(customDeveloper.dilutions)
            ? customDeveloper.dilutions.map((d, idx) => ({
                id: idx,
                name: d?.name || `Dilution ${idx + 1}`,
                dilution: d?.dilution || "Stock",
              }))
            : [],
          dateAdded: recipe.dateCreated,
        } as Developer;
      } else if (recipe.developerId) {
        return getDeveloperById(recipe.developerId);
      }

      return undefined;
    },
    [customRecipes, getDeveloperById],
  );

  // Get current version of selected custom recipe (to handle updates)
  const currentSelectedCustomRecipe = React.useMemo(() => {
    if (!selectedCustomRecipe) return null;
    // Find the current version from the customRecipes array
    const currentVersion = customRecipes.find(
      (r) => r.id === selectedCustomRecipe.id,
    );
    return currentVersion || selectedCustomRecipe; // Fallback to original if not found
  }, [selectedCustomRecipe, customRecipes]);

  const handleCustomRecipePress = React.useCallback((recipe: CustomRecipe) => {
    setSelectedCustomRecipe(recipe);
    setSelectedCombination(null); // Clear API recipe selection
  }, []);

  const handleEditCustomRecipe = React.useCallback((recipe: CustomRecipe) => {
    setEditingCustomRecipe(recipe);
    setShowCustomRecipeForm(true);
  }, []);

  const handleNewCustomRecipe = React.useCallback(() => {
    setEditingCustomRecipe(undefined);
    setShowCustomRecipeForm(true);
  }, []);

  const handleImportCustomRecipe = React.useCallback(async () => {
    if (!sharedCustomRecipe || !isRecipeImportEnabled) return;

    try {
      // Importing custom recipe

      // Convert the shared custom recipe to the format expected by addCustomRecipe
      const formData = {
        name: sharedCustomRecipe.name,
        useExistingFilm: !sharedCustomRecipe.isCustomFilm,
        selectedFilmId: sharedCustomRecipe.isCustomFilm
          ? undefined
          : sharedCustomRecipe.filmId,
        useExistingDeveloper: !sharedCustomRecipe.isCustomDeveloper,
        selectedDeveloperId: sharedCustomRecipe.isCustomDeveloper
          ? undefined
          : sharedCustomRecipe.developerId,
        temperatureF: sharedCustomRecipe.temperatureF,
        timeMinutes: sharedCustomRecipe.timeMinutes,
        shootingIso: sharedCustomRecipe.shootingIso,
        pushPull: sharedCustomRecipe.pushPull,
        agitationSchedule: sharedCustomRecipe.agitationSchedule || "",
        notes: sharedCustomRecipe.notes || "",
        customDilution: sharedCustomRecipe.customDilution || "",
        customFilm: sharedCustomRecipe.customFilm,
        customDeveloper: sharedCustomRecipe.customDeveloper,
        isPublic: sharedCustomRecipe.isPublic,
      };

      await addCustomRecipe(formData);
      // Successfully imported custom recipe

      // Close the import modal
      setShowCustomRecipeImportModal(false);

      // Clear the URL parameters to prevent the modal from showing again
      router.setParams({ recipe: undefined, source: undefined });

      // Show success message
      // You could add a toast notification here if desired
    } catch (error) {
      debugError("Failed to import custom recipe:", error);
      // You could show an error toast here if desired
    }
  }, [sharedCustomRecipe, isRecipeImportEnabled, addCustomRecipe]);

  const handleCancelImportCustomRecipe = React.useCallback(() => {
    // Close the import modal
    setShowCustomRecipeImportModal(false);

    // Clear the URL parameters to prevent the modal from showing again
    router.setParams({ recipe: undefined, source: undefined });
  }, []);

  const handleForceRefresh = React.useCallback(async () => {
    // Handle force refresh
    try {
      await forceRefreshData();
      // Force refresh completed
    } catch (error) {
      debugError("Force refresh failed:", error);
    }
  }, [forceRefreshData]);

  const handleCustomRecipeFormClose = React.useCallback(() => {
    // Handle custom recipe form close

    // Force refresh to ensure any recipe deletions are reflected in the UI
    forceRefresh();

    // Clear any selected custom recipe if it might have been deleted
    setSelectedCustomRecipe(null);

    setShowCustomRecipeForm(false);
    setEditingCustomRecipe(undefined);
  }, [forceRefresh]);

  const handleCustomRecipeDelete = React.useCallback(() => {
    // Handle custom recipe delete

    // Force refresh to ensure the deletion is reflected in the UI
    forceRefresh();

    // Clear the selected custom recipe since it was deleted
    setSelectedCustomRecipe(null);
  }, [forceRefresh]);

  const handleCustomRecipeSave = React.useCallback(
    async (recipeId: string) => {
      // Force immediate refresh to ensure updated data is displayed
      // This is critical for both saves AND deletes
      await forceRefresh();

      // Check if the recipe still exists (it won't if it was deleted)
      const recipeStillExists = customRecipes.some((r) => r.id === recipeId);

      // If recipe was deleted, clear any selections that might reference it
      if (!recipeStillExists) {
        setSelectedCustomRecipe(null);
      }

      // Close the form modal
      setShowCustomRecipeForm(false);
      setEditingCustomRecipe(undefined);
    },
    [forceRefresh, customRecipes],
  );

  // Handle duplicating a recipe (either API or custom)
  const handleDuplicateRecipe = (
    combination: Combination,
    isCustom: boolean = false,
  ) => {
    const customRecipe = isCustom
      ? customRecipes.find((r) => r.id === combination.id)
      : undefined;
    const film =
      isCustom && customRecipe
        ? getCustomRecipeFilm(customRecipe.id)
        : getFilmById(combination.filmStockId);

    // Create a new custom recipe based on the existing one
    const duplicateRecipe: CustomRecipe = {
      id: `duplicate_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: `Copy of ${combination.name || (film ? `${film.brand} ${film.name}` : "Unknown")}`,
      filmId:
        isCustom && customRecipe?.isCustomFilm
          ? customRecipe.filmId
          : combination.filmStockId,
      developerId:
        isCustom && customRecipe?.isCustomDeveloper
          ? customRecipe.developerId
          : combination.developerId,
      temperatureF: combination.temperatureF,
      timeMinutes: combination.timeMinutes,
      shootingIso: combination.shootingIso,
      pushPull: combination.pushPull,
      agitationSchedule: combination.agitationSchedule,
      notes: combination.notes,
      customDilution: combination.customDilution || undefined,
      isCustomFilm:
        isCustom && customRecipe ? customRecipe.isCustomFilm : false,
      isCustomDeveloper:
        isCustom && customRecipe ? customRecipe.isCustomDeveloper : false,
      customFilm:
        isCustom && customRecipe ? customRecipe.customFilm : undefined,
      customDeveloper:
        isCustom && customRecipe ? customRecipe.customDeveloper : undefined,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPublic: false,
    };

    // Set up editing the duplicated recipe
    setEditingCustomRecipe(duplicateRecipe);
    setShowCustomRecipeForm(true);

    // Close any open recipe details
    setSelectedCombination(null);
    setSelectedCustomRecipe(null);
  };

  // Film and developer lists for desktop search dropdown (debounced + lazy-loaded for performance)
  const filteredFilms = React.useMemo(() => {
    if (!isFilmSearchFocused) return [];

    let filtered = allFilms;
    if (debouncedFilmSearch.trim()) {
      filtered = allFilms.filter(
        (film) =>
          film.name.toLowerCase().includes(debouncedFilmSearch.toLowerCase()) ||
          film.brand.toLowerCase().includes(debouncedFilmSearch.toLowerCase()),
      );
    }

    // Limit initial results for better performance - show top 50 results
    return filtered.slice(0, 50);
  }, [allFilms, debouncedFilmSearch, isFilmSearchFocused]);

  const filteredDevelopers = React.useMemo(() => {
    if (!isDeveloperSearchFocused) return [];

    let filtered = allDevelopers;
    if (debouncedDeveloperSearch.trim()) {
      filtered = allDevelopers.filter(
        (dev) =>
          dev.name
            .toLowerCase()
            .includes(debouncedDeveloperSearch.toLowerCase()) ||
          dev.manufacturer
            .toLowerCase()
            .includes(debouncedDeveloperSearch.toLowerCase()),
      );
    }

    // Limit initial results for better performance - show top 50 results
    return filtered.slice(0, 50);
  }, [allDevelopers, debouncedDeveloperSearch, isDeveloperSearchFocused]);

  // Convert to SearchDropdownItem format
  const filmDropdownItems = React.useMemo(
    () =>
      filteredFilms.map((film) => ({
        id: film.uuid,
        title: film.name,
        subtitle: film.brand,
      })),
    [filteredFilms],
  );

  const developerDropdownItems = React.useMemo(
    () =>
      filteredDevelopers.map((developer) => ({
        id: developer.uuid,
        title: developer.name,
        subtitle: developer.manufacturer,
      })),
    [filteredDevelopers],
  );

  // Handle dropdown item selection
  const handleFilmDropdownSelect = (item: {
    id: string;
    title: string;
    subtitle: string;
  }) => {
    const film = allFilms.find((f) => f.uuid === item.id);
    if (film) {
      setSelectedFilm(film);
      setFilmSearch("");
      setIsFilmSearchFocused(false);
    }
  };

  const handleDeveloperDropdownSelect = (item: {
    id: string;
    title: string;
    subtitle: string;
  }) => {
    const developer = allDevelopers.find((d) => d.uuid === item.id);
    if (developer) {
      setSelectedDeveloper(developer);
      setDeveloperSearch("");
      setIsDeveloperSearchFocused(false);
    }
  };

  // Add layout handlers for dynamic positioning
  const handleFilmSearchLayout = () => {
    if (filmSearchRef.current && isDesktop) {
      filmSearchRef.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          setFilmSearchPosition({
            top: pageY + height,
            left: pageX,
            width: width,
          });
        },
      );
    }
  };

  const handleDeveloperSearchLayout = () => {
    if (developerSearchRef.current && isDesktop) {
      developerSearchRef.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          setDeveloperSearchPosition({
            top: pageY + height,
            left: pageX,
            width: width,
          });
        },
      );
    }
  };

  // Enhanced loading state check - prevent render until data is truly ready
  const isDataReady = React.useMemo(() => {
    try {
      return (
        isLoaded &&
        !isLoading &&
        Array.isArray(allFilms) &&
        Array.isArray(allDevelopers) &&
        Array.isArray(filteredCombinations) &&
        typeof getFilmById === "function" &&
        typeof getDeveloperById === "function"
      );
    } catch {
      return false;
    }
  }, [
    isLoaded,
    isLoading,
    allFilms,
    allDevelopers,
    filteredCombinations,
    getFilmById,
    getDeveloperById,
  ]);

  const infoSection = (
    <InfoSection title="About Development Recipes">
      <InfoText>
        Browse and search through a comprehensive database of film development
        combinations. Find the optimal development parameters for your film and
        developer combinations.
      </InfoText>

      <InfoSubtitle>How to Use:</InfoSubtitle>
      <InfoList
        items={[
          "Search for films by name or brand",
          "Search for developers by manufacturer or name",
          "Use filters to narrow by film type or developer type",
          "Sort results by film name, developer, time, temperature, or ISO",
          "View detailed development parameters for each combination",
        ]}
      />

      <InfoSubtitle>Development Parameters:</InfoSubtitle>
      <InfoText>
        Each combination shows development time, temperature (in both Fahrenheit
        and Celsius), recommended shooting ISO, dilution ratio, and any
        push/pull processing notes.
      </InfoText>

      <InfoSubtitle>Tips:</InfoSubtitle>
      <InfoList
        items={[
          "Temperature is critical - maintain consistency within ±0.5°F",
          "Agitation schedule affects contrast and grain structure",
          "Push/pull processing changes both time and development characteristics",
          "Always refer to manufacturer data sheets for safety information",
        ]}
      />
    </InfoSection>
  );

  if (error) {
    return (
      <CalculatorLayout title="Development Recipes" infoSection={infoSection}>
        <Box style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>
            Error loading development data: {error}
          </Text>
          <Button onPress={loadData} style={styles.retryButton}>
            <RefreshCw size={16} color="#fff" />
            <ButtonText style={styles.retryButtonText}>Retry</ButtonText>
          </Button>
        </Box>
      </CalculatorLayout>
    );
  }

  if (isLoading || !isLoaded || !isDataReady) {
    return (
      <CalculatorLayout title="Development Recipes" infoSection={infoSection}>
        <Box style={styles.loadingContainer}>
          <Spinner
            size="large"
            color={developmentTint}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.loadingText, { color: textColor }]}>
            {isLoading || !isLoaded
              ? "Loading development data..."
              : "Preparing recipe data..."}
          </Text>
        </Box>
      </CalculatorLayout>
    );
  }

  return (
    <RecipeErrorBoundary
      onRetry={() => {
        // Reset states and reload data
        loadData();
        forceRefresh();
      }}
    >
      <CalculatorLayout title="Development Recipes" infoSection={infoSection}>
        <Box style={styles.mainContainer}>
          {/* Loading overlay for heavy computations */}
          {isComputingCombinations && (
            <Box style={styles.computationLoadingOverlay}>
              <Spinner size="small" color={developmentTint} />
              <Text
                style={[styles.computationLoadingText, { color: textColor }]}
              >
                Processing recipes...
              </Text>
            </Box>
          )}
          {/* Search, Filters, and Results */}
          <Box style={styles.leftPanel}>
            {/* Search and Filter Section */}
            <FormSection>
              <VStack space="md" style={{ overflow: "visible" }}>
                {/* Search/Selection Fields */}
                <Box>
                  <Text style={[styles.sectionLabel, { color: textColor }]}>
                    {isDesktop ? "Search" : "Select Film & Developer"}
                  </Text>

                  <Box
                    style={[
                      styles.searchFieldsContainer,
                      isDesktop && styles.searchFieldsDesktop,
                      {
                        overflow: "visible",
                        zIndex: 999999,
                        position: "relative",
                      },
                    ]}
                  >
                    <Box
                      ref={filmSearchRef}
                      style={[
                        styles.searchField,
                        isDesktop && styles.searchFieldDesktop,
                        {
                          overflow: "visible",
                          zIndex: 999999,
                          position: "relative",
                        },
                      ]}
                      onLayout={handleFilmSearchLayout}
                    >
                      <Box style={styles.searchDropdownContainer}>
                        {isDesktop ? (
                          <SearchInput
                            variant="desktop"
                            type="film"
                            placeholder="Type to search films..."
                            value={filmSearch}
                            onChangeText={setFilmSearch}
                            onClear={() => setFilmSearch("")}
                            onFocus={() => {
                              setIsFilmSearchFocused(true);
                              handleFilmSearchLayout();
                            }}
                            onBlur={() => {
                              // Delay hiding to allow item selection
                              setTimeout(
                                () => setIsFilmSearchFocused(false),
                                150,
                              );
                            }}
                          />
                        ) : (
                          <SearchInput
                            variant="mobile"
                            type="film"
                            placeholder="Type to search films..."
                            selectedItem={selectedFilm}
                            onPress={() => setShowMobileFilmModal(true)}
                            onClear={() => setSelectedFilm(null)}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box
                      ref={developerSearchRef}
                      style={[
                        styles.searchField,
                        isDesktop && styles.searchFieldDesktop,
                        {
                          overflow: "visible",
                          zIndex: 999999,
                          position: "relative",
                        },
                      ]}
                      onLayout={handleDeveloperSearchLayout}
                    >
                      <Box style={styles.searchDropdownContainer}>
                        {isDesktop ? (
                          <SearchInput
                            variant="desktop"
                            type="developer"
                            placeholder="Type to search developers..."
                            value={developerSearch}
                            onChangeText={setDeveloperSearch}
                            onClear={() => setDeveloperSearch("")}
                            onFocus={() => {
                              setIsDeveloperSearchFocused(true);
                              handleDeveloperSearchLayout();
                            }}
                            onBlur={() => {
                              // Delay hiding to allow item selection
                              setTimeout(
                                () => setIsDeveloperSearchFocused(false),
                                150,
                              );
                            }}
                          />
                        ) : (
                          <SearchInput
                            variant="mobile"
                            type="developer"
                            placeholder="Type to search developers..."
                            selectedItem={selectedDeveloper}
                            onPress={() => setShowMobileDeveloperModal(true)}
                            onClear={() => setSelectedDeveloper(null)}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Selected Items Display - Desktop only */}
                {isDesktop && (selectedFilm || selectedDeveloper) && (
                  <Box style={styles.selectedItemsContainer}>
                    <HStack space="sm" style={styles.selectedItemsHeader}>
                      <Text style={[styles.sectionLabel, { color: textColor }]}>
                        Selected:
                      </Text>
                      <TouchableOpacity onPress={clearFilters}>
                        <Text
                          style={[
                            styles.clearAllText,
                            { color: developmentTint },
                          ]}
                        >
                          Clear All
                        </Text>
                      </TouchableOpacity>
                    </HStack>

                    {selectedFilm && (
                      <Box style={styles.selectedItem}>
                        <Text
                          style={[
                            styles.selectedItemText,
                            { color: textColor },
                          ]}
                        >
                          Film: {selectedFilm.brand} {selectedFilm.name}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedFilm(null)}>
                          <X size={16} color={textColor} />
                        </TouchableOpacity>
                      </Box>
                    )}

                    {selectedDeveloper && (
                      <Box style={styles.selectedItem}>
                        <Text
                          style={[
                            styles.selectedItemText,
                            { color: textColor },
                          ]}
                        >
                          Developer: {selectedDeveloper.manufacturer}{" "}
                          {selectedDeveloper.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setSelectedDeveloper(null)}
                        >
                          <X size={16} color={textColor} />
                        </TouchableOpacity>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Filter Toggle */}
                <TouchableOpacity
                  style={styles.filterToggle}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} color={developmentTint} />
                  <Text
                    style={[
                      styles.filterToggleText,
                      { color: developmentTint },
                    ]}
                  >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Text>
                </TouchableOpacity>

                {/* Filters */}
                {showFilters && (
                  <VStack space="sm">
                    {/* Developer Type Filter - only show when no specific developer is selected */}
                    {!selectedDeveloper && (
                      <FormGroup label="Developer Type">
                        <StyledSelect
                          value={developerTypeFilter}
                          onValueChange={setDeveloperTypeFilter}
                          items={DEVELOPER_TYPES}
                        />
                      </FormGroup>
                    )}

                    {/* Dilution Filter - only show when developer is selected */}
                    {selectedDeveloper && (
                      <FormGroup label="Dilution">
                        <StyledSelect
                          value={dilutionFilter}
                          onValueChange={setDilutionFilter}
                          items={getAvailableDilutions()}
                        />
                      </FormGroup>
                    )}

                    {/* ISO Filter - only show when film is selected */}
                    {selectedFilm && (
                      <FormGroup label="Shooting ISO">
                        <StyledSelect
                          value={isoFilter}
                          onValueChange={setIsoFilter}
                          items={getAvailableISOs()}
                        />
                      </FormGroup>
                    )}
                  </VStack>
                )}
              </VStack>
            </FormSection>

            {/* Results Section */}
            <Box style={styles.resultsSection}>
              {/* Title */}
              <Text
                style={[
                  styles.resultsHeader,
                  {
                    color: textColor,
                    textAlign: isDesktop ? "left" : "center",
                  },
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
                {customRecipes.length > 0 && showCustomRecipes && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "normal",
                      color: textColor,
                      opacity: 0.7,
                    }}
                  >
                    {" "}
                    ({customRecipes.length} custom)
                  </Text>
                )}
              </Text>

              {/* Buttons - Different layouts for mobile vs desktop */}
              {isDesktop ? (
                /* Desktop: Buttons in top right */
                <Box style={styles.desktopButtonsContainer}>
                  <HStack style={{ gap: 8, alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() =>
                        setViewMode(viewMode === "cards" ? "table" : "cards")
                      }
                      style={styles.desktopButton}
                    >
                      {viewMode === "cards" ? (
                        <Table size={14} color={developmentTint} />
                      ) : (
                        <Grid3X3 size={14} color={developmentTint} />
                      )}
                      <Text
                        style={[
                          styles.desktopButtonText,
                          { color: developmentTint },
                        ]}
                      >
                        {viewMode === "cards" ? "Table" : "Cards"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleForceRefresh}
                      style={styles.desktopButton}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Spinner size="small" color={developmentTint} />
                      ) : (
                        <RefreshCw size={14} color={developmentTint} />
                      )}
                      <Text
                        style={[
                          styles.desktopButtonText,
                          {
                            color: developmentTint,
                            opacity: isLoading ? 0.5 : 1,
                          },
                        ]}
                      >
                        {isLoading ? "Loading..." : "Refresh"}
                      </Text>
                    </TouchableOpacity>

                    {customRecipes.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                        style={[
                          styles.desktopButton,
                          {
                            backgroundColor: showCustomRecipes
                              ? developmentTint
                              : "transparent",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.desktopButtonText,
                            {
                              color: showCustomRecipes
                                ? "#fff"
                                : developmentTint,
                            },
                          ]}
                        >
                          My Recipes
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={handleNewCustomRecipe}
                      style={[
                        styles.desktopButton,
                        { backgroundColor: developmentTint },
                      ]}
                    >
                      <Plus size={14} color="#fff" />
                      <Text
                        style={[styles.desktopButtonText, { color: "#fff" }]}
                      >
                        Add Recipe
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </Box>
              ) : (
                /* Mobile: Buttons centered below title */
                <Box style={styles.mobileButtonsContainer}>
                  <HStack style={styles.mobileButtonsRow}>
                    <TouchableOpacity
                      onPress={handleForceRefresh}
                      style={styles.mobileButton}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Spinner size="small" color={developmentTint} />
                      ) : (
                        <RefreshCw size={16} color={developmentTint} />
                      )}
                      <Text
                        style={[
                          styles.mobileButtonText,
                          {
                            color: developmentTint,
                            opacity: isLoading ? 0.5 : 1,
                          },
                        ]}
                      >
                        {isLoading ? "Loading..." : "Refresh"}
                      </Text>
                    </TouchableOpacity>

                    {customRecipes.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                        style={[
                          styles.mobileButton,
                          {
                            backgroundColor: showCustomRecipes
                              ? developmentTint
                              : "transparent",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.mobileButtonText,
                            {
                              color: showCustomRecipes
                                ? "#fff"
                                : developmentTint,
                            },
                          ]}
                        >
                          My Recipes
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={handleNewCustomRecipe}
                      style={[
                        styles.mobileButton,
                        { backgroundColor: developmentTint },
                      ]}
                    >
                      <Plus size={16} color="#fff" />
                      <Text
                        style={[styles.mobileButtonText, { color: "#fff" }]}
                      >
                        Add Recipe
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </Box>
              )}

              {allCombinations.length === 0 ? (
                <Box style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: textColor }]}>
                    No development recipes found.
                  </Text>
                  <Text style={[styles.noResultsSubtext, { color: textColor }]}>
                    Try adjusting your search terms or filters, or create your
                    own recipe.
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
                    pageSize={pageSize}
                    goToPage={goToPage}
                    goToNext={goToNext}
                    goToPrevious={goToPrevious}
                    resetToFirstPage={resetToFirstPage}
                  />

                  {isDesktop && viewMode === "table" ? (
                    // Table view for desktop
                    <Box style={styles.tableContainer}>
                      <Box style={styles.tableHeaderRow}>
                        <TableHeader
                          title="Film"
                          sortKey="filmName"
                          currentSort={sortBy}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <TableHeader
                          title="Developer"
                          sortKey="developerName"
                          currentSort={sortBy}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <TableHeader
                          title="Time"
                          sortKey="timeMinutes"
                          currentSort={sortBy}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <TableHeader
                          title="Temp"
                          sortKey="temperatureF"
                          currentSort={sortBy}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <TableHeader
                          title="ISO"
                          sortKey="shootingIso"
                          currentSort={sortBy}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <TableHeader
                          title="Dilution"
                          sortKey="dilution"
                          currentSort={sortBy}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </Box>

                      <ScrollView style={styles.tableScrollView}>
                        {paginatedCombinations.map((combination, index) => {
                          const isCustom = customRecipes.some(
                            (r) => r.id === combination.id,
                          );
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
                              onPress={() => {
                                if (isCustom) {
                                  const customRecipe = customRecipes.find(
                                    (r) => r.id === combination.id,
                                  );
                                  if (customRecipe) {
                                    handleCustomRecipePress(customRecipe);
                                  }
                                } else {
                                  setSelectedCombination(combination);
                                }
                              }}
                              isEven={index % 2 === 0}
                            />
                          );
                        })}
                      </ScrollView>
                    </Box>
                  ) : (
                    // Cards view (default for mobile, optional for desktop)
                    <Box style={styles.cardsContainer}>
                      {paginatedCombinations.map((combination) => {
                        const isCustom = customRecipes.some(
                          (r) => r.id === combination.id,
                        );
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
                            onPress={() => {
                              if (isCustom) {
                                const customRecipe = customRecipes.find(
                                  (r) => r.id === combination.id,
                                );
                                if (customRecipe) {
                                  handleCustomRecipePress(customRecipe);
                                }
                              } else {
                                setSelectedCombination(combination);
                              }
                            }}
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
                    pageSize={pageSize}
                    goToPage={goToPage}
                    goToNext={goToNext}
                    goToPrevious={goToPrevious}
                    resetToFirstPage={resetToFirstPage}
                  />
                </>
              )}
            </Box>
          </Box>

          {/* API Recipe Detail Modal */}
          <Modal
            isOpen={selectedCombination !== null}
            onClose={() => setSelectedCombination(null)}
            size={getRecipeDetailModalConfig(isDesktop).size}
          >
            <ModalBackdrop />
            <ModalContent
              className={getRecipeDetailModalConfig(isDesktop).className}
              style={getRecipeDetailModalConfig(isDesktop).style}
            >
              {selectedCombination && (
                <RecipeDetail
                  combination={selectedCombination}
                  film={getFilmById(selectedCombination.filmStockId)}
                  developer={getDeveloperById(selectedCombination.developerId)}
                  onClose={() => setSelectedCombination(null)}
                  onDuplicate={() =>
                    handleDuplicateRecipe(selectedCombination, false)
                  }
                  isCustomRecipe={false}
                />
              )}
            </ModalContent>
          </Modal>

          {/* Custom Recipe Detail Modal */}
          <Modal
            isOpen={selectedCustomRecipe !== null}
            onClose={() => setSelectedCustomRecipe(null)}
            size={getCustomRecipeDetailModalConfig(isDesktop).size}
          >
            <ModalBackdrop />
            <ModalContent
              className={getCustomRecipeDetailModalConfig(isDesktop).className}
              style={getCustomRecipeDetailModalConfig(isDesktop).style}
            >
              {currentSelectedCustomRecipe && (
                <RecipeDetail
                  combination={{
                    id: currentSelectedCustomRecipe.id,
                    name: currentSelectedCustomRecipe.name,
                    uuid: currentSelectedCustomRecipe.id,
                    slug: currentSelectedCustomRecipe.id,
                    filmStockId: currentSelectedCustomRecipe.filmId,
                    developerId: currentSelectedCustomRecipe.developerId,
                    temperatureF: currentSelectedCustomRecipe.temperatureF,
                    timeMinutes: currentSelectedCustomRecipe.timeMinutes,
                    shootingIso: currentSelectedCustomRecipe.shootingIso,
                    pushPull: currentSelectedCustomRecipe.pushPull,
                    agitationSchedule:
                      currentSelectedCustomRecipe.agitationSchedule,
                    notes: currentSelectedCustomRecipe.notes,
                    customDilution: currentSelectedCustomRecipe.customDilution,
                    dateAdded: currentSelectedCustomRecipe.dateCreated,
                  }}
                  film={getCustomRecipeFilm(currentSelectedCustomRecipe.id)}
                  developer={getCustomRecipeDeveloper(
                    currentSelectedCustomRecipe.id,
                  )}
                  onClose={() => setSelectedCustomRecipe(null)}
                  onEdit={() =>
                    handleEditCustomRecipe(currentSelectedCustomRecipe)
                  }
                  onDuplicate={() =>
                    handleDuplicateRecipe(
                      {
                        id: currentSelectedCustomRecipe.id,
                        name: currentSelectedCustomRecipe.name,
                        uuid: currentSelectedCustomRecipe.id,
                        slug: currentSelectedCustomRecipe.id,
                        filmStockId: currentSelectedCustomRecipe.filmId,
                        developerId: currentSelectedCustomRecipe.developerId,
                        temperatureF: currentSelectedCustomRecipe.temperatureF,
                        timeMinutes: currentSelectedCustomRecipe.timeMinutes,
                        shootingIso: currentSelectedCustomRecipe.shootingIso,
                        pushPull: currentSelectedCustomRecipe.pushPull,
                        agitationSchedule:
                          currentSelectedCustomRecipe.agitationSchedule,
                        notes: currentSelectedCustomRecipe.notes,
                        customDilution:
                          currentSelectedCustomRecipe.customDilution,
                        dateAdded: currentSelectedCustomRecipe.dateCreated,
                      },
                      true,
                    )
                  }
                  onDelete={handleCustomRecipeDelete}
                  isCustomRecipe={true}
                />
              )}
            </ModalContent>
          </Modal>

          {/* Custom Recipe Form Modal - Both Mobile and Desktop */}
          <Modal
            isOpen={showCustomRecipeForm}
            onClose={handleCustomRecipeFormClose}
            size={getRecipeFormModalConfig(isDesktop).size}
          >
            <ModalBackdrop />
            <ModalContent
              className={getRecipeFormModalConfig(isDesktop).className}
              style={getRecipeFormModalConfig(isDesktop).style}
            >
              {isDesktop && (
                <ModalHeader className="pb-4">
                  <Text className="text-lg font-semibold">
                    {editingCustomRecipe ? "Edit Recipe" : "New Recipe"}
                  </Text>
                  <ModalCloseButton>
                    <X size={20} />
                  </ModalCloseButton>
                </ModalHeader>
              )}
              <ModalBody className="flex-1 p-0">
                <CustomRecipeForm
                  recipe={editingCustomRecipe}
                  onClose={handleCustomRecipeFormClose}
                  onSave={handleCustomRecipeSave}
                  isDesktop={isDesktop}
                  isMobileWeb={Platform.OS === "web" && !isDesktop}
                />
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Custom Recipe Import Modal */}
          <Modal
            isOpen={showCustomRecipeImportModal}
            onClose={handleCancelImportCustomRecipe}
            size="md"
          >
            <ModalBackdrop />
            <ModalContent style={{ backgroundColor: cardBackground }}>
              <ModalHeader>
                <Text
                  style={[
                    { fontSize: 18, fontWeight: "600" },
                    { color: textColor },
                  ]}
                >
                  Import Shared Recipe
                </Text>
                <ModalCloseButton>
                  <X size={20} color={textColor} />
                </ModalCloseButton>
              </ModalHeader>

              <ModalBody>
                <VStack space="lg">
                  {sharedCustomRecipe && (
                    <>
                      {/* Recipe Preview */}
                      <Box
                        style={[
                          {
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                          },
                          {
                            backgroundColor: inputBackground,
                            borderColor: borderColor,
                          },
                        ]}
                      >
                        <VStack space="sm">
                          <Text
                            style={[
                              { fontSize: 16, fontWeight: "600" },
                              { color: developmentTint },
                            ]}
                          >
                            {sharedCustomRecipe.name}
                          </Text>

                          {/* Film and Developer Information */}
                          <HStack
                            space="md"
                            style={{ justifyContent: "space-around" }}
                          >
                            <VStack
                              space="xs"
                              style={{ alignItems: "center", flex: 1 }}
                            >
                              <Text
                                style={[
                                  { fontSize: 12, fontWeight: "500" },
                                  { color: textSecondary },
                                ]}
                              >
                                Film
                              </Text>
                              <Text
                                style={[
                                  { fontSize: 14, fontWeight: "600" },
                                  { color: textColor },
                                ]}
                                numberOfLines={2}
                                textAlign="center"
                              >
                                {(() => {
                                  if (
                                    sharedCustomRecipe.isCustomFilm &&
                                    sharedCustomRecipe.customFilm
                                  ) {
                                    return `${sharedCustomRecipe.customFilm.brand} ${sharedCustomRecipe.customFilm.name}`;
                                  } else {
                                    const film = getFilmById(
                                      sharedCustomRecipe.filmId,
                                    );
                                    return film
                                      ? `${film.brand} ${film.name}`
                                      : "Unknown Film";
                                  }
                                })()}
                              </Text>
                            </VStack>

                            <VStack
                              space="xs"
                              style={{ alignItems: "center", flex: 1 }}
                            >
                              <Text
                                style={[
                                  { fontSize: 12, fontWeight: "500" },
                                  { color: textSecondary },
                                ]}
                              >
                                Developer
                              </Text>
                              <Text
                                style={[
                                  { fontSize: 14, fontWeight: "600" },
                                  { color: textColor },
                                ]}
                                numberOfLines={2}
                                textAlign="center"
                              >
                                {(() => {
                                  if (
                                    sharedCustomRecipe.isCustomDeveloper &&
                                    sharedCustomRecipe.customDeveloper
                                  ) {
                                    return `${sharedCustomRecipe.customDeveloper.manufacturer} ${sharedCustomRecipe.customDeveloper.name}`;
                                  } else {
                                    const developer = getDeveloperById(
                                      sharedCustomRecipe.developerId,
                                    );
                                    return developer
                                      ? `${developer.manufacturer} ${developer.name}`
                                      : "Unknown Developer";
                                  }
                                })()}
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack
                            space="md"
                            style={{ justifyContent: "space-around" }}
                          >
                            <VStack
                              space="xs"
                              style={{ alignItems: "center", flex: 1 }}
                            >
                              <Text
                                style={[
                                  { fontSize: 12, fontWeight: "500" },
                                  { color: textSecondary },
                                ]}
                              >
                                Time
                              </Text>
                              <Text
                                style={[
                                  { fontSize: 14, fontWeight: "600" },
                                  { color: textColor },
                                ]}
                              >
                                {formatTime(sharedCustomRecipe.timeMinutes)}
                              </Text>
                            </VStack>

                            <VStack
                              space="xs"
                              style={{ alignItems: "center", flex: 1 }}
                            >
                              <Text
                                style={[
                                  { fontSize: 12, fontWeight: "500" },
                                  { color: textSecondary },
                                ]}
                              >
                                Temperature
                              </Text>
                              <Text
                                style={[
                                  { fontSize: 14, fontWeight: "600" },
                                  { color: textColor },
                                ]}
                              >
                                {sharedCustomRecipe.temperatureF}°F
                              </Text>
                            </VStack>

                            <VStack
                              space="xs"
                              style={{ alignItems: "center", flex: 1 }}
                            >
                              <Text
                                style={[
                                  { fontSize: 12, fontWeight: "500" },
                                  { color: textSecondary },
                                ]}
                              >
                                ISO
                              </Text>
                              <Text
                                style={[
                                  { fontSize: 14, fontWeight: "600" },
                                  { color: textColor },
                                ]}
                              >
                                {sharedCustomRecipe.shootingIso}
                              </Text>
                            </VStack>
                          </HStack>

                          {sharedCustomRecipe.notes && (
                            <VStack space="xs">
                              <Text
                                style={[
                                  { fontSize: 12, fontWeight: "500" },
                                  { color: textSecondary },
                                ]}
                              >
                                Notes
                              </Text>
                              <Text
                                style={[{ fontSize: 14 }, { color: textColor }]}
                              >
                                {sharedCustomRecipe.notes}
                              </Text>
                            </VStack>
                          )}
                        </VStack>
                      </Box>

                      {/* Import Options */}
                      <VStack space="md">
                        <Text
                          style={[
                            { fontSize: 16, fontWeight: "600" },
                            { color: textColor },
                          ]}
                        >
                          Import this recipe to your collection?
                        </Text>

                        <HStack space="md">
                          <Button
                            variant="outline"
                            onPress={handleCancelImportCustomRecipe}
                            style={[{ flex: 1, borderColor: borderColor }]}
                          >
                            <ButtonText style={[{ color: textColor }]}>
                              Cancel
                            </ButtonText>
                          </Button>

                          <Button
                            variant="solid"
                            onPress={handleImportCustomRecipe}
                            style={[
                              { flex: 1, backgroundColor: developmentTint },
                            ]}
                          >
                            <ButtonText style={[{ color: "white" }]}>
                              Import Recipe
                            </ButtonText>
                          </Button>
                        </HStack>
                      </VStack>
                    </>
                  )}
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Film Search Dropdown - Desktop only */}
          {isDesktop && (
            <SearchDropdown
              variant="desktop"
              isOpen={isFilmSearchFocused}
              onClose={() => setIsFilmSearchFocused(false)}
              items={filmDropdownItems}
              onItemSelect={handleFilmDropdownSelect}
              position="left"
              dynamicPosition={filmSearchPosition}
            />
          )}

          {/* Developer Search Dropdown - Desktop only */}
          {isDesktop && (
            <SearchDropdown
              variant="desktop"
              isOpen={isDeveloperSearchFocused}
              onClose={() => setIsDeveloperSearchFocused(false)}
              items={developerDropdownItems}
              onItemSelect={handleDeveloperDropdownSelect}
              position="right"
              dynamicPosition={developerSearchPosition}
            />
          )}

          {/* Mobile Selection Modals - handled by SearchInput component now */}
          {!isDesktop && (
            <>
              <SearchDropdown
                variant="mobile"
                type="film"
                isOpen={showMobileFilmModal}
                onClose={() => setShowMobileFilmModal(false)}
                films={allFilms}
                onFilmSelect={(film: Film) => {
                  setSelectedFilm(film);
                }}
                onItemSelect={() => {}} // Not used for mobile variant
              />

              <SearchDropdown
                variant="mobile"
                type="developer"
                isOpen={showMobileDeveloperModal}
                onClose={() => setShowMobileDeveloperModal(false)}
                developers={allDevelopers}
                onDeveloperSelect={(developer: Developer) => {
                  setSelectedDeveloper(developer);
                }}
                onItemSelect={() => {}} // Not used for mobile variant
              />
            </>
          )}
        </Box>
      </CalculatorLayout>
    </RecipeErrorBoundary>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: "100%",
    overflow: "visible",
  },
  leftPanel: {
    flex: 1,
    overflow: "visible",
  },

  // Cards Container - Minimal layout container for cards
  cardsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 8,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  // Search Fields Layout Styles
  searchFieldsContainer: {
    gap: 16,
  },
  searchFieldsDesktop: {
    flexDirection: "row",
    gap: 16,
  },
  searchField: {
    flex: 1,
  },
  searchFieldDesktop: {
    flex: 1,
    minWidth: 0, // Allows flex items to shrink below content size
  },

  // Search Dropdown Styles (for desktop)
  searchDropdownContainer: {
    position: "relative",
  },

  // Selected Items Styles
  selectedItemsContainer: {
    marginTop: 8,
  },
  selectedItemsHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedItemText: {
    fontSize: 14,
    flex: 1,
  },

  // Filter Toggle Styles
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Results Styles
  resultsSection: {
    flex: 1,
    marginTop: 16,
    position: "relative",
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  // Table Styles
  tableContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 8 : 4,
    paddingVertical: 4,
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: Platform.OS === "web" ? 14 : 12,
    fontWeight: "600",
    marginRight: 4,
    textAlign: "center",
  },
  sortIcon: {
    marginLeft: 2,
  },
  tableScrollView: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Platform.OS === "web" ? 12 : 8,
    paddingHorizontal: Platform.OS === "web" ? 8 : 4,
    minHeight: Platform.OS === "web" ? 48 : 40,
  },
  filmCell: {
    flex: 2.5,
    paddingRight: 8,
  },
  filmText: {
    fontSize: Platform.OS === "web" ? 14 : 12,
    fontWeight: "600",
  },
  developerCell: {
    flex: 2,
    paddingRight: 8,
  },
  developerText: {
    fontSize: Platform.OS === "web" ? 13 : 11,
    fontWeight: "500",
  },
  timeCell: {
    flex: 1,
    paddingRight: 8,
    alignItems: "center",
  },
  tempCell: {
    flex: 1,
    paddingRight: 8,
    alignItems: "center",
  },
  isoCell: {
    flex: 0.8,
    paddingRight: 8,
    alignItems: "center",
  },
  dilutionCell: {
    flex: 1.2,
    paddingRight: 8,
    alignItems: "center",
  },
  paramText: {
    fontSize: Platform.OS === "web" ? 13 : 11,
    fontWeight: "500",
    textAlign: "center",
  },

  // Loading and Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: "center",
  },

  // Desktop Button Styles
  desktopButtonsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  desktopButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "currentColor",
    gap: 4,
  },
  desktopButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Mobile Button Styles
  mobileButtonsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  mobileButtonsRow: {
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileButton: {
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
  mobileButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Computation Loading Overlay Styles
  computationLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    flexDirection: "row",
    gap: 8,
    borderRadius: 8,
  },
  computationLoadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
